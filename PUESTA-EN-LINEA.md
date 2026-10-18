# Puesta en línea paso a paso

Guía ordenada para pasar del modo local al honeypot público. El orden importa: Cloudflare queda configurado **antes** de que el dominio apunte al servidor, y nada se siembra hasta que todos los controles del paso 7 den bien. Referencia detallada de cada pieza: [DEPLOY.md](DEPLOY.md).

En los comandos, reemplazá `DOMINIO` por tu dominio (ej. `definitivamente-no-hay-trabas.com.ar`), `IP_VPS` por la IP pública del servidor y `RUTA` por el valor de `HONEYPOT_TRAP_PATH`.

## 0. Dos decisiones antes de empezar

**Nombre de la ruta prohibida.** Por defecto es `/trap/`, como dice `specs.md`, pero un scraper atento que lea `Disallow: /trap/` puede sospechar y no entrar, y eso lo haría parecer "cumplidor". Recomendado: un nombre neutro en `HONEYPOT_TRAP_PATH` (por ejemplo `archivo-interno`). Los paneles y el análisis siguen llamando "trap" a esa ruta internamente. **No lo cambies una vez iniciado el experimento.**

**¿Ya hay un Nginx escuchando en 80/443 en el VPS?** En el servidor:

```bash
sudo ss -ltnp | grep -E ':(80|443)\s'
```

- Si no aparece nada, seguí esta guía tal cual.
- Si aparece el Nginx de iagrocorr, elegí la opción A o B de la sección 1 de [DEPLOY.md](DEPLOY.md) antes del paso 4. La A (este compose pasa a ser el proxy de ambos dominios) es la más simple de mantener.

## 1. Cloudflare: agregar el dominio (sin registros DNS todavía)

1. En Cloudflare, *Add a domain* con el dominio del honeypot y el plan Free.
2. En tu registrador (NIC.ar u otro), cambiar los nameservers por los dos que te da Cloudflare. Esperar a que el dominio figure como *Active*.
3. **No crees todavía los registros A/AAAA.** Sin ellos ningún crawler puede llegar, aunque el certificado del dominio ya aparezca en los logs de Certificate Transparency.

## 2. Cloudflare: ajustes del experimento

Los nombres de menú cambian seguido; si algo no está donde se indica, buscalo por su nombre en el buscador del panel.

1. **SSL/TLS > Overview:** modo **Full (strict)**.
2. **SSL/TLS > Edge Certificates:** *Always Use HTTPS* **apagado**, *Automatic HTTPS Rewrites* **apagado**.
3. **SSL/TLS > Origin Server > Create Certificate:** RSA, hostnames `DOMINIO` y `*.DOMINIO`, 15 años. Guardá el certificado y la clave; se usan en el paso 3.
4. **Apagar todo lo que bloquea o modifica bots.** Si alguno queda activo, el experimento mide a Cloudflare y no a los crawlers:
   - **Bloqueo de bots de IA** (*Block AI bots* / *AI Crawl Control*): en *Do not block*. Cloudflare lo activa por defecto en dominios nuevos.
   - **robots.txt administrado** (*Managed robots.txt* / *Content Signals*): apagado. Si está prendido, Cloudflare agrega o reescribe líneas del robots.txt.
   - **AI Labyrinth:** apagado.
   - **Bot Fight Mode** (Security > Bots): apagado.
   - **Browser Integrity Check:** apagado.
   - **Security Level:** el más bajo disponible (*Essentially Off* o *Low*).
   - **Rocket Loader** y **Email Address Obfuscation** (Scrape Shield): apagados, porque reescriben el HTML.
   - **Crawler Hints:** apagado, para no avisar a buscadores por fuera de lo orgánico.
5. **Caching > Cache Rules > Create rule:** "Hostname equals DOMINIO" (y otra regla o condición OR para `www.DOMINIO`), acción **Bypass cache**. Si Cloudflare cachea robots.txt, el servidor deja de ver esas descargas y se rompe la diferencia entre Nivel 1 y Nivel 2.
6. **Opcional, TLS del cliente:** *Rules > Transform Rules > Modify Request Header*, para todas las peticiones del hostname, *Set dynamic* `X-Client-TLS-Version` = `cf.tls_version` y `X-Client-TLS-Cipher` = `cf.tls_cipher`. Si tu plan no ofrece esos campos, saltealo: el honeypot funciona igual. JA3/JA4 solo existen en Enterprise.

## 3. Preparar el servidor

```bash
# Docker (si no está instalado)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER      # cerrar sesión y volver a entrar

# Firewall: solo SSH y web hacia afuera (Grafana queda en 127.0.0.1)
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

Copiar el proyecto (desde tu PC: `scp crawler-honeypot.zip usuario@IP_VPS:~`) y en el VPS:

```bash
sudo mkdir -p /opt && sudo chown $USER /opt
unzip ~/crawler-honeypot.zip -d /opt && cd /opt/crawler-honeypot
cp .env.example .env
nano .env
```

Completar en `.env`:

| Variable | Valor |
|---|---|
| `HONEYPOT_DOMAIN` | tu dominio, sin `www` |
| `HONEYPOT_TRAP_PATH` | la ruta elegida en el paso 0 |
| `DJANGO_SECRET_KEY` y `HONEYPOT_TOKEN_SECRET` | dos valores distintos de `python3 -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `GRAFANA_ADMIN_PASSWORD` | una contraseña fuerte |
| `MAXMIND_ACCOUNT_ID` y `MAXMIND_LICENSE_KEY` | de tu cuenta gratuita en maxmind.com (GeoLite2) |
| `HOST_UID` y `HOST_GID` | la salida de `id -u` y `id -g` |

Después:

```bash
bash scripts/configure.sh              # pone tu dominio en el server block de Nginx
bash scripts/update_cloudflare_ips.sh  # rangos de IP de Cloudflare actualizados
mkdir -p data
nano nginx/certs/honeypot.pem          # pegar el Origin Certificate del paso 2.3
nano nginx/certs/honeypot.key          # pegar la clave privada
chmod 600 nginx/certs/honeypot.key
```

## 4. Levantar

```bash
docker compose --profile maxmind up -d --build
docker compose ps
```

Todos los servicios deben estar `Up`. Verificá que la base ASN se descargó (puede tardar un minuto):

```bash
docker compose exec analytics ls -l /usr/share/GeoIP/
```

Tiene que aparecer `GeoLite2-ASN.mmdb`. Si no, mirá `docker compose logs geoipupdate`: casi siempre es la clave de MaxMind.

## 5. Probar el servidor directo, sin pasar por Cloudflare

Desde tu PC o el VPS, forzando la IP del servidor (en PowerShell usá `curl.exe` en vez de `curl`):

```bash
curl -sk --resolve DOMINIO:443:IP_VPS https://DOMINIO/robots.txt
curl -sk --resolve DOMINIO:443:IP_VPS https://DOMINIO/ | grep -c '/RUTA/'
```

El primero debe mostrar `Disallow: /RUTA/` y el segundo, `5`. Estas peticiones quedan en el log con `via_cloudflare: "0"`.

## 6. Apuntar el DNS

En Cloudflare > DNS, crear dos registros con la **nube naranja (Proxied)**:

- `A` `@` → `IP_VPS`
- `A` `www` → `IP_VPS`

Agregá también `AAAA` si el VPS tiene IPv6. Desde este momento el honeypot es alcanzable.

## 7. Controles antes de sembrar

Correlos desde tu PC; esperá unos minutos a que propague el DNS. Todos tienen que dar lo indicado.

```bash
# 1. robots.txt exacto: dos líneas, sin nada agregado por Cloudflare
curl -s https://DOMINIO/robots.txt

# 2. Sin caché: ejecutarlo dos veces, nunca debe decir HIT
curl -sI https://DOMINIO/robots.txt | grep -i cf-cache-status

# 3. Cloudflare no bloquea bots de IA: los tres deben dar 200 (403 o 503 = bloqueo activo)
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)" https://DOMINIO/
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" https://DOMINIO/
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)" https://DOMINIO/

# 4. Las cabeceras internas no se filtran: no debe imprimir nada
curl -sI https://DOMINIO/ | grep -i x-honeypot

# 5. HTTP también responde (sin redirección a HTTPS): debe dar 200
curl -s -o /dev/null -w "%{http_code}\n" http://DOMINIO/robots.txt

# 6. Los enlaces trampa están en la página: debe dar 5
curl -s https://DOMINIO/ | grep -c '/RUTA/'
```

En el VPS:

```bash
docker compose exec nginx-proxy tail -n 3 /var/log/nginx/honeypot_access.json
```

`remote_ip` debe ser **tu** IP pública (no una de Cloudflare) y `via_cloudflare` debe valer `"1"`.

Grafana, desde tu PC con un túnel SSH:

```bash
ssh -L 3000:127.0.0.1:3000 usuario@IP_VPS
```

Abrí http://localhost:3000; tus peticiones de prueba tienen que aparecer en el dashboard. Por último, probá el batch con datos reales:

```bash
docker compose exec analytics python -m honeypot_analytics.daily --date today --no-push
```

Tiene que terminar sin error. Tu IP aparece con el ASN de tu proveedor de Internet en `data/enriched/`.

Si algún control falla, no sigas: corregí el ajuste correspondiente del paso 2 y repetilo.

## 8. Opcional: borrar el tráfico de prueba

Tus pruebas quedan en los datos como un cliente `curl` o `browser`. Podés dejarlas y filtrar tu IP en el análisis, o empezar de cero. Esto **borra todos los logs y datos de Loki y no se puede deshacer**:

```bash
docker compose down
docker volume rm crawler-honeypot_nginx-logs crawler-honeypot_loki-data
rm -rf data/enriched data/reports
docker compose --profile maxmind up -d
```

## 9. Sembrar (acciones públicas)

Recién ahora. Generá una URL por canal para saber de dónde llega cada crawler:

```bash
docker compose run --rm honeypot-app python manage.py seed_urls github reddit hn > data/seed_urls.csv
cat data/seed_urls.csv
```

- **GitHub:** un repositorio público con un `config.json` basado en `seeds/config.json.example` y la URL del canal `github`.
- **Reddit / Hacker News:** publicar las URLs de esos canales. Revisá antes las reglas de cada comunidad.
- Guardá `data/seed_urls.csv`: el `request_uri` de cada semilla identifica el canal en los logs.

## 10. Primeros días

- **Grafana a diario:** "Descargas de robots.txt" y "Leyeron robots.txt y entraron" son los primeros indicadores.
- **Batch:** corre solo a las 00:30 UTC. El informe se genera con `docker compose exec analytics python -m honeypot_analytics.report`.
- **Señal de alarma:** si pasan varios días sin ninguna descarga de robots.txt, revisá que Cloudflare no lo esté sirviendo desde caché o bloqueando (repetí el paso 7).
- **Mantenimiento:** sección 8 de [DEPLOY.md](DEPLOY.md), que cubre rangos de Cloudflare, rotación de logs y retención.
