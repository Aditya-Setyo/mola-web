package repository

import (
	"context"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderRepository interface {
	GetAll(ctx context.Context) ([]entity.Order, error)
	GetAllOrdersPaid(ctx context.Context) ([]entity.Order, error)
	CreateOrder(db *gorm.DB, order *entity.Order) (uuid.UUID, error)
	CreateOrderItem(db *gorm.DB, orderItem *entity.OrderItem) error
	ShowOrder(ctx context.Context, userID uuid.UUID) ([]entity.Order, error)
	GetOrderByID(ctx context.Context, id uuid.UUID) (*entity.Order, error)
	GetOrderByIDAndProductID(ctx context.Context, idOrder uuid.UUID, idProduct uuid.UUID) (*entity.Order, error)
	GetOrderItemsByOrderID(ctx context.Context, id uuid.UUID) ([]entity.OrderItem, error)
	GetPendingPaymentStatusByUserID(db *gorm.DB, id uuid.UUID) (*dto.GetPaymentStatusResponse, error)
	SetAdminOrderStatus(db *gorm.DB, id uuid.UUID, status string) error
	Update(db *gorm.DB, order *entity.Order) error
	UpdateOrderItem(db *gorm.DB, orderItem *entity.OrderItem) error
	UpdatePaymentUrl(db *gorm.DB, id uuid.UUID, token string, paymentUrl string) error
	Delete(db *gorm.DB, id uuid.UUID) error
}
type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db}
}

func (r *orderRepository) GetAll(ctx context.Context) ([]entity.Order, error) {
	var orders []entity.Order
	if err := r.db.WithContext(ctx).
		Preload("OrderItems.Product").
		Preload("OrderItems.Product.Category").
		Preload("OrderItems.ProductVariant").
		Preload("OrderItems.ProductVariant.Color").
		Preload("OrderItems.ProductVariant.Size").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}
func (r *orderRepository) GetAllOrdersPaid(ctx context.Context) ([]entity.Order, error) {
	var orders []entity.Order
	if err := r.db.WithContext(ctx).Preload("User").Preload("OrderItems.Product").Preload("Shipments").Find(&orders).Where("payment_status = ?", "paid").Error; err != nil {
		return nil, err
	}
	return orders, nil
}
func (r *orderRepository) CreateOrderItem(db *gorm.DB, orderItem *entity.OrderItem) error {
	if err := db.Create(orderItem).Error; err != nil {
		return err
	}
	return nil
}

func (r *orderRepository) ShowOrder(ctx context.Context, userID uuid.UUID) ([]entity.Order, error) {
	var orders []entity.Order
	if err := r.db.WithContext(ctx).
		Preload("OrderItems.Product").
		Preload("OrderItems.Product.Category").
		Preload("OrderItems.ProductVariant").
		Preload("OrderItems.ProductVariant.Color").
		Preload("OrderItems.ProductVariant.Size").
		Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) GetOrderByID(ctx context.Context, id uuid.UUID) (*entity.Order, error) {
	var order entity.Order
	if err := r.db.WithContext(ctx).Preload("OrderItems.Product").First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetOrderByIDAndProductID(ctx context.Context, idOrder uuid.UUID, idProduct uuid.UUID) (*entity.Order, error) {
	var order entity.Order
	if err := r.db.WithContext(ctx).Preload("OrderItems.Product").First(&order, "id = ? AND order_items.product_id = ?", idOrder, idProduct).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetOrderItemsByOrderID(ctx context.Context, id uuid.UUID) ([]entity.OrderItem, error) {
	var orderItem []entity.OrderItem
	if err := r.db.WithContext(ctx).Where("order_id = ?", id).Find(&orderItem).Error; err != nil {
		return nil, err
	}
	return orderItem, nil
}

func (r *orderRepository) GetPendingPaymentStatusByUserID(db *gorm.DB, id uuid.UUID) (*dto.GetPaymentStatusResponse, error) {
	var paymentStatus dto.GetPaymentStatusResponse
	if err := db.Table("orders").Select("payment_url, token_midtrans, payment_status").Where("user_id = ? AND payment_status = ?", id, "pending").First(&paymentStatus).Error; err != nil {
		return nil, err
	}
	return &paymentStatus, nil
}

func (r *orderRepository) SetAdminOrderStatus(db *gorm.DB, id uuid.UUID, status string) error {
	if err := db.Table("orders").Where("id = ?", id).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}

func (r *orderRepository) UpdatePaymentUrl(db *gorm.DB, id uuid.UUID, token string, paymentUrl string) error {
	if err := db.Table("orders").Where("id = ?", id).Update("payment_url", paymentUrl).Update("token_midtrans", token).Error; err != nil {
		return err
	}
	return nil
}

func (r *orderRepository) CreateOrder(db *gorm.DB, order *entity.Order) (uuid.UUID, error) {
	if err := db.Create(order).Error; err != nil {
		return uuid.Nil, err
	}
	return order.ID, nil
}
func (r *orderRepository) UpdateOrderItem(db *gorm.DB, orderItem *entity.OrderItem) error {
	if err := db.Model(&entity.OrderItem{}).
		Where("id = ?", orderItem.ID).
		Select("quantity", "subtotal").
		Updates(map[string]interface{}{
			"quantity": orderItem.Quantity,
			"subtotal": orderItem.Subtotal,
		}).Error; err != nil {
		return err
	}
	return nil
}

func (r *orderRepository) Update(db *gorm.DB, order *entity.Order) error {
	if err := db.Save(order).Error; err != nil {
		return err
	}
	return nil
}

func (r *orderRepository) Delete(db *gorm.DB, id uuid.UUID) error {
	if err := db.Delete(&entity.Order{}, id).Error; err != nil {
		return err
	}
	return nil
}
