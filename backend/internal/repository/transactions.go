package repository

import (
	"context"
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type TransactionRepository interface {
	GetAll(ctx context.Context) ([]entity.Payment, error)
	CreatePayment(db *gorm.DB, payment *entity.Payment) error

}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db}
}


func (r *transactionRepository) GetAll(ctx context.Context) ([]entity.Payment, error) {
	var payments []entity.Payment
	if err := r.db.WithContext(ctx).Find(&payments).Error; err != nil {
		return nil, err
	}
	return payments, nil
}
func (r *transactionRepository) CreatePayment(db *gorm.DB, payment *entity.Payment) error {
	if err := db.Create(payment).Error; err != nil {
		return err
	}
	return nil
}