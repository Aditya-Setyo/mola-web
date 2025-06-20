package builder

import (
	"mola-web/configs"
	"mola-web/internal/http/handler"
	"mola-web/internal/http/router"
	"mola-web/internal/repository"
	"mola-web/internal/service"
	"mola-web/pkg/cache"
	"mola-web/pkg/route"
	"mola-web/pkg/token"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func BuildPublicRoutes(cfg *configs.Config, db *gorm.DB, rdb *redis.Client) []route.Route  {
	cacheable := cache.NewCacheable(rdb)
	userRepository := repository.NewUserRepository(db)
	productRepository := repository.NewProductRepository(db)
	cartRepository := repository.NewCartRepository(db)
	orderRepository := repository.NewOrderRepository(db)
	transactionRepository := repository.NewTransactionRepository(db)
	salesReportRepository := repository.NewSalesReportRepository(db)
	adsRepository := repository.NewAdRepository(db)

	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)
	userService := service.NewUserService(db, userRepository, tokenUseCase, cacheable, cfg.GoogleConfig, cfg.SMPTGmailConfig)
	productService := service.NewProductService(db, productRepository, tokenUseCase, cacheable)
	cartService := service.NewCartService(db, cartRepository, orderRepository, productRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	orderService := service.NewOrderService(db, orderRepository, cartRepository, cartService, productService, cacheable, tokenUseCase, cfg.MidtransConfig)
	transactionService := service.NewTransactionService(db, productRepository, transactionRepository, orderRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	salesReportService := service.NewSalesReportService(db, salesReportRepository)
	adsService := service.NewAdsService(db, adsRepository, tokenUseCase, cacheable)

	userHandler := handler.NewUserHandler(userService)
	productHandler := handler.NewProductHandler(productService)
	cartHandler := handler.NewCartHandler(cartService, db)
	orderHandler := handler.NewOrderHandler(orderService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	salesReportHandler := handler.NewSalesReportHandler(salesReportService)
	adsHandler := handler.NewAdHandler(adsService)

	return router.PublicRoutes(userHandler,productHandler, cartHandler, orderHandler, transactionHandler, salesReportHandler, adsHandler)
}
func BuildPrivateRoutes(cfg *configs.Config, db *gorm.DB, rdb *redis.Client) []route.Route {
	cacheable := cache.NewCacheable(rdb)
	userRepository := repository.NewUserRepository(db)
	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)
	userService := service.NewUserService(db, userRepository, tokenUseCase, cacheable, cfg.GoogleConfig, cfg.SMPTGmailConfig)
	userHandler := handler.NewUserHandler(userService)
	productRepository := repository.NewProductRepository(db)
	productService := service.NewProductService(db, productRepository, tokenUseCase, cacheable)
	productHandler := handler.NewProductHandler(productService)
	transactionRepository := repository.NewTransactionRepository(db)
	salesReportRepository := repository.NewSalesReportRepository(db)
	shipmentRepository := repository.NewShipmentRepository(db)
	categoryRepository := repository.NewCategoryRepository(db)
	colorRepository := repository.NewColorRepository(db)
	sizeRepository := repository.NewSizeRepository(db)
	adsRepository := repository.NewAdRepository(db)



	cartRepository := repository.NewCartRepository(db)
	orderRepository := repository.NewOrderRepository(db)
	cartService := service.NewCartService(db, cartRepository, orderRepository, productRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	orderService := service.NewOrderService(db, orderRepository, cartRepository, cartService, productService, cacheable, tokenUseCase, cfg.MidtransConfig)
	transactionService := service.NewTransactionService(db, productRepository, transactionRepository, orderRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	salesReportService := service.NewSalesReportService(db, salesReportRepository)
	shipmentService := service.NewShipmentService(db, shipmentRepository)
	categoryService := service.NewCategoryService(db, categoryRepository, tokenUseCase, cacheable)
	colorService := service.NewColorService(db, colorRepository, tokenUseCase, cacheable)
	sizeService := service.NewSizeService(db, sizeRepository, tokenUseCase, cacheable)
	adsService := service.NewAdsService(db, adsRepository, tokenUseCase, cacheable)


	cartHandler := handler.NewCartHandler(cartService, db)
	orderHandler := handler.NewOrderHandler(orderService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	salesReportHandler := handler.NewSalesReportHandler(salesReportService)
	shipmentHandler := handler.NewShipmentHandler(shipmentService)
	categoryHandler := handler.NewCategoryHandler(categoryService)	
	colorHandler := handler.NewColorHandler(colorService)
	sizeHandler := handler.NewSizeHandler(sizeService)
	adsHandler := handler.NewAdHandler(adsService)


	return router.PrivateRoutes(userHandler, productHandler, categoryHandler, colorHandler, sizeHandler, cartHandler, orderHandler, transactionHandler, salesReportHandler, shipmentHandler, adsHandler)
}