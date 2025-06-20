package database

import (
	"fmt"
	"mola-web/configs"
	"mola-web/internal/entity"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase(cfg configs.PostgresConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", cfg.Host, cfg.User, cfg.Password, cfg.Database, cfg.Port)
	
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}

func AutoMigrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &entity.Product{}, 
        &entity.Color{}, 
        &entity.Category{}, 
        &entity.Size{}, 
        &entity.User{},
        &entity.Invoice{},
        &entity.Order{},
        &entity.OrderItem{},
        &entity.UserProfile{},
        &entity.UserAddress{},
        &entity.ProductReview{},
        &entity.Payment{},
        &entity.Shipment{},
        &entity.Discount{},
        &entity.SalesReport{},
		&entity.Cart{},
		&entity.CartItem{},
    )
}
