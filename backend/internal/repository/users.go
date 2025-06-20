package repository

import (
	"context"
	"mola-web/internal/entity"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(db *gorm.DB, user *entity.User) error
	FindAll(ctx context.Context) ([]entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	GetUserProfile(ctx context.Context, userID uuid.UUID) (*entity.User, error)
	UpdateUser(db *gorm.DB, user *entity.User) error
	UpdateUserProfile(db *gorm.DB, userProfile *entity.UserProfile) error
	GetUserAddress(ctx context.Context, userID uuid.UUID) (*entity.UserAddress, error)
	UpdateUserAddress(db *gorm.DB, userAddress *entity.UserAddress) error
	ForgotPassword(db *gorm.DB, email string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) FindAll(ctx context.Context) ([]entity.User, error) {
	user := make([]entity.User, 0)
	if err := r.db.WithContext(ctx).
		Preload("UserProfile").
		Find(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	user := new(entity.User)
	if err := r.db.WithContext(ctx).
		Where("email = ?", email).
		First(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) Create(db *gorm.DB, user *entity.User) error {
	return db.Create(user).Error
}

func (r *userRepository) GetUserProfile(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
	user := new(entity.User)
	if err := r.db.WithContext(ctx).
		Preload("UserProfile").
		Preload("UserAddresses").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *userRepository) UpdateUser(db *gorm.DB, user *entity.User) error {
	return db.Save(user).Error
}
func (r *userRepository) UpdateUserProfile(db *gorm.DB, userProfile *entity.UserProfile) error {
	return db.Where("user_id = ?", userProfile.UserID).Save(userProfile).Error
}
func (r *userRepository) GetUserAddress(ctx context.Context, userID uuid.UUID) (*entity.UserAddress, error){
	userAddress := new(entity.UserAddress)
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		First(&userAddress).Error; err != nil {
		return nil, err
	}
	return userAddress, nil
}
func (r *userRepository) UpdateUserAddress(db *gorm.DB, userAddress *entity.UserAddress) error {
	return db.Where("user_id = ?", userAddress.UserID).Save(userAddress).Error
}

func (r *userRepository) ForgotPassword(db *gorm.DB, email string) error {
	return db.Model(&entity.User{}).Where("email = ?", email).Update("password", "").Error
}
