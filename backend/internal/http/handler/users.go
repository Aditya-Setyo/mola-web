package handler

import (
	"errors"
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) UserHandler {
	return UserHandler{userService}
}

func (h *UserHandler) Register(ctx echo.Context) error {
	// role := "admin"
	var req *dto.RegisterRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	if err := h.userService.Register(ctx.Request().Context(), req); err != nil {
		return ctx.JSON(http.StatusConflict, response.ErrorResponse(http.StatusConflict, err.Error()))
	}

	return ctx.JSON(http.StatusCreated, response.SuccessResponse("user created successfully", map[string]interface{}{}))
}

func (h *UserHandler) Login(ctx echo.Context) error {
	var loginRequest *dto.LoginRequest

	if err := ctx.Bind(&loginRequest); err != nil {
		return ctx.JSON(http.StatusBadRequest,
			response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	token, err := h.userService.Login(ctx.Request().Context(), loginRequest)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully login", map[string]interface{}{
		"token": token,
	}))
}

func (h *UserHandler) GoogleLogin(ctx echo.Context) error {
	var req dto.GoogleLoginRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	token, err := h.userService.GoogleLogin(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, response.ErrorResponse(http.StatusUnauthorized, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("successfully login", map[string]interface{}{
		"token": token,
	}))
}

func (h *UserHandler) GetAllUsers(ctx echo.Context) error {
	users, err := h.userService.GetAll(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"users": users,
	}))
}
func (h *UserHandler) GetUserProfile(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}

	user, err := h.userService.GetUserProfile(ctx.Request().Context(), userID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"user": user,
	}))
}

func (h *UserHandler) UpdateUserProfile(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}

	var req *dto.UpdateUserProfileRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err := h.userService.UpdateUserProfile(ctx.Request().Context(), userID, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"user": req,
	}))
}

func (h *UserHandler) GetUserAddress(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}

	address, err := h.userService.GetUserAddress(ctx.Request().Context(), userID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"address": address,
	}))
}

func (h *UserHandler) UpdateUserAddress(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}

	var req *dto.UpdateUserAddressRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err := h.userService.UpdateUserAddress(ctx.Request().Context(), userID, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"address": req,
	}))
}

func (h *UserHandler) ForgotPassword(ctx echo.Context) error {
    type Request struct {
        Email string `json:"email"`
    }

    var req Request
    if err := ctx.Bind(&req); err != nil {
        return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, errors.New("invalid request body").Error()))
    }

	err := h.userService.ForgotPassword(ctx.Request().Context(), req.Email)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

    return ctx.JSON(http.StatusOK, response.SuccessResponse("token telah dikirim ke email", map[string]interface{}{}))
}


func (h *UserHandler) ResetPassword(ctx echo.Context) error {
	var req *dto.ResetPasswordRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err := h.userService.ResetPassword(ctx.Request().Context(), req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{}))
}