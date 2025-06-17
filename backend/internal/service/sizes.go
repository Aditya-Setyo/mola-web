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

type SizeService interface {
	GetAll(ctx context.Context) ([]dto.GetAllSizes, error)
	Create(ctx context.Context, size *dto.CreateSizeRequest) error
	Update(ctx context.Context, size *dto.UpdateSizeRequest) error
	Delete(ctx context.Context, id uint) error
}

type sizeService struct {
	DB           *gorm.DB
	repo         repository.SizeRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewSizeService(db *gorm.DB, repo repository.SizeRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) SizeService {
	return &sizeService{
		DB:           db,
		repo:         repo,
		tokenUseCase: tokenUseCase,
		cacheable:    cacheable,
	}
}

func (s *sizeService) GetAll(ctx context.Context) (results []dto.GetAllSizes, err error) {
	key := "sizes:Get-all"
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}
	sizes, err := s.repo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("sizes not found")
	} else	if err != nil {
		return nil, err
	}
	for _, value := range sizes {
		results = append(results, dto.GetAllSizes{
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

func (s *sizeService) Create(ctx context.Context, request *dto.CreateSizeRequest) error {
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
	size := &entity.Size{
		Name: request.Name,
	}
	err := s.repo.Create(tx, size)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "sizes:Get-all"
	_ = s.cacheable.Delete(key)
	return nil
}

func (s *sizeService) Update(ctx context.Context, request *dto.UpdateSizeRequest) error {
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
	size := &entity.Size{
		ID:   request.ID,
		Name: request.Name,
	}
	err := s.repo.Update(tx, size)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "sizes:Get-all"
	_ = s.cacheable.Delete(key)
	
	return nil
}

func (s *sizeService) Delete(ctx context.Context, id uint) error {
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
	size := &entity.Size{
		ID: id,
	}
	err := s.repo.Delete(tx, size.ID)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "sizes:Get-all"
	_ = s.cacheable.Delete(key)
	
	return nil
}
