@echo off
setlocal
cd /d "%~dp0\..\.."

if not exist "print-server\.env" (
  echo FALTA: print-server\.env
  echo Crea el archivo copiando print-server\.env.example
  exit /b 1
)

set OK=1
findstr /B /C:"NEXT_PUBLIC_SUPABASE_URL=" print-server\.env >nul || set OK=0
findstr /B /C:"SUPABASE_SERVICE_ROLE_KEY=" print-server\.env >nul || set OK=0
findstr /B /C:"SUPABASE_RESTAURANTE_ID=" print-server\.env >nul || set OK=0
findstr /B /C:"PRINTER_IP=" print-server\.env >nul || set OK=0

if %OK%==0 (
  echo FALTAN lineas en print-server\.env
  echo Abre con: notepad print-server\.env
  echo.
  echo Debe incluir:
  echo   NEXT_PUBLIC_SUPABASE_URL=https://vhlzbfrzmqljngwegbde.supabase.co
  echo   SUPABASE_SERVICE_ROLE_KEY=eyJ...
  echo   SUPABASE_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde
  echo   PRINTER_IP=192.168.4.100
  exit /b 1
)

findstr /B /C:"SUPABASE_SERVICE_ROLE_KEY=eyJ" print-server\.env >nul
if errorlevel 1 (
  echo AVISO: SUPABASE_SERVICE_ROLE_KEY no parece una clave JWT ^(debe empezar por eyJ^)
)

echo OK: print-server\.env tiene las variables necesarias.
echo Editar: notepad print-server\.env
endlocal
