# ingest-now.ps1 — Ingestión manual de sorteos en local.
#
# Uso:
#   .\ingest-now.ps1           → franja auto-detectada según hora HN actual
#   .\ingest-now.ps1 11am      → fuerza franja 11AM
#   .\ingest-now.ps1 3pm       → fuerza franja 3PM
#   .\ingest-now.ps1 9pm       → fuerza franja 9PM
#   .\ingest-now.ps1 all       → prueba las 3 franjas
#
# Requisitos:
#   - Docker Desktop corriendo (para Postgres local)
#   - pnpm instalado

param(
  [string]$Slot = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# Leer .env
$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) {
  Write-Error "No se encontró .env en $root"
  exit 1
}
foreach ($line in Get-Content $envFile) {
  if ($line -match "^([^#=]+)=(.*)$") {
    [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), "Process")
  }
}

$env:API_BASE_URL     = "https://api.loteriasdehonduras.com/honduras"
$env:APP_API_BASE_URL = "http://localhost:8787"

Write-Host ""
Write-Host "=== Ingestión manual ===" -ForegroundColor Cyan
Write-Host "  Token:   $($env:INGEST_SERVICE_TOKEN.Substring(0,8))..." -ForegroundColor Gray
Write-Host "  Backend: $env:APP_API_BASE_URL" -ForegroundColor Gray
Write-Host "  API:     $env:API_BASE_URL" -ForegroundColor Gray
Write-Host ""

# Verificar Docker
$container = docker ps --filter "name=loto_postgres_dev" --format "{{.Names}}" 2>$null
if (-not $container) {
  Write-Host "Levantando Docker Postgres..." -ForegroundColor Yellow
  docker compose -f (Join-Path $root "docker-compose.yml") up -d postgres 2>&1 | Out-Null
  Start-Sleep -Seconds 3
}

# Verificar backend
$backendRunning = $false
try {
  $resp = Invoke-RestMethod "$env:APP_API_BASE_URL/health" -TimeoutSec 3 -ErrorAction Stop
  $backendRunning = $resp.success -eq $true
} catch { }

if (-not $backendRunning) {
  Write-Host "Backend no está corriendo. Levantándolo en background..." -ForegroundColor Yellow
  $backendJob = Start-Job -ScriptBlock {
    Set-Location $using:root
    $env:DATABASE_URL = $using:env:DATABASE_URL
    pnpm --filter backend-hono dev 2>&1
  }
  Write-Host "Esperando que el backend arranque (10s)..."
  Start-Sleep -Seconds 10
  # Verificar de nuevo
  try {
    $resp = Invoke-RestMethod "$env:APP_API_BASE_URL/health" -TimeoutSec 5 -ErrorAction Stop
    $backendRunning = $resp.success -eq $true
  } catch { }

  if (-not $backendRunning) {
    Write-Host ""
    Write-Host "El backend no arrancó automáticamente." -ForegroundColor Red
    Write-Host "Abre otra terminal y ejecuta:" -ForegroundColor Yellow
    Write-Host "  pnpm --filter backend-hono dev" -ForegroundColor White
    Write-Host "Luego vuelve a ejecutar este script." -ForegroundColor Yellow
    exit 1
  }
}

Write-Host "Backend OK. Ejecutando ingestión..." -ForegroundColor Green
Write-Host ""

# Ejecutar
$slotArg = if ($Slot) { $Slot } else { "" }
Set-Location $root
pnpm --filter @loto/ingest-job run local $slotArg
