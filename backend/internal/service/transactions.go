package service

import (
	"context"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"log"
	"mola-web/configs"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"
	"strconv"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go/coreapi"
	"gorm.io/gorm"
)

type TransactionService interface {
	PaymentNotification(ctx context.Context, request *dto.MidtransNotification, userID uuid.UUID) error
	Refund(ctx context.Context, request *dto.RefundRequest) error
	Cancel(ctx context.Context, request *dto.CancelRequest) error
}

type transactionService struct {
	productRepo     repository.ProductRepository
	transactionRepo repository.TransactionRepository
	orderRepo       repository.OrderRepository
	repoVariant     repository.ProductVariantRepository
	DB              *gorm.DB
	cacheable       cache.Cacheable
	tokenUseCase    token.TokenUseCase
	config          configs.MidtransConfig
}

func NewTransactionService(db *gorm.DB, productRepo repository.ProductRepository, transactionRepo repository.TransactionRepository, orderRepo repository.OrderRepository, repoVariant repository.ProductVariantRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable, config configs.MidtransConfig) TransactionService {
	return &transactionService{
		DB:              db,
		productRepo:     productRepo,
		transactionRepo: transactionRepo,
		orderRepo:       orderRepo,
		repoVariant:     repoVariant,
		tokenUseCase:    tokenUseCase,
		cacheable:       cacheable,
		config:          config,
	}
}

func CalculateMidtransSignature(
	orderID string,
	statusCode string,
	grossAmount string,
	serverKey string,
) string {
	stringToHash := orderID + statusCode + grossAmount + serverKey

	hasher := sha512.New()
	hasher.Write([]byte(stringToHash))
	hashBytes := hasher.Sum(nil)

	return hex.EncodeToString(hashBytes)
}

func (s *transactionService) PaymentNotification(ctx context.Context, request *dto.MidtransNotification, userID uuid.UUID) error {
	var c coreapi.Client
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	expectedSignature := CalculateMidtransSignature(
		request.OrderID,
		request.StatusCode,
		request.GrossAmount,
		s.config.ServerKey,
	)

	if expectedSignature != request.SignatureKey {
		log.Printf("SECURITY ALERT: Invalid Midtrans signature for OrderID: %s. Expected: %s, Got: %s",
			request.OrderID, expectedSignature, request.SignatureKey)
		return errors.New("invalid midtrans notification signature")
	}

	orderID, _ := uuid.Parse(request.OrderID)
	grossAmount, _ := strconv.ParseFloat(request.GrossAmount, 64)
	payment := &entity.Payment{
		OrderID:           orderID,
		TransactionID:     request.TransactionID,
		TransactionStatus: request.TransactionStatus,
		PaymentMethod:     &request.PaymentType,
		Amount:            grossAmount,
		Currency:          request.Currency,
		Payload:           request.Payload,
	}
	dataOrder, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = errors.New("order not found")
		tx.Error = err
		return err
	} else if err != nil {
		tx.Error = err
		return errors.New("order not found")
	}
	err = s.transactionRepo.CreatePayment(tx, payment)
	if err != nil {
		tx.Error = err
		return errors.New("failed to create payment")
	}

	transactionStatusResp, e := c.CheckTransaction(request.OrderID)
	if e != nil {
		return e
	}

	if transactionStatusResp == nil {
		return errors.New("transaction status response is nil")
	}

	updateOrder := func(status string, isPaid bool) error {
		dataOrder.PaymentStatus = status
		dataOrder.IsPaid = isPaid
		if err := s.orderRepo.Update(tx, dataOrder); err != nil {
			err = errors.New("failed to update order")
			tx.Error = err
			return err
		}
		return nil
	}
	var result error
	switch transactionStatusResp.TransactionStatus {
	case "capture":
		switch transactionStatusResp.FraudStatus {
		case "challenge":
			result = updateOrder("challenge", true)
		case "accept":
			result = updateOrder("lunas", true)
		}
	case "settlement":
		result = updateOrder("lunas", true)
	case "deny":
		result = updateOrder("lunas", true)
	case "cancel", "expire":
		dataOrder, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = errors.New("order not found")
		tx.Error = err
		return err
	} else if err != nil {
		tx.Error = err
		return errors.New("order not found")
	}
	for _, item := range dataOrder.OrderItems {
		if item.Product.HasVariant {
			for _, variant := range item.Product.Variants {
				stock := int64(variant.Stock + item.Quantity)
				err = s.repoVariant.UpdateStock(tx, variant.ID, int(stock))
				if err != nil {
					return err
				}
			}
		} else {
			stock := int64(item.Product.Stock + item.Quantity)
			err = s.productRepo.UpdateStockProduct(tx, stock, item.Product.ID)
			if err != nil {
				tx.Error = err
				return errors.New("failed to update stock product")
			}
		}
	}
		result = updateOrder("failure", false)
	}
	key := "carts:" + userID.String()
	_ = s.cacheable.Delete(key)

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	return result
}

func (s *transactionService) Refund(ctx context.Context, request *dto.RefundRequest) error {
	var c coreapi.Client
	refundRequest := &coreapi.RefundReq{
		Amount: request.Amount,
		Reason: request.Reason,
	}
	res, _ := c.RefundTransaction(request.TransactionID, refundRequest)
	if res != nil {
		return errors.New("failed to refund transaction")
	}
	return nil
}

func (s *transactionService) Cancel(ctx context.Context, request *dto.CancelRequest) error {
	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()
	
	orderID := uuid.MustParse(request.OrderID)
	dataOrder, err := s.orderRepo.GetOrderByID(ctx, orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = errors.New("order not found")
		tx.Error = err
		return err
	} else if err != nil {
		tx.Error = err
		return errors.New("order not found")
	}

	updateOrder := func(status string, isPaid bool) error {
		dataOrder.PaymentStatus = status
		dataOrder.IsPaid = isPaid
		if err := s.orderRepo.Update(tx, dataOrder); err != nil {
			err = errors.New("failed to update order")
			tx.Error = err
			return err
		}
		return nil
	}
	for _, item := range dataOrder.OrderItems {
		if item.Product.HasVariant {
			for _, variant := range item.Product.Variants {
				stock := int64(variant.Stock + item.Quantity)
				err = s.repoVariant.UpdateStock(tx, variant.ID, int(stock))
				if err != nil {
					return err
				}
			}
		} else {
			stock := int64(item.Product.Stock + item.Quantity)
			err = s.productRepo.UpdateStockProduct(tx, stock, item.Product.ID)
			if err != nil {
				tx.Error = err
				return errors.New("failed to update stock product")
			}
		}
	}
	result := updateOrder("failure", false)
	return result
}
