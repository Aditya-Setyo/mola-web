package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/labstack/echo/v4"
)

type ShipmentHandler struct {
	shipmentService service.ShipmentService
}

func NewShipmentHandler(shipmentService service.ShipmentService) ShipmentHandler {
	return ShipmentHandler{
		shipmentService: shipmentService,
	}
}

func (s ShipmentHandler) AddResiNumber(ctx echo.Context) error {
	shipmentRequest := &dto.ShipmentRequest{}
	if err := ctx.Bind(shipmentRequest); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	if err := s.shipmentService.AddResiNumber(ctx.Request().Context(), shipmentRequest); err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{}))
}
