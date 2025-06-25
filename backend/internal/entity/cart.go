package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Cart struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Status    string         `gorm:"type:varchar(20);not null;default:active" json:"status"` // active, checkout, abandoned
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	User      *User      `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
	CartItems []CartItem `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"cart_items,omitempty"`
}

func (Cart) TableName() string {
	return "carts"
}

type CartItem struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CartID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"cart_id"`
	ProductID uuid.UUID      `gorm:"type:uuid;not null;index" json:"product_id"`
	ProductVariantID *uuid.UUID `gorm:"type:uuid" json:"product_variant_id,omitempty"`
	Quantity  int            `gorm:"not null;default:1;check:quantity > 0" json:"quantity"`
	Note      string         `gorm:"type:text" json:"note,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Cart    *Cart    `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"cart,omitempty"`
	Product *Product `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"product,omitempty"`
	ProductVariant *ProductVariant `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"product_variant,omitempty"`
}

func (CartItem) TableName() string {
	return "cart_items"
}
