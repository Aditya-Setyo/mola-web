package repository

import (
	"mola-web/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartRepository interface {
	AddToCart(db *gorm.DB, userID uuid.UUID, req *entity.Cart) error
	GetCartByUserID(db *gorm.DB, userID uuid.UUID) (*entity.Cart, error)
	GetCartItemsByUserID(db *gorm.DB, userID uuid.UUID) (*entity.Cart, error)
	AddToCartItems(db *gorm.DB, req *entity.CartItem) error
	GetCartItemByCartID(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID) (*entity.CartItem, error)
	GetCartItemByCartIDAndProductIDAndVariantID(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID, variantID uuid.UUID) (*entity.CartItem, error)
	GetCartItemByCartIDAndProductIDWithoutVariant(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID) (*entity.CartItem, error)
	UpdateCartItems(db *gorm.DB, req *entity.CartItem) error
	UpdateCart(db *gorm.DB, req *entity.Cart) error
	ClearCart(db *gorm.DB, cartID uuid.UUID) error
	RemoveCartItem(db *gorm.DB, req *uuid.UUID) error
}

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) CartRepository {
	return &cartRepository{db}
}

func (r *cartRepository) AddToCart(db *gorm.DB, userID uuid.UUID, req *entity.Cart) error {
	if err := db.Create(&req).Error; err != nil {
		return err
	}
	return nil
}
func (r *cartRepository) GetCartByUserID(db *gorm.DB, userID uuid.UUID) (*entity.Cart, error) {
	var req *entity.Cart
	if err := db.Where("user_id = ?", userID).First(&req).Error; err != nil {
		return nil, err
	}
	return req, nil
}
func (r *cartRepository) GetCartItemsByUserID(db *gorm.DB, userID uuid.UUID) (*entity.Cart, error) {
	var req entity.Cart
	if err := db.
		Preload("CartItems").
		Preload("CartItems.Product").
		Preload("CartItems.Product.Category").
		Preload("CartItems.ProductVariant").
		Preload("CartItems.ProductVariant.Color").
		Preload("CartItems.ProductVariant.Size").
		Where("user_id = ?", userID).
		Take(&req).Error; err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *cartRepository) AddToCartItems(db *gorm.DB, req *entity.CartItem) error {
	if err := db.Create(&req).Error; err != nil {
		return err
	}
	return nil
}

func (r *cartRepository) GetCartItemByCartID(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID) (*entity.CartItem, error) {
	var req *entity.CartItem
	if err := db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&req).Error; err != nil {
		return nil, err
	}
	return req, nil
}

func (r *cartRepository) GetCartItemByCartIDAndProductIDAndVariantID(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID, variantID uuid.UUID) (*entity.CartItem, error) {
	var req *entity.CartItem
	if err := db.Where("cart_id = ? AND product_id = ? AND product_variant_id = ?", cartID, productID, variantID).First(&req).Error; err != nil {
		return nil, err
	}
	return req, nil
}

func (r *cartRepository) GetCartItemByCartIDAndProductIDWithoutVariant(db *gorm.DB, cartID uuid.UUID, productID uuid.UUID) (*entity.CartItem, error) {
    var item entity.CartItem
    err := db.Where("cart_id = ? AND product_id = ? AND product_variant_id IS NULL", cartID, productID).First(&item).Error
    if err != nil {
        return nil, err
    }
    return &item, nil
}


func (r *cartRepository) UpdateCartItems(db *gorm.DB, req *entity.CartItem) error {
	if err := db.Model(&entity.CartItem{}).Where("id = ?", req.ID).Updates(req).Error; err != nil {
		return err
	}
	return nil
}

func (r *cartRepository) UpdateCart(db *gorm.DB, req *entity.Cart) error {
	if err := db.Model(&entity.Cart{}).Where("id = ?", req.ID).Updates(req).Error; err != nil {
		return err
	}
	return nil
}

func (r *cartRepository) ClearCart(db *gorm.DB, cartID uuid.UUID) error {
	if err := db.Where("cart_id = ?", cartID).Delete(&entity.CartItem{}).Error; err != nil {
		return err
	}
	return nil
}

func (r *cartRepository) RemoveCartItem(db *gorm.DB, req *uuid.UUID) error {
	if err := db.Delete(&entity.CartItem{}, req).Error; err != nil {
		return err
	}
	return nil
}
