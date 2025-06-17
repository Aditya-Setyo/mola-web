package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ad struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ImageURL  string         `gorm:"type:text" json:"image_url"`
	Category  string         `gorm:"type:text" json:"category"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (Ad) TableName() string {
	return "ads"
}