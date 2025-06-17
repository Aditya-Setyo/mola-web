package repository

import (
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type AdRepository interface {
	// FindAll(ctx context.Context) ([]entity.Ad, error)
	Create(db *gorm.DB, ad entity.Ad) (*entity.Ad, error)
	GetByCategory(db *gorm.DB, category string) (*entity.Ad, error)
	Update(db *gorm.DB, ad entity.Ad) error
	// FindById(ctx context.Context, id uuid.UUID) (entity.Ad, error)
	// Update(ctx context.Context, ads entity.Ad) (entity.Ad, error)
	// Delete(ctx context.Context, id uuid.UUID) error
}

type adRepository struct {
	db *gorm.DB
}

func NewAdRepository(db *gorm.DB) AdRepository {
	return &adRepository{db: db}
}

func (r *adRepository) Create(db *gorm.DB, ad entity.Ad) (*entity.Ad, error) {
	if err := db.Create(&ad).Error; err != nil {
		return nil, err
	}
	return &ad, nil
}

func (r *adRepository) GetByCategory(db *gorm.DB, category string) (*entity.Ad, error) {
	var ads *entity.Ad
	if err := db.Where("category = ?", category).Find(&ads).Error; err != nil {
		return nil, err
	}
	return ads, nil
}

func (r *adRepository) Update(db *gorm.DB, ad entity.Ad) error {
	if err := db.Save(&ad).Error; err != nil {
		return err
	}
	return nil
}
