# start.ps1 — запуск фронта и бэка из корневой папки

param(
    [string]$Service = "all"  # all | back | front
)

$root = $PSScriptRoot

function Start-Backend {
    Write-Host "Starting backend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\back'; go run ./cmd/server/main.go" -WindowStyle Normal
}

function Start-Frontend {
    Write-Host "Starting frontend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\front'; npm run dev" -WindowStyle Normal
}

switch ($Service) {
    "back"  { Start-Backend }
    "front" { Start-Frontend }
    default {
        Start-Backend
        Start-Frontend
    }
}
