# Makefile — удобные команды для разработки

# Бинарный файл
BINARY=crypt
CMD=./cmd/server

.PHONY: run build clean test lint deps tidy

## run: запустить сервер (с горячей перезагрузкой через air, если установлен)
run:
	go run $(CMD)/main.go

## build: собрать бинарный файл
build:
	go build -o bin/$(BINARY) $(CMD)/main.go

## test: запустить все тесты
test:
	go test -v -race ./...

## lint: запустить линтер (требует golangci-lint)
lint:
	golangci-lint run ./...

## tidy: обновить go.mod и go.sum
tidy:
	go mod tidy

## deps: скачать все зависимости
deps:
	go mod download

## clean: удалить скомпилированные файлы
clean:
	rm -rf bin/

## env: создать .env из примера
env:
	cp .env.example .env
	@echo ".env файл создан. Отредактируйте его при необходимости."

## help: показать эту справку
help:
	@grep -E '^## ' Makefile | sed 's/## //' | column -t -s ':'
