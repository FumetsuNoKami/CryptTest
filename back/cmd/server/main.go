package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/andrewp/crypt/internal/client/coingecko"
	"github.com/andrewp/crypt/internal/config"
	"github.com/andrewp/crypt/internal/handler"
	"github.com/andrewp/crypt/internal/service"
	"github.com/andrewp/crypt/pkg/logger"
)

func main() {
	// 1. Загружаем конфигурацию из .env / ENV
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "err", err)
		os.Exit(1)
	}

	// 2. Создаём логгер
	log := logger.New(os.Getenv("APP_ENV"))

	log.Info("starting crypt server",
		"addr", cfg.Server.Addr(),
		"env", os.Getenv("APP_ENV"),
	)

	// 3. Собираем зависимости (Dependency Injection вручную)
	//    client → service → handler
	cgClient := coingecko.New(cfg.CoinGecko, log)
	cryptoSvc := service.NewCryptoService(cgClient, log)
	router := handler.NewRouter(cryptoSvc, log)

	// 4. Настраиваем HTTP-сервер
	srv := &http.Server{
		Addr:         cfg.Server.Addr(),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  60 * time.Second,
	}

	// 5. Запускаем сервер в отдельной горутине
	go func() {
		log.Info("server listening", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	// 6. Graceful shutdown: ждём сигнал SIGINT или SIGTERM (Ctrl+C / docker stop)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("forced shutdown", "err", err)
	}

	log.Info("server stopped")
}
