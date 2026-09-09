<#
.SYNOPSIS
    Despliega la intranet de Gestion y Servicios a Railway.

.DESCRIPTION
    Modo por defecto (Git): valida el proyecto (lint + build) y hace push a
    GitHub. Railway redespliega solo, porque el servicio esta conectado al
    repositorio.

    Modo -Direct: sube los archivos locales con la CLI de Railway
    (railway up), sin pasar por GitHub. Util para probar un cambio sin
    ensuciar el historial.

.PARAMETER Message
    Si hay cambios sin commitear, los commitea con este mensaje.
    Sin este parametro el script se detiene y no toca tu working tree.

.PARAMETER Direct
    Despliega con la CLI de Railway en vez de git push.

.PARAMETER SkipChecks
    Omite npm run lint y npm run build.

.PARAMETER Logs
    Muestra los logs de Railway al terminar.

.PARAMETER Open
    Abre el servicio en el navegador al terminar.

.EXAMPLE
    .\deploy-railway.ps1
    Valida y hace push de lo que ya este commiteado.

.EXAMPLE
    .\deploy-railway.ps1 -Message "Ajusta la vista de Corpoquindio"
    Commitea los cambios pendientes, valida y despliega.

.EXAMPLE
    .\deploy-railway.ps1 -Direct -Logs
    Sube los archivos locales con la CLI y muestra los logs.
#>

[CmdletBinding()]
param(
    [string]$Message,
    [switch]$Direct,
    [switch]$SkipChecks,
    [switch]$Logs,
    [switch]$Open,
    [string]$Service = 'Intranet',
    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'

# Los fallos previstos se muestran como un mensaje limpio, sin volcado de PowerShell.
trap {
    Write-Host ""
    Write-Host "  X  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ---------------------------------------------------------------- utilidades
function Write-Step { param([string]$Text) Write-Host "`n==> $Text" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Text) Write-Host "    OK  $Text" -ForegroundColor Green }
function Write-Note { param([string]$Text) Write-Host "    ..  $Text" -ForegroundColor DarkGray }
function Write-Warn2{ param([string]$Text) Write-Host "    !   $Text" -ForegroundColor Yellow }

function Test-Command {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    return $null -ne $cmd
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$Exe,
        [string[]]$Arguments = @(),
        [Parameter(Mandatory = $true)][string]$FailMessage
    )
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FailMessage (codigo $LASTEXITCODE)"
    }
}

# ---------------------------------------------------------------- rutas
$Root = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Get-Location).Path }
$App = Join-Path $Root 'Intranet'

Write-Host ""
Write-Host "  Deploy - Intranet Gestion y Servicios" -ForegroundColor White
Write-Host "  Repo: $Root"
Write-Host "  App : $App"

if (-not (Test-Path (Join-Path $App 'package.json'))) {
    throw "No se encontro Intranet\package.json. Ejecuta el script desde la raiz del repositorio."
}

if (-not (Test-Command 'npm')) {
    throw "npm no esta disponible en el PATH. Instala Node.js 22 o superior."
}

# ---------------------------------------------------------------- validacion
if ($SkipChecks) {
    Write-Step "Validacion omitida (-SkipChecks)"
}
else {
    Push-Location $App
    try {
        if (-not (Test-Path (Join-Path $App 'node_modules'))) {
            Write-Step "Instalando dependencias"
            if (Test-Path (Join-Path $App 'package-lock.json')) {
                Invoke-Checked -Exe 'npm' -Arguments @('ci') -FailMessage 'Fallo npm ci'
            }
            else {
                Invoke-Checked -Exe 'npm' -Arguments @('install') -FailMessage 'Fallo npm install'
            }
            Write-Ok "Dependencias listas"
        }

        Write-Step "Lint"
        Invoke-Checked -Exe 'npm' -Arguments @('run', 'lint') -FailMessage 'ESLint encontro errores. Corrigelos antes de desplegar'
        Write-Ok "Sin errores de lint"

        Write-Step "Build de produccion"
        Invoke-Checked -Exe 'npm' -Arguments @('run', 'build') -FailMessage 'Fallo el build de Vite'
        Write-Ok "Build generado en Intranet\dist"
    }
    finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------- despliegue
if ($Direct) {
    Write-Step "Despliegue directo con la CLI de Railway"

    if (-not (Test-Command 'railway')) {
        Write-Warn2 "La CLI de Railway no esta instalada."
        Write-Host  "    Instalala con:  npm i -g @railway/cli" -ForegroundColor Yellow
        Write-Host  "    Luego:          railway login" -ForegroundColor Yellow
        throw "Falta la CLI de Railway."
    }

    & railway whoami | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "No has iniciado sesion en Railway. Ejecuta: railway login"
    }
    Write-Ok "Sesion de Railway activa"

    Push-Location $App
    try {
        & railway status | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Warn2 "Esta carpeta no esta vinculada a un proyecto de Railway."
            Write-Host  "    Ejecuta:  railway link" -ForegroundColor Yellow
            throw "Proyecto de Railway sin vincular."
        }

        Write-Note "Subiendo Intranet\ al servicio '$Service'"
        Invoke-Checked -Exe 'railway' -Arguments @('up', '--service', $Service) -FailMessage 'Fallo railway up'
        Write-Ok "Despliegue enviado a Railway"
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Step "Despliegue via GitHub (Railway redespliega automaticamente)"

    if (-not (Test-Command 'git')) {
        throw "git no esta disponible en el PATH."
    }

    Push-Location $Root
    try {
        $current = (& git rev-parse --abbrev-ref HEAD).Trim()
        if ($LASTEXITCODE -ne 0) { throw "No parece un repositorio git." }

        if ($current -ne $Branch) {
            Write-Warn2 "Estas en la rama '$current' y no en '$Branch'."
            Write-Warn2 "Railway despliega desde '$Branch'; este push no publicara nada."
        }
        else {
            Write-Ok "Rama '$current'"
        }

        $dirty = & git status --porcelain
        if ($dirty) {
            if ([string]::IsNullOrWhiteSpace($Message)) {
                Write-Host ""
                Write-Warn2 "Hay cambios sin commitear:"
                $dirty | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkYellow }
                Write-Host ""
                throw "Commitealos tu mismo o vuelve a ejecutar con:  .\deploy-railway.ps1 -Message ""tu mensaje"""
            }

            Write-Note "Commiteando cambios pendientes"
            Invoke-Checked -Exe 'git' -Arguments @('add', '-A') -FailMessage 'Fallo git add'
            Invoke-Checked -Exe 'git' -Arguments @('commit', '-m', $Message) -FailMessage 'Fallo git commit'
            Write-Ok "Commit creado"
        }
        else {
            Write-Ok "Working tree limpio"
        }

        Write-Note "Enviando a origin/$Branch"
        Invoke-Checked -Exe 'git' -Arguments @('push', 'origin', $Branch) -FailMessage 'Fallo git push'
        Write-Ok "Push completado. Railway iniciara el despliegue."
    }
    finally {
        Pop-Location
    }
}

# ---------------------------------------------------------------- extras
if ($Logs) {
    if (Test-Command 'railway') {
        Write-Step "Logs de Railway (Ctrl+C para salir)"
        Push-Location $App
        try { & railway logs } finally { Pop-Location }
    }
    else {
        Write-Warn2 "No se pueden mostrar los logs: falta la CLI de Railway."
    }
}

if ($Open) {
    if (Test-Command 'railway') {
        Push-Location $App
        try { & railway open } finally { Pop-Location }
    }
    else {
        Write-Warn2 "No se puede abrir el servicio: falta la CLI de Railway."
    }
}

Write-Host ""
Write-Host "  Listo. Revisa el estado en https://railway.app" -ForegroundColor Green
Write-Host ""
