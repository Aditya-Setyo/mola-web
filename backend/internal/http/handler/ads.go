package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/labstack/echo/v4"
)

type AdHandler struct {
	AdService service.AdsService
}

func NewAdHandler(adService service.AdsService) AdHandler {
	return AdHandler{
		AdService: adService,
	}
}

func (h *AdHandler) UploadAd(ctx echo.Context) error {

	category := ctx.FormValue("category")
	image, err := ctx.FormFile("image")
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	req := dto.CreateAdRequest{
		Category : category,
		Image : image,
	}
	

	err = h.AdService.UploadAd(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"ad": req.ID,
	}))
}

func (h *AdHandler) GetAds(ctx echo.Context) error {
	category := ctx.Param("category")
	ads, err := h.AdService.GetAdsByCategory(ctx.Request().Context(), category)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"ads": ads,
	}))
}


