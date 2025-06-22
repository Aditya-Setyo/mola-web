package repository

import (
	"context"
	"mola-web/internal/entity"
	"mola-web/internal/http/dto"

	"gorm.io/gorm"
)

type SalesReportRepository interface {
	GetSalesReport(ctx context.Context, filter dto.ReportFilter) ([]dto.SalesReport, error)
	Create(db *gorm.DB, sales *entity.SalesReport) error
}

type salesReportRepository struct {
	db *gorm.DB
}

func NewSalesReportRepository(db *gorm.DB) SalesReportRepository {
	return &salesReportRepository{db: db}
}

func (r *salesReportRepository) GetSalesReport(ctx context.Context, filter dto.ReportFilter) ([]dto.SalesReport, error) {
	var reports []dto.SalesReport
	query := r.db.WithContext(ctx).Table("orders").
		Select("DATE(created_at) AS date, SUM(total_amount) AS total_sales, COUNT(*) AS total_orders").
		Where("is_paid = ?", true)

	if filter.Today {
		query = query.Where("DATE(created_at) = CURRENT_DATE")
	} else if filter.Date != "" {
		query = query.Where("DATE(created_at) = ?", filter.Date)
	} else if filter.Month != "" {
		query = query.Where("TO_CHAR(created_at, 'YYYY-MM') = ?", filter.Month)
	} else if filter.Start != "" && filter.End != "" {
		query = query.Where("DATE(created_at) BETWEEN ? AND ?", filter.Start, filter.End)
	}

	err := query.
		Group("DATE(created_at)").
		Order("date").
		Scan(&reports).Error

	return reports, err
}


func (r *salesReportRepository) Create(db *gorm.DB, sales *entity.SalesReport) error{
	if err := db.Create(sales).Error; err != nil {
		return err
	}
	return nil
}