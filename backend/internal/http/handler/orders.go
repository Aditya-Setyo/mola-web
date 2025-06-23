package handler

import (
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	orderService service.OrderService
}

func NewOrderHandler(orderService service.OrderService) OrderHandler {
	return OrderHandler{orderService}
}

func (h *OrderHandler) GetOrdersPaid (ctx echo.Context) error {
	orders, err := h.orderService.GetAllOrdersPaid(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"orders": orders,
	}))
}

func (h *OrderHandler) Checkout(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}
	email := ctx.Get("email").(string)
	name := ctx.Get("name").(string)

	redirectURL, err := h.orderService.Checkout(ctx.Request().Context(), userID, email, name)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"redirect_url": redirectURL,
	}))
}

func (h *OrderHandler) ShowOrder(ctx echo.Context) error {
	userID, ok := ctx.Get("user_id").(uuid.UUID)
	if !ok {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Unauthorized"))
	}

	order, err := h.orderService.ShowOrder(ctx.Request().Context(), userID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"order": order,
	}))

}

func (h *OrderHandler) SetAdminOrderStatus(ctx echo.Context) error {
	orderID, err:=  uuid.Parse(ctx.Param("orderID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	var status string
	if err := ctx.Bind(&status); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err = h.orderService.SetAdminOrderStatus(ctx.Request().Context(), orderID, status)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{}))
}
