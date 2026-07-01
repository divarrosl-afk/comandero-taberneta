#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Instala Comandero print-server como servicio de Windows (NSSM).

.DESCRIPTION
  1. Descarga NSSM si no está instalado
  2. Registra el servicio que arranca con Windows
  3. El portátil del restaurante imprime por TCP 9100 en la red local

  Uso:
    cd print-server
    powershell -ExecutionPolicy Bypass -File windows/install-service.ps1

  Requisitos: Node.js 20+ en PATH
#>

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Index = Join-Path $Root "index.js"
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $Node) {
  Write-Error "Node.js no encontrado. Instale Node 20 LTS desde https://nodejs.org"
}

$NssmDir = Join-Path $env:ProgramFiles "nssm"
$Nssm = Join-Path $NssmDir "nssm.exe"

if (-not (Test-Path $Nssm)) {
  Write-Host "NSSM no instalado. Descargue desde https://nssm.cc/download y extraiga nssm.exe en $NssmDir"
  Write-Host "O ejecute: choco install nssm"
  exit 1
}

$ServiceName = "ComanderoPrintServer"

& $Nssm stop $ServiceName 2>$null
& $Nssm remove $ServiceName confirm 2>$null

& $Nssm install $ServiceName $Node $Index
& $Nssm set $ServiceName AppDirectory $Root
& $Nssm set $ServiceName DisplayName "Comandero Print Server"
& $Nssm set $ServiceName Description "Servidor de impresion TCP 9100 para Comandero Taberneta"
& $Nssm set $ServiceName Start SERVICE_AUTO_START
& $Nssm set $ServiceName AppStdout (Join-Path $Root "logs\service.log")
& $Nssm set $ServiceName AppStderr (Join-Path $Root "logs\service-error.log")

$Logs = Join-Path $Root "logs"
if (-not (Test-Path $Logs)) { New-Item -ItemType Directory -Path $Logs | Out-Null }

& $Nssm start $ServiceName

Write-Host "Servicio $ServiceName instalado y arrancado."
Write-Host "Health: http://localhost:3100/health"
Write-Host "Configure en la PWA: NEXT_PUBLIC_PRINT_SERVER_URL=http://IP-DEL-PORTATIL:3100"
