package entity

import (
	"time"

	"github.com/google/uuid"
)

type Wishlist struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User    *User    `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
	Product *Product `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"product,omitempty"`
}

func (Wishlist) TableName() string {
	return "wishlists"
}