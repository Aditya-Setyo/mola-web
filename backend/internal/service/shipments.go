package service

import (
	"context"
	"log"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"

	"gorm.io/gorm"
)

type ShipmentService interface {
	AddResiNumber(ctx context.Context, request *dto.ShipmentRequest) error
}
type shipmentService struct {
	repo repository.ShipmentRepository
	DB *gorm.DB
}

func NewShipmentService(db *gorm.DB, repo repository.ShipmentRepository) ShipmentService {
	return &shipmentService{
		repo: repo,
		DB : db,
	}
}

func (s *shipmentService) AddResiNumber(ctx context.Context, request *dto.ShipmentRequest) error {
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
	shipment := &entity.Shipment{
		OrderID: request.OrderID,
		ResiNumber: &request.ResiNumber,
		Cost: request.Cost,
	}
	err := s.repo.CreateShipment(tx, shipment)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	return nil
}

