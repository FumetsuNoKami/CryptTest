import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Number formatting
export function formatCurrency(
  value: number,
  currency = 'usd',
  compact = false,
): string {
  const currencyMap: Record<string, string> = {
    usd: 'USD',
    eur: 'EUR',
    rub: 'RUB',
    btc: 'BTC',
    eth: 'ETH',
  }

  const code = currencyMap[currency.toLowerCase()] ?? currency.toUpperCase()

  if (['BTC', 'ETH'].includes(code)) {
    return `${value.toFixed(6)} ${code}`
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${code}`
  }
}

export function formatLargeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatChartDate(dateStr: string, days: string): string {
  const date = new Date(dateStr)
  if (days === '1') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  if (days === '7' || days === '30') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function isPositive(value: number): boolean {
  return value >= 0
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
