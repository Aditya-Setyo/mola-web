package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/labstack/echo/v4"
)

type SalesReportHandler struct {
	salesReportService service.SalesReportService
}

func NewSalesReportHandler(salesReportService service.SalesReportService) SalesReportHandler {
	return SalesReportHandler{
		salesReportService: salesReportService,
	}
}
func (h *SalesReportHandler) GetSalesReport(ctx echo.Context) error {
	filter := dto.ReportFilter{
		Today: ctx.QueryParam("today") == "true",
		Date:  ctx.QueryParam("date"),
		Month: ctx.QueryParam("month"),
		Start: ctx.QueryParam("start"),
		End:   ctx.QueryParam("end"),
	}

	reports, err := h.salesReportService.GetSalesReport(ctx.Request().Context(), filter)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"reports": reports,
	}))
}
