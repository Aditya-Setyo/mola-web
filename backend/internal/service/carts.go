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
	variantRepo repository.ProductVariantRepository
	cacheable   cache.Cacheable
	token       token.TokenUseCase
	config      configs.MidtransConfig
}

func NewCartService(db *gorm.DB, cartRepo repository.CartRepository, orderRepo repository.OrderRepository, productRepo repository.ProductRepository, variantRepo repository.ProductVariantRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable, config configs.MidtransConfig) CartService {
	return &cartService{
		DB:          db,
		cartRepo:    cartRepo,
		orderRepo:   orderRepo,
		productRepo: productRepo,
		cacheable:   cacheable,
		token:       tokenUseCase,
		config:      config,
		variantRepo: variantRepo,
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

	// Ambil atau buat keranjang
	cart, err := s.cartRepo.GetCartByUserID(tx, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		cart = &entity.Cart{
			UserID: userID,
			Status: "active",
		}
		if err := s.cartRepo.AddToCart(tx, userID, cart); err != nil {
			tx.Error = err
			return err
		}
	} else if err != nil {
		return err
	}

	// Validasi produk
	product, err := s.productRepo.GetByID(tx, req.ProductID)
	if err != nil {
		return err
	}

	var stockAvailable int
	var variantID *uuid.UUID

	if product.HasVariant {
		// Produk memiliki varian, pastikan variant ID tersedia
		if req.ProductVariantID == nil {
			err = errors.New("product variant ID required")
			tx.Error = err
			return err
		}

		variant, err := s.variantRepo.GetByID(tx, *req.ProductVariantID)
		if err != nil {
			tx.Error = err
			return err
		}
		if variant.ProductID != req.ProductID {
			err = errors.New("variant does not belong to this product")
			tx.Error = err
			return err
		}

		stockAvailable = variant.Stock
		variantID = &variant.ID
		cartItemsData, err := s.cartRepo.GetCartItemByCartIDAndProductIDAndVariantID(tx, cart.ID, req.ProductID, *variantID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cartItem := &entity.CartItem{
				CartID:           cart.ID,
				ProductID:        req.ProductID,
				ProductVariantID: variantID,
				Quantity:         req.Quantity,
				Note:             req.Note,
			}
			if err := s.cartRepo.AddToCartItems(tx, cartItem); err != nil {
				tx.Error = err
				return err
			}
		} else if err != nil {
			return err
		} else {
			cartItemsData.Quantity += req.Quantity
			if err := s.cartRepo.UpdateCartItems(tx, cartItemsData); err != nil {
				tx.Error = err
				return err
			}
		}

	} else {
		// Produk tanpa varian
		stockAvailable = product.Stock

		cartItemsData, err := s.cartRepo.GetCartItemByCartIDAndProductIDWithoutVariant(tx, cart.ID, req.ProductID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cartItem := &entity.CartItem{
				CartID:    cart.ID,
				ProductID: req.ProductID,
				Quantity:  req.Quantity,
				Note:      req.Note,
			}
			if err := s.cartRepo.AddToCartItems(tx, cartItem); err != nil {
				tx.Error = err
				return err
			}
		} else if err != nil {
			return err
		} else {
			cartItemsData.Quantity += req.Quantity
			if err := s.cartRepo.UpdateCartItems(tx, cartItemsData); err != nil {
				tx.Error = err
				return err
			}
		}

	}
	if req.Quantity > stockAvailable {
		err = errors.New("stock not enough")
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.cacheable.Delete("carts:" + userID.String())

	return nil
}
func (s *cartService) GetCartByUserID(db *gorm.DB, userID uuid.UUID) (*dto.GetCartItemsResponse, error) {
	// Cek apakah user memiliki transaksi pending
	dataPayment, err := s.orderRepo.GetPendingPaymentStatusByUserID(db, userID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if err == nil && dataPayment.PaymentStatus == "pending" {
		return &dto.GetCartItemsResponse{
			PaymentUrl:    dataPayment.PaymentUrl,
			TokenMidtrans: dataPayment.TokenMidtrans,
		}, nil
	}

	// Cek cache
	key := "carts:" + userID.String()
	data := s.cacheable.Get(key)
	if data != "" {
		var result *dto.GetCartItemsResponse
		if err := json.Unmarshal([]byte(data), &result); err != nil {
			return nil, err
		}
		return result, nil
	}

	// Ambil data dari database
	res, err := s.cartRepo.GetCartItemsByUserID(db, userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("cart not found")
	} else if err != nil {
		return nil, err
	}

	// Bangun response
	items := []dto.CartItems{}
	var totalAmount, totalWeight float64

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
			},
			Subtotal: float64(dataItem.Quantity) * dataItem.Product.Price,
		}

		// Tambahkan info varian jika produk punya varian
		if dataItem.Product.HasVariant {

			log.Println("item.Product.Variants", dataItem.ProductVariant)
			var variantDTO dto.ProductVariantInfo
			variantDTO.ID = dataItem.ProductVariant.ID
			variantDTO.Stock = dataItem.ProductVariant.Stock

			if dataItem.ProductVariant.ColorID != nil {
				variantDTO.ColorID = dataItem.ProductVariant.ColorID
			}
			if dataItem.ProductVariant.SizeID != nil {
				variantDTO.SizeID = dataItem.ProductVariant.SizeID
			}
			if dataItem.ProductVariant.Color.Name != "" {
				variantDTO.Color = dataItem.ProductVariant.Color.Name
			}
			if dataItem.ProductVariant.Size.Name != "" {
				variantDTO.Size = dataItem.ProductVariant.Size.Name
			}

			item.Product.Variants = append(item.Product.Variants, variantDTO)

		}

		totalAmount += item.Subtotal
		totalWeight += float64(dataItem.Quantity) * dataItem.Product.Weight
		items = append(items, item)
	}

	totalPaid := totalAmount * 30 / 100
	result := &dto.GetCartItemsResponse{
		CartID:      res.ID,
		TotalWeight: totalWeight,
		TotalAmount: totalAmount,
		TotalPaid:   totalPaid,
		CartItems:   items,
	}

	// Simpan ke cache
	if cached, err := json.Marshal(result); err == nil {
		_ = s.cacheable.Set(key, cached)
	}

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

	cartItem := &entity.CartItem{
		ID:        req.ID,
		CartID:    req.CartID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if req.Note != nil {
		cartItem.Note = *req.Note
	}

	// Jika menggunakan varian, set juga ProductVariantID
	if req.ProductVariantID != nil {
		cartItem.ProductVariantID = req.ProductVariantID
	}

	if err := s.cartRepo.UpdateCartItems(tx, cartItem); err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	// Hapus cache keranjang user
	key := "carts:" + userID.String()
	_ = s.cacheable.Delete(key)

	return nil
}

func (s *cartService) RemoveCartItem(ctx context.Context, userID uuid.UUID, cartItemID uuid.UUID) error {
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

	if err := s.cartRepo.RemoveCartItem(tx, &cartItemID); err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	// Invalidate cache
	key := "carts:" + userID.String()
	_ = s.cacheable.Delete(key)

	return nil
}
