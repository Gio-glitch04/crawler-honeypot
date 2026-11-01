# Honeypot de crawlers: datos recolectados

**Sitio:** definitivamente-no-hay-trabas.com.ar
**Ruta trampa (prohibida en robots.txt):** `/archivo-interno/`
**Período:** 18/10/2026 21:31 UTC al 30/10/2026 17:57 UTC (casi 12 días)
**Fuente:** log crudo de Nginx (`honeypot_access.json`), exportado el 30/10/2026

---

## Resumen

- Se registraron **3.568.349 peticiones válidas** (después de sacar 57 de pruebas propias).
- **El 99,6 % del tráfico son dos crawlers de IA:** ClaudeBot (1,99 millones, 6,1 GB servidos) y GPTBot (1,56 millones, 4,7 GB).
- **Ningún crawler que se declara como bot entró a la trampa.** Ni los de IA (ClaudeBot, GPTBot, GoogleOther, OAI-SearchBot) ni los de buscadores (Googlebot, Applebot).
- **Las 207 entradas a la trampa vinieron de 6 IPs que se hacen pasar por navegadores comunes** (Chrome en Windows, Mac o Linux). Ninguna pidió `robots.txt` antes, y siguieron por igual enlaces visibles y ocultos con CSS. Eso las ubica en los **niveles 2 y 3** de la clasificación del experimento.
- **No hubo ninguna violación de nivel 1** (pedir `robots.txt` y después entrar igual a la trampa).
- ClaudeBot tuvo un pico de **38.787 peticiones por hora** (24/10 20:00 UTC) y dejó de rastrear el **25/10 cerca de las 19:00 UTC**. GPTBot sigue con un ritmo casi fijo de **~7.180 peticiones por hora** desde el 21/10.
- Hubo **4.129 intentos de robar credenciales o archivos sensibles** (`/.env`, `/.git/config`, `phpinfo.php`, `wp-login.php`), todos respondidos con 404.
- **Conclusión provisoria sobre la hipótesis:** con estos datos **no hay evidencia** de que los crawlers de IA declarados ignoren `robots.txt` más que los buscadores: ambos grupos tienen 0 entradas a la trampa. Lo que sí aparece es scraping camuflado como navegador que ignora `robots.txt` por completo, pero no se puede atribuir a ninguna empresa.

---

## 1. Limpieza de datos

| Excluido | Peticiones |
|---|---:|
| Auto-test desde la nube (UA `honeypot-selftest/1.0`) | 15 |
| Tu visita manual del 19/10 (45.191.81.232) | 8 |
| Pruebas de puesta en línea del 18/10 (186.124.199.212, AR, con UAs falsos de ClaudeBot, GPTBot y Bytespider) | 24 |
| Probable prueba manual del 20/10 23:22 UTC (181.4.69.199, AR, Chrome, hizo clic en 6 enlaces seguidos) | 8 |
| Controles locales con curl (sin pasar por Cloudflare) | 2 |
| **Total excluido** | **57** |

> Los dos casos del medio no estaban en la lista original de exclusiones. Los saqué porque tienen el patrón de pruebas manuales desde Argentina. Si alguno no fuiste vos, hay que volver a sumarlo.

**Hueco en los datos:** el 27/10 entre las 03:03 y las 12:00 UTC no llegó ninguna petición (unas 9 horas). Lo más probable es que la PC o el túnel estuvieran apagados.

---

## 2. Quién visitó el sitio

| Familia | Tipo | Peticiones | Pidió robots.txt | Entró a la trampa | IPs | Primera vez | Última vez |
|---|---|---:|---:|---:|---:|---|---|
| ClaudeBot (Anthropic) | IA | 1.989.866 | 155 | 0 | 27 | 19/10 23:07 | 27/10 01:44 |
| GPTBot (OpenAI) | IA | 1.558.875 | 0 * | 0 | 451 | 21/10 05:30 | 30/10 17:57 |
| GoogleOther (Google) | IA ** | 10.702 | 0 * | 0 | 11 | 19/10 20:25 | 22/10 06:01 |
| Navegadores sin marca de bot | ? | 7.036 | 12 | **207** | 427 | 18/10 21:43 | 30/10 15:02 |
| Googlebot | Buscador | 1.532 | 297 | 0 | 22 | 19/10 18:44 | 30/10 09:04 |
| OAI-SearchBot (OpenAI) | IA | 49 | 49 | 0 | 13 | 21/10 05:30 | 30/10 14:07 |
| Applebot | Buscador | 2 | 2 | 0 | 2 | 25/10 17:43 | 25/10 18:04 |
| Herramientas (python-requests, curl, Go, okhttp, etc.) | Herramienta | 168 | 7 | 0 | — | — | — |
| Escáneres (Censys, Palo Alto Xpanse, InternetMeasurement) | Escáner | 18 | 0 | 0 | — | — | — |
| Otros sin catalogar o sin User-Agent | Otro | 101 | 7 | 0 | — | — | — |

Horas en UTC.

\* **GPTBot nunca pidió `robots.txt` con su propio nombre, pero OpenAI sí lo leyó:** OAI-SearchBot pidió `robots.txt` desde la misma red (74.7.x.x) un segundo antes del primer pedido de GPTBot (21/10 05:30:30). OpenAI parece compartir una sola lectura entre sus crawlers. Con Google pasa algo parecido: Googlebot pidió `robots.txt` 297 veces y GoogleOther ninguna.

\** El clasificador del proyecto cuenta a GoogleOther como "IA". Google lo describe como un crawler genérico de investigación, así que conviene tratarlo aparte en el análisis final.

### Comportamiento de los crawlers de IA

- **ClaudeBot** arrancó el 20/10 con ~1.800 peticiones por hora. El 23/10 entre las 08:00 y las 09:00 UTC saltó a ~37.000–38.800 por hora y se mantuvo así unas 50 horas. El 25/10 fue bajando y a partir de las 19:00 UTC dejó de rastrear: después solo hizo 32 peticiones, unas 2 por hora, hasta el 27/10. Pidió `robots.txt` 155 veces (unas cada hora) y nunca entró a la trampa.
- **GPTBot** apareció el 21/10 y desde entonces trabaja a un ritmo casi constante: mediana de 7.184 por hora, máximo de 7.198. Es tan parejo que parece un límite de velocidad fijo (unas 2 por segundo). Sigue activo al momento de exportar los datos.
- **El sitio genera un laberinto infinito:** cada página tiene 5 enlaces nuevos. El 70 % de las páginas públicas servidas estaban en la profundidad máxima (10). Los crawlers de IA llegaron hasta el fondo de lo que permite el honeypot.

---

## 3. Entradas a la trampa

**Total: 207 entradas, de 6 IPs.** Todas usan User-Agents de Chrome normales, ninguna pidió `robots.txt`.

| IP | País | Peticiones | A la trampa | Respuestas 404 | Cuándo | Duración | Profundidad máx. |
|---|---|---:|---:|---:|---|---|---:|
| 158.69.55.82 | Canadá | 200 | 98 | 0 | 21/10 03:53 al 24/10 06:40 | intermitente, 3 días | 3 |
| 103.196.9.99 | EE. UU. | 111 | 53 | 0 | 24/10 06:36 | 16 segundos | 2 |
| 154.28.229.150 | EE. UU. | 90 | 43 | 0 | 21/10 03:51 | 29 segundos | 2 |
| 45.138.12.168 | Polonia | 14 | 5 | 0 | 19/10 al 25/10 | intermitente | 1 |
| 45.138.12.27 | Polonia | 297 | 4 | 285 | 26/10 14:31 | 3,5 minutos | 1 |
| 93.123.109.228 | Países Bajos | 334 | 4 | 315 | 23/10 06:31 | 7 minutos | 1 |

### Por técnica de ocultamiento del enlace

| Técnica | Entradas |
|---|---:|
| Visible (control) | 43 |
| `display:none` inline | 43 |
| Fuera de pantalla | 42 |
| `display:none` por clase CSS | 40 |
| `opacity: 0` | 39 |

El reparto es casi uniforme: estos bots **no renderizan la página**, leen el HTML y siguen cada `href` que encuentran, sin importar si una persona lo vería.

### Qué tipo de actor es cada uno

- **Scrapers de enlaces (3 IPs: 158.69.55.82, 154.28.229.150, 103.196.9.99).** Siguen todos los enlaces, públicos y trampa en partes iguales, a gran velocidad (más de 3 por segundo). Hay coincidencias de horario: 154.28.229.150 terminó el 21/10 a las 03:51 y 158.69.55.82 empezó dos minutos después; 103.196.9.99 actuó el 24/10 a las 06:36 y 158.69.55.82 hizo su último pedido cuatro minutos más tarde. **Puede ser un mismo operador rotando IPs**, pero es una hipótesis.
- **Escáneres de vulnerabilidades (2 IPs: 93.123.109.228 y 45.138.12.27).** Entraron a la trampa de paso, pero lo que buscaban eran archivos como `/.env` o `/.git/config` (cientos de 404).
- **Visitante intermitente (45.138.12.168).** Pocas visitas espaciadas en una semana, cambiando de User-Agent. Parece un monitor o un agregador.

### Clasificación según el diseño del experimento

| Nivel | Definición | Casos |
|---|---|---:|
| 1. Violación directa | Pide `robots.txt` y después entra a la trampa | **0** |
| 2. Violación por ignorancia | Entra a la trampa sin haber pedido `robots.txt` | **6 IPs** (las 207 entradas) |
| 3. Sin renderizado | Sigue enlaces ocultos con CSS | **6 IPs** (164 entradas a enlaces ocultos) |

---

## 4. Otros datos

- **Países (según Cloudflare):** EE. UU. concentra el 99,8 % por los crawlers de IA. Fuera de eso: Países Bajos (1.317), Alemania (1.293), Italia (715), Polonia (441), Francia (364).
- **Rutas inexistentes más pedidas:** `/favicon.ico` (231), `/sitemap.xml` (116), `/.env` (64), `/.git/config` (60) y decenas de variantes de `.env`.
- **De dónde llegó la gente:** casi nadie trae referer externo. Aparecen 51 desde Google y 1 desde Hacker News. Todavía no se sembraron los enlaces en GitHub ni en Reddit.
- **Cloudflare:** según lo visto el 26/10 en su panel, bloqueó 53 escáneres de exploits antes de que llegaran al honeypot. Esos no figuran en este log.

---

## 5. Limitaciones y próximos pasos

1. **Muestra chica para comparar grupos:** solo 4 familias de IA y 2 de buscadores, y ninguna entró a la trampa. Un test de Fisher no tiene sentido con 0 contra 0.
2. **Siembra pendiente:** sin enlaces en GitHub, Reddit o Hacker News, casi no llegan crawlers "independientes" ni scrapers de datasets, que son los más interesantes.
3. **El análisis diario automático dejó de correr el 21/10** (el último archivo en `data/enriched` es del 20/10). Hay que revisar el contenedor `analytics`; sin él no hay enriquecimiento por ASN.
4. **Verificar identidades:** contrastar las IPs de ClaudeBot y GPTBot con las listas oficiales de cada empresa, y averiguar el ASN de las 6 IPs que entraron a la trampa.
5. **El log ocupa 3,4 GB** y, al ritmo actual de GPTBot, crece unos 165 MB por día. Conviene rotarlo o comprimirlo.

---

## Archivos que acompañan este resumen

- `informe-honeypot.pdf`: el informe con gráficos.
- `por-familia.csv`, `actores-trampa.csv`, `por-dia.csv`: tablas completas.
- `datos-resumen.json`: todos los números de este resumen.
- `graficos/`: los gráficos en PNG.
