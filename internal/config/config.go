package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config хранит все настройки приложения.
// Значения загружаются из файла .env или переменных окружения.
type Config struct {
	Server   ServerConfig
	CoinGecko CoinGeckoConfig
}

// ServerConfig — настройки HTTP-сервера.
type ServerConfig struct {
	Host         string
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// CoinGeckoConfig — настройки клиента CoinGecko API.
type CoinGeckoConfig struct {
	BaseURL    string
	APIKey     string        // необязателен для бесплатного плана
	Timeout    time.Duration
	RateLimit  int           // запросов в минуту
}

// Load читает конфигурацию из .env файла и переменных окружения.
// Переменные окружения имеют приоритет над .env файлом.
func Load() (*Config, error) {
	// Пробуем загрузить .env — не страшно, если файла нет
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			Host:         getEnv("SERVER_HOST", "localhost"),
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  getDurationEnv("SERVER_READ_TIMEOUT", 10*time.Second),
			WriteTimeout: getDurationEnv("SERVER_WRITE_TIMEOUT", 10*time.Second),
		},
		CoinGecko: CoinGeckoConfig{
			BaseURL:   getEnv("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3"),
			APIKey:    getEnv("COINGECKO_API_KEY", ""),
			Timeout:   getDurationEnv("COINGECKO_TIMEOUT", 15*time.Second),
			RateLimit: getIntEnv("COINGECKO_RATE_LIMIT", 10),
		},
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("config validation: %w", err)
	}

	return cfg, nil
}

func (c *Config) validate() error {
	if c.Server.Port == "" {
		return fmt.Errorf("SERVER_PORT is required")
	}
	return nil
}

// Addr возвращает строку вида "host:port" для запуска сервера.
func (s *ServerConfig) Addr() string {
	return s.Host + ":" + s.Port
}

// --- вспомогательные функции ---

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getIntEnv(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return defaultVal
}

func getDurationEnv(key string, defaultVal time.Duration) time.Duration {
	if val := os.Getenv(key); val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			return d
		}
	}
	return defaultVal
}
