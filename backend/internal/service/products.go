package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductService interface {
	GetAll(ctx context.Context) ([]*dto.GetAllProducts, error)
	GetByID(ctx context.Context, id uuid.UUID) (*dto.GetProductByID, error)
	GetProductByCategoryID(ctx context.Context, categoryID uint) ([]*dto.GetProductByCategoryID, error)
	GetProductByName(ctx context.Context, name string) ([]dto.GetProductByName, error)
	Create(ctx context.Context, request *dto.CreateProductRequest) error
	Update(ctx context.Context, request *dto.UpdateProductRequest) error
	CheckStockProduct(tx *gorm.DB, productID uuid.UUID) (int64, error)
	UpdateStockProductOnOrder(tx *gorm.DB, productID uuid.UUID, stock int64) error
	UpdateStockProduct(ctx context.Context, productID uuid.UUID, stock int64) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type productService struct {
	DB           *gorm.DB
	repo         repository.ProductRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewProductService(db *gorm.DB, repo repository.ProductRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) ProductService {
	return &productService{
		DB:           db,
		repo:         repo,
		tokenUseCase: tokenUseCase,
		cacheable:    cacheable,
	}
}

func (s *productService) GetAll(ctx context.Context) (results []*dto.GetAllProducts, err error) {
	key := cache.CacheKeyProductsGetAll
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}
	results, err = s.repo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else	if err != nil {
		return nil, err
	}
	mashalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, mashalledData)
	if err != nil {
		return nil, err
	}
	// log.Println(results)
	return results, nil
}

func (s *productService) GetProductByCategoryID(ctx context.Context, categoryID uint) (results []*dto.GetProductByCategoryID, err error) {
	key := cache.CacheKeyProductsGetByCategoryId
	data := s.cacheable.Get(key)
	if data != "" {
		err := json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}
	results, err = s.repo.GetByCategoryID(ctx, categoryID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else	if err != nil {
		return nil, err
	}
	mashalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, mashalledData)
	if err != nil {
		return nil, err
	}
	return results, nil
}

func (s *productService) GetProductByName(ctx context.Context, name string) (results []dto.GetProductByName, err error) {
	dataProducts, err := s.repo.GetByName(ctx, name)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else	if err != nil {
		return nil, err
	}

	for _, product := range dataProducts {
		result := dto.GetProductByName{
			ID:          product.ID,
			Name:        product.Name,
			CategoryID:  product.CategoryID,
			Description: product.Description,
			ImageURL:    product.ImageURL,
			HasVariant:  product.HasVariant,
			Price:       product.Price,
			Stock:       product.Stock,
			Weight:      product.Weight,
		}

		if product.Category != nil {
			result.CategoryName = &product.Category.Name
		}
		if product.Color != nil {
			result.ColorName = &product.Color.Name
		}
		if product.Size != nil {
			result.SizeName = &product.Size.Name
		}

		results = append(results, result)

	}
	return results, nil
}

func (s *productService) GetByID(ctx context.Context, id uuid.UUID) (result *dto.GetProductByID, err error) {
	
	key := cache.CacheKeyProductsGetById
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}
	result, err = s.repo.GetByID(s.DB.WithContext(ctx), id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else	if err != nil {
		return nil, err
	}

	mashalledData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, mashalledData)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s *productService) CheckStockProduct(tx *gorm.DB, productID uuid.UUID) (int64, error) {
	stock, err := s.repo.GetStockProduct(tx, productID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = errors.New("order not found")
		return 0, err
	}else if err != nil {
		return 0, err
	}
	if stock <= 0 {
		return 0, errors.New("stock is empty")
	}


	return stock, nil
}

func (s *productService) UpdateStockProductOnOrder(tx *gorm.DB, productID uuid.UUID, stock int64) error {
	dataStock, err := s.CheckStockProduct(tx, productID)
	if err != nil {
		return err
	}
	stock = dataStock - stock
	
	err = s.repo.UpdateStockProduct(tx, stock, productID)
	if err != nil {
		return err
	}

	_ = s.invalidateProductListCaches()

	return nil
}

func (s *productService) UpdateStockProduct(ctx context.Context, productID uuid.UUID, stock int64) error {
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
	err := s.UpdateStockProductOnOrder(tx, productID, stock)
	if err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	_ = s.invalidateProductListCaches()
	return nil
}


func (s *productService) Create(ctx context.Context, request *dto.CreateProductRequest) error {
	src, err := request.Image.Open()
	if err != nil {
		return errors.New("failed to open image")
	}
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
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), request.Image.Filename)
	imagePath :=  filepath.Join("public/products/images", fileName) 
	dst, err := os.Create(imagePath)
	if err != nil {
		return err
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		return err
	}
	*request.ImageURL = "/static/products/images/" + fileName
	product := &entity.Product{
		Name:        request.Name,
		CategoryID:  request.CategoryID,
		Description: request.Description,
		ImageURL:    request.ImageURL,
		HasVariant:  request.HasVariant,
		Price:       request.Price,
		Stock:       request.Stock,
		Weight:      request.Weight,
	}
	if request.ColorID != nil {
		product.ColorID = request.ColorID
	}
	if request.SizeID != nil {
		product.SizeID = request.SizeID
	}

	err = s.repo.Create(tx, product)
	if err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.invalidateProductListCaches()

	return nil
}

func (s *productService) Update(ctx context.Context, request *dto.UpdateProductRequest) error {
	src, err := request.Image.Open()
	if err != nil {
		return errors.New("failed to open image")
	}
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
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), request.Image.Filename)
	imagePath :=  filepath.Join("public/products/images", fileName) 
	dst, err := os.Create(imagePath)
	if err != nil {
		return err
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		return err
	}
	*request.ImageURL = "/static/products/images/" + fileName
	product := &entity.Product{
		Name:        request.Name,
		CategoryID:  request.CategoryID,
		Description: request.Description,
		ImageURL:    request.ImageURL,
		HasVariant:  request.HasVariant,
		Price:       request.Price,
		Stock:       request.Stock,
		Weight:      request.Weight,
	}
	if request.ColorID != nil {
		product.ColorID = request.ColorID
	}
	if request.SizeID != nil {
		product.SizeID = request.SizeID
	}
	err = s.repo.Update(tx, product)
	if err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.invalidateProductListCaches()

	return error(nil)
}

func (s *productService) Delete(ctx context.Context, id uuid.UUID) error {
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
	product := &entity.Product{
		ID: id,
	}
	err := s.repo.Delete(tx, product.ID)
	if err != nil {
		tx.Error = err
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.invalidateProductListCaches()

	return nil
}

func (s *productService) invalidateProductListCaches() error {
	for _, key := range cache.ListCacheKeysProductToInvalidate {
		err := s.cacheable.Delete(key)
		if err != nil {
			return fmt.Errorf("WARNING: Failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}
