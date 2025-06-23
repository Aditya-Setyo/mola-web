package repository

import (
	"context"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductRepository interface {
	GetAll(ctx context.Context) ([]*dto.GetAllProducts, error)
	GetByID(db *gorm.DB, id uuid.UUID) (*dto.GetProductByID, error)
	GetByCategoryID(ctx context.Context, categoryID uint) ([]*dto.GetProductByCategoryID, error)
	GetByName(ctx context.Context, name string) ([]*entity.Product, error)
	GetStockProduct(db *gorm.DB, id uuid.UUID) (int64, error)
	UpdateStockProduct(db *gorm.DB, stock int64, id uuid.UUID) error
	InsertProductReview(db *gorm.DB, review *entity.ProductReview) error
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

func (r *productRepository) GetAll(ctx context.Context) ([]*dto.GetAllProducts, error) {
	products := make([]*dto.GetAllProducts, 0)

	err := r.db.WithContext(ctx).
		Table("products").
		Select(`
			products.id,
			products.name,
			products.description,
			products.image_url,
			products.has_variant,
			products.stock,
			products.price,
			products.weight,
			products.category_id,
			categories.name AS category_name,
			products.color_id,
			colors.name AS color_name,
			products.size_id,
			sizes.name AS size_name
		`).
		Joins("LEFT JOIN categories ON categories.id = products.category_id").
		Joins("LEFT JOIN colors ON colors.id = products.color_id").
		Joins("LEFT JOIN sizes ON sizes.id = products.size_id").
		Where("products.deleted_at IS NULL").
		Scan(&products).Error

	if err != nil {
		return nil, err
	}

	return products, nil
}

func (r *productRepository) GetByCategoryID(ctx context.Context, categoryID uint) ([]*dto.GetProductByCategoryID, error) {
	products := make([]*dto.GetProductByCategoryID, 0)

	err := r.db.WithContext(ctx).
		Table("products").
		Select(`
			products.id,
			products.name,
			products.description,
			products.image_url,
			products.has_variant,
			products.stock,
			products.price,
			products.weight,
			products.category_id,			
			categories.name AS category_name,
			products.color_id,
			colors.name AS color_name,
			products.size_id,
			sizes.name AS size_name
		`).
		Joins("LEFT JOIN categories ON categories.id = products.category_id").
		Joins("LEFT JOIN colors ON colors.id = products.color_id").
		Joins("LEFT JOIN sizes ON sizes.id = products.size_id").
		Where("products.category_id = ?", categoryID).
		Where("products.deleted_at IS NULL").
		Scan(&products).Error

	if err != nil {
		return nil, err
	}

	return products, nil

}

func (r *productRepository) GetByName(ctx context.Context, name string) ([]*entity.Product, error) {
	products := make([]*entity.Product, 0)
	if err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Color").
		Preload("Size").
		Where("products.name ILIKE ?", "%"+name+"%").
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) GetByID(db *gorm.DB, id uuid.UUID) (*dto.GetProductByID, error) {
	products := new(dto.GetProductByID)

	err := db.
		Table("products").
		Select(`
			products.id,
			products.name,
			products.description,
			products.image_url,
			products.has_variant,
			products.stock,
			products.price,
			products.weight,
			products.category_id,			
			categories.name AS category_name,
			products.color_id,
			colors.name AS color_name,
			products.size_id,
			sizes.name AS size_name
		`).
		Joins("LEFT JOIN categories ON categories.id = products.category_id").
		Joins("LEFT JOIN colors ON colors.id = products.color_id").
		Joins("LEFT JOIN sizes ON sizes.id = products.size_id").
		Where("products.id = ?", id).
		Where("products.deleted_at IS NULL").
		Take(&products).Error

	if err != nil {
		return nil, err
	}
	return products, nil
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

func (r *productRepository) UpdateStockProduct(db *gorm.DB, stock int64, id uuid.UUID) error {
	if err := db.Table("products").Where("id = ?", id).Update("stock", stock).Error; err != nil {
		return err
	}
	return nil
}

func (r *productRepository) InsertProductReview (db *gorm.DB, review *entity.ProductReview) error {
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
	if err := db.Save(product).Error; err != nil {
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
