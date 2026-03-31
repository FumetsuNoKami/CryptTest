# CryptoScope

Real-time cryptocurrency market data — Go REST API + React SPA.

## Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| **Backend**     | Go 1.22, chi router, godotenv            |
| **Data source** | CoinGecko API v3                         |
| **Frontend**    | React 19, TypeScript, Vite 8             |
| **Styling**     | Tailwind CSS v4, shadcn-style components |
| **Charts**      | Recharts                                 |
| **Animations**  | Motion (motion/react)                    |
| **HTTP client** | Axios                                    |
| **Routing**     | React Router v7                          |

---

## Prerequisites

- **Go** ≥ 1.22
- **Node.js** ≥ 20 + **npm**
- **GNU Make** (входит в Git for Windows / WSL; на Windows также можно использовать `start.ps1`)

---

## Quick Start

```bash
# 1. Установить зависимости
make install

# 2. Создать .env файлы
make env
# Отредактируйте back/.env — добавьте COINGECKO_API_KEY при наличии Pro-ключа

# 3. Запустить оба сервиса (два отдельных окна PowerShell)
make run
```

Приложение будет доступно:

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8080

Альтернатива на PowerShell (без Make):

```powershell
.\start.ps1          # запустить всё
.\start.ps1 -Service back   # только backend
.\start.ps1 -Service front  # только frontend
```

---

## Make Commands

```
make run            — запустить backend и frontend (два окна PowerShell)
make run-back       — запустить только backend (блокирующий)
make run-front      — запустить только frontend (блокирующий)

make build          — собрать backend и frontend
make build-back     — собрать бинарник back/bin/crypt
make build-front    — собрать фронтенд в front/dist

make install        — установить все зависимости (Go + npm)
make install-back   — go mod download
make install-front  — npm install

make test           — тесты backend (go test -race ./...)
make lint           — golangci-lint (требует установки)
make tidy           — go mod tidy

make env            — создать back/.env и front/.env из .env.example
make clean          — удалить back/bin и front/dist
make help           — показать список команд
```

---

## Configuration

### Backend — `back/.env`

| Variable             | Default                            | Description                            |
| -------------------- | ---------------------------------- | -------------------------------------- |
| `PORT`               | `8080`                             | Порт HTTP-сервера                      |
| `ENV`                | `dev`                              | `dev` → text-логи, `production` → JSON |
| `COINGECKO_BASE_URL` | `https://api.coingecko.com/api/v3` | URL CoinGecko API                      |
| `COINGECKO_API_KEY`  | —                                  | Pro API-ключ (опционально)             |

### Frontend — `front/.env`

| Variable       | Default                 | Description         |
| -------------- | ----------------------- | ------------------- |
| `VITE_API_URL` | `http://localhost:8080` | Базовый URL backend |

---

## API Endpoints

Все ответы обёрнуты в конверт `{ "data": ..., "error": ... }`.

### `GET /health`

Проверка живости сервиса.

```json
{ "data": { "status": "ok" }, "error": null }
```

---

### `GET /api/v1/coins`

Список монет с рыночными данными.

| Query param | Type   | Default           | Description                                                         |
| ----------- | ------ | ----------------- | ------------------------------------------------------------------- |
| `currency`  | string | `usd`             | Валюта: `usd`, `eur`, `rub`, `btc`, `eth`                           |
| `page`      | int    | `1`               | Номер страницы                                                      |
| `per_page`  | int    | `50`              | Монет на странице (макс. 250)                                       |
| `order`     | string | `market_cap_desc` | Сортировка: `market_cap_desc/asc`, `volume_desc/asc`, `id_asc/desc` |

```
GET /api/v1/coins?currency=usd&page=1&per_page=50&order=market_cap_desc
```

---

### `GET /api/v1/coins/{id}`

Полные данные по монете (описание, рыночные метрики, ссылки).

```
GET /api/v1/coins/bitcoin
GET /api/v1/coins/ethereum
```

---

### `GET /api/v1/coins/{id}/history`

История цены монеты за период.

| Query param | Type   | Default | Description                                |
| ----------- | ------ | ------- | ------------------------------------------ |
| `currency`  | string | `usd`   | Валюта                                     |
| `days`      | string | `7`     | Период: `1`, `7`, `30`, `90`, `365`, `max` |

```
GET /api/v1/coins/bitcoin/history?currency=usd&days=30
```

---

## Frontend Pages

| Route        | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `/`          | Таблица монет — фильтры (валюта, сортировка, per_page), пагинация                               |
| `/coins/:id` | Страница монеты — цена, 8 метрик, интерактивный график (1d/7d/30d/90d/1y/Max), описание, ссылки |

**Особенности:**

- Тёмная / светлая тема с сохранением в `localStorage` (без мерцания при загрузке)
- Анимации: `FadeIn`, `SlideUp`, `ScaleIn`, stagger-списки — через `motion/react`
- Переходы между страницами через CSS [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) (`<Link viewTransition>`)
- `React.use()` + `<Suspense>` + `<ErrorBoundary>` на каждом уровне данных

---

## Project Structure

```
crypto/
├── Makefile                  # корневые команды
├── start.ps1                 # PowerShell-альтернатива make run
│
├── back/                     # Go REST API
│   ├── cmd/server/main.go    # точка входа, DI
│   ├── internal/
│   │   ├── config/           # загрузка .env
│   │   ├── handler/          # HTTP-обработчики, router, response helpers
│   │   ├── service/          # бизнес-логика, валидация
│   │   ├── client/coingecko/ # HTTP-клиент CoinGecko → internal/model
│   │   └── model/            # типы данных (Coin, CoinDetail, CoinHistory …)
│   └── pkg/logger/           # slog-обёртка (text/json)
│
└── front/                    # React SPA
    ├── src/
    │   ├── api/              # axios client + typed query functions
    │   ├── components/
    │   │   ├── ui/           # Button, Card, Badge, Input, Select, Skeleton …
    │   │   │   └── animations/ # FadeIn, SlideUp, ScaleIn, Stagger, HoverScale
    │   │   ├── layout/       # Header, Footer
    │   │   └── coins/        # CoinTable, CoinRow, CoinFilters, PriceChart …
    │   ├── hooks/            # useTheme
    │   ├── pages/            # HomePage, CoinPage
    │   ├── types/            # TypeScript-типы API
    │   └── lib/              # утилиты (cn, formatCurrency, …)
    └── public/
```

---

## Architecture Notes

- **DI через конструкторы** — `coingecko.Client → service.CryptoService → handler`
- **Единый формат ответов** — `{ data, error }` через хелпер `writeJSON` / `writeError`
- **Axios-конверт** — фронтенд автоматически разворачивает `{ data }` и бросает `Error` при `{ error }`
- **Нет глобального стейта** — данные живут в `useMemo`-промисах, прочитанных через `React.use()`
- **Версия API** зафиксирована на `/api/v1`
