package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Product model
type Product struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	CategoryID  *uint          `gorm:"type:serial,not null"  json:"category_id"`
	Description *string        `gorm:"type:text" json:"description"`
	ImageURL    *string        `gorm:"type:text" json:"image_url"`
	HasVariant  bool           `gorm:"default:false" json:"has_variant"`
	ColorID     *uint          `gorm:"type:serial,not null" json:"color_id"`
	SizeID      *uint          `gorm:"type:serial,not null" json:"size_id"`
	Stock       int            `gorm:"default:0" json:"stock"`
	Price       float64        `gorm:"type:numeric(12,2);not null" json:"price"`
	Weight      float64        `gorm:"type:numeric(12,2);not null" json:"weight"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Category       *Category       `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"category,omitempty"`
	Color          *Color          `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"color,omitempty"`
	Size           *Size           `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"size,omitempty"`
	OrderItems     []OrderItem     `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"order_items,omitempty"`
	ProductReviews []ProductReview `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"product_reviews,omitempty"`
}

func (Product) TableName() string {
	return "public.products"
}

type ProductReview struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Rating    int       `gorm:"not null" json:"rating"`
	Review    *string   `gorm:"type:text" json:"review"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	Product *Product `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"product,omitempty"`
	User    *User    `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (ProductReview) TableName() string {
	return "public.product_reviews"
}
