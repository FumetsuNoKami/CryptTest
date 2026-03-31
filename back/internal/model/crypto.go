package model

import "time"

// Coin — базовые данные о криптовалюте для списка.
type Coin struct {
	ID                string    `json:"id"`
	Symbol            string    `json:"symbol"`
	Name              string    `json:"name"`
	Image             string    `json:"image"`
	CurrentPrice      float64   `json:"currentPrice"`
	MarketCap         float64   `json:"marketCap"`
	MarketCapRank     int       `json:"marketCapRank"`
	PriceChange24h    float64   `json:"priceChange24h"`
	PriceChangePct24h float64   `json:"priceChangePct24h"`
	TotalVolume       float64   `json:"totalVolume"`
	High24h           float64   `json:"high24h"`
	Low24h            float64   `json:"low24h"`
	CirculatingSupply float64   `json:"circulatingSupply"`
	TotalSupply       float64   `json:"totalSupply"`
	ATH               float64   `json:"ath"`
	LastUpdated       time.Time `json:"lastUpdated"`
}

// CoinDetail — расширенные данные по одной монете.
type CoinDetail struct {
	ID          string         `json:"id"`
	Symbol      string         `json:"symbol"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Image       CoinImage      `json:"image"`
	Links       CoinLinks      `json:"links"`
	MarketData  CoinMarketData `json:"marketData"`
	Categories  []string       `json:"categories"`
	LastUpdated time.Time      `json:"lastUpdated"`
}

// CoinImage — ссылки на логотип монеты разных размеров.
type CoinImage struct {
	Thumb string `json:"thumb"`
	Small string `json:"small"`
	Large string `json:"large"`
}

// CoinLinks — полезные ссылки монеты.
type CoinLinks struct {
	Homepage       []string `json:"homepage"`
	BlockchainSite []string `json:"blockchainSite"`
	ReposURL       struct {
		Github []string `json:"github"`
	} `json:"reposUrl"`
}

// CoinMarketData — рыночные данные монеты.
type CoinMarketData struct {
	CurrentPrice      map[string]float64 `json:"currentPrice"` // цена в разных валютах
	MarketCap         map[string]float64 `json:"marketCap"`
	TotalVolume       map[string]float64 `json:"totalVolume"`
	PriceChangePct24h float64            `json:"priceChangePct24h"`
	PriceChangePct7d  float64            `json:"priceChangePct7d"`
	PriceChangePct30d float64            `json:"priceChangePct30d"`
	ATH               map[string]float64 `json:"ath"`
	ATL               map[string]float64 `json:"atl"`
	CirculatingSupply float64            `json:"circulatingSupply"`
	TotalSupply       float64            `json:"totalSupply"`
}

// PricePoint — одна точка истории цены (timestamp + цена).
type PricePoint struct {
	Timestamp time.Time `json:"timestamp"`
	Price     float64   `json:"price"`
}

// CoinHistory — история цен монеты за период.
type CoinHistory struct {
	ID     string       `json:"id"`
	Prices []PricePoint `json:"prices"`
}

// ListCoinsParams — параметры фильтрации для получения списка монет.
type ListCoinsParams struct {
	VsCurrency string // валюта сравнения (usd, eur, rub...)
	Page       int    // номер страницы
	PerPage    int    // монет на странице (макс. 250)
	Order      string // market_cap_desc, volume_asc и т.д.
}

// HistoryParams — параметры для получения истории цен.
type HistoryParams struct {
	VsCurrency string
	Days       string // "1", "7", "30", "90", "365", "max"
	Interval   string // "daily", "hourly" (только для Pro)
}

// TrendingCoin — монета из трендинга CoinGecko.
type TrendingCoin struct {
	ID                string  `json:"id"`
	Symbol            string  `json:"symbol"`
	Name              string  `json:"name"`
	Thumb             string  `json:"thumb"`
	MarketCapRank     int     `json:"marketCapRank"`
	Score             int     `json:"score"`
	Price             float64 `json:"price"`
	PriceChangePct24h float64 `json:"priceChangePct24h"`
	Sparkline         string  `json:"sparkline"`
}

// TrendingResponse — список трендинговых монет.
type TrendingResponse struct {
	Coins []TrendingCoin `json:"coins"`
}

// GainerLoser — монета из топа роста или падения.
type GainerLoser struct {
	ID             string  `json:"id"`
	Symbol         string  `json:"symbol"`
	Name           string  `json:"name"`
	Image          string  `json:"image"`
	MarketCapRank  int     `json:"marketCapRank"`
	Price          float64 `json:"price"`
	PriceChange24h float64 `json:"priceChange24h"`
	Volume24h      float64 `json:"volume24h"`
}

// TopGainersLosers — топ монет по росту и падению цены.
type TopGainersLosers struct {
	TopGainers []GainerLoser `json:"topGainers"`
	TopLosers  []GainerLoser `json:"topLosers"`
}
