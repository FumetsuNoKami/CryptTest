// API Response wrapper matching Go backend
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Matches model.Coin
export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  marketCap: number
  marketCapRank: number
  priceChange24h: number
  priceChangePct24h: number
  totalVolume: number
  high24h: number
  low24h: number
  circulatingSupply: number
  totalSupply: number
  ath: number
  lastUpdated: string
}

// Matches model.CoinDetail
export interface CoinDetail {
  id: string
  symbol: string
  name: string
  description: string
  image: {
    thumb: string
    small: string
    large: string
  }
  links: {
    homepage: string[]
    blockchainSite: string[]
    reposUrl: {
      github: string[]
    }
  }
  marketData: {
    currentPrice: Record<string, number>
    marketCap: Record<string, number>
    totalVolume: Record<string, number>
    priceChangePct24h: number
    priceChangePct7d: number
    priceChangePct30d: number
    ath: Record<string, number>
    atl: Record<string, number>
    circulatingSupply: number
    totalSupply: number
  }
  categories: string[]
  lastUpdated: string
}

// Matches model.PricePoint
export interface PricePoint {
  timestamp: string
  price: number
}

// Matches model.CoinHistory
export interface CoinHistory {
  id: string
  prices: PricePoint[]
}

// Query params
export interface ListCoinsParams {
  currency?: string
  page?: number
  per_page?: number
  order?: string
}

export type HistoryDays = '1' | '7' | '30' | '90' | '365' | 'max'

export interface HistoryParams {
  currency?: string
  days?: HistoryDays
}
