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
	ColorID      *uint     `json:"color_id"`
	ColorName    *string   `json:"color"`
	SizeID       *uint     `json:"size_id"`
	SizeName     *string   `json:"size"`
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
	ColorID      *uint     `json:"color_id"`
	ColorName    *string   `json:"color"`
	SizeID       *uint     `json:"size_id"`
	SizeName     *string   `json:"size"`
}

type GetProductByName struct {
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
	ColorName    *string   `json:"color"`
	SizeName     *string   `json:"size"`
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
	ColorName    *string   `json:"color"`
	SizeName     *string   `json:"size"`
}

type GetProductByIDShowOrder struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Weight       float64   `json:"weight"`
	Price        float64   `json:"price"`
	Description  *string   `json:"description"`
	ImageURL     *string   `json:"image_url"`
	CategoryID   *uint     `json:"category_id"`
	CategoryName *string   `json:"category_name"`
	HasVariant   bool      `json:"has_variant"`
	ColorName    *string   `json:"color"`
	SizeName     *string   `json:"size"`
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
	ColorID     *uint `json:"color_id"`
	SizeID      *uint `json:"size_id"`
	Stock       int        `json:"stock" validate:"min=0"`
}

type UpdateProductRequest struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Name        string    `json:"name" validate:"required"`
	CategoryID  *uint     `json:"category_id"`
	Description *string   `json:"description"`
	ImageURL    *string   `json:"image_url"`
	Image       *multipart.FileHeader
	HasVariant  bool      `json:"has_variant"`
	Price       float64   `json:"price" validate:"required,min=0"`
	Weight      float64   `json:"weight"`
	ColorID     *uint     `json:"color_id"`
	SizeID      *uint     `json:"size_id"`
	Stock       int       `json:"stock" validate:"min=0"`
}

type DeleteProductRequest struct {
	ID uuid.UUID `json:"id" validate:"required"`
}
