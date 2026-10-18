# Puesta en línea en tu PC (Windows 10 + Cloudflare Tunnel)

Guía para publicar el honeypot usando tu propia PC como servidor, sin VPS. El tráfico entra por **Cloudflare Tunnel**: un contenedor (`cloudflared`) abre una conexión **saliente** hacia Cloudflare y las visitas llegan por ahí. Eso implica que:

- no abrís ningún puerto en el router,
- tu IP hogareña no aparece en el DNS ni la ve nadie de afuera,
- no necesitás IP fija.

Si más adelante conseguís un VPS, la versión para servidor está en [PUESTA-EN-LINEA-VPS.md](PUESTA-EN-LINEA-VPS.md).

En los comandos, reemplazá `DOMINIO` por tu dominio y `RUTA` por el valor de `HONEYPOT_TRAP_PATH`. Todo se ejecuta en **PowerShell** salvo que se indique otra cosa. Escribí siempre `curl.exe` y no `curl`, porque `curl` a secas es otro comando de PowerShell.

## 0. Antes de empezar: riesgos de usar tu PC personal

El túnel resuelve la exposición de tu red, pero hay cosas que tenés que saber:

- **Tráfico de Internet llega a tu PC.** Llega a contenedores aislados: Nginx y una app Django sin login, sin formularios y con sistema de archivos de solo lectura. Es una superficie chica, pero corre en la misma máquina donde tenés tus cosas.
  - Mantené Windows y Docker Desktop actualizados.
  - No guardes nada personal dentro de la carpeta del proyecto: es lo único de tu disco que ven los contenedores.
  - No corras otros servicios de Docker mientras el túnel esté activo.
- **Lo más seguro sigue siendo otra máquina.** Una PC vieja, una mini PC o un VPS chico (unos pocos dólares por mes) aíslan mejor el experimento. Si podés, preferilo. Esta guía funciona igual en cualquier PC con Windows 10.
- **La PC tiene que estar prendida 24/7.**
  - Desactivá la suspensión: *Configuración > Sistema > Inicio/apagado y suspensión > Nunca*.
  - Docker Desktop arranca solo **cuando iniciás sesión**. Después de un reinicio por Windows Update, el honeypot queda caído hasta que alguien entre a la cuenta.
  - Anotá las caídas, porque dejan huecos en los datos.
- **Carga.** Un crawler agresivo puede recorrer el laberinto de enlaces sin fin. Para eso la plantilla trae `HONEYPOT_MAX_DEPTH=10`: después de 10 niveles las páginas dejan de generar enlaces nuevos.
- **Tu proveedor de Internet.** Algunos contratos hogareños prohíben alojar servidores. Con el túnel no hay puertos abiertos, pero revisá tu contrato si te preocupa.

## 1. Instalar Docker Desktop

1. Descargá Docker Desktop para Windows desde docker.com e instalalo con la opción **WSL 2**. Requiere Windows 10 22H2 y la virtualización activada en la BIOS; el instalador avisa si falta algo.
2. En Docker Desktop, *Settings > General*: activá **Start Docker Desktop when you sign in to your computer**.
3. Comprobá en PowerShell:

   ```powershell
   docker version
   docker compose version     # 2.24 o superior
   ```

## 2. Cloudflare: agregar el dominio

1. En Cloudflare, *Add a domain* con tu dominio y el plan Free.
2. En tu registrador (NIC.ar u otro), poné los dos nameservers que te da Cloudflare y esperá a que el dominio figure como *Active*.
3. **No crees registros DNS a mano:** los crea el túnel en el paso 7.

## 3. Cloudflare: ajustes del experimento

Los nombres de menú cambian seguido; si algo no está donde se indica, buscalo por su nombre en el buscador del panel. Si alguno de estos ajustes queda activo, el experimento mide a Cloudflare y no a los crawlers.

1. **SSL/TLS > Edge Certificates:** *Always Use HTTPS* **apagado** y *Automatic HTTPS Rewrites* **apagado**. Con el túnel no hace falta Origin Certificate.
2. **Bloqueo de bots de IA** (*Block AI bots* / *AI Crawl Control*): **Do not block**. Cloudflare lo activa por defecto en dominios nuevos.
3. **robots.txt administrado** (*Managed robots.txt* / *Content Signals*): **apagado**.
4. **AI Labyrinth:** apagado.
5. **Bot Fight Mode** (Security > Bots): apagado.
6. **Browser Integrity Check:** apagado. **Security Level:** el más bajo disponible.
7. **Rocket Loader** y **Email Address Obfuscation:** apagados.
8. **Crawler Hints:** apagado.
9. **Caching > Cache Rules > Create rule:** "Hostname equals DOMINIO" OR "Hostname equals www.DOMINIO", acción **Bypass cache**.

## 4. Crear el túnel (sin publicarlo todavía)

1. En Cloudflare, *Zero Trust > Networks > Tunnels > Create a tunnel*. Si es la primera vez, Zero Trust te pide elegir un nombre de equipo y el plan Free.
2. Tipo **Cloudflared**, nombre por ejemplo `honeypot`.
3. En *Choose your environment* elegí **Docker**. Te muestra un comando `docker run ... --token eyJ...`. **Copiá solo el token** (el texto largo después de `--token`). No ejecutes ese comando: el contenedor ya está en el proyecto.
4. Dejá esa pestaña abierta: los *Public Hostnames* se agregan en el paso 7.

El token es una credencial: no lo compartas ni lo subas a ningún lado.

## 5. Preparar el proyecto

1. Descomprimí `crawler-honeypot.zip` en una ruta corta, **fuera de OneDrive**, por ejemplo `C:\honeypot\`. Queda `C:\honeypot\crawler-honeypot\`.
2. En PowerShell:

   ```powershell
   cd C:\honeypot\crawler-honeypot
   Copy-Item home\.env.home.example .env
   docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(50))"
   docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(50))"
   notepad .env
   ```

3. Completá `.env`. El Bloc de notas de Windows 10 respeta el formato del archivo, así que no hay problema en editarlo ahí.

   | Variable | Valor |
   |---|---|
   | `HONEYPOT_DOMAIN` | tu dominio, sin `www` |
   | `HONEYPOT_TRAP_PATH` | ruta prohibida con nombre neutro (por ejemplo `archivo-interno`). No la cambies una vez iniciado el experimento |
   | `HONEYPOT_MAX_DEPTH` | `10` (o `0` para sin límite) |
   | `CLOUDFLARE_TUNNEL_TOKEN` | el token del paso 4 |
   | `DJANGO_SECRET_KEY` y `HONEYPOT_TOKEN_SECRET` | los dos valores que imprimieron los `docker run` |
   | `GRAFANA_ADMIN_PASSWORD` | una contraseña fuerte |
   | `MAXMIND_ACCOUNT_ID` y `MAXMIND_LICENSE_KEY` | de tu cuenta gratuita de GeoLite2 en maxmind.com |

## 6. Levantar

Definí un atajo para la sesión de PowerShell (repetilo cada vez que abras una ventana nueva):

```powershell
cd C:\honeypot\crawler-honeypot
function hp { docker compose -f docker-compose.yml -f docker-compose.home.yml @args }
hp --profile maxmind up -d --build
hp ps -a
```

`home-certs` termina con `Exited (0)` y eso es normal. El resto debe estar `Up`.

Comprobá el túnel:

```powershell
hp logs cloudflared --tail 20
```

Tiene que aparecer `Registered tunnel connection` y, en Cloudflare, el túnel figura como **HEALTHY**. Si dice que el token es inválido, revisá `CLOUDFLARE_TUNNEL_TOKEN` y corré `hp up -d cloudflared`.

Comprobá la base ASN (puede tardar un minuto en bajar):

```powershell
hp exec analytics ls -l /usr/share/GeoIP/
```

Tiene que aparecer `GeoLite2-ASN.mmdb`. Si no, mirá `hp logs geoipupdate`: casi siempre es la clave de MaxMind.

Prueba local, todavía sin Internet de por medio:

```powershell
curl.exe -s -H "Host: DOMINIO" http://127.0.0.1:8080/robots.txt
(curl.exe -s -H "Host: DOMINIO" http://127.0.0.1:8080/ | Select-String '/RUTA/').Count
```

El primero debe mostrar `Disallow: /RUTA/` y el segundo, `5`.

## 7. Publicar

En la pestaña del túnel: *Public Hostname > Add a public hostname*:

| Subdomain | Domain | Service type | URL |
|---|---|---|---|
| *(vacío)* | DOMINIO | HTTP | `nginx-proxy:80` |
| `www` | DOMINIO | HTTP | `nginx-proxy:80` |

Cloudflare crea solo los registros DNS. **Desde este momento el honeypot está en Internet.**

## 8. Controles antes de sembrar

Esperá un par de minutos y corré esto desde tu PC. Todos tienen que dar lo indicado.

```powershell
# 1. robots.txt exacto: dos líneas, sin nada agregado por Cloudflare
curl.exe -s https://DOMINIO/robots.txt

# 2. Sin caché: ejecutarlo dos veces, nunca debe decir HIT
curl.exe -sI https://DOMINIO/robots.txt | Select-String cf-cache-status

# 3. Cloudflare no bloquea bots de IA: los tres deben dar 200 (403 o 503 = bloqueo activo)
curl.exe -s -o NUL -w "%{http_code}`n" -A "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)" https://DOMINIO/
curl.exe -s -o NUL -w "%{http_code}`n" -A "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" https://DOMINIO/
curl.exe -s -o NUL -w "%{http_code}`n" -A "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)" https://DOMINIO/

# 4. Las cabeceras internas no se filtran: no debe imprimir nada
curl.exe -sI https://DOMINIO/ | Select-String x-honeypot

# 5. HTTP también responde (sin redirección a HTTPS): debe dar 200
curl.exe -s -o NUL -w "%{http_code}`n" http://DOMINIO/robots.txt

# 6. Los enlaces trampa están en la página: debe dar 5
(curl.exe -s https://DOMINIO/ | Select-String '/RUTA/').Count

# 7. Tu IP hogareña no aparece: deben salir solo IPs de Cloudflare (104.x, 172.64-71.x o 2606:4700:...)
nslookup DOMINIO
```

Revisá el log:

```powershell
curl.exe -s https://ifconfig.me          # tu IP pública
hp exec nginx-proxy tail -n 3 /var/log/nginx/honeypot_access.json
```

`remote_ip` debe coincidir con tu IP pública y `via_cloudflare` debe valer `"1"`. Las pruebas por `127.0.0.1:8080` del paso 6 aparecen con `"0"` y eso es correcto.

**Grafana:** abrí http://localhost:3000 (usuario `admin` y la contraseña de `.env`). Solo se puede abrir desde tu PC y no hace falta túnel. Tus pruebas tienen que verse en el dashboard.

**Batch** con datos reales:

```powershell
hp exec analytics python -m honeypot_analytics.daily --date today --no-push
```

Tiene que terminar sin errores. Tu IP aparece con el ASN de tu proveedor en `data\enriched\`.

Si algún control falla, no sigas: corregí el ajuste correspondiente del paso 3 y repetí el control.

## 9. Opcional: borrar el tráfico de prueba

Tus pruebas quedan en los datos como un cliente `curl` o `browser`. Podés dejarlas y filtrar tu IP en el análisis, o empezar de cero. Esto **borra todos los logs y datos de Loki, sin vuelta atrás**:

```powershell
hp down
docker volume rm crawler-honeypot_nginx-logs crawler-honeypot_loki-data
Remove-Item -Recurse -Force data\enriched, data\reports -ErrorAction SilentlyContinue
hp --profile maxmind up -d
```

## 10. Sembrar (acciones públicas)

Recién ahora. Generá una URL por canal para saber de dónde llega cada crawler:

```powershell
hp run --rm -T honeypot-app python manage.py seed_urls github reddit hn | Out-File -Encoding utf8 data\seed_urls.csv
Get-Content data\seed_urls.csv
```

- **GitHub:** un repositorio público con un `config.json` basado en `seeds\config.json.example` y la URL del canal `github`.
- **Reddit / Hacker News:** publicá las URLs de esos canales. Revisá antes las reglas de cada comunidad.
- Guardá `data\seed_urls.csv`: el `request_uri` de cada semilla identifica el canal en los logs.

## 11. Día a día

- **Grafana:** "Descargas de robots.txt" y "Leyeron robots.txt y entraron a /trap/" son los primeros indicadores.
- **Batch:** corre solo a las 00:30 UTC, si la PC está prendida. Si estuvo apagada, procesá ese día a mano con `hp exec analytics python -m honeypot_analytics.daily --date AAAA-MM-DD`. Loki acepta hasta 7 días hacia atrás; para días más viejos agregá `--no-push`.
- **Informe:** `hp exec analytics python -m honeypot_analytics.report` lo deja en `data\reports\report.md`.
- **Pausar el honeypot:** `hp stop cloudflared` lo saca de Internet sin perder datos, y `hp start cloudflared` lo vuelve a publicar.
- **Señal de alarma:** si pasan varios días sin ninguna descarga de robots.txt, repetí los controles 1 a 3 del paso 8.
