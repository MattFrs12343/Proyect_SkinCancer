Write-Host "OncoDerma - Servidor Unificado" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "oncoderma-frontend\dist")) {
    Write-Host "Construyendo frontend..." -ForegroundColor Yellow
    cd oncoderma-frontend
    npm run build
    cd ..
}

Write-Host "Iniciando servidor en puerto 8000..." -ForegroundColor Green
Write-Host "Accede a: http://localhost:8000" -ForegroundColor White
Write-Host ""

cd skin_cancer_api
python main.py
