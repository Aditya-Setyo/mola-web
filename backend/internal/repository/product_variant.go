package repository

import (
	"mola-web/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductVariantRepository interface {
	Create(db *gorm.DB, productVariant *entity.ProductVariant) error
	GetByID(db *gorm.DB, id uuid.UUID) (*entity.ProductVariant, error)
	GetByProductID(db *gorm.DB, productID uuid.UUID) ([]*entity.ProductVariant, error)
	GetStockProductVariant(db *gorm.DB, id uuid.UUID) (int64, error)
	Update(db *gorm.DB, productVariant *entity.ProductVariant) error
	UpdateStock(db *gorm.DB, id uuid.UUID, stock int) error
	Delete(db *gorm.DB, id uuid.UUID) error
	DeleteByProductID(db *gorm.DB, productID uuid.UUID) error
	DeleteByID(db *gorm.DB, id uuid.UUID) error
}

type productVariantRepository struct {
	db *gorm.DB
}

func NewProductVariantRepository(db *gorm.DB) ProductVariantRepository {
	return &productVariantRepository{db}
}

func (r *productVariantRepository) GetStockProductVariant(db *gorm.DB, id uuid.UUID) (int64, error) {
	var stock int64
	err := db.
		Table("product_variants").
		Select("stock").
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Scan(&stock).Error

	if err != nil {
		return 0, err
	}

	return stock, nil
}
func (r *productVariantRepository) GetByID(db *gorm.DB, id uuid.UUID) (*entity.ProductVariant, error) {
	var productVariant entity.ProductVariant
	if err := db.First(&productVariant, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &productVariant, nil
}

func (r *productVariantRepository) Create(db *gorm.DB, productVariant *entity.ProductVariant) error {
	if err := db.Create(productVariant).Error; err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) Update(db *gorm.DB, productVariant *entity.ProductVariant) error {
	if err := db.Model(&entity.ProductVariant{}).Where("id = ?", productVariant.ID).Updates(productVariant).Error; err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) UpdateStock(db *gorm.DB, id uuid.UUID, stock int) error {
	if err := db.Table("product_variants").Where("id = ?", id).Update("stock", stock).Error; err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) Delete(db *gorm.DB, id uuid.UUID) error {
	if err := db.Delete(&entity.ProductVariant{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) DeleteByProductID(db *gorm.DB, productID uuid.UUID) error {
	if err := db.Delete(&entity.ProductVariant{}, "product_id = ?", productID).Error; err != nil {
		return err
	}
	return nil
}

func (r *productVariantRepository) GetByProductID(db *gorm.DB, productID uuid.UUID) ([]*entity.ProductVariant, error) {
	var variants []*entity.ProductVariant
	if err := db.Where("product_id = ?", productID).Find(&variants).Error; err != nil {
		return nil, err
	}
	return variants, nil
}

func (r *productVariantRepository) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Where("id = ?", id).Delete(&entity.ProductVariant{}).Error
}
