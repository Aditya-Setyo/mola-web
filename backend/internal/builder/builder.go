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
	categoryRepository := repository.NewCategoryRepository(db)
	colorRepository := repository.NewColorRepository(db)
	sizeRepository := repository.NewSizeRepository(db)
	cartRepository := repository.NewCartRepository(db)
	orderRepository := repository.NewOrderRepository(db)
	transactionRepository := repository.NewTransactionRepository(db)
	salesReportRepository := repository.NewSalesReportRepository(db)

	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)
	userService := service.NewUserService(db, userRepository, tokenUseCase, cacheable)
	productService := service.NewProductService(db, productRepository, tokenUseCase, cacheable)
	categoryService := service.NewCategoryService(db, categoryRepository, tokenUseCase, cacheable)
	colorService := service.NewColorService(db, colorRepository, tokenUseCase, cacheable)
	sizeService := service.NewSizeService(db, sizeRepository, tokenUseCase, cacheable)
	cartService := service.NewCartService(db, cartRepository, orderRepository, productRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	orderService := service.NewOrderService(db, orderRepository, cartRepository, cartService, productService, cacheable, tokenUseCase, cfg.MidtransConfig)
	transactionService := service.NewTransactionService(db, productRepository, transactionRepository, orderRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	salesReportService := service.NewSalesReportService(db, salesReportRepository)

	userHandler := handler.NewUserHandler(userService)
	productHandler := handler.NewProductHandler(productService)
	categoryHandler := handler.NewCategoryHandler(categoryService)	
	colorHandler := handler.NewColorHandler(colorService)
	sizeHandler := handler.NewSizeHandler(sizeService)
	cartHandler := handler.NewCartHandler(cartService, db)
	orderHandler := handler.NewOrderHandler(orderService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	salesReportHandler := handler.NewSalesReportHandler(salesReportService)

	return router.PublicRoutes(userHandler,productHandler, categoryHandler, colorHandler, sizeHandler, cartHandler, orderHandler, transactionHandler, salesReportHandler)
}
func BuildPrivateRoutes(cfg *configs.Config, db *gorm.DB, rdb *redis.Client) []route.Route {
	cacheable := cache.NewCacheable(rdb)
	userRepository := repository.NewUserRepository(db)
	tokenUseCase := token.NewTokenUseCase(cfg.JWT.SecretKey)
	userService := service.NewUserService(db, userRepository, tokenUseCase, cacheable)
	userHandler := handler.NewUserHandler(userService)
	productRepository := repository.NewProductRepository(db)
	productService := service.NewProductService(db, productRepository, tokenUseCase, cacheable)
	productHandler := handler.NewProductHandler(productService)
	transactionRepository := repository.NewTransactionRepository(db)
	salesReportRepository := repository.NewSalesReportRepository(db)

	cartRepository := repository.NewCartRepository(db)
	orderRepository := repository.NewOrderRepository(db)
	cartService := service.NewCartService(db, cartRepository, orderRepository, productRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	orderService := service.NewOrderService(db, orderRepository, cartRepository, cartService, productService, cacheable, tokenUseCase, cfg.MidtransConfig)
	transactionService := service.NewTransactionService(db, productRepository, transactionRepository, orderRepository, tokenUseCase, cacheable, cfg.MidtransConfig)
	salesReportService := service.NewSalesReportService(db, salesReportRepository)

	cartHandler := handler.NewCartHandler(cartService, db)
	orderHandler := handler.NewOrderHandler(orderService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	salesReportHandler := handler.NewSalesReportHandler(salesReportService)

	return router.PrivateRoutes(userHandler, productHandler, cartHandler, orderHandler, transactionHandler, salesReportHandler)
}