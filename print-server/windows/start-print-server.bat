@echo off
setlocal
cd /d "%~dp0\..\.."

if not exist "print-server\.env" (
  echo [ERROR] Falta print-server\.env
  echo Copia print-server\.env.example a print-server\.env y editalo con Notepad.
  exit /b 1
)

echo Comprobando puerto 3100...
netstat -ano | findstr ":3100" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo [AVISO] Puerto 3100 ocupado. Ejecuta primero:
  echo   print-server\windows\stop-print-server.bat
  exit /b 1
)

echo.
echo Arrancando print-server...
echo Ctrl+C para parar
echo.
npm run print-server
