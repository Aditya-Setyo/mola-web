package entity

import (
	"time"

	"github.com/google/uuid"
)

type SalesReport struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ReportDate  time.Time `gorm:"type:date;not null" json:"report_date"`
	TotalSales  float64   `gorm:"type:numeric(12,2);not null" json:"total_sales"`
	TotalOrders int       `gorm:"not null" json:"total_orders"`
	CreatedAt   time.Time `json:"created_at"`
}

func (SalesReport) TableName() string {
	return "sales_reports"
}