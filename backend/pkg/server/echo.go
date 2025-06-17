package server

import (
	"mola-web/configs"
	"mola-web/pkg/response"
	"mola-web/pkg/route"
	"mola-web/pkg/token"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Server struct {
	*echo.Echo
}

func NewServer(cfg *configs.Config,
	publicRoutes, privateRoutes []route.Route) *Server {
	e := echo.New()
	e.Static("/static", "public")
	e.HideBanner = true
	
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{"*"}, // Bisa juga di-set ke origin tertentu
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
    }))
	v1 := e.Group("/api/v1")

	if len(publicRoutes) > 0 {
		for _, route := range publicRoutes {
			v1.Add(route.Method, route.Path, route.Handler)
		}
	}

	if len(privateRoutes) > 0 {
		for _, route := range privateRoutes {
			v1.Add(route.Method, route.Path, route.Handler, JWTMiddleware(cfg.JWT.SecretKey), RBACMiddleware(route.Roles))
		}
	}
	return &Server{e}
}

func JWTMiddleware(secretKey string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(token.JwtCustomClaims)
		},
		SigningKey: []byte(secretKey),
		ErrorHandler: func(ctx echo.Context, err error) error {
			return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, "anda harus login untuk megakses resource ini."))
		},
	})
}

func RBACMiddleware(roles []string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			user := ctx.Get("user").(*jwt.Token)
			claims := user.Claims.(*token.JwtCustomClaims)

			if claims.Role != "admin" {
				ctx.Set("user_id", claims.UserID)
				ctx.Set("name", claims.Name)
				ctx.Set("email", claims.Email)
			}

			allowed := false
			for _, role := range roles {
				if role == claims.Role {
					allowed = true
					break
				}
			}

			if !allowed {
				return ctx.JSON(http.StatusForbidden, response.ErrorResponse(http.StatusForbidden, "anda tidak diizinkan untuk mengakses resource ini."))
			}

			return next(ctx)
		}
	}
}
