package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Payment struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID           uuid.UUID      `gorm:"type:uuid;not null" json:"order_id"`
	PaymentMethod     *string        `gorm:"type:varchar(100)" json:"payment_method"`
	TransactionID     string         `gorm:"size:100;index"`
	TransactionStatus string         `gorm:"size:100;index"`
	Amount            float64        `gorm:"type:numeric(12,2);not null" json:"amount"`
	Currency          string         `gorm:"type:varchar(10);default:IDR" json:"currency"`
	Payload           datatypes.JSON `gorm:"type:jsonb" json:"payload"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Order *Order `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"order,omitempty"`
	// Payment log hapus
}

func (p *Payment) TableName() string {
	return "payments"
}
