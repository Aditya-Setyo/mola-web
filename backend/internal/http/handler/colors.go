package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type ColorHandler struct {
	colorService service.ColorService
}

func NewColorHandler(colorService service.ColorService) ColorHandler {
	return ColorHandler{colorService: colorService}
}

func (h ColorHandler) GetAll(ctx echo.Context) error {
	colors, err := h.colorService.GetAll(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(colors) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Color not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"colors": colors,
	}))
}

func (h ColorHandler) Create(ctx echo.Context) error {
	request := new(dto.CreateColorRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err := h.colorService.Create(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"color": request.Name,
	}))
}

func (h ColorHandler) Update(ctx echo.Context) error {
	colorID, err := strconv.ParseUint(ctx.Param("colorID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	request := new(dto.UpdateColorRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	request.ID = uint(colorID)
	err = h.colorService.Update(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"color": request.Name,
	}))
}

func (h ColorHandler) Delete(ctx echo.Context) error {
	colorID, err := strconv.ParseUint(ctx.Param("colorID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	err = h.colorService.Delete(ctx.Request().Context(), uint(colorID))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"color": colorID,
	}))
}
