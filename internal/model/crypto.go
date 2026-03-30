package model

import "time"

// Coin — базовые данные о криптовалюте для списка.
type Coin struct {
	ID                string  `json:"id"`
	Symbol            string  `json:"symbol"`
	Name              string  `json:"name"`
	Image             string  `json:"image"`
	CurrentPrice      float64 `json:"current_price"`
	MarketCap         float64 `json:"market_cap"`
	MarketCapRank     int     `json:"market_cap_rank"`
	PriceChange24h    float64 `json:"price_change_24h"`
	PriceChangePct24h float64 `json:"price_change_percentage_24h"`
	TotalVolume       float64 `json:"total_volume"`
	High24h           float64 `json:"high_24h"`
	Low24h            float64 `json:"low_24h"`
	CirculatingSupply float64 `json:"circulating_supply"`
	TotalSupply       float64 `json:"total_supply"`
	ATH               float64 `json:"ath"`
	LastUpdated       time.Time `json:"last_updated"`
}

// CoinDetail — расширенные данные по одной монете.
type CoinDetail struct {
	ID          string            `json:"id"`
	Symbol      string            `json:"symbol"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Image       CoinImage         `json:"image"`
	Links       CoinLinks         `json:"links"`
	MarketData  CoinMarketData    `json:"market_data"`
	Categories  []string          `json:"categories"`
	LastUpdated time.Time         `json:"last_updated"`
}

// CoinImage — ссылки на логотип монеты разных размеров.
type CoinImage struct {
	Thumb string `json:"thumb"`
	Small string `json:"small"`
	Large string `json:"large"`
}

// CoinLinks — полезные ссылки монеты.
type CoinLinks struct {
	Homepage     []string `json:"homepage"`
	BlockchainSite []string `json:"blockchain_site"`
	ReposURL     struct {
		Github []string `json:"github"`
	} `json:"repos_url"`
}

// CoinMarketData — рыночные данные монеты.
type CoinMarketData struct {
	CurrentPrice      map[string]float64 `json:"current_price"`       // цена в разных валютах
	MarketCap         map[string]float64 `json:"market_cap"`
	TotalVolume       map[string]float64 `json:"total_volume"`
	PriceChangePct24h float64            `json:"price_change_percentage_24h"`
	PriceChangePct7d  float64            `json:"price_change_percentage_7d"`
	PriceChangePct30d float64            `json:"price_change_percentage_30d"`
	ATH               map[string]float64 `json:"ath"`
	ATL               map[string]float64 `json:"atl"`
	CirculatingSupply float64            `json:"circulating_supply"`
	TotalSupply       float64            `json:"total_supply"`
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
