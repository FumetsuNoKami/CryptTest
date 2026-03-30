# API Документация

Base URL: `http://localhost:8080`

Все ответы имеют формат:

```json
{ "data": <payload> }
```

При ошибке:

```json
{ "error": "описание ошибки" }
```

---

## GET /health

Проверка живости сервера.

**Запрос:**

```
GET /health
```

**Ответ `200 OK`:**

```json
{ "data": { "status": "ok" } }
```

---

## GET /api/v1/coins

Список монет с рыночными данными.

**Query-параметры:**

| Параметр   | Тип    | По умолчанию      | Описание                                  |
| ---------- | ------ | ----------------- | ----------------------------------------- |
| `currency` | string | `usd`             | Валюта: `usd`, `eur`, `rub`, `btc`, `eth` |
| `page`     | int    | `1`               | Номер страницы (пагинация)                |
| `per_page` | int    | `50`              | Монет на странице (макс. 250)             |
| `order`    | string | `market_cap_desc` | Сортировка. Варианты ниже                 |

**Варианты `order`:**

- `market_cap_desc` — по капитализации (убывание) ← рекомендуется
- `market_cap_asc` — по капитализации (возрастание)
- `volume_asc` / `volume_desc` — по объёму торгов
- `id_asc` / `id_desc` — по алфавиту

**Запрос:**

```bash
curl "http://localhost:8080/api/v1/coins?currency=usd&per_page=10&page=1"
```

**Ответ `200 OK`:**

```json
{
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "current_price": 67000.0,
      "market_cap": 1320000000000,
      "market_cap_rank": 1,
      "price_change_24h": 1200.5,
      "price_change_percentage_24h": 1.82,
      "total_volume": 28000000000,
      "high_24h": 68000.0,
      "low_24h": 65500.0,
      "circulating_supply": 19700000,
      "total_supply": 21000000,
      "ath": 73750.0,
      "last_updated": "2024-03-15T10:00:00Z"
    }
  ]
}
```

---

## GET /api/v1/coins/{id}

Детальная информация по монете.

**Path-параметры:**

| Параметр | Тип    | Описание                                              |
| -------- | ------ | ----------------------------------------------------- |
| `id`     | string | ID монеты: `bitcoin`, `ethereum`, `solana`, `toncoin` |

**Запрос:**

```bash
curl http://localhost:8080/api/v1/coins/bitcoin
```

**Ответ `200 OK`:**

```json
{
  "data": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "description": "Bitcoin is the first successful internet money...",
    "image": {
      "thumb": "https://...thumb.png",
      "small": "https://...small.png",
      "large": "https://...large.png"
    },
    "links": {
      "homepage": ["https://bitcoin.org"],
      "blockchain_site": ["https://blockchair.com/bitcoin"],
      "repos_url": { "github": ["https://github.com/bitcoin/bitcoin"] }
    },
    "market_data": {
      "current_price": { "usd": 67000, "eur": 61500, "rub": 6100000 },
      "market_cap": { "usd": 1320000000000 },
      "total_volume": { "usd": 28000000000 },
      "price_change_percentage_24h": 1.82,
      "price_change_percentage_7d": -2.5,
      "price_change_percentage_30d": 15.3,
      "ath": { "usd": 73750 },
      "atl": { "usd": 67.81 },
      "circulating_supply": 19700000,
      "total_supply": 21000000
    },
    "categories": ["Cryptocurrency", "Layer 1 (L1)"],
    "last_updated": "2024-03-15T10:00:00Z"
  }
}
```

---

## GET /api/v1/coins/{id}/history

История цен монеты за выбранный период.

**Path-параметры:**

| Параметр | Тип    | Описание  |
| -------- | ------ | --------- |
| `id`     | string | ID монеты |

**Query-параметры:**

| Параметр   | Тип    | По умолчанию | Описание                                   |
| ---------- | ------ | ------------ | ------------------------------------------ |
| `currency` | string | `usd`        | Валюта сравнения                           |
| `days`     | string | `7`          | Период: `1`, `7`, `30`, `90`, `365`, `max` |

**Запрос:**

```bash
curl "http://localhost:8080/api/v1/coins/ethereum/history?days=30&currency=usd"
```

**Ответ `200 OK`:**

```json
{
  "data": {
    "id": "ethereum",
    "prices": [
      { "timestamp": "2024-02-14T00:00:00Z", "price": 2700.5 },
      { "timestamp": "2024-02-15T00:00:00Z", "price": 2750.1 },
      ...
    ]
  }
}
```

> **Гранулярность данных:**
>
> - `days=1` → данные каждые 5 минут
> - `days=7` до `days=90` → данные каждый час
> - `days=90+` → данные за каждый день

---

## Популярные ID монет

| ID            | Символ | Название |
| ------------- | ------ | -------- |
| `bitcoin`     | BTC    | Bitcoin  |
| `ethereum`    | ETH    | Ethereum |
| `solana`      | SOL    | Solana   |
| `toncoin`     | TON    | Toncoin  |
| `binancecoin` | BNB    | BNB      |
| `ripple`      | XRP    | XRP      |
| `cardano`     | ADA    | Cardano  |
| `dogecoin`    | DOGE   | Dogecoin |
| `polkadot`    | DOT    | Polkadot |
| `litecoin`    | LTC    | Litecoin |

---

## Коды ошибок

| HTTP-статус                 | Причина                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `400 Bad Request`           | Неверные параметры запроса                                  |
| `502 Bad Gateway`           | Ошибка при запросе к CoinGecko API (rate limit, недоступен) |
| `500 Internal Server Error` | Неожиданная ошибка сервера                                  |

---

## Примеры для фронтенда (fetch)

```javascript
// Топ-20 монет
const response = await fetch("http://localhost:8080/api/v1/coins?per_page=20");
const { data } = await response.json();
console.log(data); // массив монет

// Детали Bitcoin
const { data: bitcoin } = await (
  await fetch("http://localhost:8080/api/v1/coins/bitcoin")
).json();
console.log(bitcoin.market_data.current_price.usd);

// История Ethereum за 30 дней
const { data: history } = await (
  await fetch("http://localhost:8080/api/v1/coins/ethereum/history?days=30")
).json();
const prices = history.prices; // [{timestamp, price}, ...]
```
