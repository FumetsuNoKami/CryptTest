import axios, { type AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'

export const apiClient = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? 'http://localhost:8080',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor: unwrap { data, error } envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      (error.response?.data as ApiResponse<unknown>)?.error ??
      error.message ??
      'Unknown error'
    return Promise.reject(new Error(message))
  },
)

/**
 * Typed request helper.
 * Pass method + url + optional params/config — get back the unwrapped data.
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>({
    method,
    url,
    ...(method === 'GET' ? { params } : { data: params }),
    ...config,
  })

  const { data, error } = response.data

  if (error) throw new Error(error)
  if (data === null || data === undefined) throw new Error('No data returned')

  return data
}
