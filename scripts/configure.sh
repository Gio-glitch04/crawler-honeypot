#!/usr/bin/env bash
# Aplica HONEYPOT_DOMAIN de .env al server block de Nginx (se puede re-ejecutar).
set -euo pipefail
cd "$(dirname "$0")/.."
source .env
[ -n "${HONEYPOT_DOMAIN:-}" ] || { echo "Falta HONEYPOT_DOMAIN en .env" >&2; exit 1; }
sed -i -E "s/^([[:space:]]*server_name)[[:space:]].*;/\1 ${HONEYPOT_DOMAIN} www.${HONEYPOT_DOMAIN};/" nginx/conf.d/honeypot.conf
grep -n server_name nginx/conf.d/honeypot.conf
