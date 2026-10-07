#!/usr/bin/env bash
# Arranca la intranet en local: API (3001) y web (5173). Equivalente de iniciar.ps1.
# Uso: ./iniciar.sh   (Ctrl+C detiene ambos)
cd "$(dirname "$(readlink -f "$0")")" || exit 1

command -v node >/dev/null || { echo "No se encontro Node.js (version 20.19 o superior)."; exit 1; }
[ -d node_modules ] || { echo "Instalando dependencias..."; npm install || exit 1; }

# Libera los puertos si quedó una ejecución anterior
for p in 3001 5173; do fuser -k "$p/tcp" >/dev/null 2>&1; done

trap 'kill 0' EXIT INT TERM
npm run dev:api &
npm run dev -- --host &

sleep 4
(xdg-open http://localhost:5173 >/dev/null 2>&1 &)
ip=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -n "$ip" ] && echo "Desde otro PC de la red: http://$ip:5173"
echo "Usuarios de desarrollo: admin / admin  y  gestor / cumple2026"
wait
