package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/andrewp/crypt/internal/client"
	"github.com/andrewp/crypt/internal/model"
)

// cryptoService — конкретная реализация CryptoService.
// Делегирует получение данных клиенту внешнего API.
// В будущем сюда можно добавить кеш (Redis, in-memory) или несколько источников.
type cryptoService struct {
	client client.CryptoClient
	log    *slog.Logger
}

// NewCryptoService создаёт сервис, используя переданный клиент.
func NewCryptoService(c client.CryptoClient, log *slog.Logger) CryptoService {
	return &cryptoService{
		client: c,
		log:    log,
	}
}

// ListCoins получает список монет. Можно добавить кеш здесь.
func (s *cryptoService) ListCoins(ctx context.Context, params model.ListCoinsParams) ([]model.Coin, error) {
	s.log.Info("service: ListCoins", "currency", params.VsCurrency, "page", params.Page)

	coins, err := s.client.ListCoins(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("service.ListCoins: %w", err)
	}

	return coins, nil
}

// GetCoin возвращает детальную информацию по монете.
func (s *cryptoService) GetCoin(ctx context.Context, id string) (*model.CoinDetail, error) {
	if id == "" {
		return nil, fmt.Errorf("service.GetCoin: id cannot be empty")
	}

	s.log.Info("service: GetCoin", "id", id)

	detail, err := s.client.GetCoin(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("service.GetCoin(%s): %w", id, err)
	}

	return detail, nil
}

// GetCoinHistory возвращает историю цен монеты.
func (s *cryptoService) GetCoinHistory(ctx context.Context, id string, params model.HistoryParams) (*model.CoinHistory, error) {
	if id == "" {
		return nil, fmt.Errorf("service.GetCoinHistory: id cannot be empty")
	}

	s.log.Info("service: GetCoinHistory", "id", id, "days", params.Days)

	history, err := s.client.GetCoinHistory(ctx, id, params)
	if err != nil {
		return nil, fmt.Errorf("service.GetCoinHistory(%s): %w", id, err)
	}

	return history, nil
}

// GetTrending возвращает список трендинговых монет.
func (s *cryptoService) GetTrending(ctx context.Context) (*model.TrendingResponse, error) {
	s.log.Info("service: GetTrending")

	result, err := s.client.GetTrending(ctx)
	if err != nil {
		return nil, fmt.Errorf("service.GetTrending: %w", err)
	}

	return result, nil
}

// GetTopGainersLosers возвращает топ монет по росту и падению.
func (s *cryptoService) GetTopGainersLosers(ctx context.Context, duration string) (*model.TopGainersLosers, error) {
	s.log.Info("service: GetTopGainersLosers", "duration", duration)

	result, err := s.client.GetTopGainersLosers(ctx, duration)
	if err != nil {
		return nil, fmt.Errorf("service.GetTopGainersLosers: %w", err)
	}

	return result, nil
}
