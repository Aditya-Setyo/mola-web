package repository

import (
	"context"
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	GetAll(ctx context.Context) ([]entity.Category, error)
	Create(db *gorm.DB, category *entity.Category) error
	Update(db *gorm.DB, category *entity.Category) error
	Delete(db *gorm.DB, id uint) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db}
}

func (r *categoryRepository) GetAll(ctx context.Context) ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.WithContext(ctx).Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepository) Create(db *gorm.DB, category *entity.Category) error {
	if err := db.Create(category).Error; err != nil {
		return err
	}
	return nil
}

func (r *categoryRepository) Update(db *gorm.DB, category *entity.Category) error {
	if err := db.Model(&entity.Category{}).Where("id = ?", category.ID).Updates(category).Error; err != nil {
		return err
	}
	return nil
}

func (r *categoryRepository) Delete(db *gorm.DB, id uint) error {
	if err := db.Delete(&entity.Category{}, id).Error; err != nil {
		return err
	}
	return nil
}
