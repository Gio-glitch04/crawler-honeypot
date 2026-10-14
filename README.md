# Crawler Compliance Honeypot

Honeypot HTTP/HTTPS para medir el cumplimiento de `robots.txt` (RFC 9309) por parte de crawlers, con foco en bots de IA. Implementa `specs.md`, respeta las decisiones de `memory.md`, instrumenta los criterios de `experiment.md` y sigue la topología de `deployment.md`.

Guía de despliegue paso a paso: [DEPLOY.md](DEPLOY.md).

## Estructura

```
docker-compose.yml        Topología completa (proxy, honeypot, telemetría, batch ASN)
.env.example              Variables a completar
honeypot/                 App Django (capa 3)
nginx/                    Proxy L7 + logs JSON (capa 2)
  nginx.conf              log_format honeypot_json, IP real vía CF-Connecting-IP
  conf.d/                 server blocks: honeypot, default (444), plantilla iagrocorr
  snippets/               Rangos IP de Cloudflare (regenerables)
promtail/ loki/ grafana/  Telemetría dinámica (capa 5) con dashboard provisionado
analytics/                Batch diario ASN + clasificación + informe Pandas (capa 4 y §5)
scripts/                  configure.sh, update_cloudflare_ips.sh, selfsigned.sh
seeds/                    Ejemplo de archivo semilla para GitHub
```

## Cómo funciona

**Rutas** (specs.md §3)

| Ruta | Qué hace |
|---|---|
| `GET /robots.txt` | `User-agent: *` / `Disallow: /trap/` |
| `GET /` | 5 enlaces visibles a `/public/` y 5 enlaces a `/trap/` (uno por técnica) |
| `GET /public/{id}` | Ficha de dataset señuelo, con nuevos enlaces públicos y trampa |
| `GET /trap/{id}` | Mismo contenido señuelo. Todo acceso aquí es una violación |

**Enlaces que mutan en cada petición** (memory.md decisión 5). Cada `id` es un token de 52 caracteres hex: UUID4 + instante de emisión + profundidad + firma HMAC. La técnica de ocultamiento no viaja en claro: el servidor la recupera verificando la firma. Esto permite saber, sin base de datos:

- con qué técnica estaba escondido el enlace que siguió el bot,
- cuántos segundos pasaron entre que se generó el enlace y que se siguió (`link_age_s`),
- a qué profundidad del laberinto llegó,
- si el id fue inventado o manipulado (`invalid`), o si el bot fue a `/trap/` a secas tras leer el `Disallow` (`bare`).

**Técnicas de enlace a /trap/** (para el Nivel 3)

| Técnica | Cómo se oculta |
|---|---|
| `visible` | No se oculta (control: el bot ve el enlace y robots.txt lo prohíbe) |
| `display_none_inline` | `style="display:none"` en el atributo |
| `display_none_class` | `display:none` por clase CSS de nombre aleatorio |
| `opacity_0` | `opacity:0` por clase CSS aleatoria |
| `offscreen` | Posicionado fuera del viewport |

Los nombres de clase cambian en cada petición, así que un scraper no puede descartarlos sin interpretar el CSS.

**Logging** (specs.md §4). Nginx escribe una línea JSON por petición con todos los campos pedidos más `msec`, `peer_ip`, `via_cloudflare`, `cf_ray`, `cf_country`, y los metadatos que la app le pasa en cabeceras internas (`route`, `link_technique`, `link_issued`, `link_depth`), que Nginx elimina antes de responder.

**Clasificación** (experiment.md §4), en `analytics/honeypot_analytics/pipeline.py`:

- Nivel 1: hubo `GET /robots.txt` previo de la misma IP o del mismo actor (familia de bot + ASN) y después accedió a `/trap/`.
- Nivel 2: accedió a `/trap/` sin haber pedido `robots.txt` antes (ventana de 30 días configurable).
- Nivel 3: el enlace seguido estaba oculto por CSS. Es una marca adicional, combinable con 1 o 2 (`1+3`, `2+3`).

El informe (`python -m honeypot_analytics.report`) compara la tasa de actores infractores entre IA y buscadores con una prueba exacta de Fisher unilateral, excluyendo del grupo de control los UA de buscador que llegan desde un ASN inesperado (posible suplantación).

## Prueba local realizada

Se levantó el stack completo con Docker, certificado autofirmado y una base ASN de prueba, y se simuló tráfico de 5 bots:

| Bot simulado | Comportamiento | Resultado |
|---|---|---|
| GPTBot | Lee robots.txt y sigue todos los enlaces | 5 accesos Nivel 1, 4 de ellos Nivel 3 |
| Bytespider | No lee robots.txt, sigue todos | 5 accesos Nivel 2, 4 de ellos Nivel 3 |
| Googlebot / ClaudeBot | Leen robots.txt, solo enlaces públicos | Sin violaciones |
| "Googlebot" desde ASN ajeno | Sigue solo el enlace visible | Nivel 2, marcado `suspect` y excluido del control |
| python-requests | `/trap/` y `/trap/deadbeef` | Nivel 2, técnicas `bare` e `invalid` |

También se verificó que una conexión directa al origen con `CF-Connecting-IP` falsificado queda registrada con su IP real y `via_cloudflare=0`, que las cabeceras internas no llegan al cliente, y que los 11 paneles del dashboard de Grafana devuelven datos.
