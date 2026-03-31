// Package service содержит бизнес-логику приложения.
// Слой сервиса стоит между HTTP-обработчиком и клиентом внешнего API.
// Здесь можно добавить кеширование, агрегацию из нескольких источников,
// обогащение данных и т.д.
package service

import (
	"context"

	"github.com/andrewp/crypt/internal/model"
)

// CryptoService — интерфейс бизнес-логики для работы с криптовалютами.
// Обработчики (handlers) зависят только от этого интерфейса,
// а не от конкретной реализации — это облегчает тестирование.
type CryptoService interface {
	// ListCoins возвращает список монет с рыночными данными.
	ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error)

	// GetCoin возвращает детальную информацию по монете по её ID.
	GetCoin(ctx context.Context, id string) (*model.CoinDetail, error)

	// GetCoinHistory возвращает историю цен монеты за указанный период.
	GetCoinHistory(ctx context.Context, id string, params model.HistoryParams) (*model.CoinHistory, error)

	// GetTrending возвращает список трендинговых монет.
	GetTrending(ctx context.Context) (*model.TrendingResponse, error)

	// GetTopGainersLosers возвращает топ монет по росту и падению.
	GetTopGainersLosers(ctx context.Context, duration string) (*model.TopGainersLosers, error)
}
