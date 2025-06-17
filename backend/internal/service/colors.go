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

type ColorService interface {
	GetAll(ctx context.Context) ([]dto.GetAllColors, error)
	Create(ctx context.Context, color *dto.CreateColorRequest) error
	Update(ctx context.Context, color *dto.UpdateColorRequest) error
	Delete(ctx context.Context, id uint) error
}
type colorService struct {
	DB           *gorm.DB
	repo         repository.ColorRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewColorService(db *gorm.DB, repo repository.ColorRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) ColorService {
	return &colorService{
		DB:           db,
		repo:         repo,
		tokenUseCase: tokenUseCase,
		cacheable:    cacheable,
	}
}

func (s *colorService) GetAll(ctx context.Context) (results []dto.GetAllColors, err error) {
	key := "colors:Get-all"
	data := s.cacheable.Get(key)
	if data != "" {
		err = json.Unmarshal([]byte(data), &results)
		if err != nil {
			return nil, err
		}
		return results, nil
	}
	colors, err := s.repo.GetAll(ctx)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("colors not found")
	} else if err != nil {
		return nil, err
	}
	for _, value := range colors {
		results = append(results, dto.GetAllColors{
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

func (s *colorService) Create(ctx context.Context, request *dto.CreateColorRequest) error {
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
	color := &entity.Color{
		Name: request.Name,
	}
	err := s.repo.Create(tx, color)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "colors:Get-all"
	_ = s.cacheable.Delete(key)
	return nil
}

func (s *colorService) Update(ctx context.Context, request *dto.UpdateColorRequest) error {
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
	color := &entity.Color{
		ID:   request.ID,
		Name: request.Name,
	}
	err := s.repo.Update(tx, color)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "colors:Get-all"
	_ = s.cacheable.Delete(key)
	return nil

}

func (s *colorService) Delete(ctx context.Context, id uint) error {
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
	color := &entity.Color{
		ID: id,
	}
	err := s.repo.Delete(tx, color.ID)
	if err != nil {
		tx.Error = err
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "colors:Get-all"
	_ = s.cacheable.Delete(key)
	return nil
}
