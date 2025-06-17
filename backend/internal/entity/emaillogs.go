package entity

import (
	"time"

	"github.com/google/uuid"
)

type EmailLog struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID   *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	SentTo    string     `gorm:"type:varchar(100);not null" json:"sent_to"`
	Subject   *string    `gorm:"type:text" json:"subject"`
	Message   *string    `gorm:"type:text" json:"message"`
	SentAt    time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"sent_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	// Relationships
	Order *Order `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:CASCADE;" json:"booking,omitempty"`
}

func (e *EmailLog) TableName() string {
	return "email_logs"
}
