package router

import (
	"mola-web/internal/http/handler"
	"mola-web/pkg/route"
	"net/http"
)

func PublicRoutes(
	userHandler handler.UserHandler,
	productHandler handler.ProductHandler,
	cartHandler handler.CartHandler,
	orderHandler handler.OrderHandler,
	transactionHandler handler.TransactionHandler,
	salesReportHandler handler.SalesReportHandler,
	adsHandler handler.AdHandler,
) []route.Route {
	return []route.Route{
		
		{
			Method:  http.MethodPost,
			Path:    "/login",
			Handler: userHandler.Login,
		},
		{
			Method:  http.MethodPost,
			Path:    "/login/google",
			Handler: userHandler.GoogleLogin,
		},
		{
			Method:  http.MethodPost,
			Path:    "/register",
			Handler: userHandler.Register,
		},
		{
			Method:  http.MethodPost,
			Path:    "/forgot-password",
			Handler: userHandler.ForgotPassword,
		},
		{
			Method:  http.MethodPost,
			Path:    "/reset-password",
			Handler: userHandler.ResetPassword,
		},
		{
			Method:  http.MethodGet,
			Path:    "/products",
			Handler: productHandler.GetAll,
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
			Path:    "/payments/midtrans",
			Handler: transactionHandler.PaymentNotification,
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/ads/:category",
			Handler: adsHandler.GetAds,
		},
	}
}

func PrivateRoutes(
	userHandler handler.UserHandler,
	productHandler handler.ProductHandler,
	categoryHandler handler.CategoryHandler,
	colorHandler handler.ColorHandler,
	sizeHandler handler.SizeHandler,
	cartHandler handler.CartHandler,
	orderHandler handler.OrderHandler,
	transactionHandler handler.TransactionHandler,
	salesReportHandler handler.SalesReportHandler,
	shipmentHandler handler.ShipmentHandler,
	adsHandler handler.AdHandler,
) []route.Route {
	return []route.Route{
		{
			Method:  http.MethodGet,
			Path:    "/users/profile",
			Handler: userHandler.GetUserProfile,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/users",
			Handler: userHandler.GetAllUsers,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/users/profile",
			Handler: userHandler.UpdateUserProfile,
			Roles:   []string{"admin", "user"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/products",
			Handler: productHandler.Create,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/products/:productID",
			Handler: productHandler.Update,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/products/stock/:productID",
			Handler: productHandler.UpdateStock,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/products/:productID",
			Handler: productHandler.Delete,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/categories",
			Handler: categoryHandler.Create,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/categories",
			Handler: categoryHandler.GetAll,
			Roles:   []string{"admin", "user"},//masih bingung
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/categories/:categoryID",
			Handler: categoryHandler.Delete,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/categories/:categoryID",
			Handler: categoryHandler.Update,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/colors",
			Handler: colorHandler.Create,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/colors",
			Handler: colorHandler.GetAll,
			Roles:   []string{"admin", "user"},//masih bingung
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/colors/:colorID",
			Handler: colorHandler.Delete,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/colors/:colorID",
			Handler: colorHandler.Update,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/sizes",
			Handler: sizeHandler.Create,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/sizes",
			Handler: sizeHandler.GetAll,
			Roles:   []string{"admin", "user"},//masih bingung
		},
		{
			Method:  http.MethodDelete,
			Path:    "/admin/sizes/:sizeID",
			Handler: sizeHandler.Delete,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPut,
			Path:    "/admin/sizes/:sizeID",
			Handler: sizeHandler.Update,
			Roles:   []string{"admin"},
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
			Path:    "/admin/orders/aproval/:orderID",
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
			Method:  http.MethodPost,
			Path:    "/admin/shipments/add-resi-number/:orderID",
			Handler: shipmentHandler.AddResiNumber,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodGet,
			Path:    "/admin/sales-report",
			Handler: salesReportHandler.GetSalesReport,
			Roles:   []string{"admin"},
		},
		{
			Method:  http.MethodPost,
			Path:    "/admin/ads",
			Handler: adsHandler.UploadAd,
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
