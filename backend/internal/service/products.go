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
	InsertProductReview(ctx context.Context, request *dto.ProductReviewRequest) error
	GetProductReviews(ctx context.Context, productID uuid.UUID) ([]dto.GetProductReviewResponse, error)
	Create(ctx context.Context, request *dto.CreateProductRequest) error
	Update(ctx context.Context, request *dto.UpdateProductRequest) error
	CheckStockProduct(tx *gorm.DB, productID uuid.UUID) (int64, error)
	CheckStockProductVariant(tx *gorm.DB, variantID uuid.UUID) (int64, error)
	UpdateStockProductOnOrder(tx *gorm.DB, productID uuid.UUID, stock int64) error
	UpdateStockProductVariantOnOrder(tx *gorm.DB, variantID uuid.UUID, stock int64) error
	UpdateStockProduct(ctx context.Context, productID uuid.UUID, stock int64) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type productService struct {
	DB           *gorm.DB
	repo         repository.ProductRepository
	repoVariant  repository.ProductVariantRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewProductService(db *gorm.DB, repo repository.ProductRepository, repoVariant repository.ProductVariantRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) ProductService {
	return &productService{
		DB:           db,
		repo:         repo,
		repoVariant:  repoVariant,
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

	dataProducts, err := s.repo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else if err != nil {
		return nil, err
	}

	for _, value := range dataProducts {
		productDTO := &dto.GetAllProducts{
			ID:          value.ID,
			Name:        value.Name,
			Stock:       value.Stock,
			Weight:      value.Weight,
			Price:       value.Price,
			Description: value.Description,
			ImageURL:    value.ImageURL,
			CategoryID:  value.CategoryID,
			HasVariant:  value.HasVariant,
		}
		if value.Category != nil {
			productDTO.CategoryName = &value.Category.Name
		}

		if value.HasVariant {
			for _, v := range value.Variants {
				var variantDTO dto.ProductVariantInfo
				variantDTO.ID = v.ID
				variantDTO.Stock = v.Stock

				if v.ColorID != nil {
					variantDTO.ColorID = v.ColorID
				}
				if v.SizeID != nil {
					variantDTO.SizeID = v.SizeID
				}
				if v.Color != nil {
					variantDTO.Color = v.Color.Name
				}
				if v.Size != nil {
					variantDTO.Size = v.Size.Name
				}

				productDTO.Variants = append(productDTO.Variants, variantDTO)
			}
		}

		results = append(results, productDTO)
	}

	marshalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, marshalledData)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (s *productService) GetProductByCategoryID(ctx context.Context, categoryID uint) (results []*dto.GetProductByCategoryID, err error) {
	key := cache.CacheKeyProductsGetByCategoryId + fmt.Sprint(categoryID)
	data := s.cacheable.Get(key)
	if data != "" {
		err := json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}

	dataProducts, err := s.repo.GetByCategoryID(ctx, categoryID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else if err != nil {
		return nil, err
	}

	for _, value := range dataProducts {
		productDTO := &dto.GetProductByCategoryID{
			ID:          value.ID,
			Name:        value.Name,
			Stock:       value.Stock,
			Weight:      value.Weight,
			Price:       value.Price,
			Description: value.Description,
			ImageURL:    value.ImageURL,
			CategoryID:  value.CategoryID,
			HasVariant:  value.HasVariant,
		}
		if value.Category != nil {
			productDTO.CategoryName = &value.Category.Name
		}

		if value.HasVariant {
			for _, v := range value.Variants {
				var variantDTO dto.ProductVariantInfo
				variantDTO.ID = v.ID
				variantDTO.Stock = v.Stock

				if v.ColorID != nil {
					variantDTO.ColorID = v.ColorID
				}
				if v.SizeID != nil {
					variantDTO.SizeID = v.SizeID
				}
				if v.Color != nil {
					variantDTO.Color = v.Color.Name
				}
				if v.Size != nil {
					variantDTO.Size = v.Size.Name
				}

				productDTO.Variants = append(productDTO.Variants, variantDTO)
			}
		}

		results = append(results, productDTO)
	}

	marshalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, marshalledData)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (s *productService) GetProductByName(ctx context.Context, name string) (results []dto.GetProductByName, err error) {
	dataProducts, err := s.repo.GetByName(ctx, name)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else if err != nil {
		return nil, err
	}

	for _, product := range dataProducts {
		result := dto.GetProductByName{
			ID:          product.ID,
			Name:        product.Name,
			Weight:      product.Weight,
			Description: product.Description,
			ImageURL:    product.ImageURL,
			CategoryID:  product.CategoryID,
			HasVariant:  product.HasVariant,
			Price:       product.Price,
			Stock:       product.Stock,
		}

		if product.Category != nil {
			result.CategoryName = &product.Category.Name
		}

		if product.HasVariant {
			for _, v := range product.Variants {
				var variantDTO dto.ProductVariantInfo
				variantDTO.ID = v.ID
				variantDTO.Stock = v.Stock

				if v.ColorID != nil {
					variantDTO.ColorID = v.ColorID
				}
				if v.SizeID != nil {
					variantDTO.SizeID = v.SizeID
				}
				if v.Color != nil {
					variantDTO.Color = v.Color.Name
				}
				if v.Size != nil {
					variantDTO.Size = v.Size.Name
				}

				result.Variants = append(result.Variants, variantDTO)
			}
		}

		results = append(results, result)
	}
	return results, nil
}

func (s *productService) GetByID(ctx context.Context, id uuid.UUID) (result *dto.GetProductByID, err error) {
	key := cache.CacheKeyProductsGetById + fmt.Sprint(id)
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	dataProduct, err := s.repo.GetByID(s.DB.WithContext(ctx), id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("products not found")
	} else if err != nil {
		return nil, err
	}

	result = &dto.GetProductByID{
		ID:          dataProduct.ID,
		Name:        dataProduct.Name,
		Description: dataProduct.Description,
		ImageURL:    dataProduct.ImageURL,
		HasVariant:  dataProduct.HasVariant,
		Price:       dataProduct.Price,
		Weight:      dataProduct.Weight,
		CategoryID:  dataProduct.CategoryID,
		Stock:       dataProduct.Stock,
	}

	if dataProduct.Category != nil {
		result.CategoryName = &dataProduct.Category.Name
	}

	// Tambahkan informasi varian jika ada
	if dataProduct.HasVariant {
		for _, v := range dataProduct.Variants {
			var variantDTO dto.ProductVariantInfo
			variantDTO.ID = v.ID
			variantDTO.Stock = v.Stock

			if v.ColorID != nil {
				variantDTO.ColorID = v.ColorID
			}
			if v.SizeID != nil {
				variantDTO.SizeID = v.SizeID
			}
			if v.Color != nil {
				variantDTO.Color = v.Color.Name
			}
			if v.Size != nil {
				variantDTO.Size = v.Size.Name
			}

			result.Variants = append(result.Variants, variantDTO)
		}
	}

	marshalledData, err := json.Marshal(result)
	if err != nil {
		return nil, err
	}

	err = s.cacheable.Set(key, marshalledData)
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
	} else if err != nil {
		return 0, err
	}
	if stock <= 0 {
		return 0, errors.New("stock is empty")
	}

	return stock, nil
}

func (s *productService) CheckStockProductVariant(tx *gorm.DB, variantID uuid.UUID) (int64, error) {
	stock, err := s.repoVariant.GetStockProductVariant(tx, variantID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = errors.New("order not found")
		return 0, err
	} else if err != nil {
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

func (s *productService) UpdateStockProductVariantOnOrder(tx *gorm.DB, variantID uuid.UUID, stock int64) error {
	dataStock, err := s.CheckStockProductVariant(tx, variantID)
	if err != nil {
		return err
	}
	stock = dataStock - stock

	err = s.repoVariant.UpdateStock(tx, variantID, int(stock))
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

func (s *productService) InsertProductReview(ctx context.Context, request *dto.ProductReviewRequest) error {
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
	data := &entity.ProductReview{
		ProductID: request.ProductID,
		UserName:  request.UserName,
		Rating:    request.Rating,
		Review:    request.Review,
	}
	err := s.repo.InsertProductReview(tx, data)
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

func (s *productService) GetProductReviews(ctx context.Context, productID uuid.UUID) ([]dto.GetProductReviewResponse, error) {
	results := []dto.GetProductReviewResponse{}
	key := cache.CacheKeyProductsReviews + productID.String()
	data := s.cacheable.Get(key)
	if data != "" {
		err := json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}

	dataProductReviews, err := s.repo.GetProductReviews(ctx, productID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("product reviews not found")
	} else if err != nil {
		return nil, err
	}

	for _, productReview := range dataProductReviews {
		result := dto.GetProductReviewResponse{
			ID:        productReview.ID,
			ProductID: productReview.ProductID,
			UserName:  productReview.UserName,
			Rating:    productReview.Rating,
			Review:    productReview.Review,
		}
		results = append(results, result)
	}

	marshalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, marshalledData)

	return results, nil
}

func (s *productService) Create(ctx context.Context, request *dto.CreateProductRequest) error {
	src, err := request.Image.Open()
	if err != nil {
		return errors.New("failed to open image")
	}

	log.Println("req", request)
	log.Println("variant", request.Variants)
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
	imagePath := filepath.Join("public/products/images", fileName)
	dst, err := os.Create(imagePath)
	if err != nil {
		return err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}
	*request.ImageURL = "/static/products/images/" + fileName

	// Otomatis tentukan hasVariant
	hasVariant := request.HasVariant
	product := &entity.Product{
		Name:        request.Name,
		CategoryID:  request.CategoryID,
		Description: request.Description,
		ImageURL:    request.ImageURL,
		HasVariant:  hasVariant,
		Price:       request.Price,
		Weight:      request.Weight,
		Stock:       request.Stock,
	}
	err = s.repo.Create(tx, product)
	if err != nil {
		tx.Error = err
		return err
	}
	var variant *entity.ProductVariant
	if !hasVariant {
		product.Stock = request.Stock
	} else {
		for _, v := range request.Variants {
			variant = &entity.ProductVariant{
				ProductID: product.ID,
				ColorID:   v.ColorID,
				SizeID:    v.SizeID,
				Stock:     v.Stock,
			}
			err = s.repoVariant.Create(tx, variant)
			if err != nil {
				tx.Error = err
				return err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.invalidateProductListCaches()

	return nil
}

func (s *productService) Update(ctx context.Context, request *dto.UpdateProductRequest) error {
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

	// Upload gambar baru jika ada
	if request.Image != nil {
		src, err := request.Image.Open()
		if err != nil {
			tx.Error = err
			return errors.New("failed to open image")
		}
		defer src.Close()

		fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), request.Image.Filename)
		imagePath := filepath.Join("public/products/images", fileName)
		dst, err := os.Create(imagePath)
		if err != nil {
			tx.Error = err
			return err
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			tx.Error = err
			return err
		}
		*request.ImageURL = "/static/products/images/" + fileName
	}

	// Update produk utama
	product := &entity.Product{
		ID:          request.ID,
		Name:        request.Name,
		CategoryID:  request.CategoryID,
		Description: request.Description,
		ImageURL:    request.ImageURL,
		HasVariant:  request.HasVariant,
		Price:       request.Price,
		Weight:      request.Weight,
	}

	if !request.HasVariant {
		product.Stock = request.Stock
	}

	err := s.repo.Update(tx, product)
	if err != nil {
		tx.Error = err
		return err
	}

	// Jika memiliki variant, lakukan sinkronisasi varian
	if request.HasVariant {
		// Ambil semua varian lama
		existingVariants, err := s.repoVariant.GetByProductID(tx, product.ID)
		if err != nil {
			tx.Error = err
			return err
		}

		// Map untuk melacak varian yang sudah diproses
		processed := make(map[string]bool)

		for i, newVar := range request.Variants {
			log.Println("==========================", request.Variants[i].ID)
			key := fmt.Sprintf("%v:%v", newVar.ColorID, newVar.SizeID)
			processed[key] = true
			found := false

			// Cek apakah varian baru ini sudah ada di varian lama
			for _, oldVar := range existingVariants {
				if (oldVar.ColorID == nil && newVar.ColorID == nil || oldVar.ColorID != nil && newVar.ColorID != nil && *oldVar.ColorID == *newVar.ColorID) &&
					(oldVar.SizeID == nil && newVar.SizeID == nil || oldVar.SizeID != nil && newVar.SizeID != nil && *oldVar.SizeID == *newVar.SizeID) {

					// Update stok jika berubah
					if oldVar.Stock != newVar.Stock {
						oldVar.Stock = newVar.Stock
						if err := s.repoVariant.Update(tx, oldVar); err != nil {
							tx.Error = err
							return err
						}
					}
					found = true
					break
				}
			}

			// Jika varian tidak ditemukan, tambahkan sebagai varian baru
			if !found {
				newEntity := &entity.ProductVariant{
					ProductID: product.ID,
					ColorID:   newVar.ColorID,
					SizeID:    newVar.SizeID,
					Stock:     newVar.Stock,
				}
				if err := s.repoVariant.Create(tx, newEntity); err != nil {
					tx.Error = err
					return err
				}
			}
		}
		// for i, value := range existingVariants {
		// 	if request.Variants[i].ID == &value.ID {
		// 		continue
		// 	} else {
		// 		if err := s.repoVariant.DeleteByID(tx, value.ID); err != nil {
		// 			tx.Error = err
		// 			return err
		// 		}
		// 	}
		// }
		// Helper: bandingkan UUID dengan aman, termasuk nil

		variantIDsFromRequest := make(map[uuid.UUID]bool)
		log.Println("variantID", request.Variants[0].ID)
		for _, newVar := range request.Variants {
			if newVar.ID != nil {
				variantIDsFromRequest[*newVar.ID] = true
			}
		}
		log.Println("variantIDsFromRequest", variantIDsFromRequest)
		// Hapus varian lama yang tidak ada di permintaan update
		for _, oldVar := range existingVariants {
			if _, exists := variantIDsFromRequest[oldVar.ID]; !exists {
				if err := s.repoVariant.DeleteByID(tx, oldVar.ID); err != nil {
					tx.Error = err
					return err
				}
			}
		}

	}

	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}

	_ = s.invalidateProductListCaches()

	return nil
}

func isSameUUID(a, b *uuid.UUID) bool {
	if a == nil && b == nil {
		return true
	}
	if a != nil && b != nil {
		return *a == *b
	}
	return false
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
		err := s.cacheable.DeleteByPrefix(key)
		if err != nil {
			return fmt.Errorf("WARNING: Failed to invalidate cache key %s: %v", key, err)
		}
	}
	return nil
}
