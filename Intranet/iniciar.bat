@echo off
rem Lanza iniciar.ps1 sin depender de la politica de ejecucion de PowerShell.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"
