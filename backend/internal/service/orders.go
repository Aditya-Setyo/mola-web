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
	GetAllOrders(ctx context.Context) ([]dto.GetAllOrdersResponse, error)
	GetAllOrdersPaid(ctx context.Context) ([]dto.GetOrdersPaidResponse, error)
	// GetCartByUserID(ctx context.Context, userID uuid.UUID) (result *dto.GetCartItemsResponse, err error)
	Checkout(ctx context.Context, userID uuid.UUID, email string, name string) (*dto.SnapRsponse, error)
	SetAdminOrderStatus(ctx context.Context, id uuid.UUID, status string) error
	ShowOrder(ctx context.Context, userID uuid.UUID) ([]dto.ShowOrderResponse, error)
	ExpireUninitializedOrders() error
}

type orderService struct {
	DB             *gorm.DB
	orderRepo      repository.OrderRepository
	cartRepo       repository.CartRepository
	cartService    CartService
	productService ProductService
	cacheable      cache.Cacheable
	token          token.TokenUseCase
	config         configs.MidtransConfig
}

func NewOrderService(db *gorm.DB, orderRepo repository.OrderRepository, cartRepo repository.CartRepository, cartService CartService, productService ProductService, cacheable cache.Cacheable, token token.TokenUseCase, config configs.MidtransConfig) OrderService {
	return &orderService{
		DB:             db,
		orderRepo:      orderRepo,
		cartRepo:       cartRepo,
		cartService:    cartService,
		productService: productService,
		cacheable:      cacheable,
		token:          token,
		config:         config,
	}
}

func (s *orderService) GetAllOrdersPaid(ctx context.Context) ([]dto.GetOrdersPaidResponse, error) {
	key := "orders:AllOrdersPaid"
	var results []dto.GetOrdersPaidResponse
	data := s.cacheable.Get(key)
	if data != "" {
		err := json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}
	orders, err := s.orderRepo.GetAllOrdersPaid(ctx)
	if err != nil {
		return nil, err
	}

	for _, order := range orders {
		var productNames []string
		for _, item := range order.OrderItems {
			if item.Product != nil {
				productNames = append(productNames, item.Product.Name)
			}
		}
		var resi string
		if len(order.Shipments) > 0 {
			if order.Shipments[0].ResiNumber != "" {
				resi = order.Shipments[0].ResiNumber
			}
		}
		result := dto.GetOrdersPaidResponse{
			ID:          order.ID,
			UserName:    order.User.Name,
			Resi:        resi,
			ProductName: productNames,
		}

		results = append(results, result)
	}

	s.cacheable.Set(key, orders)
	return results, nil
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
		totalPrice := item.Product.Price * 0.3
		productName := item.Product.Name

		// Jika punya varian
		if item.Product.HasVariant {
			for _, value := range item.Product.Variants {
				if value.Color != "" {
					productName += " - " + value.Color
				}
				if value.Size != "" {
					productName += " - " + value.Size + " | "
				}
			}
		}
		items = append(items, midtrans.ItemDetails{
			ID:    item.Product.ID.String(),
			Name:  productName,
			Price: int64(totalPrice),
			Qty:   int32(item.Quantity),
		})
		if item.Product.HasVariant {
			for _, value := range item.Product.Variants {
				err = s.productService.UpdateStockProductVariantOnOrder(tx, value.ID, int64(item.Quantity))
				if err != nil {
					tx.Error = err
					return nil, err
				}
			}
		} else {
			err = s.productService.UpdateStockProductOnOrder(tx, cartData.CartItems[i].Product.ID, int64(cartData.CartItems[i].Quantity))
			if err != nil {
				tx.Error = err
				return nil, err
			}
		}
	}

	order := entity.Order{
		UserID:        userID,
		OrderCode:     orderCode,
		Status:        "pending",
		IsPaid:        false,
		TotalAmount:   float64(cartData.TotalAmount),
		TotalWeight:   float64(cartData.TotalWeight),
		PaymentStatus: "pending",
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
			// ProductVariantID: item.Product.Variants[i].ID,
			Quantity: item.Quantity,
			Price:    item.Product.Price,
			Subtotal: item.Subtotal,
			Note:     item.Note,
		}
		for _, value := range item.Product.Variants {
			orderItem.ProductVariantID = value.ID
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
	totalPaid := float64(cartData.TotalAmount) * 0.3
	log.Println("totalPaid: ", totalPaid)
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID.String(),
			GrossAmt: int64(totalPaid),
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
		tx.Error = err
		return nil, err
	}
	_ = s.cacheable.Delete("carts:" + userID.String())
	_ = s.cacheable.Delete("orders:show-order:" + userID.String())
	_ = s.cacheable.Delete("orders:all-orders")
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
		items := []dto.OrderItems{}

		for _, dataItem := range order.OrderItems {
			var categoryName, sizeName, colorName *string
			if dataItem.Product.Category != nil {
				categoryName = &dataItem.Product.Category.Name
			}
			if dataItem.ProductVariant.Size != nil {
				sizeName = &dataItem.ProductVariant.Size.Name
			}
			if dataItem.ProductVariant.Color != nil {
				colorName = &dataItem.ProductVariant.Color.Name
			}
			item := dto.OrderItems{
				Quantity: dataItem.Quantity,
				Note:     dataItem.Note,
				Product: &dto.GetProductByIDShowOrder{
					ID:           dataItem.Product.ID,
					Name:         dataItem.Product.Name,
					CategoryID:   dataItem.Product.CategoryID,
					Description:  dataItem.Product.Description,
					ImageURL:     dataItem.Product.ImageURL,
					HasVariant:   dataItem.Product.HasVariant,
					Price:        dataItem.Product.Price,
					Weight:       dataItem.Product.Weight,
					CategoryName: categoryName,
					SizeName:     sizeName,
					ColorName:    colorName,
				},
				Subtotal: float64(dataItem.Quantity) * dataItem.Product.Price,
			}
			items = append(items, item)
		}

		results = append(results, dto.ShowOrderResponse{
			ID:            order.ID,
			UserID:        order.UserID,
			OrderCode:     order.OrderCode,
			Status:        order.Status,
			TotalAmount:   order.TotalAmount,
			TotalWeight:   order.TotalWeight,
			PaymentStatus: order.PaymentStatus,
			OrderItems:    items,
		})
	}

	marshaled, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, marshaled)

	return results, nil
}

func (s *orderService) GetAllOrders(ctx context.Context) ([]dto.GetAllOrdersResponse, error){
	key := "orders:all-orders"
	var results []dto.GetAllOrdersResponse

	data := s.cacheable.Get(key)
	if data != "" {
		if err := json.Unmarshal([]byte(data), &results); err != nil {
			return nil, err
		}
		return results, nil
	}

	orders, err := s.orderRepo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("orders not found")
	} else if err != nil {
		return nil, err
	}

	for _, order := range orders {
		items := []dto.OrderItems{}

		for _, dataItem := range order.OrderItems {
			var categoryName, sizeName, colorName *string
			if dataItem.Product.Category != nil {
				categoryName = &dataItem.Product.Category.Name
			}
			if dataItem.ProductVariant.Size != nil {
				sizeName = &dataItem.ProductVariant.Size.Name
			}
			if dataItem.ProductVariant.Color != nil {
				colorName = &dataItem.ProductVariant.Color.Name
			}
			item := dto.OrderItems{
				Quantity: dataItem.Quantity,
				Note:     dataItem.Note,
				Product: &dto.GetProductByIDShowOrder{
					ID:           dataItem.Product.ID,
					Name:         dataItem.Product.Name,
					CategoryID:   dataItem.Product.CategoryID,
					Description:  dataItem.Product.Description,
					ImageURL:     dataItem.Product.ImageURL,
					HasVariant:   dataItem.Product.HasVariant,
					Price:        dataItem.Product.Price,
					Weight:       dataItem.Product.Weight,
					CategoryName: categoryName,
					SizeName:     sizeName,
					ColorName:    colorName,
				},
				Subtotal: float64(dataItem.Quantity) * dataItem.Product.Price,
			}
			items = append(items, item)
		}

		results = append(results, dto.GetAllOrdersResponse{
			ID:            order.ID,
			UserID:        order.UserID,
			OrderCode:     order.OrderCode,
			Status:        order.Status,
			TotalAmount:   order.TotalAmount,
			TotalWeight:   order.TotalWeight,
			PaymentStatus: order.PaymentStatus,
			OrderItems:    items,
		})
	}

	marshaled, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, marshaled)

	return results, nil
}

func (s *orderService) ExpireUninitializedOrders() error {
	tx := s.DB.Begin()
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
	err := s.orderRepo.ExpireUninitializedOrders(tx)
	if err != nil {
		tx.Error = err
		return err
	}
	// dataOrder, err := s.orderRepo.GetOrderByID(ctx, orderID)
	// 	if errors.Is(err, gorm.ErrRecordNotFound) {
	// 		err = errors.New("order not found")
	// 		tx.Error = err
	// 		return err
	// 	} else if err != nil {
	// 		tx.Error = err
	// 		return errors.New("order not found")
	// 	}
	// 	for _, item := range dataOrder.OrderItems {
	// 		if item.Product.HasVariant {
	// 			for _, variant := range item.Product.Variants {
	// 				stock := int64(variant.Stock + item.Quantity)
	// 				err = s.repoVariant.UpdateStock(tx, variant.ID, int(stock))
	// 				if err != nil {
	// 					return err
	// 				}
	// 			}
	// 		} else {
	// 			stock := int64(item.Product.Stock + item.Quantity)
	// 			err = s.productRepo.UpdateStockProduct(tx, stock, item.Product.ID)
	// 			if err != nil {
	// 				tx.Error = err
	// 				return errors.New("failed to update stock product")
	// 			}
	// 		}
	// 	}
	// 	result = updateOrder("expired", false)
	return tx.Commit().Error
}