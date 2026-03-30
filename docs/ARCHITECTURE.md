# Архитектура проекта

Проект следует принципам **Clean Architecture** (чистой архитектуры).  
Главная идея: каждый слой зависит только от слоёв ниже, но не наоборот.

---

## Структура папок

```
crypt/
│
├── cmd/
│   └── server/
│       └── main.go          ← Точка входа. Собирает всё вместе.
│
├── internal/                ← Внутренний код, недоступен снаружи модуля
│   ├── config/
│   │   └── config.go        ← Чтение настроек из .env файла
│   │
│   ├── model/
│   │   └── crypto.go        ← Структуры данных (Coin, CoinDetail, PricePoint...)
│   │
│   ├── client/
│   │   ├── client.go        ← Интерфейс CryptoClient
│   │   └── coingecko/
│   │       └── coingecko.go ← Реализация для CoinGecko API
│   │
│   ├── service/
│   │   ├── service.go       ← Интерфейс CryptoService
│   │   └── crypto.go        ← Бизнес-логика
│   │
│   └── handler/
│       ├── router.go        ← Регистрация маршрутов и middleware
│       ├── crypto.go        ← HTTP-обработчики
│       └── response.go      ← Вспомогательные функции для JSON-ответов
│
├── pkg/
│   └── logger/
│       └── logger.go        ← Логгер (доступен для любых нужд)
│
└── docs/                    ← Документация
```

---

## Слои и их обязанности

```
  ┌─────────────────────────────────┐
  │         HTTP Handler            │  ← Читает запрос, вызывает сервис, пишет ответ
  │  internal/handler/              │
  └────────────────┬────────────────┘
                   │ вызывает через интерфейс
  ┌────────────────▼────────────────┐
  │           Service               │  ← Бизнес-логика, валидация, агрегация
  │  internal/service/              │
  └────────────────┬────────────────┘
                   │ вызывает через интерфейс
  ┌────────────────▼────────────────┐
  │           Client                │  ← HTTP-запросы к внешним API
  │  internal/client/coingecko/     │
  └────────────────┬────────────────┘
                   │
  ┌────────────────▼────────────────┐
  │        CoinGecko API            │  ← Внешний мир
  │  https://api.coingecko.com      │
  └─────────────────────────────────┘
```

---

## Зачем интерфейсы?

В `internal/client/client.go` определён интерфейс `CryptoClient`.  
В `internal/service/service.go` — интерфейс `CryptoService`.

**Это даёт три преимущества:**

### 1. Тестируемость

В тестах можно передать mock-реализацию вместо реального HTTP-клиента:

```go
type mockClient struct{}

func (m *mockClient) ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error) {
    return []model.Coin{{ID: "bitcoin", Name: "Bitcoin"}}, nil
}
```

### 2. Замена источника данных

Хотите добавить Binance или CoinCap? Просто создайте новый пакет и реализуйте `CryptoClient`:

```
internal/client/
    client.go          ← интерфейс (не меняем)
    coingecko/         ← текущая реализация
    binance/           ← новая реализация (в будущем)
    coincap/           ← ещё одна (в будущем)
```

### 3. Агрегация

Сервис может использовать несколько клиентов одновременно:

```go
type multiSourceService struct {
    primary   client.CryptoClient   // CoinGecko
    secondary client.CryptoClient   // CoinCap как fallback
}
```

---

## Поток данных (пример: GET /api/v1/coins)

```
Browser/Frontend
     │
     │  GET /api/v1/coins?currency=usd&per_page=10
     ▼
handler.ListCoins()          [handler/crypto.go]
     │  читает query-параметры
     │  создаёт model.ListCoinsParams
     ▼
service.ListCoins()          [service/crypto.go]
     │  логирует запрос
     │  (здесь можно добавить кеш)
     ▼
coingecko.ListCoins()        [client/coingecko/coingecko.go]
     │  формирует URL: /coins/markets?vs_currency=usd&per_page=10
     │  делает HTTP GET запрос
     │  парсит JSON ответ ([]cgCoin)
     │  маппит в []model.Coin
     ▼
handler.writeJSON()          [handler/response.go]
     │  оборачивает в { "data": [...] }
     │  сериализует в JSON
     ▼
Browser/Frontend
     JSON ответ
```

---

## Добавление нового источника данных

1. Создайте папку `internal/client/newsource/`
2. Создайте файл `newsource.go` со структурой `Client`
3. Реализуйте методы интерфейса `client.CryptoClient`
4. В `cmd/server/main.go` замените `coingecko.New(...)` на `newsource.New(...)`

Всё остальное (сервис, хендлеры) — **не меняется**.

---

## Добавление кеширования

Откройте `internal/service/crypto.go` и добавьте кеш в `ListCoins`:

```go
type cryptoService struct {
    client client.CryptoClient
    cache  *sync.Map          // простой in-memory кеш
    log    *slog.Logger
}

func (s *cryptoService) ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error) {
    cacheKey := fmt.Sprintf("coins:%s:%d:%d", params.VsCurrency, params.Page, params.PerPage)

    if cached, ok := s.cache.Load(cacheKey); ok {
        return cached.([]model.Coin), nil
    }

    coins, err := s.client.ListCoins(ctx, params)
    if err != nil {
        return nil, err
    }

    s.cache.Store(cacheKey, coins)
    return coins, nil
}
```
