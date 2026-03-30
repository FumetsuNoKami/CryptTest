package handler

import (
	"encoding/json"
	"net/http"
)

// apiResponse — стандартная обёртка для всех JSON-ответов API.
// Фронтенд всегда получает одинаковую структуру:
//
//	{ "data": ..., "error": "..." }
type apiResponse struct {
	Data  any    `json:"data,omitempty"`
	Error string `json:"error,omitempty"`
}

// writeJSON сериализует payload в JSON и отправляет с нужным статусом.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(apiResponse{Data: payload})
}

// writeError отправляет JSON с описанием ошибки.
func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(apiResponse{Error: msg})
}
