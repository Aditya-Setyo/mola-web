package handler

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/datatypes"
)

type TransactionHandler struct {
	TransactionService service.TransactionService
}

func NewTransactionHandler(transactionService service.TransactionService) TransactionHandler {
	return TransactionHandler{
		TransactionService: transactionService,
	}
}

func (h *TransactionHandler) PaymentNotification(ctx echo.Context) error {
	bodyBytes, err := io.ReadAll(ctx.Request().Body)
	if err != nil {
		log.Println("Failed to read request body:", err)
		return ctx.NoContent(http.StatusBadRequest)
	}
	
	ctx.Request().Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	request := new(dto.MidtransNotification)
	if err := ctx.Bind(request); err != nil {
		log.Println("Failed to bind request:", err)
		return ctx.NoContent(http.StatusBadRequest)
	}

	request.Payload = datatypes.JSON(bodyBytes)

	err = h.TransactionService.PaymentNotification(ctx.Request().Context(), request)
	if err != nil {
		log.Println("Failed to process payment notification:", err)
		return ctx.NoContent(http.StatusInternalServerError) 
	}

	return ctx.NoContent(http.StatusOK) 
}

func (h *TransactionHandler) Refund(ctx echo.Context) error {
	request := new(dto.RefundRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}

	err := h.TransactionService.Refund(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse(fmt.Sprintf("success refund %s", request.TransactionID), map[string]interface{}{}))
}