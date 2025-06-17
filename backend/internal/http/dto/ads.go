package dto

import (
	"mime/multipart"

	"github.com/google/uuid"
)

type CreateAdRequest struct {
	ID        uuid.UUID `json:"id"`
	ImageURL  string    `json:"image_url"`
	Category  string    `json:"category"`
	Image     *multipart.FileHeader
}

type GetAdsByCategoryResponse struct {
	ImageURL  string    `json:"image_url"`
	Category  string    `json:"category"`
}
