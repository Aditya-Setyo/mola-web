package dto

import "github.com/google/uuid"

type ShipmentRequest struct {
	OrderID    uuid.UUID `json:"order_id"`
	ResiNumber string    `json:"resi_number"`
	Cost       float64   `json:"cost"`
}