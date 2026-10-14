#!/usr/bin/env bash
# Aplica HONEYPOT_DOMAIN de .env al server block de Nginx.
set -euo pipefail
cd "$(dirname "$0")/.."
source .env
[ -n "${HONEYPOT_DOMAIN:-}" ] || { echo "Falta HONEYPOT_DOMAIN en .env" >&2; exit 1; }
sed -i "s/__HONEYPOT_DOMAIN__/${HONEYPOT_DOMAIN}/g" nginx/conf.d/honeypot.conf
grep -n server_name nginx/conf.d/honeypot.conf
