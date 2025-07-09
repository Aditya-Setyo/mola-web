package dto

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type TransactionRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	Quantity  int       `json:"quantity" validate:"required"`
}

type TransactionResponse struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"product_id"`
	Quantity  int       `json:"quantity"`
}

type SnapRsponse struct {
	Token       string `json:"token"`
	RedirectURL string `json:"redirect_url"`
}

type MidtransNotification struct {
	TransactionTime        string          `json:"transaction_time"`
	TransactionStatus      string          `json:"transaction_status"`
	TransactionID          string          `json:"transaction_id"`
	StatusMessage          string          `json:"status_message"`
	StatusCode             string          `json:"status_code"`
	SignatureKey           string          `json:"signature_key"`
	PaymentType            string          `json:"payment_type"`
	OrderID                string          `json:"order_id"`
	MerchantID             string          `json:"merchant_id"`
	MaskedCard             string          `json:"masked_card"`
	GrossAmount            string          `json:"gross_amount"`
	SettlementTime         string          `json:"settlement_time"`
	Issuer                 string          `json:"issuer"`
	FraudStatus            string          `json:"fraud_status"`
	Eci                    string          `json:"eci"`
	Currency               string          `json:"currency"`
	ChannelResponseMessage string          `json:"channel_response_message"`
	ChannelResponseCode    string          `json:"channel_response_code"`
	CardType               string          `json:"card_type"`
	Bank                   string          `json:"bank"`
	ApprovalCode           string          `json:"approval_code"`
	BillKey                string          `json:"bill_key"`
	BillerCode             string          `json:"biller_code"`
	Store                  string          `json:"store"`
	VaNumbers              []VaNumber      `json:"va_numbers"`
	PaymentAmounts         []PaymentAmount `json:"payment_amounts"`
	PermataVaNumber        string          `json:"permata_va_number"`
	Payload                datatypes.JSON  `json:"-"`
}

type VaNumber struct {
	Bank     string `json:"bank"`
	VaNumber string `json:"va_number"`
}

// PaymentAmount is a struct to handle payment amount
type PaymentAmount struct {
	PaidAt string `json:"paid_at"`
	Amount string `json:"amount"`
}

type RefundRequest struct {
	TransactionID string `json:"transaction_id" validate:"required"`
	Reason        string `json:"reason" validate:"required"`
	Amount        int64    `json:"amount" validate:"required"`
}

type CancelRequest struct {
	OrderID       string `json:"order_id" validate:"required"`
	TransactionID string `json:"transaction_id" validate:"required"`
	Reason        string `json:"reason" validate:"required"`
}

type GetAllPayments struct {
	TransactionID string `json:"transaction_id" validate:"required"`
	UserName string    `json:"user_name" validate:"required"`
	Total float64 `json:"total" validate:"required"`
	Metode string `json:"metode" validate:"required"`
	Status string `json:"status" validate:"required"`
	Waktu string `json:"waktu" validate:"required"`
}