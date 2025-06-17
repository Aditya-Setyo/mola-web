package token

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type TokenUseCase interface {
	GenerateAccessToken(claims JwtCustomClaims) (string, error)
}

type tokenUseCase struct {
	secretKey string
}

func NewTokenUseCase(secretKey string) TokenUseCase {
	return &tokenUseCase{secretKey}
}

type JwtCustomClaims struct {
	Name   string    `json:"name"`
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

func (t *tokenUseCase) GenerateAccessToken(claims JwtCustomClaims) (string, error) {
	plainToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	encodedToken, err := plainToken.SignedString([]byte(t.secretKey))
	if err != nil {
		return "", err
	}

	return encodedToken, nil
}
