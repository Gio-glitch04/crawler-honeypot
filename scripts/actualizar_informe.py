import re
import sys

body_content = r"""# Honeypots web para medir el cumplimiento de `robots.txt` (RFC 9309): diseño con tokens HMAC sin estado y estudio de caso en un dominio señuelo

**Joel Jesús Marcori, Julio César Pintos, Giovanni Oscar Piazza**  
Facultad de Ciencias Exactas, Naturales y Agrimensura (FaCENA), Universidad Nacional del Nordeste (UNNE). Corrientes, Argentina.  
Cátedra de Internetworking, 2026. Contacto: {joelmarcori1, juliopintoscesar, gpiazza1804}@gmail.com  
Repositorio: <https://github.com/Gio-glitch04/crawler-honeypot> — Dominio experimental: `definitivamente-no-hay-trabas.com.ar`

---

## Resumen

Este trabajo analiza la técnica de *honeypot* aplicada a la auditoría empírica del Protocolo de Exclusión de Robots (`robots.txt`, RFC 9309). Se presenta el marco general de engaño defensivo (*deception*, baja y alta interacción, *tarpits*, *honeytokens*) y se compara nuestro enfoque con alternativas como AI Labyrinth de Cloudflare. Implementamos un honeypot HTTP de capa 7 sin estado que genera un laberinto infinito de páginas y enlaces señuelo codificados en tokens HMAC-SHA256 truncados a 40 bits (52 caracteres hexadecimales), preservando metadatos en la URL sin base de datos en el servidor. Desplegado durante 11,85 días en producción sobre Windows 10 con Docker Desktop (WSL 2) y Cloudflare Tunnel, el sistema procesó 3.568.349 peticiones válidas (~10,9 GB de carga útil). Los tres operadores de crawlers declarados que recorrieron el laberinto (Anthropic, OpenAI y Google, que sumaron el 99,8 % del tráfico) registraron 0 accesos a la ruta prohibida sobre 5,36 millones de enlaces trampa expuestos (100 % de acatamiento en el sitio señuelo). La verificación de red constató que las subredes observadas coincidieron con los rangos oficiales de OpenAI y Google (100,00 % y 99,83 % de cobertura), y con el registro ARIN para Anthropic (99,9998 %). En contraste, se registraron 207 violaciones correspondientes a 6 direcciones IP que falsificaban cabeceras de navegadores comerciales: el 100 % incurrió en Nivel 2 (omisión de consultar `robots.txt`) y el 79,2 % (164 de 207) en Nivel 3 (consumo de enlaces ocultos por CSS). Enmarcado a nivel de operador ($n = 3$, cota de Clopper-Pearson al 95 % de 63,2 %), el estudio discute alcances reales, limitaciones metodológicas, aspectos éticos bajo la Ley 25.326 y criterios de aplicabilidad.

**Palabras clave:** honeypot, deception, web crawlers, robots.txt, RFC 9309, HMAC, tokens sin estado, ClaudeBot, GPTBot.

---

## 1. Introducción y marco conceptual

### 1.1. Contexto, planteamiento del problema y objetivos

El Protocolo de Exclusión de Robots (`robots.txt`), estandarizado en el **RFC 9309** [1], permite indicar qué recursos no deben ser rastreados por agentes automatizados. Al carecer de mecanismos criptográficos de autenticación o bloqueo en red y transporte, su cumplimiento es voluntario (*advisory*). Con la expansión de los modelos de lenguaje (LLMs) y sistemas RAG, la recolección masiva de datos transformó el tráfico web: en 2024 el tráfico automatizado superó al humano, alcanzando el 51 % global [2], con una adopción asimétrica de directivas defensivas [3].

Estudios recientes aportan evidencia empírica directa: Kim et al. [4] evaluaron 130 bots y hallaron que el acatamiento decae ante directivas restrictivas, alertando sobre la suplantación de `User-Agent`; Liu et al. [5] examinaron la eficacia de `robots.txt` para proteger creadores de contenido frente a crawlers de IA. Surge la pregunta central: **¿Respetan efectivamente los agentes de IA las directivas de exclusión de `robots.txt` en producción, o las violaciones provienen de recolectores camuflados que omiten el protocolo?**

**Objetivos del trabajo:**
1. Sistematizar el marco conceptual de los honeypots y posicionar nuestro diseño frente a alternativas de mitigación (§1.2 y §4.3).
2. Diseñar, implementar y evaluar en producción un honeypot HTTP de capa 7 sin estado para auditar el RFC 9309 (§2 y §3).
3. Evaluar empíricamente el comportamiento de los crawlers en el entorno señuelo, acotando conclusiones y aspectos éticos y operativos (§3.4, §4 y §5).

**Alcance y delimitación:** Son de autoría propia la arquitectura del laberinto, el código, el despliegue con Docker y Cloudflare Tunnel, el registro de 3,57 millones de peticiones y los análisis estadísticos. Se toman de la literatura las tasas globales de tráfico [2, 3], las advertencias sobre *spoofing* [4] y los marcos de evaluación sobre crawlers de IA [5]. El estudio no extrapola sus conclusiones a toda la web ni a directivas complejas: audita rigurosamente a los agentes que visitaron un dominio señuelo único frente a una directiva `Disallow` benigna.

### 1.2. Fundamentos de la técnica Honeypot: historia, taxonomía y *tarpits*

Un *honeypot* es un recurso informático cuyo valor reside exclusivamente en su uso no autorizado o ilegítimo (Spitzner [6]). Al carecer de usuarios legítimos, casi toda interacción recibida constituye una anomalía inspeccionable.

La disciplina incluye hitos fundamentales: el rastreo pionero de intrusos de Stoll [7] y Cheswick [8]; la formalización del engaño de Cohen [9]; el Honeynet Project [10], el simulador Honeyd [11] y el tarpit LaBrea [12]; Project Honey Pot contra spam [13]; plataformas como Nepenthes/Dionaea [14], Glastopf [15], Cowrie [16] y Canarytokens [17]; y laberintos modernos contra crawlers de IA como AI Labyrinth de Cloudflare [18].

**Taxonomía técnica:**
1. **Nivel de interacción:** *Baja interacción* (emula servicios con respuestas sintéticas; mínimo riesgo computacional, como nuestro honeypot HTTP); *media interacción* (intérpretes confinados, ej. Cowrie); *alta interacción* (sistemas operativos reales instrumentados; máxima visibilidad pero requiere contención estricta).
2. **Escala y propósito:** Se diferencian honeypots aislados de *honeynets* (redes coordinadas), y sistemas de *producción* (alerta temprana) de *investigación* (estudio de tácticas adversarias).
3. **Forma del señuelo:** Servicios de red, aplicaciones web o *honeytokens* (elementos pasivos como URLs o credenciales que alertan al ser accedidos) [17].

**Aplicabilidad para la auditoría de `robots.txt`:** Evaluar el cumplimiento en sitios existentes presenta tres problemas: contaminación por enlaces externos previos, incapacidad de los logs estándar para capturar el nodo DOM de procedencia y su visibilidad, y saturación de bases de datos ante rastreos masivos. Un honeypot web de baja interacción con dominio aislado y tokens criptográficos resuelve simultáneamente estos tres factores.

### 1.3. Conceptos fundamentales de Internetworking y capa de aplicación

* **Semántica y caché de `robots.txt` (RFC 9309):** El estándar exige obtener `/robots.txt`, identificar reglas aplicables al `User-Agent` (o al comodín `*`) y aplicar coincidencia por prefijo (*path prefix matching*), prevaleciendo la regla más específica [1]. Admite almacenar la política en caché hasta por 24 horas. El RFC 9309 define la semántica pero no prescribe la sincronización interna de nodos en un operador distribuido; que un agente consulte la directiva para toda su infraestructura (como `OAI-SearchBot` en OpenAI) es compatible con dicha política de caché.
* **Separación entre árbol DOM y Render Tree:** Según WHATWG HTML [19] y W3C CSS Display Module [20], el navegador genera el DOM y el CSSOM, fusionándolos en el **Render Tree** antes de calcular la geometría (*layout*) y pintar los píxeles. Los nodos con `display: none` se excluyen del *Render Tree*; aquellos con `opacity: 0` o desplazados fuera de pantalla (`left: -10000px`) se renderizan pero son invisibles. Sin embargo, **todos permanecen en el DOM y en el HTML crudo**. Un recolector que analice texto o use `querySelectorAll('a')` sin calcular visibilidad (`checkVisibility()`) seguirá enlaces invisibles; un navegador completo que procese el renderizado visual los descartará.
* **Túneles reversos en el borde y preservación de capas L3/L7:** Al exponer un servidor mediante *Cloudflare Tunnel*, la sesión TCP/TLS finaliza en el nodo Anycast más próximo. El túnel encapsula el tráfico hacia el host anfitrión sin requerir puertos abiertos perimetrales. El socket TCP en Nginx observa la IP de la red del túnel. Para recuperar la IP pública real sin permitir falsificaciones (*IP spoofing*), Nginx restringe `set_real_ip_from` a la subred del túnel antes de interpretar `CF-Connecting-IP`.
* **Atribución en capa de red (BGP, ASN y RDAP):** La cabecera `User-Agent` es texto libre fácilmente falseable; verificar la identidad exige contrastar la IP de origen con tablas BGP, registros RDAP/WHOIS (ARIN, RIPE) y prefijos oficiales publicados por cada operador.

---

## 2. Arquitectura y funcionamiento

### 2.1. Componentes efectivamente desplegados y topología de red (Windows 10 + Docker Desktop)

El despliegue se ejecutó sobre **Windows 10 (22H2) con Docker Desktop (WSL 2 basado en Ubuntu)**, combinando `docker-compose.yml`, `docker-compose.home.yml` y `--profile maxmind`. La topología segmenta los servicios en **tres redes virtuales tipo *bridge*** aisladas (`tunnel_net` en `10.98.0.0/24`, `honeypot_net` y `telemetry_net`), sin puertos expuestos en el enrutador:

![Topología de red y servicios desplegados](graficos/topologia.png)
*Figura de topología. El contenedor `analytics` figura detenido desde el 21/10 (§3.3). Fuente del diagrama: `graficos/topologia.mmd`.*

Roles de cada servicio:
1. **`cloudflared` (`cloudflare/cloudflared:2025.9.1`):** Conectado a `tunnel_net` (`10.98.0.0/24`). Establece túneles salientes autenticados hacia Cloudflare Anycast y reenvía tráfico HTTP a `nginx-proxy:80`.
2. **`home-certs` (`python:3.12-slim`):** Contenedor efímero sin red (`network_mode: none`) que genera certificados autofirmados para Nginx antes del arranque.
3. **`nginx-proxy` (`nginx:1.29-alpine`):** Puente entre `tunnel_net` y `honeypot_net`. Aplica `set_real_ip_from 10.98.0.0/24` y toma `CF-Connecting-IP`, garantizando la IP real y fijando `via_cloudflare="1"`. Registra en JSON las cabeceras internas devueltas por Django y las suprime hacia el cliente con `proxy_hide_header`.
4. **`honeypot-app` (Django 5.1 / Gunicorn en `python:3.12-slim`):** Ejecutado sin privilegios y sistema de solo lectura (`read_only: true`, con `/tmp` en *tmpfs*). Genera el laberinto y valida los tokens.
5. **Observabilidad (`telemetry_net`):** `promtail:3.5.0` transmite `honeypot_access.json` hacia `loki:3.5.0`, visualizado vía `grafana:12.0.0` en `127.0.0.1:3000`. El servicio `geoipupdate:v7.1.0` mantiene al día `GeoLite2-ASN.mmdb`.

### 2.2. Aislamiento y recuperación de la dirección IP real

Para impedir la inyección arbitraria de la cabecera `CF-Connecting-IP`, Nginx restringe la directiva `set_real_ip_from` a la subred del túnel (`10.98.0.0/24`) [21]:

```nginx
# Fragmento de nginx/nginx.conf y conf.d/honeypot.conf
include /etc/nginx/snippets/cloudflare_realip.conf;  # set_real_ip_from 10.98.0.0/24;
real_ip_header CF-Connecting-IP;

geo $realip_remote_addr $via_cloudflare {
    default 0;
    include /etc/nginx/snippets/cloudflare_geo.conf; # 1 si proviene de Cloudflare
}

# En el bloque location: supresión de diagnóstico interno
proxy_hide_header X-Honeypot-Route;
proxy_hide_header X-Honeypot-Technique;
proxy_hide_header X-Honeypot-Token-Issued;
proxy_hide_header X-Honeypot-Depth;
```

Si una petición no procede del túnel, `$via_cloudflare` vale `0` y Nginx descarta cualquier `CF-Connecting-IP` inyectada. Las cabeceras `X-Honeypot-*` se asientan atómicamente en el log JSON y se ocultan al cliente.

### 2.3. Construcción del token criptográfico sin estado (HMAC-SHA256)

Cada enlace emitido hacia `/public/<token>` o `/archivo-interno/<token>` incorpora un identificador de **52 caracteres hexadecimales** (208 bits) [22]:

$$\text{Token (52 hex)} = \underbrace{\text{UUID4}}_{32\text{ hex (128 b)}} \;\|\; \underbrace{t_{\text{emisión}}}_{8\text{ hex (32 b)}} \;\|\; \underbrace{d}_{2\text{ hex (8 b)}} \;\|\; \underbrace{\sigma}_{10\text{ hex (40 b)}}$$

donde $t_{\text{emisión}}$ es el timestamp Unix, $d \in [0, 255]$ es la profundidad y $\sigma$ son los primeros 40 bits de la firma:

$$\sigma = \text{HMAC-SHA256}_{K}\big(\text{UUID4} \;\|\; t_{\text{emisión}} \;\|\; d \;\|\; \text{técnica}\big)[0:10]$$

La `técnica` forma parte del mensaje autenticado pero **no viaja explícita en la URL**. La rutina `decode()` prueba la firma contra las técnicas válidas con `hmac.compare_digest()`:

```python
# Fragmento del núcleo de verificación en honeypot/trap/tokens.py
def decode(token_id: str) -> Token:
    token_id = token_id.lower()
    if len(token_id) != 52 or any(c not in "0123456789abcdef" for c in token_id):
        return Token(token_id, "invalid", None, None)
    uid, ts_hex, depth_hex, sig = token_id[:32], token_id[32:40], token_id[40:42], token_id[42:]
    for technique in ALL_TECHNIQUES:  # 5 variantes de trampa + 1 pública
        if hmac.compare_digest(sig, _sign(uid, ts_hex, depth_hex, technique)):
            return Token(token_id, technique, int(ts_hex, 16), int(depth_hex, 16))
    return Token(token_id, "invalid", None, None)
```

Esto recupera técnica, profundidad e instante en tiempo $O(1)$ sin disco, con resistencia a colisiones accidentales de $6 / 2^{40} \approx 5,46 \times 10^{-12}$.

**Truncamiento a 40 bits:** El RFC 2104 [22] recomienda no truncar por debajo de 80 bits para evitar colisiones forjadas activas. En nuestro diseño se adoptaron 40 bits para mantener la URL en 52 caracteres: el token no custodia secretos, sino que etiqueta enlaces propios. Forjar un token requeriría $\sim 1,8 \times 10^{11}$ peticiones en línea, inviable en nuestro tráfico (§4.5).

### 2.4. Laberinto dinámico, técnicas de ocultamiento CSS y taxonomía de violaciones

Cada página ($d \le 10$) renderiza metadatos simulados e inserta **10 hiperenlaces**:
- **5 enlaces públicos** hacia `/public/<token>`.
- **5 enlaces trampa** hacia `/archivo-interno/<token>` (`random.shuffle`), correspondientes a cinco variantes:
  1. `visible`: Renderizado en claro dentro de un párrafo (control no oculto).
  2. `display_none_inline`: En `<div style="display:none">`.
  3. `display_none_class`: En `<div class="<rnd>">` con clase `.<rnd>{display:none}` en `<style>`.
  4. `opacity_0`: En `<div class="<rnd>">` con `opacity:0; pointer-events:none; height:0`.
  5. `offscreen`: Posicionado fuera de pantalla (`left:-10000px; top:-10000px`).

Los nombres de clase CSS se regeneran pseudoaleatoriamente (`secrets.token_hex(4)`), neutralizando filtros estáticos. A profundidad $d = 10$, se emite una página hoja desprovista de enlaces ($d = 11$), acotando la exploración del bot.

El archivo `/robots.txt` servido fue:
```text
User-agent: *
Disallow: /archivo-interno/
```
Esta directiva representa la condición más benigna posible: restringe solo un prefijo señuelo, dejando el resto del árbol habilitado.

**Taxonomía de violaciones:**
- **Nivel 1 (Violación Directa):** Descarga `/robots.txt` y luego accede a `/archivo-interno/*` (desobediencia consciente).
- **Nivel 2 (Violación por Omisión):** Accede a `/archivo-interno/*` sin haber consultado `/robots.txt`.
- **Nivel 3 (Extracción Ciega / Sin Renderizado CSS):** Accede a la trampa mediante alguna modalidad oculta (`display_none_inline`, `display_none_class`, `opacity_0`, `offscreen`). Refleja análisis léxico sin computación visual de Render Tree.

---

## 3. Caso práctico

### 3.1. Simulación local, despliegue en producción y siembra

**Simulación local:** Previo al despliegue, se validó el stack en un entorno cerrado (`127.0.0.1`) con `docker-compose.local.yml`. El arnés `local/simulate.py` ejecutó seis clientes automatizados: GPTBot y Bytespider simulados cayeron en la trampa generando violaciones Nivel 1 y 2 (con Nivel 3), mientras que Googlebot y ClaudeBot simulados respetaron las rutas públicas, sin fugas de cabeceras `X-Honeypot-*`.

```powershell
# Puesta en producción con túnel saliente
docker compose -f docker-compose.yml -f docker-compose.home.yml --profile maxmind up -d --build
docker compose logs cloudflared --tail 20  # Confirmación de estado "HEALTHY"
```

**Parámetros de borde en Cloudflare:** Se desactivaron intencionalmente *Block AI Bots*, *AI Crawl Control*, *Managed robots.txt*, *AI Labyrinth*, *Bot Fight Mode* y la optimización de HTML, fijando *Bypass Cache* para derivar todo el tráfico al origen. Las reglas perimetrales base de Capa 3/4 y L7 bloquearon 53 escáneres antes del túnel.

**Siembra activa de URLs y descubrimiento:** El 18/10/2026 se generaron URLs semilla públicas con `manage.py seed_urls` y se publicaron activamente en un repositorio público de **GitHub** y en **Hacker News**, además de foros técnicos. Sin embargo, en los registros, **las peticiones con tokens de semilla específicos registraron exactamente 0 accesos directos**, evidenciando que ningún crawler ingresó directamente siguiendo dichos enlaces. El rastreo comenzó orgánicamente mediante el descubrimiento de la raíz `/` y `/robots.txt` a través de los registros de *Certificate Transparency* (CT logs tras emitirse el certificado TLS) y la indexación inicial del dominio, registrándose únicamente 1 petición con `Referer: https://news.ycombinator.com/` y 51 de Google sin token de semilla.

**Ventana experimental:** Del 18/10/2026 21:31:02 UTC al 30/10/2026 17:57:05 UTC (11 días, 20 horas y 26 minutos). El log crudo acumuló 3.568.406 líneas JSON (3,45 GB en disco).

**Verificación operativa:** La inyección de enlaces y supresión de cabeceras se validaron por PowerShell:
```powershell
# Verificar robots.txt, 5 enlaces trampa y supresión de cabeceras internas
(curl.exe -s https://definitivamente-no-hay-trabas.com.ar/robots.txt) -match "Disallow: /archivo-interno/"
(curl.exe -s https://definitivamente-no-hay-trabas.com.ar/ | Select-String '/archivo-interno/').Count
curl.exe -sI https://definitivamente-no-hay-trabas.com.ar/ | Select-String x-honeypot
```

### 3.2. Evidencia concreta: registros crudos, secuencia de captura y panel de Grafana

La siguiente traza real de Nginx ilustra la interacción del origen infractor **`154.28.229.0/24`** el **21 de octubre de 2026 a las 03:51 UTC**. Tras una descarga de la portada a las `03:51:32.371`, transcurren apenas **221 ms** hasta que solicita enlaces públicos y trampas en paralelo a razón de ~5 req/s sin haber consultado `/robots.txt`:

```text
03:51:20.358  GET /                                   route=home
03:51:32.371  GET /                                   route=home
03:51:32.592  GET /public/1f79...                     route=public  link_depth=1  (221 ms tras segundo GET /)
03:51:32.789  GET /                                   route=home
03:51:32.977  GET /archivo-interno/...                route=trap    technique=visible              link_depth=1
03:51:33.168  GET /public/...                         route=public  link_depth=1
03:51:33.634  GET /archivo-interno/...                route=trap    technique=offscreen            link_depth=1
03:51:33.816  GET /public/...                         route=public  link_depth=1
03:51:34.013  GET /public/...                         route=public  link_depth=1
03:51:34.194  GET /archivo-interno/...                route=trap    technique=display_none_inline  link_depth=1
03:51:34.377  GET /public/...                         route=public  link_depth=1
03:51:34.581  GET /archivo-interno/...                route=trap    technique=opacity_0            link_depth=1
03:51:34.763  GET /archivo-interno/...                route=trap    technique=display_none_class   link_depth=1
03:51:34.947  GET /public/...                         route=public  link_depth=2
```

La latencia del origen (`request_time`) registró mediana (**p50**) de **2 ms** y percentil 99 (**p99**) de **3 a 4 ms**. En telemetría, Grafana indexó eventos vía Loki con LogQL [23]:

```logql
sum(count_over_time({job="honeypot", route="trap"}[$__range]))
sum by (technique) (count_over_time({job="honeypot", route="trap"}[$__range]))
```

La **Figura 1** ilustra el estado del panel en un corte intermedio (2,95 M de peticiones). En el panel se observan 213 accesos brutos a `/trap/`; al sustraer los 6 accesos de prueba académica del equipo sobre `opacity_0`, se obtienen exactamente los **207 accesos netos** (y 39 en `opacity_0`) del dataset limpio. La métrica conserva la etiqueta `/trap/` por la nomenclatura interna del dashboard (`route="trap"`), vinculada a `/archivo-interno/`.

![Dashboard de Grafana en producción](graficos/grafana-dashboard-produccion.jpg)
*Figura 1. Tablero de Grafana en producción en un corte intermedio (2,95 M de peticiones), exhibiendo el perfil temporal de rastreo y la distribución de violaciones brutas en `/trap/`.*

### 3.3. Depuración del conjunto de datos y lecciones operativas

**Depuración del conjunto de datos:** Se auditaron y removieron 57 solicitudes atribuibles a verificaciones del despliegue:
- `honeypot-selftest/1.0`: 15 peticiones de validación funcional.
- Subred de control del equipo `45.191.81.0/24` (Argentina): 8 accesos manuales con Opera.
- Subred de pruebas del equipo `186.124.199.0/24` (Argentina): 24 solicitudes con `curl -A` de diversos bots.
- Subred de prueba del equipo `181.4.69.0/24` (Argentina, 20/10 23:22 UTC): 8 solicitudes con navegador Chrome (solicitud de `/favicon.ico`, cabecera `Referer` válida y 6 clics sobre enlaces `opacity_0`). Se confirmó formalmente por los autores que correspondió a una prueba interna de verificación y revisión docente desde Argentina. El uso de DevTools para activar enlaces con `opacity:0` (invisibles al renderizado normal) es consistente con una auditoría para comprobar las trampas, ratificando su exclusión del conjunto de crawlers externos.
- Peticiones locales (`via_cloudflare = 0`): 2 controles de salud internos.

El dataset depurado final comprendió **3.568.349 peticiones válidas**.

**Incidencias operativas resueltas:**
1. *Detención de `analytics`:* El procesamiento batch colapsó al escalar el volumen (GPTBot con 132k req/día el 21/10 y ClaudeBot con 887k req/día el 24/10). La consulta masiva a Loki agotó la memoria del contenedor, resolviéndose el cómputo final mediante scripts de lectura en streaming sobre el log exportado.
2. *Interrupción nocturna:* Una interrupción del anfitrión el 27/10 ocasionó un vacío de captura de 8 horas y 57 minutos (~64.000 peticiones estimadas de GPTBot no registradas a ~7.180 req/h).
3. *Crecimiento de registros:* El archivo JSON acumuló 3,45 GB en disco (~291 MB diarios), requiriendo esquemas de rotación atómica (`logrotate`) y compresión `gzip`.

### 3.4. Resultados empíricos obtenidos

#### 3.4.1. Distribución general del tráfico y consulta delegada
El tráfico se distribuyó sobre 3.560.629 visitas públicas (`/public/`, 99,78 %), 6.203 respuestas `404 Not Found` (0,17 %), 776 solicitudes a la raíz `/`, 529 descargas de `/robots.txt`, 207 accesos a `/archivo-interno/` y 5 errores de cliente (4 HTTP 413 y 1 HTTP 400), totalizando con precisión:
$$3.560.629 + 6.203 + 776 + 529 + 207 + 5 = \mathbf{3.568.349}$$

**Tabla 1. Panorama de actividad por familia de agente clasificada.**

| Familia | Categoría | Peticiones | % Total | Subredes `/24` | Datos (GB) | `robots.txt` | Accesos a Trampa |
|---|---|---:|---:|---:|---:|---:|---:|
| **ClaudeBot** (Anthropic) | IA | 1.989.866 | 55,77 % | 4 | 6,11 GB | 155 | **0** |
| **GPTBot** (OpenAI) | IA | 1.558.875 | 43,69 % | 4 | 4,72 GB | 0 * | **0** |
| **GoogleOther** (Google) | I+D / IA [24] | 10.702 | 0,30 % | 5 | 0,04 GB | 0 * | **0** |
| **Navegadores** (Camuflados) | Sin marca | 7.036 | 0,20 % | Múltiples | 0,004 GB | 12 | **207** |
| **Googlebot** (Google) | Buscador | 1.532 | 0,04 % | 4 | 0,003 GB | 297 | **0** |
| **OAI-SearchBot** (OpenAI) | IA / Búsqueda | 49 | <0,01 % | 3 | <0,001 GB | 49 | **0** |
| **Applebot** (Apple) | Buscador | 2 | <0,01 % | 1 | <0,001 GB | 2 | **0** |
| **Herramientas / Escáneres / Otros** | Varios | 287 | <0,01 % | Múltiples | <0,001 GB | 14 | **0** |
| **TOTAL** | — | **3.568.349** | **100,00 %** | — | **~10,9 GB** | **529** | **207** |

*\* Sin consultas directas de `robots.txt`; compatible con consulta centralizada por operador (§3.4.3). La columna `/24` proviene de `bots.py` y no coincide uno a uno con la Tabla 2. El tráfico procedió de al menos 1.000 IPs distintas. La serie temporal completa se detalla en el Anexo A.*

![Evolución diaria del volumen de tráfico por familia](graficos/serie-diaria.png)
*Figura 2. Volumen diario de peticiones por familia (UTC), evidenciando el pico de ráfagas de ClaudeBot y la cadencia determinística de GPTBot.*

#### 3.4.2. Dinámicas de rastreo de ClaudeBot y GPTBot
- **ClaudeBot (Anthropic):** Consumo por lotes. Mediana de edad de token (`tok_age`) de **5,0 h** (piso de 1 h), sin cabecera `Referer`. Ráfagas de hasta **38.787 req/h** (~10,8 req/s), disminuyendo desde el 25/10.
- **GPTBot (OpenAI):** Consumo continuo en flujo. Mediana de **8,9 s** entre emisión y pedido y `Referer` en el 100 % de las solicitudes. Tasa horaria constante (mediana de **7.184 req/h** ≈ 2,0 req/s, CV = 0,068), compatible con *token bucket*. El 30/10 acumuló 128.201 peticiones en 17,95 h (7.140 req/h ≈ 1,98 req/s).

Ambos alcanzaron la profundidad máxima ($d = 10$): entre el 68 % y el 72 % de sus peticiones correspondieron a nodos hoja sin enlaces ($d = 11$; Figura 3 y Anexo C). La ramificación efectiva ($b \approx 3,2$ en ClaudeBot y $\approx 3,6$ en GPTBot, frente a 5 teórico) refleja enlaces no visitados retenidos en las colas de los operadores.

![Distribución de solicitudes por nivel de profundidad](graficos/profundidad.png)
*Figura 3. Solicitudes por nivel de profundidad en escala logarítmica frente a la ramificación teórica.*

#### 3.4.3. Consulta centralizada de `robots.txt` y verificación de rangos IP
Un análisis puramente literal de User-Agent sugeriría que `GPTBot` (1,56 millones de peticiones) y `GoogleOther` (10.702 peticiones) rastrearon sin consultar `robots.txt`. Sin embargo, los registros temporales y de red son **compatibles con** una consulta centralizada compartida:
- **OpenAI:** El 21/10 a las 05:30:30.494 UTC, `OAI-SearchBot` descargó `/robots.txt`. Apenas **749 ms después**, `GPTBot` inició la descarga masiva desde el mismo Sistema Autónomo, refrescando la directiva cada 360 minutos (49 descargas) sin solicitar HTML. Esto concuerda con una directiva compartida en caché por el operador.
- **Google:** `Googlebot` realizó 297 consultas a `/robots.txt`; `GoogleOther` comparte con él sus IPs principales y la subred `66.249.73.0/24`, coherente con una infraestructura común.

**Validación contra prefijos publicados y registro ARIN:** Contrastamos las subredes de origen observadas contra los endpoints oficiales y listas de prefijos mediante [`scripts/verificar_rangos_ip.py`](https://github.com/Gio-glitch04/crawler-honeypot/blob/main/scripts/verificar_rangos_ip.py) [24, 25, 26, 27]:

**Tabla 2. Subredes observadas y cobertura verificada por operador** (generada con `scripts/generar_tablas.py` a partir de `data/verificacion_rangos.csv`).

| Operador | Subredes observadas (peticiones) | AS (BGP) | Fuente de verificación | Verificadas / total | Cobertura |
|---|---|---|---|---:|---:|
| **Anthropic** | `216.73.217.0/24` (1.590.538); `216.73.216.0/24` (399.324); `34.162.0.0/16` (4) | AS16509, AS396982 | Registro ARIN `216.73.216.0/22` [27] (Anthropic no publica lista de prefijos) | 1.989.862 / 1.989.866 | **99,9998 %** |
| **OpenAI** | `74.7.242.0/24` (1.557.329); `132.196.86.0/24` (751); `172.182.207.0/24` (410); `172.182.202.0/24` (385); `74.7.175.0/24` (38, OAI-SearchBot); `74.7.230.0/24` (9, OAI-SearchBot); `51.8.102.0/24` (2, OAI-SearchBot) | AS8075 | `gptbot.json` [25] y `searchbot.json` [26] | 1.558.924 / 1.558.924 | **100,00 %** |
| **Google** | `66.249.73.0/24` (12.119); `192.178.6.0/24` (94); otros /24 de 66.249.x (sin desglose) (21) | AS15169 | `googlebot.json` y `special-crawlers.json` [24] | 12.213 / 12.234 | **99,8283 %** |

*Notas.* (i) Anthropic no publica lista oficial de prefijos JSON; la verificación descansa en la titularidad del bloque `216.73.216.0/22` en ARIN (`NET-216-73-216-0-1`). Las 4 peticiones desde `34.162.0.0/16` (Google Cloud) quedan fuera de ese bloque y **no están verificadas**. (ii) Para OpenAI y Google, un `/24` cuenta como verificado si se solapa con un prefijo publicado (`/25`, `/27`). (iii) En Google, 21 peticiones ocurrieron en otros `/24` de `66.249.x` cuyo desglose no se conserva en los agregados y se computan como no verificadas (cobertura 99,83 %).

#### 3.4.4. Evaluación estadística y análisis de las violaciones
Dado que la decisión de acatar `robots.txt` responde a una política centralizada por organización y no a eventos independientes por enlace, la unidad de análisis válida es el **operador**:

**Tabla 3. Cumplimiento de exclusión por operador observado.**

| Operador | Crawlers activos | Páginas con enlaces | Enlaces trampa expuestos | Trampas seguidas | Tasa observada |
|---|---|---:|---:|---:|---:|
| **Anthropic** | ClaudeBot | 628.124 | 3.140.620 | 0 | 0,00 % |
| **OpenAI** | GPTBot, OAI-SearchBot | 436.250 | 2.181.250 | 0 | 0,00 % |
| **Google** | GoogleOther, Googlebot | 8.690 | 43.450 | 0 | 0,00 % |
| **TOTAL** | — | **1.073.064** | **5.365.320** | **0** | **0,00 %** |

A nivel muestral, **3 de 3 operadores declarados acataron plenamente el protocolo en este sitio señuelo**. Con $n = 3$ y $k = 0$, la cota superior unilateral exacta de Clopper-Pearson al 95 % de confianza para la proporción de operadores infractores es $1 - 0,05^{1/3} \approx 63,2\%$ (70,8 % bilateral) [28]. Tratadas descriptivamente a nivel de enlaces expuestos, las cotas individuales arrojan $9,54 \times 10^{-7}$ para ClaudeBot y $1,37 \times 10^{-6}$ para GPTBot (detalladas en el Anexo D).

**Validez de la variante visible:** Las variantes trampa ocultas por CSS introducen factores de confusión si un bot descarta elementos no visibles. La evidencia limpia radica en la variante `visible`, expuesta 1.073.064 veces ante los tres operadores con 0 accesos registrados, contrastando con el seguimiento masivo de enlaces visibles hacia `/public/`.

**Análisis de las violaciones a la ruta trampa:** Se capturaron **207 accesos a la ruta prohibida `/archivo-interno/`**, originados en su totalidad por **6 direcciones IP** con cabeceras de navegadores de escritorio comerciales (`Chrome/124–150`).

**Tabla 4. Perfil sintetizado de los 6 orígenes IP que accedieron a `/archivo-interno/`.**

| Actor | Subred IP (/24) | Peticiones | Accesos a Trampa | Perfil observado y clasificación conductual |
| :--- | :--- | ---: | ---: | :--- |
| **A1** | `154.28.229.0/24` | 90 | **43** | `Chrome/131` Linux/macOS, `en-US`; barrido rápido hasta prof. 2 |
| **A2** | `103.196.9.0/24` | 111 | **53** | `Chrome/130–131` Linux, `en-US`; idéntico perfil y cadencia que A1 |
| **C** | `158.69.55.0/24` | 200 | **98** | `Chrome/124` Win10, sin idioma; 2 sesiones de 100 reqs exactas |
| **B1** | `93.123.109.0/24` | 334 | **4** | `Chrome/150` Win10, `fr-FR`; sondeos `.git` (315 respuestas 404) |
| **B2** | `45.138.12.0/24` | 297 | **4** | `Chrome/150` Win10, `fr-FR`; idéntico diccionario y cabeceras que B1 |
| **D** | `45.138.12.0/24` | 14 | **5** | `Chrome/133` Linux/Win; visitas aisladas espaciadas en 7 días |

*(Nota: Desglose forense de 13 columnas en el Anexo B. B2 y D comparten la misma subred `/24` con perfiles temporales distintos).*

Ninguno de estos actores solicitó `/robots.txt` (**100 % Nivel 2**). Respecto a la presentación, 43 accesos ingresaron por `visible` y 164 por modalidades ocultas, determinando que **164 de 207 solicitudes (79,2 %) constituyeron infracciones de Nivel 3**.

**Distribución por técnica CSS:** La distribución observada (43 en `visible`, 43 en `display_none_inline`, 42 en `offscreen`, 40 en `display_none_class`, 39 en `opacity_0`) arrojó una bondad de ajuste $\chi^2 = 0,3188$ ($\text{gl} = 4, p = 0,9886$). Un extractor que recopila indiscriminadamente atributos `href` converge a la uniformidad por diseño de la plantilla. Las 207 observaciones no son independientes (proceden de 6 IPs); este ajuste es consistente con extracción sin renderizado visual.

![Accesos a la trampa por técnica de ocultamiento](graficos/trampa-tecnicas.png)
*Figura 4. Accesos a la ruta prohibida por variante técnica frente a la frecuencia uniforme esperada.*

**Caracterización técnica:** El Grupo B combinó sondeos de directorios Git (`/.git/config`) y endpoints RSC (`/_next/rsc`) con la recolección de enlaces de portada. Chrome/150 era la versión estable vigente en la fecha del ensayo [29], mientras que los perfiles C (Chrome/124), A (Chrome/130–131) y D (Chrome/133) exhibían cadenas desactualizadas, típicas de scripts con cabeceras codificadas estáticamente. El indicador empírico más determinante de automatización es que **ninguno de los 6 orígenes solicitó `/favicon.ico`**, recurso pedido por omisión por un navegador real en una portada. Como control positivo, la visita del equipo con Chrome real (subred `181.4.69.0/24`, §3.3) sí lo solicitó (`GPTBot` lo pidió una vez, ratificando que la omisión es un indicio complementario). No existe evidencia que vincule a estos 6 actores con centros de LLMs; se trata de escáneres y extractores no cooperativos.

---

## 4. Análisis crítico

### 4.1. Ventajas y limitaciones de la técnica
**Ventajas:** Alta relación señal/ruido (toda interacción en la ruta prohibida es anómala [6]); escalabilidad sin estado (HMAC-SHA256 procesó 3,57 millones de transacciones con latencias de 2 ms sin base de datos por petición); y observabilidad del protocolo (revela frecuencias de refresco, procesamiento por lotes y gestión de frontera).  
**Limitaciones:** Detectabilidad del entorno sintético ante navegadores *headless* con evaluación de layout (`checkVisibility()`); alcance observacional pasivo restringido a quienes visitan el señuelo; y riesgo de agotamiento de cuotas por host en los crawlers.

### 4.2. Casos reales documentados en la industria
1. **Project Honey Pot (http:BL):** Páginas trampa para identificar IPs de spammers mediante listas DNS dinámicas [13].
2. **Cloudflare vs. Perplexity (2025):** Demostración mediante señuelos de que ciertos proveedores eludían `robots.txt` vía agentes secundarios [30].
3. **AI Labyrinth de Cloudflare (2025):** Laberintos infinitos generados por modelos en el borde para agotar cuotas de scrapers hostiles [18, 31].
4. **T-Pot (Deutsche Telekom Security):** Plataforma modular de honeypots en producción alimentando portales globales de amenazas [32].
5. **Canarytokens (Thinkst):** Honeytokens en código y credenciales que alertan ante aperturas no autorizadas [17].

### 4.3. Comparación con herramientas afines

**Tabla 5. Comparativa técnica de alternativas frente a la auditoría de crawlers.**

| Enfoque | Objetivo primordial | Telemetría / Atribución | Ventaja distintiva | Limitación metodológica |
|---|---|---|---|---|
| **Nuestro Honeypot L7** | **Auditar cumplimiento empírico** de directivas | Nivel exacto, profundidad, latencia y técnica CSS | Sin estado, reproducible, no discriminatorio | Baja interacción; no detecta headless con layout |
| **AI Labyrinth** (Cloudflare) [18, 31] | **Mitigar / Disuadir** mediante laberinto de texto IA | Eventos agregados (*Served* / *Crawls*) en consola | Nativo en CDN; disponible en plan gratuito | Propietario; aplica trampas según clasificación previa |
| **Nepenthes** (Tarpit IA actual) [33] | **Atrapar y agotar** crawlers infractores | Registro de solicitudes en laberinto determinista | Respuestas lentas deliberadas y polución de datos | Diseñado como contramedida agresiva, no auditoría |
| **Tarpits clásicos** (LaBrea) [12] | Retener gusanos de red en Capa 4 | Persistencia de sockets TCP | Consumo despreciable de recursos del host | Inaplicable a la lógica semántica de HTTP y robots.txt |
| **Honeytokens** (Canarytokens) [17] | Detección puntual de filtraciones | Alerta unitaria por apertura de recurso | Despliegue veloz y cero falsos positivos | Alerta atómica; no mide profundidad ni dinámicas |
| **Mecanismos PoW** (Turnstile [34], Anubis [35]) | **Prevención activa** de scraping | Desafíos criptográficos resueltos en cliente | Eleva el costo computacional del scraper | Barrera de bloqueo; no mide cumplimiento voluntario |

### 4.4. Relación con la literatura previa
Nuestros resultados dialogan directamente con trabajos contemporáneos:
- **Kim et al. (IMC 2025) [4]:** Evaluaron 130 bots durante 40 días, concluyendo que el cumplimiento decae ante directivas más restrictivas y advirtiendo sobre el falseamiento de User-Agents. La ausencia de violaciones de los tres operadores observados en nuestro trabajo coincide con su hallazgo de que las directivas benignas son respetadas por los grandes proveedores.
- **Liu et al. (IMC 2025) [5]:** Evaluaron herramientas defensivas y rastreo de IA desde la perspectiva de creadores de contenido, observando que los principales agentes respetan las directivas explícitas de exclusión, resultado que nuestro estudio corrobora de forma independiente en un entorno de producción para ClaudeBot y GPTBot.
- **Agentes no cooperativos (Bytespider):** En la literatura [4, 5] se identifica a Bytespider (ByteDance) como un agente frecuentemente no cooperativo que desatiende restricciones de exclusión. Aunque en nuestra simulación local Bytespider incurrió en violaciones Nivel 1 y 2, en el despliegue en producción no se registró tráfico de dicho operador, una limitación comentada en §4.5.

### 4.5. Amenazas a la validez
- **Directiva única y benigna:** La regla ensayada (`Disallow: /archivo-interno/`) fue la más permisiva posible; la literatura muestra mayor desobediencia al restringir la raíz (`Disallow: /`) [4].
- **Sitio web único y aislado:** Dominio nuevo sin tráfico humano previo ni reputación SEO.
- **Ventana temporal de 12 días:** Crawlers periódicos o no observados en este lapso (como Bytespider, CCBot o PerplexityBot) no pudieron ser caracterizados.
- **No independencia de observaciones:** Los 207 accesos trampa proceden de 6 direcciones IP; computar cada enlace individual constituiría pseudorreplicación.
- **Truncamiento HMAC a 40 bits:** Menor a los 80 bits recomendados por el RFC 2104 [22], compensado operativamente por la inviabilidad de ataques en línea ($\sim 1,8 \times 10^{11}$ peticiones).

### 4.6. Consideraciones éticas, privacidad y reproducibilidad
- **Minimización de datos y Ley 25.326:** Conforme a la legislación argentina de protección de datos personales [36], todas las IPs públicas en reportes se anonimizan a nivel `/24`. No se recolectaron cookies, credenciales ni datos personales; el 100 % del tráfico provino de procesos automáticos. Los registros originales se preservan cifrados para fines académicos.
- **Impacto sobre crawlers:** El laberinto no utilizó técnicas de polución maliciosa (*data poisoning*) y acotó la profundidad a $d \le 10$ para contener el consumo de recursos de los operadores.
- **Reproducibilidad:** El repositorio público incluye el código del honeypot, esquemas de Docker Compose, CSVs canónicos en `data/` y scripts de procesamiento: [`scripts/generar_tablas.py`](https://github.com/Gio-glitch04/crawler-honeypot/blob/main/scripts/generar_tablas.py), [`scripts/verificar_rangos_ip.py`](https://github.com/Gio-glitch04/crawler-honeypot/blob/main/scripts/verificar_rangos_ip.py) y [`scripts/estadisticas_y_graficos.py`](https://github.com/Gio-glitch04/crawler-honeypot/blob/main/scripts/estadisticas_y_graficos.py). El procesamiento final fuera de línea se realizó mediante un script de lectura en streaming en Python sobre `honeypot_access.json.tar.gz` (extrayendo marcas temporales, IP, User-Agent, URI y código de respuesta HTTP para poblar las series canónicas en `data/`), complementado por las herramientas analíticas del repositorio.

---

## 5. Conclusiones y trabajos futuros

### 5.1. Cuándo conviene (y cuándo no) implementar esta tecnología
**Cuándo conviene:** En investigación y auditoría técnica para discriminar tráfico cooperativo de scrapers camuflados; en infraestructuras de contenido crítico como sondas internas para alimentar listas de bloqueo; y para medir empíricamente cadencia, ancho de banda y colas de crawlers masivos.  
**Cuándo no conviene:** Como sustituto de defensas perimetrales activas (un honeypot documenta pero no bloquea); sin aislamiento de dominio o límite de profundidad (riesgo de auto-DoS ante millones de descargas); y ante scrapers headless avanzados con evaluación visual de layout.

### 5.2. Conclusiones del estudio
1. **Acatamiento estricto de agentes declarados:** ClaudeBot, GPTBot/OAI-SearchBot y Googlebot/GoogleOther respetaron el 100 % de las directivas en el sitio señuelo, con correspondencia verificada contra los prefijos publicados de OpenAI y Google y contra el registro ARIN para Anthropic.
2. **Origen de las infracciones:** El 100 % de las 207 violaciones provino de 6 actores que ocultaban su identidad tras navegadores comerciales, con 100 % Nivel 2 (omisión de consultar `robots.txt`) y 79,2 % Nivel 3 (extracción ciega sin renderizado CSS).
3. **Alcance estadístico del estándar:** Con $n = 3$ operadores, la cota de Clopper-Pearson al 95 % es del $63,2 \%$, lo que demuestra que el tamaño muestral de operadores no permite generalizar al conjunto de la web ni ante directivas restrictivas. El protocolo carece de utilidad defensiva contra recolectores no declarados.
4. **Eficiencia del diseño sin estado:** Los tokens HMAC de 52 caracteres absorbieron 3,57 millones de transacciones con latencia mediana de 2 ms sin interactuar con base de datos por petición.

### 5.3. Trabajos futuros
1. **Políticas de exclusión restrictivas:** Evaluar directivas restrictivas (`Disallow: /`) y reglas diferenciadas por User-Agent [4].
2. **Ampliación de siembra y atribución:** Extender la difusión hacia repositorios adicionales (Hugging Face, Reddit) para evaluar latencias de indexación y atraer bots ausentes (`Bytespider`, `CCBot`, `PerplexityBot`).
3. **Inspección de Capa 4:** Implementar terminación TLS o Client Hints (`Sec-CH-UA`) para obtener huellas digitales JA4 independientes de cabeceras HTTP.
4. **Trampas DOM avanzadas:** Incorporar trampas en comentarios HTML, inyecciones JavaScript y sitemaps XML.
"""

doc_path = "crawler-honeypot/docs/entrega/INFORME_TRABAJO_INVESTIGACION_HONEYPOT.md"
with open(doc_path, "r", encoding="utf-8") as f:
    orig = f.read()

bib_pos = orig.find("## 6. Bibliografía")
bib_and_annex = orig[bib_pos:]

full_doc = body_content.strip() + "\n\n---\n\n" + bib_and_annex.strip() + "\n"

# Verify metrics
m = re.search(r"(## 1\. Introducción.*?)(## 6\. Bibliografía)", full_doc, re.DOTALL)
if m:
    body_words = len(m.group(1).split())
    print(f"Body words (§1 to §5): {body_words}")

total_words = len(full_doc.split())
print(f"Total words: {total_words}")
print(f"Occurrences of COMPLETAR: {full_doc.count('COMPLETAR')}")

# Write to both locations
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(full_doc)

with open("INFORME_TRABAJO_INVESTIGACION_HONEYPOT.md", "w", encoding="utf-8") as f:
    f.write(full_doc)

print("Both files successfully updated.")
