package logger

import (
	"log/slog"
	"os"
)

// New создаёт структурированный логгер (slog).
// В режиме development выводит читаемый текст, в production — JSON.
func New(env string) *slog.Logger {
	var handler slog.Handler

	opts := &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}

	if env == "production" {
		// JSON-логи удобно парсить в системах мониторинга (Loki, CloudWatch и т.д.)
		opts.Level = slog.LevelInfo
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		// Текстовые логи удобно читать при разработке
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler)
}
