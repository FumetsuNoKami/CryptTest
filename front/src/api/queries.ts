import { request } from './client'
import type { Coin, CoinDetail, CoinHistory, ListCoinsParams, HistoryParams } from '@/types/api'

// ——————————————————————————————————————————————
// Coins list
// ——————————————————————————————————————————————

export function fetchCoins(params: ListCoinsParams = {}): Promise<Coin[]> {
  return request<Coin[]>('GET', '/api/v1/coins', params as Record<string, unknown>)
}

// ——————————————————————————————————————————————
// Single coin
// ——————————————————————————————————————————————

export function fetchCoin(id: string): Promise<CoinDetail> {
  return request<CoinDetail>('GET', `/api/v1/coins/${id}`)
}

// ——————————————————————————————————————————————
// Price history
// ——————————————————————————————————————————————

export function fetchCoinHistory(id: string, params: HistoryParams = {}): Promise<CoinHistory> {
  return request<CoinHistory>('GET', `/api/v1/coins/${id}/history`, params as Record<string, unknown>)
}
