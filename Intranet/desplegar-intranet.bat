@echo off
setlocal

rem Lanzador de despliegue para Windows.
rem Ejecuta la validacion, hace commit y push a GitHub.
rem Railway despliega automáticamente la rama main.

set "ROOT=%~dp0.."
set "SCRIPT=%ROOT%\deploy-railway.ps1"

if not exist "%SCRIPT%" (
  echo No se encontro deploy-railway.ps1 en "%ROOT%".
  pause
  exit /b 1
)

set /p "MESSAGE=Mensaje para el commit: "
if "%MESSAGE%"=="" (
  echo Se necesita un mensaje de commit. No se hizo despliegue.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -Message "%MESSAGE%"
set "CODE=%ERRORLEVEL%"

if not "%CODE%"=="0" (
  echo.
  echo El despliegue fallo con codigo %CODE%.
  pause
  exit /b %CODE%
)

echo.
echo Despliegue enviado correctamente a Railway.
pause
exit /b 0
