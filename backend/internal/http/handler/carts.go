package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type CartHandler struct {
	cartService service.CartService
	DB          *gorm.DB
}

func NewCartHandler(cartService service.CartService, db *gorm.DB) CartHandler {
	return CartHandler{
		cartService: cartService,
		DB:          db,
	}
}

func (h *CartHandler) AddToCart(ctx echo.Context) error {
	var req dto.AddToCartRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid user ID"))
	}

	// Tambah item ke cart user
	err := h.cartService.AddToCart(ctx.Request().Context(), userID, &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"cart": req,
	}))
}

func (h *CartHandler) GetCart(ctx echo.Context) error {
	userId, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}
	
	cart, err := h.cartService.GetCartByUserID(h.DB.WithContext(ctx.Request().Context()), userId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"cart": cart,
	}))
}

func (h *CartHandler) UpdateCartItem(ctx echo.Context) error {
	userId, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}
	
	cartId := uuid.MustParse(ctx.Param("cartID"))
	req := new(dto.UpdateCartItemRequest)
	req.CartID = cartId
	if err := ctx.Bind(req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err := h.cartService.UpdateCartItem(ctx.Request().Context(), userId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"cart": req,
	}))
}

func (h *CartHandler) RemoveCartItem(ctx echo.Context) error {
	userId, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}
	
	req := uuid.MustParse(ctx.Param("cartID"))
	err := h.cartService.RemoveCartItem(ctx.Request().Context(), userId, req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"cart": req,
	}))
}


