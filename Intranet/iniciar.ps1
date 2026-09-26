# Arranca la intranet en local: la API (puerto 3001) y la web (puerto 5173), cada una en su ventana.
# Uso: clic derecho > "Ejecutar con PowerShell", o doble clic en iniciar.bat (no necesita cambiar permisos).

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'No se encontro Node.js. Instalalo desde https://nodejs.org (version 20.19 o superior).' -ForegroundColor Red
  Read-Host 'Presiona Enter para salir'
  exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
  Write-Host 'Instalando dependencias (solo la primera vez)...' -ForegroundColor Cyan
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) { Read-Host 'Fallo npm install. Presiona Enter para salir'; exit 1 }
}

Write-Host 'Iniciando API en http://localhost:3001 ...' -ForegroundColor Cyan
Start-Process -FilePath 'powershell.exe' -WorkingDirectory $PSScriptRoot -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', "`$Host.UI.RawUI.WindowTitle = 'Intranet - API'; npm.cmd run dev:api"

Write-Host 'Iniciando web en http://localhost:5173 ...' -ForegroundColor Cyan
Start-Process -FilePath 'powershell.exe' -WorkingDirectory $PSScriptRoot -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', "`$Host.UI.RawUI.WindowTitle = 'Intranet - Web'; npm.cmd run dev -- --host"

Start-Sleep -Seconds 4
Start-Process 'http://localhost:5173'

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' -or $_.IPAddress -like '172.*' } | Select-Object -First 1).IPAddress
if ($ip) { Write-Host "Desde otro PC de la misma red abre: http://${ip}:5173" -ForegroundColor Yellow }

Write-Host ''
Write-Host 'Listo. Usuarios de desarrollo: admin / admin  y  gestor / cumple2026' -ForegroundColor Green
Write-Host 'Para detener todo, cierra las dos ventanas nuevas (Intranet - API e Intranet - Web).'
