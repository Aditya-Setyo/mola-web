package dto

import (
	"mime/multipart"

	"github.com/google/uuid"
)

type GetAllProducts struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Stock        int       `json:"stock"`
	Weight       float64   `json:"weight"`
	Price        float64   `json:"price"`
	Description  *string   `json:"description"`
	ImageURL     *string   `json:"image_url"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName *string   `json:"category_name"`
	HasVariant   bool      `json:"has_variant"`
	Variants     []ProductVariantInfo  `json:"variants,omitempty"`
}

type GetProductByCategoryID struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Stock        int       `json:"stock"`
	Weight       float64   `json:"weight"`
	Price        float64   `json:"price"`
	Description  *string   `json:"description"`
	ImageURL     *string   `json:"image_url"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName *string   `json:"category_name"`
	HasVariant   bool      `json:"has_variant"`
	Variants     []ProductVariantInfo  `json:"variants,omitempty"`
}

type GetProductByName struct {
	ID           uuid.UUID             `json:"id"`
	Name         string                `json:"name"`
	Weight       float64               `json:"weight"`
	Price        float64               `json:"price"`
	Stock        int                   `json:"stock"`
	Description  *string               `json:"description"`
	ImageURL     *string               `json:"image_url"`
	CategoryID   *uint                 `json:"category_id"`
	CategoryName *string               `json:"category_name"`
	HasVariant   bool                  `json:"has_variant"`
	Variants     []ProductVariantInfo  `json:"variants,omitempty"` // hanya muncul jika ada variasi
}


type ProductVariantInfo struct {
	ID      uuid.UUID `json:"id"`
	ColorID *uint      `json:"color_id"`
	SizeID  *uint      `json:"size_id"`
	Color   string   `json:"color"`
	Size    string   `json:"size"`
	Stock   int       `json:"stock"`
}


type GetProductByID struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Stock        int       `json:"stock"`
	Weight       float64   `json:"weight"`
	Price        float64   `json:"price"`
	Description  *string   `json:"description"`
	ImageURL     *string   `json:"image_url"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName *string   `json:"category_name"`
	HasVariant   bool      `json:"has_variant"`
	Variants     []ProductVariantInfo  `json:"variants,omitempty"`
}

type GetProductByIDShowOrder struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Weight       float64   `json:"weight"`
	Price        float64   `json:"price"`
	Description  *string   `json:"description"`
	Stock        int       `json:"stock"`
	ImageURL     *string   `json:"image_url"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName *string   `json:"category_name"`
	HasVariant   bool      `json:"has_variant"`
	ColorName    *string   `json:"color"`
	SizeName     *string   `json:"size"`
	Variants     []ProductVariantInfo  `json:"variants,omitempty"`
}

type GetProductReviewResponse struct {
	ID          uuid.UUID `json:"id"`
	UserName    string    `json:"user_name"`
	ProductID   uuid.UUID `json:"product_id"`
	Rating      float64   `json:"rating"`
	Review      string    `json:"review"`
}


type CreateProductRequest struct {
	Name        string     `json:"name" validate:"required"`
	CategoryID  *uint      `json:"category_id"`
	Description *string    `json:"description"`
	ImageURL    *string    `json:"image_url"`
	Image       *multipart.FileHeader
	HasVariant  bool       `json:"has_variant"`
	Price       float64    `json:"price" validate:"required,min=0"`
	Weight      float64    `json:"weight"`
	Stock   int   `json:"stock" validate:"min=0"`

	// digunakan jika HasVariant == true
	Variants []CreateProductVariantRequest `json:"variants,omitempty" validate:"omitempty,dive"`
}

type CreateProductVariantRequest struct {
	ColorID *uint    `json:"color_id" validate:"required"`
	SizeID  *uint    `json:"size_id" validate:"required"`
	Stock   int      `json:"stock" validate:"required,min=0"`
}

type UpdateProductRequest struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Name        string     `json:"name" validate:"required"`
	CategoryID  *uint      `json:"category_id"`
	Description *string    `json:"description"`
	ImageURL    *string    `json:"image_url"`
	Image       *multipart.FileHeader
	HasVariant  bool       `json:"has_variant"`
	Price       float64    `json:"price" validate:"required,min=0"`
	Weight      float64    `json:"weight"`
	Stock   int   `json:"stock" validate:"min=0"`

	// digunakan jika HasVariant == true
	Variants []UpdateProductVariantRequest `json:"variants,omitempty" validate:"omitempty,dive"`
}
type UpdateProductVariantRequest struct {
	ID      *uuid.UUID `json:"id"` // NULL jika varian baru
	ColorID *uint `json:"color_id"`
	SizeID  *uint `json:"size_id"`
	Stock   int   `json:"stock" validate:"min=0"`
}
type DeleteProductRequest struct {
	ID uuid.UUID `json:"id" validate:"required"`
}

type ProductReviewRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	UserName  string    `json:"user_name" validate:"required"`
	Rating    float64       `json:"rating" validate:"required"`
	Review    string    `json:"review" validate:"required"`
}