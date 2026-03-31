import { useQuery } from '@tanstack/react-query'
import { request } from './client'
import type {
  Coin,
  CoinDetail,
  CoinHistory,
  ListCoinsParams,
  HistoryParams,
  TrendingResponse,
  TopGainersLosers,
  MoverDuration,
} from '@/types/api'

// ——————————————————————————————————————————————
// Query keys
// ——————————————————————————————————————————————

export const queryKeys = {
  coins: (params: ListCoinsParams) => ['coins', params] as const,
  coin: (id: string) => ['coin', id] as const,
  coinHistory: (id: string, params: HistoryParams) => ['coinHistory', id, params] as const,
  trending: () => ['trending'] as const,
  topMovers: (duration: MoverDuration) => ['topMovers', duration] as const,
}

// ——————————————————————————————————————————————
// Fetch functions
// ——————————————————————————————————————————————

export function fetchCoins(params: ListCoinsParams = {}): Promise<Coin[]> {
  return request<Coin[]>('GET', '/api/v1/coins', params as Record<string, unknown>)
}

export function fetchCoin(id: string): Promise<CoinDetail> {
  return request<CoinDetail>('GET', `/api/v1/coins/${id}`)
}

export function fetchCoinHistory(id: string, params: HistoryParams = {}): Promise<CoinHistory> {
  return request<CoinHistory>('GET', `/api/v1/coins/${id}/history`, params as Record<string, unknown>)
}

export function fetchTrending(): Promise<TrendingResponse> {
  return request<TrendingResponse>('GET', '/api/v1/trending')
}

export function fetchTopGainersLosers(duration: MoverDuration = '24h'): Promise<TopGainersLosers> {
  return request<TopGainersLosers>('GET', '/api/v1/top-movers', { duration })
}

// ——————————————————————————————————————————————
// Hooks
// ——————————————————————————————————————————————

export function useCoins(params: ListCoinsParams = {}) {
  return useQuery({
    queryKey: queryKeys.coins(params),
    queryFn: () => fetchCoins(params),
  })
}

export function useCoin(id: string) {
  return useQuery({
    queryKey: queryKeys.coin(id),
    queryFn: () => fetchCoin(id),
    enabled: !!id,
  })
}

export function useCoinHistory(id: string, params: HistoryParams = {}) {
  return useQuery({
    queryKey: queryKeys.coinHistory(id, params),
    queryFn: () => fetchCoinHistory(id, params),
    enabled: !!id,
  })
}

export function useTrending() {
  return useQuery({
    queryKey: queryKeys.trending(),
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopGainersLosers(duration: MoverDuration = '24h') {
  return useQuery({
    queryKey: queryKeys.topMovers(duration),
    queryFn: () => fetchTopGainersLosers(duration),
    staleTime: 3 * 60 * 1000,
  })
}
