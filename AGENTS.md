# AGENTS.md

## Scope
- Монорепо из двух независимых частей: `back/` (Go API) и `front/` (React Router v7 SSR шаблон).
- Текущий продуктовый код находится в `back/`; `front/` пока стартовый шаблон без вызовов API.

## Big Picture (как течёт запрос)
- Точка входа: `back/cmd/server/main.go`.
- Ручной DI в цепочке `coingecko.Client -> service.CryptoService -> handler`.
- Роутинг и middleware: `back/internal/handler/router.go` (`chi`, `cors`, `Recoverer`, `Logger`, `Compress`, `RequestID`).
- Бизнес-слой: `back/internal/service/crypto.go` (валидация + делегирование клиенту).
- Внешний API-слой: `back/internal/client/coingecko/coingecko.go` (HTTP + mapping CoinGecko -> `internal/model`).
- Все HTTP-ответы обёрнуты в единый формат `{"data": ..., "error": ...}` через `back/internal/handler/response.go`.

## Critical Workflows
- Запуск всего проекта (Windows): `start.ps1` или `make run` из корня (открывает отдельные PowerShell окна).
- Backend dev: `cd back; go run ./cmd/server/main.go`.
- Backend build/test: `cd back; make build` и `cd back; make test` (включён `-race`).
- Front dev/build: `cd front; npm run dev` / `cd front; npm run build`.
- Конфиг backend: скопировать `back/.env.example` в `.env`; загрузка через `godotenv`, ENV имеет приоритет (`back/internal/config/config.go`).

## Project-Specific Conventions
- Слои держат через интерфейсы: `handler` зависит от `service.CryptoService`, `service` от `client.CryptoClient`.
- Новый endpoint обычно требует изменения в 5 местах: `internal/model` -> `internal/client` -> `internal/service` -> `internal/handler` -> `internal/handler/router.go`.
- Версионирование API зафиксировано на префиксе `/api/v1`.
- Ошибки внешнего источника в handler сейчас мапятся в `502 Bad Gateway` (пример: `ListCoins`, `GetCoin`, `GetCoinHistory`).
- Для `GET /coins` есть защита от перегрузки: `per_page` ограничен до 250 в `back/internal/handler/crypto.go`.
- Логирование через `slog`: `text` в dev, `json` в production (`back/pkg/logger/logger.go`).

## Integrations and Contracts
- Единственная внешняя интеграция: CoinGecko API v3 (`COINGECKO_BASE_URL`, опционально `COINGECKO_API_KEY`).
- При наличии ключа клиент отправляет заголовок `x-cg-pro-api-key`.
- API контракты backend: `/health`, `/api/v1/coins`, `/api/v1/coins/{id}`, `/api/v1/coins/{id}/history`.
- Front сейчас SSR (`front/react-router.config.ts`, `ssr: true`) и имеет только index route `front/app/routes.ts`.

## Practical Agent Notes
- Не опирайтесь на `docs/*` из root README: этих файлов в текущем дереве нет, ориентируйтесь на реальный код.
- В репозитории сейчас нет `*_test.go`; при изменениях backend проверяйте хотя бы `go test ./...`.
- Для изменений в API проверяйте совместимость JSON-полей из `internal/model` (camelCase в тегах уже зафиксирован).
