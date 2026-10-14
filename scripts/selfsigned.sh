#!/usr/bin/env bash
# Certificado autofirmado SOLO para pruebas locales.
set -euo pipefail
cd "$(dirname "$0")/../nginx/certs"
domain="${1:-honeypot.local}"
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
  -keyout honeypot.key -out honeypot.pem -subj "/CN=$domain" 2>/dev/null
echo "Creado nginx/certs/honeypot.{pem,key} para $domain"
