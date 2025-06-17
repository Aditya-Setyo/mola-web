package entity

import (
	"time"

	"gorm.io/gorm"
)

type Size struct {
	ID        uint           `gorm:"primaryKey,autoincrement" json:"id"`
	Name      string         `gorm:"type:varchar(30);not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Products []Product `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"products,omitempty"`
}

func (Size) TableName() string {
	return "public.sizes"
}
