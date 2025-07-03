package repository

import (
	"context"
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type SizeRepository interface {
	GetAll(ctx context.Context) ([]entity.Size, error)
	Create(db *gorm.DB, size *entity.Size) error
	Update(db *gorm.DB, size *entity.Size) error
	Delete(db *gorm.DB, id uint) error
}
type sizeRepository struct {
	db *gorm.DB
}

func NewSizeRepository(db *gorm.DB) SizeRepository {
	return &sizeRepository{db}
}

func (r *sizeRepository) GetAll(ctx context.Context) ([]entity.Size, error) {
	var sizes []entity.Size
	if err := r.db.Find(&sizes).Error; err != nil {
		return nil, err
	}
	return sizes, nil
}

func (r *sizeRepository) Create(db *gorm.DB, size *entity.Size) error {
	if err := db.Create(size).Error; err != nil {
		return err
	}
	return nil
}

func (r *sizeRepository) Update(db *gorm.DB, size *entity.Size) error {
	if err := db.Model(&entity.Size{}).Where("id = ?", size.ID).Updates(size).Error; err != nil {
		return err
	}
	return nil
}

func (r *sizeRepository) Delete(db *gorm.DB, id uint) error {
	if err := db.Delete(&entity.Size{}, id).Error; err != nil {
		return err
	}
	return nil
}
