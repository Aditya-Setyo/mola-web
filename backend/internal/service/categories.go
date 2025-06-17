package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"
	"mola-web/pkg/cache"
	"mola-web/pkg/token"

	"gorm.io/gorm"
)

type CategoryService interface {
	GetAll(ctx context.Context) ([]dto.GetAllCategories, error)
	Create(ctx context.Context, category *dto.CreateCategoryRequest) error
	Update(ctx context.Context, category *dto.UpdateCategoryRequest) error
	Delete(ctx context.Context, id uint) error
}

type categoryService struct {
	DB           *gorm.DB
	repo         repository.CategoryRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewCategoryService(db *gorm.DB, repo repository.CategoryRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) CategoryService {
	return &categoryService{
	DB:           db,
	repo:         repo,
	tokenUseCase: tokenUseCase,
	cacheable:    cacheable,	
	}
}

func (s *categoryService) GetAll(ctx context.Context) (results []dto.GetAllCategories, err error) {
	key := "categories:Get-all"
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}

	categories, err := s.repo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("categories not found")
	} else if err != nil {
		return nil, err
	}
	for _, value := range categories {
		results = append(results, dto.GetAllCategories{
			ID:   value.ID,
			Name: value.Name,
		})
	}
	mashalledData, err := json.Marshal(results)
	if err != nil {
		return nil, err
	}

	_ = s.cacheable.Set(key, mashalledData)
	
	return results, nil
}

func (s *categoryService) Create(ctx context.Context, request *dto.CreateCategoryRequest) error {
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
	category := &entity.Category{
		Name: request.Name,
	}

	err := s.repo.Create(tx, category)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "categories:Get-all"
	_ = s.cacheable.Delete(key)
	return nil
}

func (s *categoryService) Update(ctx context.Context, request *dto.UpdateCategoryRequest) error {
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
	category := &entity.Category{
		ID:   request.ID,
		Name: request.Name,
	}
	err := s.repo.Update(tx, category)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "categories:Get-all"
	_ = s.cacheable.Delete(key)
	return nil
}

func (s *categoryService) Delete(ctx context.Context, id uint) error {
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
	category := entity.Category{
		ID: id,
	}
	err := s.repo.Delete(tx, category.ID)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "categories:Get-all"
	_ = s.cacheable.Delete(key)
	
	return nil
}
