// Package cached реализует декоратор над client.CryptoClient с in-memory TTL-кешом.
// Позволяет сократить количество реальных запросов к внешнему API без изменений
// в слоях сервиса и хандлера.
package cached

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/andrewp/crypt/internal/cache"
	"github.com/andrewp/crypt/internal/client"
	"github.com/andrewp/crypt/internal/model"
)

// Client — обёртка над CryptoClient, добавляющая TTL-кеш.
type Client struct {
	inner    client.CryptoClient
	log      *slog.Logger
	coins    *cache.Cache[string, []model.Coin]
	detail   *cache.Cache[string, *model.CoinDetail]
	history  *cache.Cache[string, *model.CoinHistory]
	trending *cache.Cache[string, *model.TrendingResponse]
	movers   *cache.Cache[string, *model.TopGainersLosers]
}

// New создаёт кеширующую обёртку с указанным TTL для всех методов.
func New(inner client.CryptoClient, ttl time.Duration, log *slog.Logger) *Client {
	return &Client{
		inner:    inner,
		log:      log,
		coins:    cache.New[string, []model.Coin](ttl),
		detail:   cache.New[string, *model.CoinDetail](ttl),
		history:  cache.New[string, *model.CoinHistory](ttl),
		trending: cache.New[string, *model.TrendingResponse](ttl),
		movers:   cache.New[string, *model.TopGainersLosers](ttl),
	}
}

// ListCoins возвращает кешированный список монет или запрашивает его у внешнего API.
func (c *Client) ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error) {
	key := fmt.Sprintf("list:%s:%d:%d:%s", params.VsCurrency, params.Page, params.PerPage, params.Order)

	if cached, ok := c.coins.Get(key); ok {
		c.log.Debug("cache hit: ListCoins", "key", key)
		return cached, nil
	}

	coins, err := c.inner.ListCoins(ctx, params)
	if err != nil {
		return nil, err
	}
	c.coins.Set(key, coins)
	c.log.Debug("cache miss: ListCoins, stored", "key", key)
	return coins, nil
}

// GetCoin возвращает кешированные детали монеты или запрашивает их у внешнего API.
func (c *Client) GetCoin(ctx context.Context, id string) (*model.CoinDetail, error) {
	key := "coin:" + id

	if cached, ok := c.detail.Get(key); ok {
		c.log.Debug("cache hit: GetCoin", "id", id)
		return cached, nil
	}

	detail, err := c.inner.GetCoin(ctx, id)
	if err != nil {
		return nil, err
	}
	c.detail.Set(key, detail)
	c.log.Debug("cache miss: GetCoin, stored", "id", id)
	return detail, nil
}

// GetCoinHistory возвращает кешированную историю цен или запрашивает её у внешнего API.
func (c *Client) GetCoinHistory(ctx context.Context, id string, params model.HistoryParams) (*model.CoinHistory, error) {
	key := fmt.Sprintf("history:%s:%s:%s:%s", id, params.VsCurrency, params.Days, params.Interval)

	if cached, ok := c.history.Get(key); ok {
		c.log.Debug("cache hit: GetCoinHistory", "id", id, "days", params.Days)
		return cached, nil
	}

	history, err := c.inner.GetCoinHistory(ctx, id, params)
	if err != nil {
		return nil, err
	}
	c.history.Set(key, history)
	c.log.Debug("cache miss: GetCoinHistory, stored", "id", id, "days", params.Days)
	return history, nil
}

// GetTrending возвращает кешированный трендинг или запрашивает его у внешнего API.
func (c *Client) GetTrending(ctx context.Context) (*model.TrendingResponse, error) {
	const key = "trending"

	if cached, ok := c.trending.Get(key); ok {
		c.log.Debug("cache hit: GetTrending")
		return cached, nil
	}

	result, err := c.inner.GetTrending(ctx)
	if err != nil {
		return nil, err
	}
	c.trending.Set(key, result)
	c.log.Debug("cache miss: GetTrending, stored")
	return result, nil
}

// GetTopGainersLosers возвращает кешированный топ моверс или запрашивает его у внешнего API.
func (c *Client) GetTopGainersLosers(ctx context.Context, duration string) (*model.TopGainersLosers, error) {
	key := "movers:" + duration

	if cached, ok := c.movers.Get(key); ok {
		c.log.Debug("cache hit: GetTopGainersLosers", "duration", duration)
		return cached, nil
	}

	result, err := c.inner.GetTopGainersLosers(ctx, duration)
	if err != nil {
		return nil, err
	}
	c.movers.Set(key, result)
	c.log.Debug("cache miss: GetTopGainersLosers, stored", "duration", duration)
	return result, nil
}
