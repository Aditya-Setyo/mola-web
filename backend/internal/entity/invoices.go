package entity

import (
	"time"

	"github.com/google/uuid"
)

type Invoice struct {
	ID            uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID     uuid.UUID  `gorm:"type:uuid;not null" json:"order_id"`
	InvoiceNumber string     `gorm:"type:varchar(100);not null;unique" json:"invoice_number"`
	IssuedAt      time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"issued_at"`
	DueDate       *time.Time `json:"due_date"`
	Status        string     `gorm:"type:varchar(30);default:unpaid" json:"status"`

	// Relationships
	Order *Order `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"booking,omitempty"`
}

func (Invoice) TableName() string {
	return "invoices"
}
