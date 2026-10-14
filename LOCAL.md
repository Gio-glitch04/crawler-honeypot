# Prueba local

Levanta el stack completo en tu PC sin exponer nada: todos los puertos quedan en `127.0.0.1`, así que ni Internet ni tu red local pueden verlo. No necesita dominio, Cloudflare, certificado real ni cuenta de MaxMind. No hace falta bash: alcanza con Docker Desktop (Compose 2.24 o superior) y una terminal (PowerShell, CMD o bash).

Archivos que se usan solo acá: `docker-compose.local.yml` y la carpeta `local/`. Ninguno se usa en el VPS.

## 1. Levantar

Desde la carpeta del proyecto:

```
docker compose --env-file local/.env.local -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Para no repetir esa línea, en PowerShell podés definir un alias para la sesión:

```
function hp { docker compose --env-file local/.env.local -f docker-compose.yml -f docker-compose.local.yml @args }
hp up -d --build
```

En el resto de la guía, `hp` equivale a esa línea completa.

El override se encarga solo de:
- generar un certificado autofirmado (servicio `local-certs`),
- crear una base ASN falsa con los rangos del simulador (servicio `local-asn-db`),
- servir el honeypot como `localhost` y tratar la red del simulador como si fuera Cloudflare.

Comprobá que todo esté arriba y que los puertos estén en `127.0.0.1`:

```
hp ps -a
hp port nginx-proxy 80
hp port nginx-proxy 443
```

`local-certs` y `local-asn-db` terminan con `Exited (0)` y eso es lo esperado. El resto debe estar `Up`, y los dos `port` deben mostrar `127.0.0.1:8080` y `127.0.0.1:8443`.

## 2. Mirar el sitio

- http://localhost:8080/ (o https://localhost:8443/ aceptando la advertencia del certificado).
- http://localhost:8080/robots.txt
- Con "Ver código fuente" se ven los 5 enlaces a `/trap/`: uno visible ("Archivo histórico") y cuatro ocultos por CSS, con nombres de clase que cambian en cada recarga.

Todo lo que hagas desde el navegador también queda registrado (como categoría `browser`).

## 3. Simular crawlers

```
hp --profile sim run --rm --no-deps simulator
```

El simulador imita seis clientes, cada uno con una IP pública ficticia:

| Bot simulado | Comportamiento | Resultado esperado |
|---|---|---|
| GPTBot | Lee robots.txt y sigue todos los enlaces | 5 accesos Nivel 1, 4 de ellos también Nivel 3 |
| Bytespider | No lee robots.txt y sigue todos | 5 accesos Nivel 2, 4 de ellos también Nivel 3 |
| Googlebot | Lee robots.txt y sigue solo `/public/` | Sin violaciones |
| ClaudeBot | Lee robots.txt y sigue solo `/public/` | Sin violaciones |
| "Googlebot" desde un ASN ajeno | Sigue solo el enlace visible | 1 acceso Nivel 2, marcado `suspect` |
| python-requests | Pide `/trap/` y `/trap/deadbeef` | 2 accesos Nivel 2 (`bare` e `invalid`) |

El simulador también falla si alguna cabecera interna `X-Honeypot-*` llegara al cliente. Podés correrlo varias veces; editá `local/simulate.py` para probar otros comportamientos. Si cambiás el simulador, agregá `--build` al comando.

## 4. Ver los logs

```
hp exec nginx-proxy tail -n 5 /var/log/nginx/honeypot_access.json
```

En cada línea, `remote_ip` es la IP ficticia del bot, `via_cloudflare` vale `1`, y `route` y `link_technique` dicen qué pidió y con qué técnica estaba escondido el enlace.

## 5. Grafana

Abrir http://localhost:3000 con usuario `admin` y contraseña `admin-local`, y entrar al dashboard *Honeypot > Crawler Compliance Honeypot*. Si no aparece nada, poné el rango de tiempo en "Last 1 hour".

Los paneles de peticiones, técnicas y User-Agents se llenan enseguida. Los de categoría, nivel y ASN se llenan recién después del paso 6.

## 6. Batch de ASN e informe

En producción el batch corre solo a las 00:30 UTC. Para probarlo ya, sobre el día de hoy:

```
hp exec analytics python -m honeypot_analytics.daily --date today
hp exec analytics python -m honeypot_analytics.report
```

Los resultados quedan en la carpeta `data/` del proyecto:
- `data/enriched/events-AAAA-MM-DD.csv.gz`: cada petición con ASN, familia de bot y nivel de violación.
- `data/reports/report.md`: resumen por nivel, por técnica, por familia, y la prueba de la hipótesis.
- `data/reports/by_family.csv`, `actors.csv` y `trap_hits.csv`.

Con los bots del simulador, el informe debe mostrar 5 accesos de Nivel 1, 8 de Nivel 2 y 8 de Nivel 3. Si también navegaste o corriste el simulador varias veces, los números van a ser mayores. El valor p no va a ser significativo con tan pocos actores, y eso es lo esperado.

## 7. Apagar y limpiar

```
hp down          # detiene todo y conserva datos
hp down -v       # además borra logs, Loki, Grafana y el certificado de prueba
```

La carpeta `data/` no se borra con `down -v`; eliminala a mano si querés empezar de cero.

## Qué no cubre esta prueba

- El comportamiento real de Cloudflare (caché, bloqueo de bots de IA, reescritura de robots.txt). Esos ajustes se verifican en el VPS siguiendo DEPLOY.md, antes de sembrar URLs.
- Datos ASN reales: la base local es falsa y solo conoce los rangos del simulador.
