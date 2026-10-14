# Despliegue

Pasos para poner el honeypot en el VPS compartido con `iagrocorr.com.ar`. Nada de esto se ejecutó contra infraestructura real: los pasos marcados como **acción externa** publican o cambian algo fuera del VPS y conviene hacerlos a conciencia.

## 0. Requisitos

- VPS con Docker Engine y el plugin `docker compose`.
- Dominio aislado (ej. `definitivamente-no-hay-trabas.com.ar`) agregado a Cloudflare.
- Cuenta gratuita de MaxMind para GeoLite2-ASN (o, como alternativa sin cuenta, DB-IP ASN Lite en formato MMDB copiado a `/usr/share/GeoIP/dbip-asn-lite.mmdb` dentro del volumen `geoip-data`).

## 1. Convivencia con el Nginx actual de iagrocorr

`deployment.md` prevé un único Nginx central para ambos dominios. Hay dos caminos; elegir uno:

**A. Este compose pasa a ser el proxy central (recomendado si el actual es simple).**
Copiar el server block actual de iagrocorr a `nginx/conf.d/iagrocorr.conf` (partiendo de `iagrocorr.conf.example`), sus certificados a `nginx/certs/`, y conectar el contenedor de la app a la red `iagrocorr_net` (o activar el servicio con `--profile iagrocorr`). Detener el proxy anterior antes de levantar este, porque ambos usan los puertos 80/443.

**B. Mantener el Nginx actual.**
Quitar el servicio `nginx-proxy` del compose y llevar al Nginx existente: el `log_format honeypot_json`, el bloque `real_ip`/`geo` de `nginx/nginx.conf`, los snippets de Cloudflare y `conf.d/honeypot.conf`. El proxy debe alcanzar `honeypot-app` por la red `honeypot_net` y escribir el log en un volumen que Promtail y `analytics` puedan leer.

## 2. Preparar el servidor

```bash
git clone <repo> /opt/crawler-honeypot   # o copiar esta carpeta
cd /opt/crawler-honeypot
cp .env.example .env                       # completar todas las variables
bash scripts/configure.sh                  # aplica HONEYPOT_DOMAIN al server block
bash scripts/update_cloudflare_ips.sh      # rangos de IP de Cloudflare actualizados
mkdir -p data
```

Secretos: `python3 -c "import secrets; print(secrets.token_urlsafe(50))"` para `DJANGO_SECRET_KEY` y `HONEYPOT_TOKEN_SECRET`. No cambiar `HONEYPOT_TOKEN_SECRET` durante el experimento: los enlaces ya emitidos pasarían a clasificarse como `invalid`.

## 3. Cloudflare

Estos ajustes son críticos para la validez del experimento.

1. **DNS:** registro A (y AAAA si aplica) del dominio y `www` hacia el VPS, con proxy activado (nube naranja).
2. **SSL/TLS:** modo *Full (strict)*. Crear un *Origin Certificate* y guardarlo como `nginx/certs/honeypot.pem` y `nginx/certs/honeypot.key`. No activar *Always Use HTTPS*: el honeypot sirve lo mismo por HTTP y HTTPS para no perder ni alterar peticiones.
3. **Desactivar todo lo que bloquee, desafíe o modifique a los bots**, o el experimento mide a Cloudflare y no a los crawlers:
   - Bloqueo de bots de IA (*Block AI bots* / AI Crawl Control), que Cloudflare activa por defecto en dominios nuevos.
   - *Managed robots.txt* / señales de contenido: Cloudflare puede reescribir el `robots.txt` servido.
   - *AI Labyrinth*, *Bot Fight Mode* y *Super Bot Fight Mode*.
   - *Browser Integrity Check*; poner *Security Level* en lo más bajo.
   - *Rocket Loader*, *Email Obfuscation* y cualquier optimización que reescriba el HTML.
4. **Caché:** crear una *Cache Rule* que haga *Bypass cache* para todo el hostname. La app ya envía `Cache-Control: no-store`, pero si Cloudflare cachea `/robots.txt` el origen deja de ver esas descargas y se rompe la distinción entre Nivel 1 y Nivel 2.
5. **TLS del cliente (opcional, fingerprinting):** los campos `tls_version` y `tls_cipher` del log corresponden al tramo Cloudflare→origen, no al cliente real. Para registrar los del cliente, crear una *Transform Rule* de tipo *Modify Request Header* que agregue `X-Client-TLS-Version` = `cf.tls_version` y `X-Client-TLS-Cipher` = `cf.tls_cipher` (verificar que el plan los ofrezca). JA3/JA4 (`X-Client-JA3`, `X-Client-JA4`) requieren Bot Management, que es de plan Enterprise; si no se tiene, esos campos quedan vacíos.

## 4. Levantar el stack

```bash
docker compose --profile maxmind up -d --build
docker compose ps
docker compose logs -f nginx-proxy honeypot-app
```

Sin cuenta de MaxMind, omitir `--profile maxmind` y copiar la base MMDB al volumen `geoip-data` a mano.

Comprobaciones:

```bash
curl -s https://DOMINIO/robots.txt
curl -s https://DOMINIO/ | grep -c '/trap/'          # debe dar 5
docker compose exec nginx-proxy tail -n 3 /var/log/nginx/honeypot_access.json
```

En el log, `remote_ip` debe ser la IP pública desde la que se probó y `via_cloudflare` debe valer `1`.

## 5. Grafana

Grafana escucha solo en `127.0.0.1:3000`. Acceder con un túnel SSH:

```bash
ssh -L 3000:127.0.0.1:3000 usuario@vps
```

y abrir `http://localhost:3000` (usuario y contraseña de `.env`). El dashboard *Crawler Compliance Honeypot* viene provisionado. Los paneles de ASN y nivel de violación se llenan después de la primera corrida del batch diario.

## 6. Batch diario y análisis

El servicio `analytics` corre solo a las `ANALYTICS_RUN_AT_UTC` (00:30 por defecto) y procesa el día anterior: consulta Loki, enriquece cada IP con ASN y organización, clasifica las violaciones, guarda `data/enriched/events-AAAA-MM-DD.csv.gz` y reinyecta el resultado en Loki (`job="honeypot_enriched"`).

Manualmente:

```bash
docker compose exec analytics python -m honeypot_analytics.daily --date 2026-10-20
docker compose exec analytics python -m honeypot_analytics.daily --source files   # desde los logs, sin Loki
docker compose exec analytics python -m honeypot_analytics.report                 # informe en data/reports/
```

Loki rechaza muestras de más de 7 días, así que para reprocesar días viejos usar `--no-push`.

## 7. Generación de tráfico (experiment.md §3) — acción externa

- **Certificate Transparency:** ocurre solo al emitir el certificado del dominio en Cloudflare; no requiere nada más.
- **Semillas atribuibles:** generar una URL distinta por canal para saber de dónde viene cada crawler:

  ```bash
  docker compose run --rm honeypot-app python manage.py seed_urls github reddit hn > data/seed_urls.csv
  ```

  Guardar ese CSV: el `request_uri` de cada semilla identifica el canal en los logs.
- **GitHub:** publicar un repositorio con un `config.json` basado en `seeds/config.json.example` y la URL del canal `github`.
- **Reddit / Hacker News:** publicar las URLs de esos canales. Revisar antes las reglas de cada comunidad sobre autopromoción y contenido de prueba.

## 8. Mantenimiento

- Rangos de Cloudflare: correr `scripts/update_cloudflare_ips.sh` mensualmente y luego `docker compose exec nginx-proxy nginx -s reload`.
- Rotación del log: el archivo crece sin límite. Con logrotate en el host sobre el volumen, o periódicamente `mv` + `docker compose exec nginx-proxy nginx -s reopen`; `analytics --source files` lee también los archivos rotados (`honeypot_access.json*`).
- Retención: Loki guarda 400 días (`loki/loki-config.yml`). Los logs contienen IPs, que pueden considerarse datos personales; ajustar la retención a lo que necesite el estudio.
- Promtail está en fin de vida y Grafana recomienda migrar a Grafana Alloy. Se mantuvo Promtail porque así lo pide `specs.md`; la migración solo afecta a `promtail/` y al servicio correspondiente.
- Imágenes fijadas: `nginx:1.29-alpine`, `grafana/loki:3.5.0`, `grafana/promtail:3.5.0`, `grafana/grafana:12.0.0`, `geoipupdate:v7.1.0`. Actualizarlas a conciencia, porque un cambio de versión de Loki puede requerir ajustar su configuración.
