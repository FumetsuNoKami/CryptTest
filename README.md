# 🪙 Crypt — Crypto Data API

REST API сервис на Go для получения актуальных данных по криптовалютам.  
Использует [CoinGecko API](https://www.coingecko.com/en/api) как источник данных.

## Возможности

- 📋 Список монет с рыночными данными (цена, капитализация, объём торгов)
- 🔍 Детальная информация по конкретной монете
- 📈 История цен за выбранный период (1д / 7д / 30д / 365д)
- 🌐 CORS-поддержка для подключения фронтенда
- ⚡ Graceful shutdown (корректное завершение при остановке)

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd crypt

# 2. Создать .env файл
cp .env.example .env

# 3. Загрузить зависимости
go mod tidy

# 4. Запустить сервер
go run ./cmd/server/main.go
```

Сервер запустится на `http://localhost:8080`.

## API Endpoints

| Метод | URL                          | Описание                   |
| ----- | ---------------------------- | -------------------------- |
| GET   | `/health`                    | Проверка работоспособности |
| GET   | `/api/v1/coins`              | Список монет               |
| GET   | `/api/v1/coins/{id}`         | Детали монеты              |
| GET   | `/api/v1/coins/{id}/history` | История цен                |

Полная документация: [docs/API.md](docs/API.md)

## Примеры запросов

```bash
# Топ-10 монет в USD
curl "http://localhost:8080/api/v1/coins?currency=usd&per_page=10"

# Детали по Bitcoin
curl "http://localhost:8080/api/v1/coins/bitcoin"

# История Ethereum за 30 дней
curl "http://localhost:8080/api/v1/coins/ethereum/history?days=30"
```

## Структура проекта

```
crypt/
├── cmd/server/         # Точка входа (main.go)
├── internal/
│   ├── config/         # Конфигурация из .env
│   ├── model/          # Структуры данных
│   ├── client/         # Клиенты внешних API
│   │   └── coingecko/  # CoinGecko реализация
│   ├── service/        # Бизнес-логика
│   └── handler/        # HTTP-обработчики
├── pkg/logger/         # Логгер
├── docs/               # Документация
└── .env.example        # Пример конфигурации
```

Подробное описание архитектуры: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Документация

- [Начало работы](docs/GETTING_STARTED.md)
- [Архитектура проекта](docs/ARCHITECTURE.md)
- [API документация](docs/API.md)
