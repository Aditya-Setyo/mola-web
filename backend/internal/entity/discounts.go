package entity

import (
	"time"

	"github.com/google/uuid"
)

type Discount struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code         string     `gorm:"type:varchar(50);not null;unique" json:"code"`
	DiscountType string     `gorm:"type:varchar(20);not null" json:"discount_type"`
	Value        float64    `gorm:"type:numeric(12,2);not null" json:"value"`
	StartDate    *time.Time `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	UsageLimit   *int       `json:"usage_limit"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (Discount) TableName() string {
	return "discounts"
}
