package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Shipment struct {
	ID         uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID    uuid.UUID      `gorm:"type:uuid;not null" json:"order_id"`
	ResiNumber string         `gorm:"type:varchar(100)" json:"resi_number"`
	Cost       float64        `gorm:"type:numeric(12,2);not null" json:"cost"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Order *Order `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"order,omitempty"`
}

func (s *Shipment) TableName() string {
	return "shipments"
}
