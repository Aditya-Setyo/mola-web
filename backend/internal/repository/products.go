package repository

import (
	"context"
	"mola-web/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductRepository interface {
	GetAll(ctx context.Context) ([]*entity.Product, error)
	GetByID(db *gorm.DB, id uuid.UUID) (*entity.Product, error)
	GetByCategoryID(ctx context.Context, categoryID uint) ([]entity.Product, error)
	GetByName(ctx context.Context, name string) ([]*entity.Product, error)
	GetStockProduct(db *gorm.DB, id uuid.UUID) (int64, error)
	UpdateStockProduct(db *gorm.DB, stock int64, id uuid.UUID) error
	InsertProductReview(db *gorm.DB, review *entity.ProductReview) error
	GetProductReviews(ctx context.Context, productID uuid.UUID) ([]entity.ProductReview, error)
	Create(db *gorm.DB, product *entity.Product) error
	Update(db *gorm.DB, product *entity.Product) error
	Delete(db *gorm.DB, id uuid.UUID) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db}
}

func (r *productRepository) GetAll(ctx context.Context) ([]*entity.Product, error) {
	products := make([]*entity.Product, 0)

	if err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Variants").
		Preload("Variants.Color").
		Preload("Variants.Size").
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) GetByCategoryID(ctx context.Context, categoryID uint) ([]entity.Product, error) {
	products := make([]entity.Product, 0)

	if err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Variants").
		Preload("Variants.Color").
		Preload("Variants.Size").
		Where("products.category_id = ?", categoryID).
		Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil

}

func (r *productRepository) GetByName(ctx context.Context, name string) ([]*entity.Product, error) {
	products := make([]*entity.Product, 0)
	if err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Variants").
		Preload("Variants.Color").
		Preload("Variants.Size").
		Where("products.name ILIKE ?", "%"+name+"%").
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) GetByID(db *gorm.DB, id uuid.UUID) (*entity.Product, error) {
	var product entity.Product

	err := db.
		Preload("Category").
		Preload("Variants").
		Preload("Variants.Color").
		Preload("Variants.Size").
		First(&product, "id = ? AND deleted_at IS NULL", id).Error

	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) GetStockProduct(db *gorm.DB, id uuid.UUID) (int64, error) {
	var stock int64
	err := db.
		Table("products").
		Select("stock").
		Where("id = ?", id).
		Where("deleted_at IS NULL").
		Scan(&stock).Error

	if err != nil {
		return 0, err
	}

	return stock, nil
}



func (r *productRepository) GetProductReviews(ctx context.Context, productID uuid.UUID) ([]entity.ProductReview, error) {
	reviews := make([]entity.ProductReview, 0)
	if err := r.db.WithContext(ctx).
		Where("product_id = ?", productID).
		Find(&reviews).Error; err != nil {
		return nil, err
	}
	return reviews, nil
}

func (r *productRepository) UpdateStockProduct(db *gorm.DB, stock int64, id uuid.UUID) error {
	if err := db.Table("products").Where("id = ?", id).Update("stock", stock).Error; err != nil {
		return err
	}
	return nil
}

func (r *productRepository) InsertProductReview(db *gorm.DB, review *entity.ProductReview) error {
	if err := db.Create(review).Error; err != nil {
		return err
	}
	return nil
}

func (r *productRepository) Create(db *gorm.DB, product *entity.Product) error {
	if err := db.Create(product).Error; err != nil {
		return err
	}
	return nil
}

func (r *productRepository) Update(db *gorm.DB, product *entity.Product) error {
	updateFields := map[string]interface{}{
		"name":        product.Name,
		"category_id": product.CategoryID,
		"description": product.Description,
		"image_url":   product.ImageURL,
		"has_variant": product.HasVariant, // 👈 wajib ini!
		"stock":       product.Stock,
		"price":       product.Price,
		"weight":      product.Weight,
	}

	if err := db.Model(&entity.Product{}).Where("id = ?", product.ID).Updates(updateFields).Error; err != nil {
		return err
	}
	return nil
}


func (r *productRepository) Delete(db *gorm.DB, id uuid.UUID) error {
	if err := db.Delete(&entity.Product{}, id).Error; err != nil {
		return err
	}
	return nil
}
