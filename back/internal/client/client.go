// Package client определяет контракт для внешних источников данных о криптовалютах.
// Благодаря интерфейсу можно легко заменить CoinGecko на любой другой источник
// или подставить mock-реализацию в тестах.
package client

import (
	"context"

	"github.com/andrewp/crypt/internal/model"
)

// CryptoClient — интерфейс для получения данных о криптовалютах из внешних API.
// Любой новый источник данных должен реализовать этот интерфейс.
type CryptoClient interface {
	// ListCoins возвращает список монет с рыночными данными.
	ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error)

	// GetCoin возвращает детальную информацию по одной монете.
	GetCoin(ctx context.Context, id string) (*model.CoinDetail, error)

	// GetCoinHistory возвращает историю цен монеты за указанный период.
	GetCoinHistory(ctx context.Context, id string, params model.HistoryParams) (*model.CoinHistory, error)
}
