#!/usr/bin/env bash
# Regenera los rangos de IP de Cloudflare usados por Nginx (realip + geo).
# Ejecutar al instalar y periódicamente (p. ej. cron mensual), luego:
#   docker compose exec nginx-proxy nginx -s reload
set -euo pipefail
cd "$(dirname "$0")/../nginx/snippets"

ranges=$( { curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6; } | grep -E '^[0-9a-fA-F:.]+/[0-9]+$')
[ -n "$ranges" ] || { echo "No se pudieron descargar los rangos" >&2; exit 1; }

{
  echo "# Generado por scripts/update_cloudflare_ips.sh el $(date -u +%FT%TZ)"
  for r in $ranges; do echo "set_real_ip_from $r;"; done
} > cloudflare_realip.conf

{
  echo "# Generado por scripts/update_cloudflare_ips.sh el $(date -u +%FT%TZ)"
  for r in $ranges; do echo "$r 1;"; done
} > cloudflare_geo.conf

echo "OK: $(echo "$ranges" | wc -l) rangos"
