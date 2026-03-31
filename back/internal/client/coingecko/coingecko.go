// Package coingecko реализует CryptoClient для CoinGecko API v3.
// Документация API: https://www.coingecko.com/en/api/documentation
package coingecko

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/andrewp/crypt/internal/config"
	"github.com/andrewp/crypt/internal/model"
)

// Client — HTTP-клиент для CoinGecko API.
type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
	log        *slog.Logger
}

// New создаёт новый CoinGecko-клиент с заданной конфигурацией.
func New(cfg config.CoinGeckoConfig, log *slog.Logger) *Client {
	return &Client{
		baseURL: cfg.BaseURL,
		apiKey:  cfg.APIKey,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
		log: log,
	}
}

// -------------------------------------------------------------------
// Реализация интерфейса client.CryptoClient
// -------------------------------------------------------------------

// ListCoins возвращает список монет с рыночными данными.
// Маппинг: ответ CoinGecko → []model.Coin
func (c *Client) ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error) {
	// Формируем query-параметры запроса
	q := url.Values{}
	q.Set("vs_currency", defaultStr(params.VsCurrency, "usd"))
	q.Set("order", defaultStr(params.Order, "market_cap_desc"))
	q.Set("per_page", strconv.Itoa(defaultInt(params.PerPage, 50)))
	q.Set("page", strconv.Itoa(defaultInt(params.Page, 1)))
	q.Set("sparkline", "false")

	endpoint := "/coins/markets?" + q.Encode()

	// cgCoin — внутренняя структура ответа CoinGecko
	var raw []cgCoin
	if err := c.get(ctx, endpoint, &raw); err != nil {
		return nil, fmt.Errorf("ListCoins: %w", err)
	}

	// Маппинг из формата API → наша модель
	coins := make([]model.Coin, 0, len(raw))
	for _, r := range raw {
		coins = append(coins, mapCoin(r))
	}

	c.log.Debug("ListCoins fetched", "count", len(coins))
	return coins, nil
}

// GetCoin возвращает детальную информацию по монете.
func (c *Client) GetCoin(ctx context.Context, id string) (*model.CoinDetail, error) {
	q := url.Values{}
	q.Set("localization", "false")
	q.Set("tickers", "false")
	q.Set("community_data", "false")
	q.Set("developer_data", "false")

	endpoint := "/coins/" + url.PathEscape(id) + "?" + q.Encode()

	var raw cgCoinDetail
	if err := c.get(ctx, endpoint, &raw); err != nil {
		return nil, fmt.Errorf("GetCoin(%s): %w", id, err)
	}

	detail := mapCoinDetail(raw)
	return &detail, nil
}

// GetCoinHistory возвращает историю цен за указанный период.
func (c *Client) GetCoinHistory(ctx context.Context, id string, params model.HistoryParams) (*model.CoinHistory, error) {
	q := url.Values{}
	q.Set("vs_currency", defaultStr(params.VsCurrency, "usd"))
	q.Set("days", defaultStr(params.Days, "7"))
	if params.Interval != "" {
		q.Set("interval", params.Interval)
	}

	endpoint := "/coins/" + url.PathEscape(id) + "/market_chart?" + q.Encode()

	var raw cgMarketChart
	if err := c.get(ctx, endpoint, &raw); err != nil {
		return nil, fmt.Errorf("GetCoinHistory(%s): %w", id, err)
	}

	history := mapHistory(id, raw)
	return &history, nil
}

// GetTrending возвращает список трендинговых монет.
func (c *Client) GetTrending(ctx context.Context) (*model.TrendingResponse, error) {
	var raw cgTrendingResponse
	if err := c.get(ctx, "/search/trending", &raw); err != nil {
		return nil, fmt.Errorf("GetTrending: %w", err)
	}

	coins := make([]model.TrendingCoin, 0, len(raw.Coins))
	for _, entry := range raw.Coins {
		it := entry.Item
		coins = append(coins, model.TrendingCoin{
			ID:                it.ID,
			Symbol:            it.Symbol,
			Name:              it.Name,
			Thumb:             it.Thumb,
			MarketCapRank:     it.MarketCapRank,
			Score:             it.Score,
			Price:             it.Data.Price,
			PriceChangePct24h: it.Data.PriceChangePct24h.USD,
			Sparkline:         it.Data.Sparkline,
		})
	}

	c.log.Debug("GetTrending fetched", "count", len(coins))
	return &model.TrendingResponse{Coins: coins}, nil
}

// GetTopGainersLosers возвращает топ монет по росту и падению.
func (c *Client) GetTopGainersLosers(ctx context.Context, duration string) (*model.TopGainersLosers, error) {
	q := url.Values{}
	q.Set("vs_currency", "usd")
	q.Set("duration", defaultStr(duration, "24h"))
	q.Set("top_coins", "1000")

	var raw cgTopGainersLosers
	if err := c.get(ctx, "/coins/top_gainers_losers?"+q.Encode(), &raw); err != nil {
		return nil, fmt.Errorf("GetTopGainersLosers: %w", err)
	}

	mapMover := func(m cgTopMover) model.GainerLoser {
		return model.GainerLoser{
			ID:             m.ID,
			Symbol:         m.Symbol,
			Name:           m.Name,
			Image:          m.Image,
			MarketCapRank:  m.MarketCapRank,
			Price:          m.USD,
			PriceChange24h: m.USDChange24h,
			Volume24h:      m.USDVol24h,
		}
	}

	gainers := make([]model.GainerLoser, 0, len(raw.TopGainers))
	for _, m := range raw.TopGainers {
		gainers = append(gainers, mapMover(m))
	}
	losers := make([]model.GainerLoser, 0, len(raw.TopLosers))
	for _, m := range raw.TopLosers {
		losers = append(losers, mapMover(m))
	}

	c.log.Debug("GetTopGainersLosers fetched", "gainers", len(gainers), "losers", len(losers))
	return &model.TopGainersLosers{
		TopGainers: gainers,
		TopLosers:  losers,
	}, nil
}

// -------------------------------------------------------------------
// HTTP-уровень
// -------------------------------------------------------------------

// get выполняет GET-запрос к CoinGecko API и декодирует JSON-ответ в dst.
func (c *Client) get(ctx context.Context, endpoint string, dst any) error {
	fullURL := c.baseURL + endpoint

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fullURL, nil)
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	// Если есть API-ключ — передаём (для Pro плана)
	if c.apiKey != "" {
		req.Header.Set("x-cg-pro-api-key", c.apiKey)
	}

	c.log.Debug("CoinGecko request", "url", fullURL)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status %d: %s", resp.StatusCode, string(body))
	}

	if err := json.Unmarshal(body, dst); err != nil {
		return fmt.Errorf("decode json: %w", err)
	}

	return nil
}

// -------------------------------------------------------------------
// Внутренние структуры ответов CoinGecko API
// -------------------------------------------------------------------

type cgCoin struct {
	ID                string    `json:"id"`
	Symbol            string    `json:"symbol"`
	Name              string    `json:"name"`
	Image             string    `json:"image"`
	CurrentPrice      float64   `json:"current_price"`
	MarketCap         float64   `json:"market_cap"`
	MarketCapRank     int       `json:"market_cap_rank"`
	PriceChange24h    float64   `json:"price_change_24h"`
	PriceChangePct24h float64   `json:"price_change_percentage_24h"`
	TotalVolume       float64   `json:"total_volume"`
	High24h           float64   `json:"high_24h"`
	Low24h            float64   `json:"low_24h"`
	CirculatingSupply float64   `json:"circulating_supply"`
	TotalSupply       *float64  `json:"total_supply"`
	ATH               float64   `json:"ath"`
	LastUpdated       time.Time `json:"last_updated"`
}

type cgCoinDetail struct {
	ID          string `json:"id"`
	Symbol      string `json:"symbol"`
	Name        string `json:"name"`
	Description struct {
		En string `json:"en"`
	} `json:"description"`
	Image struct {
		Thumb string `json:"thumb"`
		Small string `json:"small"`
		Large string `json:"large"`
	} `json:"image"`
	Links struct {
		Homepage       []string `json:"homepage"`
		BlockchainSite []string `json:"blockchain_site"`
		ReposURL       struct {
			Github []string `json:"github"`
		} `json:"repos_url"`
	} `json:"links"`
	MarketData  cgMarketData `json:"market_data"`
	Categories  []string     `json:"categories"`
	LastUpdated time.Time    `json:"last_updated"`
}

type cgMarketData struct {
	CurrentPrice      map[string]float64 `json:"current_price"`
	MarketCap         map[string]float64 `json:"market_cap"`
	TotalVolume       map[string]float64 `json:"total_volume"`
	PriceChangePct24h float64            `json:"price_change_percentage_24h"`
	PriceChangePct7d  float64            `json:"price_change_percentage_7d"`
	PriceChangePct30d float64            `json:"price_change_percentage_30d"`
	ATH               map[string]float64 `json:"ath"`
	ATL               map[string]float64 `json:"atl"`
	CirculatingSupply float64            `json:"circulating_supply"`
	TotalSupply       *float64           `json:"total_supply"`
}

// cgMarketChart — ответ endpoint /market_chart.
// Цены хранятся как массив [timestamp_ms, price].
type cgMarketChart struct {
	Prices [][]float64 `json:"prices"`
}

// cgTrendingResponse — ответ endpoint /search/trending.
type cgTrendingResponse struct {
	Coins []struct {
		Item cgTrendingItem `json:"item"`
	} `json:"coins"`
}

type cgTrendingItem struct {
	ID            string `json:"id"`
	Symbol        string `json:"symbol"`
	Name          string `json:"name"`
	Thumb         string `json:"thumb"`
	MarketCapRank int    `json:"market_cap_rank"`
	Score         int    `json:"score"`
	Data          struct {
		Price             float64 `json:"price"`
		PriceChangePct24h struct {
			USD float64 `json:"usd"`
		} `json:"price_change_percentage_24h"`
		Sparkline string `json:"sparkline"`
	} `json:"data"`
}

// cgTopMover — один элемент из ответа /coins/top_gainers_losers.
type cgTopMover struct {
	ID            string  `json:"id"`
	Symbol        string  `json:"symbol"`
	Name          string  `json:"name"`
	Image         string  `json:"image"`
	MarketCapRank int     `json:"market_cap_rank"`
	USD           float64 `json:"usd"`
	USDChange24h  float64 `json:"usd_24h_change"`
	USDVol24h     float64 `json:"usd_24h_vol"`
}

// cgTopGainersLosers — ответ endpoint /coins/top_gainers_losers.
type cgTopGainersLosers struct {
	TopGainers []cgTopMover `json:"top_gainers"`
	TopLosers  []cgTopMover `json:"top_losers"`
}

// -------------------------------------------------------------------
// Маппинг API-ответов → наши модели
// -------------------------------------------------------------------

func mapCoin(r cgCoin) model.Coin {
	var totalSupply float64
	if r.TotalSupply != nil {
		totalSupply = *r.TotalSupply
	}
	return model.Coin{
		ID:                r.ID,
		Symbol:            r.Symbol,
		Name:              r.Name,
		Image:             r.Image,
		CurrentPrice:      r.CurrentPrice,
		MarketCap:         r.MarketCap,
		MarketCapRank:     r.MarketCapRank,
		PriceChange24h:    r.PriceChange24h,
		PriceChangePct24h: r.PriceChangePct24h,
		TotalVolume:       r.TotalVolume,
		High24h:           r.High24h,
		Low24h:            r.Low24h,
		CirculatingSupply: r.CirculatingSupply,
		TotalSupply:       totalSupply,
		ATH:               r.ATH,
		LastUpdated:       r.LastUpdated,
	}
}

func mapCoinDetail(r cgCoinDetail) model.CoinDetail {
	var totalSupply float64
	if r.MarketData.TotalSupply != nil {
		totalSupply = *r.MarketData.TotalSupply
	}
	return model.CoinDetail{
		ID:          r.ID,
		Symbol:      r.Symbol,
		Name:        r.Name,
		Description: r.Description.En,
		Image: model.CoinImage{
			Thumb: r.Image.Thumb,
			Small: r.Image.Small,
			Large: r.Image.Large,
		},
		Links: model.CoinLinks{
			Homepage:       filterNonEmpty(r.Links.Homepage),
			BlockchainSite: filterNonEmpty(r.Links.BlockchainSite),
			ReposURL: struct {
				Github []string `json:"github"`
			}{Github: filterNonEmpty(r.Links.ReposURL.Github)},
		},
		MarketData: model.CoinMarketData{
			CurrentPrice:      r.MarketData.CurrentPrice,
			MarketCap:         r.MarketData.MarketCap,
			TotalVolume:       r.MarketData.TotalVolume,
			PriceChangePct24h: r.MarketData.PriceChangePct24h,
			PriceChangePct7d:  r.MarketData.PriceChangePct7d,
			PriceChangePct30d: r.MarketData.PriceChangePct30d,
			ATH:               r.MarketData.ATH,
			ATL:               r.MarketData.ATL,
			CirculatingSupply: r.MarketData.CirculatingSupply,
			TotalSupply:       totalSupply,
		},
		Categories:  r.Categories,
		LastUpdated: r.LastUpdated,
	}
}

func mapHistory(id string, r cgMarketChart) model.CoinHistory {
	points := make([]model.PricePoint, 0, len(r.Prices))
	for _, p := range r.Prices {
		if len(p) < 2 {
			continue
		}
		// CoinGecko возвращает время в миллисекундах Unix
		ts := time.UnixMilli(int64(p[0]))
		points = append(points, model.PricePoint{
			Timestamp: ts,
			Price:     p[1],
		})
	}
	return model.CoinHistory{ID: id, Prices: points}
}

// -------------------------------------------------------------------
// Вспомогательные функции
// -------------------------------------------------------------------

func defaultStr(v, d string) string {
	if v == "" {
		return d
	}
	return v
}

func defaultInt(v, d int) int {
	if v == 0 {
		return d
	}
	return v
}

// filterNonEmpty убирает пустые строки из слайса.
func filterNonEmpty(ss []string) []string {
	result := ss[:0]
	for _, s := range ss {
		if s != "" {
			result = append(result, s)
		}
	}
	return result
}
