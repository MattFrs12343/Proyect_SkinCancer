# Script para construir el frontend y servir todo desde el backend
# Ejecutar: .\build-and-serve.ps1

Write-Host "🚀 OncoDerma - Build y Servidor Unificado" -ForegroundColor Cyan
Write-Host ""

# 1. Construir el frontend
Write-Host "📦 Paso 1: Construyendo frontend..." -ForegroundColor Yellow
Set-Location oncoderma-frontend

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Construir
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir el frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend construido exitosamente" -ForegroundColor Green
Write-Host ""

# 2. Volver a la raíz
Set-Location ..

# 3. Iniciar el backend
Write-Host "🚀 Paso 2: Iniciando servidor unificado..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Accede a la aplicación en:" -ForegroundColor Cyan
Write-Host "   http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "📍 Desde otros dispositivos:" -ForegroundColor Cyan
Write-Host "   http://192.168.0.16:8000" -ForegroundColor White
Write-Host ""
Write-Host "📍 Con Cloudflare Tunnel:" -ForegroundColor Cyan
Write-Host "   cloudflared tunnel --url http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

Set-Location skin_cancer_api
python main.py
