package repository

import (
	"mola-web/internal/entity"

	"gorm.io/gorm"
)

type ShipmentRepository interface {
	CreateShipment(db *gorm.DB ,shipment *entity.Shipment)  error
	
}
type shipmentRepository struct {
	db *gorm.DB
}

func NewShipmentRepository(db *gorm.DB) ShipmentRepository {
	return &shipmentRepository{db}
}

func (r *shipmentRepository) CreateShipment(db *gorm.DB ,shipment *entity.Shipment) error {
	if err := r.db.Create(shipment).Error; err != nil {
		return err
	}
	return nil
}