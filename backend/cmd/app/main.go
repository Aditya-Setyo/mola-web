package main

import (
	"context"
	"fmt"
	"log"
	"mola-web/configs"
	"mola-web/internal/builder"
	"mola-web/pkg/cache"
	"mola-web/pkg/database"
	"mola-web/pkg/server"
	"os"
	"os/signal"
	"time"
)

func main() {
	cfg, err := configs.NewConfig("/var/www/mola-web/backend/.env")
	checkError(err)

	db, err := database.InitDatabase(cfg.PostgresConfig)
	checkError(err)

	checkError(database.AutoMigrate(db))

	rdb := cache.InitCache(cfg.RedisConfig)

	publicRoutes := builder.BuildPublicRoutes(cfg, db, rdb)
	privateRoutes := builder.BuildPrivateRoutes(cfg, db, rdb)

	srv := server.NewServer(cfg, publicRoutes, privateRoutes)
	runServer(srv, cfg.PORT)
	waitForShutdown(srv)
}

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}

func runServer(srv *server.Server, port string) {
	go func() {
		err := srv.Start(fmt.Sprintf(":%s", port))
		log.Fatal(err)
	}()
}

func waitForShutdown(srv *server.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	go func() {
		if err := srv.Shutdown(ctx); err != nil {
			srv.Logger.Fatal(err)
		}
	}()
}
