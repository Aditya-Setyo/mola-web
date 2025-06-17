package dto

import (
	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	UserID           uuid.UUID ` json:"user_id"`
	OrderCode        string    ` json:"order_code"`
	Status           string    `json:"status"`
	TotalAmount      float64   `json:"total_amount"`
	PaymentStatus    string    `json:"payment_status"`
	IsPaid           bool      `json:"is_paid"`
	PaymentExpiredAt *string   `json:"payment_expired_at"`
}

type ShowOrderResponse struct {
	ID            uuid.UUID    `json:"id"`
	UserID        uuid.UUID    `json:"user_id"`
	OrderCode     string       `json:"order_code"`
	Status        string       `json:"status"`
	TotalAmount   float64      `json:"total_amount"`
	PaymentStatus string       `json:"payment_status"`
	OrderItems    []OrderItems `json:"order_items"`
}

type OrderItems struct {
	ProductID uuid.UUID                `json:"product_id"`
	Quantity  int                      `json:"quantity"`
	Subtotal  float64                  `json:"subtotal"`
	Note      *string                  `json:"note"`
	Product   *GetProductByIDShowOrder `json:"product"`
}

type GetPaymentStatusResponse struct {
	TokenMidtrans string `json:"token_midtrans"`
	PaymentUrl    string `json:"payment_url"`
	PaymentStatus string `json:"payment_status"`
}