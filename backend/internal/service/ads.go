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

	"gorm.io/gorm"
)

type AdsService interface {
	UploadAd(ctx context.Context, request *dto.CreateAdRequest) error
	GetAdsByCategory(ctx context.Context, category string) (result *dto.GetAdsByCategoryResponse, err error)
}

type adsService struct {
	DB           *gorm.DB
	repo         repository.AdRepository
	tokenUseCase token.TokenUseCase
	cacheable    cache.Cacheable
}

func NewAdsService(db *gorm.DB, repo repository.AdRepository, tokenUseCase token.TokenUseCase, cacheable cache.Cacheable) AdsService {
	return &adsService{
		DB:           db,
		repo:         repo,
		tokenUseCase: tokenUseCase,
		cacheable:    cacheable,
	}
}

func (s *adsService) UploadAd(ctx context.Context, request *dto.CreateAdRequest) error {
	src, err := request.Image.Open()
	if err != nil {
		return errors.New("failed to open image")
	}

	tx := s.DB.WithContext(ctx).Begin()
	defer func() {
		src.Close()
		if p := recover(); p != nil {
			tx.Rollback()
			log.Printf("PANIC RECOVERED: Rolling back transaction due to panic: %v", p)
			panic(p)
		} else if tx.Error != nil {
			tx.Rollback()
			log.Printf("ERROR: Rolling back transaction due to service error: %v", tx.Error)
		}
	}()

	var dataAds *entity.Ad
	dataAds, err = s.repo.GetByCategory(tx, request.Category)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		createAds, err := s.repo.Create(tx, *dataAds)
		if err != nil {
			tx.Error = err
			return err
		}
		dataAds = createAds
	} else if err != nil {
		tx.Error = err
		return err
	} else {
		oldPath := filepath.Join(dataAds.ImageURL)
		os.Remove(oldPath)
	}
	fileName := fmt.Sprintf("%s-Category:%s-%s", dataAds.ID, request.Category, request.Image.Filename)
	imagePath :=  filepath.Join("public/ads", fileName) 
	dst, err := os.Create(imagePath)
	if err != nil {
		return err
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		return err
	}
	newAds := &entity.Ad{
		ImageURL: "/static/ads/" + fileName,
	}
	err = s.repo.Update(tx, *newAds)
	if err != nil {
		tx.Error = err
		return errors.New("failed to update ads")
	}
	if err := tx.Commit().Error; err != nil {
		tx.Error = err
		return err
	}
	key := "ads:all"
	_ = s.cacheable.Delete(key)

	return nil
}


func (s *adsService) GetAdsByCategory(ctx context.Context, category string) (result *dto.GetAdsByCategoryResponse, err error) {
	key := "ads:all"
	data := s.cacheable.Get(key)
	if data != "" {
		err := json.Unmarshal([]byte(data), &result)
		if err != nil {
			return nil, err
		}
		return result, nil
	}
	ads, err := s.repo.GetByCategory(s.DB, category)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("ads not found")
	} else if err != nil {
		return nil, err
	}
	result = &dto.GetAdsByCategoryResponse{
		ImageURL: ads.ImageURL,
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