# Script para configurar el Firewall de Windows
# EJECUTAR COMO ADMINISTRADOR

Write-Host "Configurando Firewall de Windows para OncoDerma..." -ForegroundColor Cyan
Write-Host ""

# Permitir puerto 3001 (Frontend)
Write-Host "Agregando regla para Frontend (puerto 3001)..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="OncoDerma Frontend" dir=in action=allow protocol=TCP localport=3001

# Permitir puerto 8000 (Backend)
Write-Host "Agregando regla para Backend (puerto 8000)..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="OncoDerma Backend" dir=in action=allow protocol=TCP localport=8000

Write-Host ""
Write-Host "✅ Firewall configurado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora otros dispositivos en tu red pueden acceder a:" -ForegroundColor Cyan
Write-Host "  Frontend: http://192.168.0.16:3001" -ForegroundColor White
Write-Host "  Backend:  http://192.168.0.16:8000" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
