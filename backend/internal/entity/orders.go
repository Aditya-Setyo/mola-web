package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	OrderCode     string         `gorm:"type:varchar(50);uniqueIndex" json:"order_code"`
	Status        string         `gorm:"type:varchar(20);default:pending" json:"status"`
	IsPaid        bool           `gorm:"default:false" json:"is_paid"`
	TotalAmount   float64        `gorm:"type:numeric(12,2);not null" json:"total_amount"`
	TotalWeight   float64        `gorm:"type:numeric(12,2);not null" json:"total_weight"`
	PaymentStatus string         `gorm:"type:varchar(30);default:pending" json:"payment_status"`
	TokenMidtrans *string        `gorm:"type:varchar(100)" json:"token_midtrans"`
	PaymentUrl    *string        `gorm:"type:varchar(100)" json:"payment_url"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	OrderItems []OrderItem `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"order_items"`

	// Relationships
	User      *User      `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
	Payments  []Payment  `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"payments,omitempty"`
	Invoices  []Invoice  `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"invoices,omitempty"`
	Shipments []Shipment `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"shipments,omitempty"`
}

func (b *Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID          uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	ProductID        uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	ProductVariantID uuid.UUID `gorm:"type:uuid" json:"product_variant_id,omitempty"`
	Quantity         int       `gorm:"not null;default:1" json:"quantity"`
	Price            float64   `gorm:"not null" json:"price"`
	Subtotal         float64   `gorm:"not null" json:"subtotal"`
	Note             *string   `gorm:"type:text" json:"note,omitempty"`

	Product        *Product        `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"product,omitempty"`
	ProductVariant *ProductVariant `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"product_variant,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (b *OrderItem) TableName() string {
	return "order_items"
}
