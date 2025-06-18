package dto

import "github.com/google/uuid"

type LoginRequest struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type GetUserProfileResponse struct {
	ProfileID uuid.UUID `json:"profile_id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
}

type UpdateUserProfileRequest struct {
	ProfileID uuid.UUID `json:"profile_id" validate:"required"`
	FullName  string    `json:"full_name"`
	Phone     string    `json:"phone"`
}
type GetUserAddressResponse struct {
	ID           uuid.UUID `json:"id"`
	AddressLine1 string    `json:"address_line1"`
	AddressLine2 string    `json:"address_line2"`
	City         string    `json:"city"`
	State        string    `json:"state"`
	PostalCode   string    `json:"postal_code"`
	Country      string    `json:"country"`
	IsDefault    bool      `json:"is_default"`
}
type UpdateUserAddressRequest struct {
	ID      uuid.UUID `json:"id" validate:"required"`
	Address string    `json:"address" validate:"required"`
}

type UpdateUserPasswordRequest struct {
	ID       uint   `json:"id" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UserLogs struct{
	ID uuid.UUID `json:"id" validate:"required"`
	Email string `json:"email" validate:"required"`
	Name string `json:"name" validate:"required"`
}

type GoogleLoginRequest struct {
	IdToken string `json:"id_token"`
}