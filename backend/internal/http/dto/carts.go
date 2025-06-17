package dto

import "github.com/google/uuid"

type AddToCartRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	Quantity  int       `json:"quantity" validate:"required,min=1"`
	Note      string    `json:"note"`
}

type AddToCartItemsRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	Quantity  int       `json:"quantity" validate:"required,min=1"`
	Note      *string   `json:"note"`
}
type GetCartItemsResponse struct {
	CartID        uuid.UUID   `json:"cart_id"`
	CartItems     []CartItems `json:"cart_items"`
	TotalAmount   float64     `json:"total_amount"`
	TotalWeight   float64     `json:"total_weight"`
	PaymentUrl    string      `json:"payment_url"`
	TokenMidtrans string      `json:"token_midtrans"`
}
type CartItems struct {
	CartItemsID uuid.UUID       `json:"cart_item_id"`
	Quantity    int             `json:"quantity"`
	Product     *GetProductByID `json:"product"`
	Note        *string         `json:"note"`
	Subtotal    float64         `json:"subtotal"`
}

type UpdateCartItemRequest struct {
	ID        uuid.UUID `json:"cart_item_id" validate:"required"`
	CartID    uuid.UUID `json:"cart_id" validate:"required"`
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	Quantity  int       `json:"quantity" validate:"required,min=1"`
	Note      *string   `json:"note"`
}

type UpdateCartRequest struct {
	ID     uuid.UUID `json:"id" validate:"required"`
	Status string    `json:"status" validate:"required"`
}
