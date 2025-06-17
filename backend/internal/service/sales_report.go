package service

import (
	"context"
	"errors"
	"mola-web/internal/http/dto"
	"mola-web/internal/repository"

	"gorm.io/gorm"
)

type SalesReportService interface {
	GetSalesReport(ctx context.Context, filter dto.ReportFilter) ([]dto.SalesReport, error)
}
type salesReportService struct {
	DB   *gorm.DB
	repo repository.SalesReportRepository
}

func NewSalesReportService(db *gorm.DB, repo repository.SalesReportRepository) SalesReportService {
	return &salesReportService{
		DB:   db,
		repo: repo,
	}
}

func (s *salesReportService) GetSalesReport(ctx context.Context, filter dto.ReportFilter) ([]dto.SalesReport, error) {
	results, err := s.repo.GetSalesReport(ctx, filter)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("sales report not found")
	} else if err != nil {
		return nil, err
	}
	return results, err
}
