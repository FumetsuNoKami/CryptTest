// Package cache предоставляет простой in-memory TTL-кеш без внешних зависимостей.
package cache

import (
	"sync"
	"time"
)

// entry — одна запись кеша.
type entry[V any] struct {
	value     V
	expiresAt time.Time
}

// Cache — потокобезопасный кеш с TTL.
type Cache[K comparable, V any] struct {
	mu  sync.RWMutex
	ttl time.Duration
	m   map[K]entry[V]
}

// New создаёт кеш с заданным TTL.
func New[K comparable, V any](ttl time.Duration) *Cache[K, V] {
	return &Cache[K, V]{
		ttl: ttl,
		m:   make(map[K]entry[V]),
	}
}

// Get возвращает значение, если оно есть и не просрочено.
func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	e, ok := c.m[key]
	c.mu.RUnlock()
	if !ok || time.Now().After(e.expiresAt) {
		var zero V
		return zero, false
	}
	return e.value, true
}

// Set сохраняет значение с TTL.
func (c *Cache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	c.m[key] = entry[V]{value: value, expiresAt: time.Now().Add(c.ttl)}
	c.mu.Unlock()
}
