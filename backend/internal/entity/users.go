package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null" json:"name"`
	Email     string         `gorm:"type:varchar(100);not null;unique" json:"email"`
	Password  string         `gorm:"type:text;not null" json:"-"`
	Role      string         `gorm:"type:varchar(20);not null;default:admin" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Orders []Order `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"orders,omitempty"`
	UserProfile   *UserProfile    `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user_profile,omitempty"`
	UserAddresses *UserAddress   `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user_addresses,omitempty"`
	ProductReviews []ProductReview `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"product_reviews,omitempty"`
	Carts         []Cart          `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"carts,omitempty"`

}

func (User) TableName() string {
	return "public.users"
}


type UserProfile struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      *uuid.UUID     `gorm:"type:uuid;unique" json:"user_id"`
	FullName    string         `gorm:"type:varchar(100);not null" json:"full_name"`
	PhoneNumber *string        `gorm:"type:varchar(20)" json:"phone_number"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	User     *User     `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (UserProfile) TableName() string {
	return "public.user_profiles"
}

type UserAddress struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID       *uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	AddressLine1 string         `gorm:"type:text;not null" json:"address_line1"`
	AddressLine2 *string        `gorm:"type:text" json:"address_line2"`
	City         string         `gorm:"type:varchar(50);not null" json:"city"`
	State        string         `gorm:"type:varchar(50);not null" json:"state"`
	PostalCode   string         `gorm:"type:varchar(20);not null" json:"postal_code"`
	Country      string         `gorm:"type:varchar(50);not null" json:"country"`
	IsDefault    bool           `gorm:"default:false" json:"is_default"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	User *User `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (UserAddress) TableName() string {
	return "public.user_addresses"
}
