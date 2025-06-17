package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type SizeHandler struct {
	sizeService service.SizeService
}

func NewSizeHandler(sizeService service.SizeService) SizeHandler {
	return SizeHandler{sizeService: sizeService}
}

func (h SizeHandler) GetAll(ctx echo.Context) error {
	sizes, err := h.sizeService.GetAll(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(sizes) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Size not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"sizes": sizes,
	}))
}

func (h SizeHandler) Create(ctx echo.Context) error {
	request := new(dto.CreateSizeRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err := h.sizeService.Create(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"size": request.Name,
	}))
}

func (h SizeHandler) Update(ctx echo.Context) error {
	request := new(dto.UpdateSizeRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err := h.sizeService.Update(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"size": request.Name,
	}))
}

func (h SizeHandler) Delete(ctx echo.Context) error {
	sizeID, err := strconv.ParseUint(ctx.Param("sizeID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	err = h.sizeService.Delete(ctx.Request().Context(), uint(sizeID))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"size": sizeID,
	}))
}