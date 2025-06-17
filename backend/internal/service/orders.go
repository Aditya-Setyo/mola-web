package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"mola-web/configs"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"
	"time"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
	"gorm.io/gorm"
)

type OrderService interface {
	CreateOrder(ctx context.Context, order entity.Order) (uuid.UUID, error)
	CreateOrderItem(ctx context.Context, orderItem entity.OrderItem) error
	// GetCartByUserID(ctx context.Context, userID uuid.UUID) (result *dto.GetCartItemsResponse, err error)
	Checkout(ctx context.Context, userID uuid.UUID, email string, name string) (*dto.SnapRsponse, error)
	SetAdminOrderStatus(ctx context.Context, id uuid.UUID, status string) error
	ShowOrder(ctx context.Context, userID uuid.UUID) ([]dto.ShowOrderResponse, error)

}

type orderService struct {
	DB        *gorm.DB
	orderRepo repository.OrderRepository
	cartRepo  repository.CartRepository
	cartService CartService
	productService ProductService
	cacheable cache.Cacheable
	token     token.TokenUseCase
	config    configs.MidtransConfig
}

func NewOrderService(db *gorm.DB, orderRepo repository.OrderRepository, cartRepo repository.CartRepository, cartService CartService, productService ProductService, cacheable cache.Cacheable, token token.TokenUseCase, config configs.MidtransConfig) OrderService {
	return &orderService{
		DB:        db,
		orderRepo: orderRepo,
		cartRepo:  cartRepo,
		cartService: cartService,
		productService: productService,
		cacheable: cacheable,
		token:     token,
		config:    config,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, order entity.Order) (uuid.UUID, error) {
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
	orderID, err := s.orderRepo.CreateOrder(tx, &order)
	if err != nil {
		tx.Error = err
		return uuid.Nil, err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return uuid.Nil, err
	}
	return orderID, nil
}

func (s *orderService) CreateOrderItem(ctx context.Context, orderItem entity.OrderItem) error {
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
	err := s.orderRepo.CreateOrderItem(tx, &orderItem)
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

// func (s *orderService) GetCartByUserID(ctx context.Context, userID uuid.UUID) (result *dto.GetCartItemsResponse, err error) {
// 	key := "carts:" + userID.String()
// 	data := s.cacheable.Get(key)
// 	if data != "" {
// 		err = json.Unmarshal([]byte(data), &result)
// 		if err != nil {
// 			return nil, err
// 		}
// 		return result, nil
// 	}
// 	res, err := s.cartRepo.GetCartItemsByUserID(ctx, userID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	items := []dto.CartItems{}
// 	var totalAmount float64

// 	for _, dataItem := range res.CartItems {
// 		item := dto.CartItems{
// 			CartItemsID: dataItem.ID,
// 			Quantity:    dataItem.Quantity,
// 			Note:        &dataItem.Note,
// 			Product: &dto.GetProductByID{
// 				ID:           dataItem.Product.ID,
// 				Name:         dataItem.Product.Name,
// 				CategoryID:   dataItem.Product.CategoryID,
// 				Description:  dataItem.Product.Description,
// 				ImageURL:     dataItem.Product.ImageURL,
// 				HasVariant:   dataItem.Product.HasVariant,
// 				Price:        dataItem.Product.Price,
// 				Stock:        dataItem.Product.Stock,
// 				Weight:       dataItem.Product.Weight,
// 				CategoryName: &dataItem.Product.Category.Name,
// 				SizeName:     &dataItem.Product.Size.Name,
// 				ColorName:    &dataItem.Product.Color.Name,
// 			},
// 			Subtotal: float64(dataItem.Quantity) * dataItem.Product.Price,
// 		}
// 		totalAmount += float64(dataItem.Quantity) * dataItem.Product.Price
// 		items = append(items, item)
// 	}

// 	result = &dto.GetCartItemsResponse{
// 		CartID:      res.ID,
// 		TotalAmount: totalAmount,
// 		CartItems:   items,
// 	}
// 	mashalledData, err := json.Marshal(result)
// 	if err != nil {
// 		return nil, err
// 	}

// 	_ = s.cacheable.Set(key, mashalledData)
// 	return result, nil
// }

func (s *orderService) Checkout(ctx context.Context, userID uuid.UUID, email string, name string) (*dto.SnapRsponse, error) {
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
	cartData, err := s.cartService.GetCartByUserID(tx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Error = err
		return nil, errors.New("cart not found")
	} else if err != nil {
		tx.Error = err
		return nil, err
	}
	orderCode := GenerateOrderCode()
	var items []midtrans.ItemDetails
	var enabledPaymentsTypes []snap.SnapPaymentType
	enabledPaymentsTypes = append(enabledPaymentsTypes, snap.AllSnapPaymentType...)

	for i, item := range cartData.CartItems {

		items = append(items, midtrans.ItemDetails{
			ID:    item.Product.ID.String(),
			Name:  item.Product.Name,
			Price: int64(item.Product.Price),
			Qty:   int32(item.Quantity),
		})
		err = s.productService.UpdateStockProductOnOrder(tx, cartData.CartItems[i].Product.ID, int64(cartData.CartItems[i].Quantity))
		if err != nil {
			tx.Error = err
			return nil, err
		}
	}

	order := entity.Order{
		UserID:           userID,
		OrderCode:        orderCode,
		Status:           "pending",
		IsPaid:           false,
		TotalAmount:      float64(cartData.TotalAmount),
		TotalWeight:      float64(cartData.TotalWeight),
		PaymentStatus:    "pending",
	}
	orderID, err := s.orderRepo.CreateOrder(tx, &order)
	if err != nil {
		tx.Error = err
		return nil, err
	}
	for _, item := range cartData.CartItems {
		orderItem := entity.OrderItem{
			OrderID:   orderID,
			ProductID: item.Product.ID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
			Subtotal:  item.Subtotal,
			Note:      item.Note,
		}
		if err := s.orderRepo.CreateOrderItem(tx, &orderItem); err != nil {
			tx.Error = err
			return nil, err
		}
	}
	if err := s.cartRepo.ClearCart(tx, cartData.CartID); err != nil {
		tx.Error = err
		return nil, err
	}

	m := snap.Client{}
	m.New(s.config.ServerKey, midtrans.Sandbox)

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID.String(),
			GrossAmt: int64(order.TotalAmount),
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: name,
			Email: email,
		},
		Items:           &items,
		EnabledPayments: enabledPaymentsTypes,
	}

	snapResp, _ := m.CreateTransaction(req)
	response := dto.SnapRsponse{
		Token:       snapResp.Token,
		RedirectURL: snapResp.RedirectURL,
	}
	err = s.orderRepo.UpdatePaymentUrl(tx, orderID, snapResp.Token, snapResp.RedirectURL)
	if err != nil {
		tx.Error = err
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &response, nil
}

func GenerateOrderCode() string {
	now := time.Now()
	date := now.Format("20060102")
	randNum := rand.Int()
	return fmt.Sprintf("ORD-%s-%04d", date, randNum)
}

func (s *orderService) SetAdminOrderStatus(ctx context.Context, id uuid.UUID, status string) error {
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
	err := s.orderRepo.SetAdminOrderStatus(tx, id, status)
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

func (s *orderService) ShowOrder(ctx context.Context, userID uuid.UUID) ([]dto.ShowOrderResponse, error) {
	key := "orders:show-order:" + userID.String()
	var results []dto.ShowOrderResponse

	data := s.cacheable.Get(key)
	if data != "" {
		if err := json.Unmarshal([]byte(data), &results); err != nil {
			return nil, err
		}
		return results, nil
	}

	orders, err := s.orderRepo.ShowOrder(ctx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("orders not found")
	} else if err != nil {
		return nil, err
	}

	for _, order := range orders {
		var orderItems []dto.OrderItems
		for _, item := range order.OrderItems {
			var categoryName, colorName, sizeName *string
			if item.Product.Category != nil {
				categoryName = &item.Product.Category.Name
			}
			if item.Product.Color != nil {
				colorName = &item.Product.Color.Name
			}
			if item.Product.Size != nil {
				sizeName = &item.Product.Size.Name
			}
			orderItems = append(orderItems, dto.OrderItems{
				Quantity: item.Quantity,
				Subtotal: item.Subtotal,
				Note:     item.Note,
				Product: &dto.GetProductByIDShowOrder{
					ID:           item.Product.ID,
					Name:         item.Product.Name,
					Description:  item.Product.Description,
					Price:        item.Product.Price,
					ImageURL:     item.Product.ImageURL,
					Weight:       item.Product.Weight,
					CategoryName: categoryName,
					ColorName:    colorName,
					SizeName:     sizeName,
				},
			})
		}

		results = append(results, dto.ShowOrderResponse{
			ID:            order.ID,
			UserID:        order.UserID,
			OrderCode:     order.OrderCode,
			Status:        order.Status,
			TotalAmount:   order.TotalAmount,
			PaymentStatus: order.PaymentStatus,
			OrderItems:    orderItems,
		})
	}

	marshaled, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, marshaled)

	return results, nil
}
