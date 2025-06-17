package dto

type SalesReport struct {
	Date  string  `json:"date"`
	TotalSales  float64 `json:"total_sales"`
	TotalOrders int `json:"total_orders"`
}

type ReportFilter struct {
	Today  bool
	Date   string
	Month  string
	Start  string
	End    string
}