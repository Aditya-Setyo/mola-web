package entity

import (
	"time"

	"gorm.io/gorm"
)

// Category model
type Category struct {
	ID        uint           `gorm:"primaryKey,autoincrement" json:"id"`
	Name      string         `gorm:"type:varchar(50);not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Products  []Product      `gorm:"constraint:OnUpdate:NO ACTION,OnDelete:NO ACTION;" json:"products,omitempty"`
}

func (Category) TableName() string {
	return "public.categories"
}
