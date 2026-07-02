@echo off
setlocal
echo Deteniendo procesos en el puerto 3100...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3100" ^| findstr "LISTENING"') do (
  echo   taskkill /PID %%a /F
  taskkill /PID %%a /F >nul 2>&1
)
echo Listo. Comprueba con: netstat -ano ^| findstr ":3100"
endlocal
