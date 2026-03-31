# Makefile — управление монорепо CryptoScope из корневой папки
# Запуск через GNU Make (входит в состав Git for Windows / WSL)

.PHONY: run run-back run-front \
        build build-back build-front \
        install install-back install-front \
        test lint tidy env clean help

# ─────────────────────────────────────────────
# Запуск
# ─────────────────────────────────────────────

## run         : запустить backend и frontend одновременно (два окна PowerShell)
run:
	powershell -NoProfile -ExecutionPolicy Bypass -File start.ps1

## run-back    : запустить только backend (блокирующий режим)
run-back:
	cd back && go run ./cmd/server/main.go

## run-front   : запустить только frontend (блокирующий режим)
run-front:
	cd front && npm run dev

# ─────────────────────────────────────────────
# Сборка
# ─────────────────────────────────────────────

## build       : собрать backend и frontend
build: build-back build-front

## build-back  : собрать бинарник бэкенда (back/bin/crypt)
build-back:
	cd back && go build -o bin/crypt ./cmd/server/main.go

## build-front : собрать фронтенд в front/dist
build-front:
	cd front && npm run build

# ─────────────────────────────────────────────
# Зависимости
# ─────────────────────────────────────────────

## install     : установить все зависимости (Go + npm)
install: install-back install-front

## install-back  : скачать Go-модули
install-back:
	cd back && go mod download

## install-front : npm install для фронтенда
install-front:
	cd front && npm install

# ─────────────────────────────────────────────
# Качество кода
# ─────────────────────────────────────────────

## test        : запустить тесты бэкенда (с -race)
test:
	cd back && go test -v -race ./...

## lint        : запустить golangci-lint (требует установки)
lint:
	cd back && golangci-lint run ./...

## tidy        : привести go.mod / go.sum в порядок
tidy:
	cd back && go mod tidy

# ─────────────────────────────────────────────
# Прочее
# ─────────────────────────────────────────────

## env         : создать .env файлы из примеров
env:
	cd back && cp .env.example .env
	@echo "back/.env создан"
	cd front && cp .env.example .env
	@echo "front/.env создан"

## clean       : удалить артефакты сборки
clean:
	cd back  && rm -rf bin/
	cd front && rm -rf dist/

## help        : показать эту справку
help:
	@echo.
	@echo   run            -- запустить backend и frontend (два окна PowerShell)
	@echo   run-back       -- запустить только backend
	@echo   run-front      -- запустить только frontend
	@echo.
	@echo   build          -- собрать backend и frontend
	@echo   build-back     -- собрать back/bin/crypt
	@echo   build-front    -- собрать front/dist
	@echo.
	@echo   install        -- установить все зависимости
	@echo   install-back   -- go mod download
	@echo   install-front  -- npm install
	@echo.
	@echo   test           -- go test -race ./... (backend)
	@echo   lint           -- golangci-lint (backend)
	@echo   tidy           -- go mod tidy (backend)
	@echo.
	@echo   env            -- создать .env из .env.example
	@echo   clean          -- удалить артефакты сборки
	@echo.
