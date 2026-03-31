// Package handler содержит HTTP-обработчики и настройку маршрутизатора.
// Каждый обработчик: читает параметры запроса → вызывает сервис → пишет JSON-ответ.
package handler

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/andrewp/crypt/internal/service"
)

// NewRouter собирает и возвращает готовый HTTP-маршрутизатор.
// Все маршруты и middleware регистрируются здесь.
func NewRouter(svc service.CryptoService, log *slog.Logger) http.Handler {
	r := chi.NewRouter()

	// --- Middleware (выполняются перед каждым запросом) ---

	// Восстановление после паники — сервер не упадёт при неожиданной ошибке
	r.Use(middleware.Recoverer)

	// Логирование каждого запроса: метод, путь, статус, время выполнения
	r.Use(middleware.Logger)

	// Сжатие ответов (gzip)
	r.Use(middleware.Compress(5))

	// Уникальный ID для каждого запроса — удобно при отладке
	r.Use(middleware.RequestID)

	// CORS — разрешаем запросы с фронтенда (настройте Origin под ваш домен)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // TODO: ограничьте в production
		AllowedMethods:   []string{"GET", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// --- Маршруты ---
	h := newCryptoHandler(svc, log)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/coins", h.ListCoins)                   // GET /api/v1/coins?currency=usd&page=1&per_page=50
		r.Get("/coins/{id}", h.GetCoin)                // GET /api/v1/coins/bitcoin
		r.Get("/coins/{id}/history", h.GetCoinHistory) // GET /api/v1/coins/bitcoin/history?days=7
		r.Get("/trending", h.GetTrending)              // GET /api/v1/trending
		r.Get("/top-movers", h.GetTopGainersLosers)    // GET /api/v1/top-movers?duration=24h
	})

	// Healthcheck — для Docker/K8s проверки живости сервиса
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	return r
}
