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
	TotalWeight   float64      `json:"total_weight"`
	PaymentStatus string       `json:"payment_status"`
	OrderItems    []OrderItems `json:"order_items"`
}

type OrderItems struct {
	Quantity  int                      `json:"quantity"`
	Subtotal  float64                  `json:"subtotal"`
	Note      *string                  `json:"note"`
	Product   *GetProductByIDShowOrder `json:"product"`
}

type GetPaymentStatusResponse struct {
	TokenMidtrans string `json:"token_midtrans" gorm:"column:payment_url"`
	PaymentUrl    string `json:"payment_url" gorm:"column:token_midtrans"`
	PaymentStatus string `json:"payment_status" gorm:"column:payment_status"`
}

type GetOrdersPaidResponse struct {
	ID            uuid.UUID `json:"id"`
	UserName      string    `json:"user_name"`
	Resi          string    `json:"resi"`
	ProductName   []string  `json:"product_name"`
}
