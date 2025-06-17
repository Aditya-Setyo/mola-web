package router

import (
	"mola-web/internal/http/handler"
	"mola-web/pkg/route"
	"net/http"
)

func PublicRoutes(
	userHandler handler.UserHandler,
	productHandler handler.ProductHandler,
	categoryHandler handler.CategoryHandler,
	colorHandler handler.ColorHandler,
	sizeHandler handler.SizeHandler,
	cartHandler handler.CartHandler,
	orderHandler handler.OrderHandler,
	transactionHandler handler.TransactionHandler,
	salesReportHandler handler.SalesReportHandler,
) []route.Route {
	return []route.Route{
		{
			Method:  http.MethodPost,
			Path:    "/login",
			Handler: userHandler.Login,
		},
		{
			Method:  http.MethodPost,
			Path:    "/register",
			Handler: userHandler.Register,
		},
		{
			Method:  http.MethodPost,
			Path:    "/products",
			Handler: productHandler.Create,
		},
		{
			Method:  http.MethodGet,
			Path:    "/products",
			Handler: productHandler.GetAll,
		},
		{
			Method:  http.MethodPut,
			Path:    "/products/:productID",
			Handler: productHandler.Update,
		},
		{
			Method:  http.MethodGet,
			Path:    "/products/category/:categoryID",
			Handler: productHandler.GetByCategoryID,
		},
		{
			Method:  http.MethodGet,
			Path:    "/products/name/:name",
			Handler: productHandler.GetByName,
		},
		{
			Method:  http.MethodGet,
			Path:    "/products/:productID",
			Handler: productHandler.GetByID,
		},
		{
			Method:  http.MethodPost,
			Path:    "/products",
			Handler: productHandler.Create,
		},
		{
			Method:  http.MethodPut,
			Path:    "/products/stock/:productID",
			Handler: productHandler.UpdateStock,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/products/:productID",
			Handler: productHandler.Delete,
		},
		{
			Method:  http.MethodPost,
			Path:    "/categories",
			Handler: categoryHandler.Create,
		},
		{
			Method:  http.MethodGet,
			Path:    "/categories",
			Handler: categoryHandler.GetAll,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/categories/:categoryID",
			Handler: categoryHandler.Delete,
		},
		{
			Method:  http.MethodPut,
			Path:    "/categories/:categoryID",
			Handler: categoryHandler.Update,
		},
		{
			Method:  http.MethodPost,
			Path:    "/colors",
			Handler: colorHandler.Create,
		},
		{
			Method:  http.MethodGet,
			Path:    "/colors",
			Handler: colorHandler.GetAll,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/colors/:colorID",
			Handler: colorHandler.Delete,
		},
		{
			Method:  http.MethodPut,
			Path:    "/colors/:colorID",
			Handler: colorHandler.Update,
		},
		{
			Method:  http.MethodPost,
			Path:    "/sizes",
			Handler: sizeHandler.Create,
		},
		{
			Method:  http.MethodGet,
			Path:    "/sizes",
			Handler: sizeHandler.GetAll,
		},
		{
			Method:  http.MethodDelete,
			Path:    "/sizes/:sizeID",
			Handler: sizeHandler.Delete,
		},
		{
			Method:  http.MethodPut,
			Path:    "/sizes/:sizeID",
			Handler: sizeHandler.Update,
		},
		{
			Method:  http.MethodPost,
			Path:    "/payments/midtrans",
			Handler: transactionHandler.PaymentNotification,
		},
		{
			Method:  http.MethodGet,
			Path:    "/sales-report",
			Handler: salesReportHandler.GetSalesReport,
		},
	}
}

func PrivateRoutes(
	userHandler handler.UserHandler,
	productHandler handler.ProductHandler,
	cartHandler handler.CartHandler,
	orderHandler handler.OrderHandler,
	transactionHandler handler.TransactionHandler,
	salesReportHandler handler.SalesReportHandler,
	shipmentHandler handler.ShipmentHandler,
) []route.Route {
	return []route.Route{
		{
			Method:  http.MethodGet,
			Path:    "/users/profile",
			Handler: userHandler.GetUserProfile,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/users/profile",
			Handler: userHandler.UpdateUserProfile,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/carts",
			Handler: cartHandler.AddToCart,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/carts",
			Handler: cartHandler.GetCart,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/carts/:cartID",
			Handler: cartHandler.UpdateCartItem,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodDelete,
			Path:    "/carts/:cartID",
			Handler: cartHandler.RemoveCartItem,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/orders/checkout",
			Handler: orderHandler.Checkout,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/orders/show",
			Handler: orderHandler.ShowOrder,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/orders/aproval/:orderID",
			Handler: orderHandler.SetAdminOrderStatus,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/payments/refund",
			Handler: transactionHandler.Refund,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/sales-report",
			Handler: salesReportHandler.GetSalesReport,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/shipments/add-resi-number",
			Handler: shipmentHandler.AddResiNumber,
			Roles:   []string{"admin"},
		},
	}
}

// | Tujuan        | Contoh URL                                      |
// | ------------- | ----------------------------------------------- |
// | Semua laporan | `/sales-report`                                 |
// | Hari ini      | `/sales-report?today=true`                      |
// | Per tanggal   | `/sales-report?date=2025-06-12`                 |
// | Per bulan     | `/sales-report?month=2025-06`                   |
// | Rentang waktu | `/sales-report?start=2025-06-01&end=2025-06-12` |
