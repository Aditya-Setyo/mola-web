package repository

import (
	"context"
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type ColorRepository interface {
	GetAll(ctx context.Context) ([]entity.Color, error)
	Create(db *gorm.DB, color *entity.Color) error
	Update(db *gorm.DB, color *entity.Color) error
	Delete(db *gorm.DB, id uint) error
}

type colorRepository struct {
	db *gorm.DB
}

func NewColorRepository(db *gorm.DB) ColorRepository {
	return &colorRepository{db}
}

func (r *colorRepository) GetAll(ctx context.Context) ([]entity.Color, error) {
	var colors []entity.Color
	if err := r.db.WithContext(ctx).Find(&colors).Error; err != nil {
		return nil, err
	}
	return colors, nil
}

func (r *colorRepository) Create(db *gorm.DB, color *entity.Color) error {
	if err := db.Create(&color).Error; err != nil {
		return err
	}
	return nil
}

func (r *colorRepository) Update(db *gorm.DB, color *entity.Color) error {
	if err := db.Model(&entity.Color{}).Where("id = ?", color.ID).Updates(color).Error; err != nil {
		return err
	}
	return nil
}

func (r *colorRepository) Delete(db *gorm.DB, id uint) error {
	if err := db.Delete(&entity.Color{}, id).Error; err != nil {
		return err
	}
	return nil
}
