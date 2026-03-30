package handler

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/andrewp/crypt/internal/model"
	"github.com/andrewp/crypt/internal/service"
)

// cryptoHandler хранит зависимости, нужные обработчикам.
type cryptoHandler struct {
	svc service.CryptoService
	log *slog.Logger
}

func newCryptoHandler(svc service.CryptoService, log *slog.Logger) *cryptoHandler {
	return &cryptoHandler{svc: svc, log: log}
}

// ListCoins godoc
// GET /api/v1/coins
//
// Query params:
//   - currency  string  (default: usd)   — валюта: usd, eur, rub, btc, eth...
//   - page      int     (default: 1)     — номер страницы
//   - per_page  int     (default: 50)    — монет на странице, макс. 250
//   - order     string  (default: market_cap_desc)
func (h *cryptoHandler) ListCoins(w http.ResponseWriter, r *http.Request) {
	params := model.ListCoinsParams{
		VsCurrency: queryStr(r, "currency", "usd"),
		Page:       queryInt(r, "page", 1),
		PerPage:    queryInt(r, "per_page", 50),
		Order:      queryStr(r, "order", "market_cap_desc"),
	}

	// Защита от злоупотреблений
	if params.PerPage > 250 {
		params.PerPage = 250
	}

	coins, err := h.svc.ListCoins(r.Context(), params)
	if err != nil {
		h.log.Error("ListCoins failed", "err", err)
		writeError(w, http.StatusBadGateway, "failed to fetch coins")
		return
	}

	writeJSON(w, http.StatusOK, coins)
}

// GetCoin godoc
// GET /api/v1/coins/{id}
//
// Path params:
//   - id  string — идентификатор монеты (например: bitcoin, ethereum, solana)
func (h *cryptoHandler) GetCoin(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "coin id is required")
		return
	}

	detail, err := h.svc.GetCoin(r.Context(), id)
	if err != nil {
		h.log.Error("GetCoin failed", "id", id, "err", err)
		writeError(w, http.StatusBadGateway, "failed to fetch coin")
		return
	}

	writeJSON(w, http.StatusOK, detail)
}

// GetCoinHistory godoc
// GET /api/v1/coins/{id}/history
//
// Path params:
//   - id  string — идентификатор монеты
//
// Query params:
//   - currency  string  (default: usd)  — валюта
//   - days      string  (default: 7)    — 1, 7, 30, 90, 365, max
func (h *cryptoHandler) GetCoinHistory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "coin id is required")
		return
	}

	params := model.HistoryParams{
		VsCurrency: queryStr(r, "currency", "usd"),
		Days:       queryStr(r, "days", "7"),
	}

	history, err := h.svc.GetCoinHistory(r.Context(), id, params)
	if err != nil {
		h.log.Error("GetCoinHistory failed", "id", id, "err", err)
		writeError(w, http.StatusBadGateway, "failed to fetch history")
		return
	}

	writeJSON(w, http.StatusOK, history)
}

// -------------------------------------------------------------------
// Вспомогательные функции для чтения query-параметров
// -------------------------------------------------------------------

func queryStr(r *http.Request, key, defaultVal string) string {
	if v := r.URL.Query().Get(key); v != "" {
		return v
	}
	return defaultVal
}

func queryInt(r *http.Request, key string, defaultVal int) int {
	if v := r.URL.Query().Get(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil && i > 0 {
			return i
		}
	}
	return defaultVal
}
