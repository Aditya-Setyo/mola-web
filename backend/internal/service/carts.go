package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"mola-web/configs"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartService interface {
	AddToCart(ctx context.Context, userID uuid.UUID, req *dto.AddToCartRequest) error
	GetCartByUserID(db *gorm.DB, userID uuid.UUID) (*dto.GetCartItemsResponse, error)
	UpdateCartItem(ctx context.Context, userID uuid.UUID, req *dto.UpdateCartItemRequest) error
	RemoveCartItem(ctx context.Context, userID uuid.UUID, req uuid.UUID) error
}
type cartService struct {
	DB          *gorm.DB
	cartRepo    repository.CartRepository
	orderRepo   repository.OrderRepository
	productRepo repository.ProductRepository
	cacheable   cache.Cacheable
	token       token.TokenUseCase
	config      configs.MidtransConfig
}

func NewCartService(db *gorm.DB, cartRepo repository.CartRepository, orderRepo repository.OrderRepository, productRepo repository.ProductRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable, config configs.MidtransConfig) CartService {
	return &cartService{
		DB:          db,
		cartRepo:    cartRepo,
		orderRepo:   orderRepo,
		productRepo: productRepo,
		cacheable:   cacheable,
		token:       tokenUseCase,
		config:      config,
	}
}

func (s *cartService) AddToCart(ctx context.Context, userID uuid.UUID, req *dto.AddToCartRequest) (err error) {
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
	var cart *entity.Cart
	cart, err = s.cartRepo.GetCartByUserID(tx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		cart = &entity.Cart{
			UserID: userID,
			Status: "active",
		}
		err = s.cartRepo.AddToCart(tx, userID, cart)
		if err != nil {
			tx.Error = err
			return err
		}

	} else if err != nil {
		return err
	}

	product, err := s.productRepo.GetByID(tx, req.ProductID)
	if err != nil {
		return err
	}
	if req.Quantity > product.Stock {
		err = errors.New("stock not enough")
		tx.Error = err
		return err
	}
	cartItemsData, err := s.cartRepo.GetCartItemByCartID(tx, cart.ID, req.ProductID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		log.Println("==nil==")
		cartItems := &entity.CartItem{
			CartID:    cart.ID,
			ProductID: req.ProductID,
			Quantity:  req.Quantity,
			Note:      req.Note,
		}
		if err := s.cartRepo.AddToCartItems(tx, cartItems); err != nil {
			tx.Error = err
			return err
		}

	} else if err != nil {
		return err
	} else {
		log.Println("==cartItemsData==")
		cartItemsData.Quantity += req.Quantity
		if err := s.cartRepo.UpdateCartItems(tx, cartItemsData); err != nil {
			tx.Error = err
			return err
		}
	}

	key := "carts:" + userID.String()
	_ = s.cacheable.Delete(key)

	return nil
}

func (s *cartService) GetCartByUserID(db *gorm.DB, userID uuid.UUID) (result *dto.GetCartItemsResponse, err error) {
	dataPayment, _ := s.orderRepo.GetPendingPaymentStatusByUserID(db, userID)
	if dataPayment.PaymentStatus == "pending" {
		result = &dto.GetCartItemsResponse{
			PaymentUrl:    dataPayment.PaymentUrl,
			TokenMidtrans: dataPayment.TokenMidtrans,
		}
		return result, nil
	}
	key := "carts:" + userID.String()
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}
	res, err := s.cartRepo.GetCartItemsByUserID(db, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("cart not found")
	}else if err != nil {
		return nil, err
	}
	items := []dto.CartItems{}
	var totalAmount float64
	var totalWeight float64

	for _, dataItem := range res.CartItems {
		item := dto.CartItems{
			CartItemsID: dataItem.ID,
			Quantity:    dataItem.Quantity,
			Note:        &dataItem.Note,
			Product: &dto.GetProductByID{
				ID:           dataItem.Product.ID,
				Name:         dataItem.Product.Name,
				CategoryID:   dataItem.Product.CategoryID,
				Description:  dataItem.Product.Description,
				ImageURL:     dataItem.Product.ImageURL,
				HasVariant:   dataItem.Product.HasVariant,
				Price:        dataItem.Product.Price,
				Stock:        dataItem.Product.Stock,
				Weight:       dataItem.Product.Weight,
				CategoryName: &dataItem.Product.Category.Name,
				SizeName:     &dataItem.Product.Size.Name,
				ColorName:    &dataItem.Product.Color.Name,
			},
			Subtotal: float64(dataItem.Quantity) * dataItem.Product.Price,
		}
		totalAmount += float64(dataItem.Quantity) * dataItem.Product.Price
		totalWeight += float64(dataItem.Quantity) * dataItem.Product.Weight
		items = append(items, item)
	}

	result = &dto.GetCartItemsResponse{
		CartID:      res.ID,
		TotalWeight: totalWeight,
		TotalAmount: totalAmount,
		CartItems:   items,
	}
	mashalledData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, mashalledData)
	return result, nil
}

func (s *cartService) UpdateCartItem(ctx context.Context, userID uuid.UUID, req *dto.UpdateCartItemRequest) error {
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
	cartItems := entity.CartItem{
		ID:        req.ID,
		CartID:    req.CartID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
		Note:      *req.Note,
	}
	if err := s.cartRepo.UpdateCartItems(tx, &cartItems); err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "carts:" + userID.String()
	_ = s.cacheable.Delete(key)

	return nil
}

func (s *cartService) RemoveCartItem(ctx context.Context, userID uuid.UUID, req uuid.UUID) error {
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
	if err := s.cartRepo.RemoveCartItem(tx, &req); err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "carts:" + userID.String()
	err := s.cacheable.Delete(key)
	if err != nil {
		return err
	}
	return nil
}
