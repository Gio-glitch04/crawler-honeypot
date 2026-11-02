# Honeypots web para medir el cumplimiento de `robots.txt` (RFC 9309): diseño con tokens HMAC sin estado y estudio de caso en un dominio señuelo

**Joel Jesús Marcori, Julio César Pintos, Giovanni Oscar Piazza**  
Facultad de Ciencias Exactas, Naturales y Agrimensura (FaCENA), Universidad Nacional del Nordeste (UNNE). Corrientes, Argentina.  
Cátedra de Internetworking, 2026. Contacto: {joelmarcori1, juliopintoscesar, gpiazza1804}@gmail.com  
Repositorio: <https://github.com/Gio-glitch04/crawler-honeypot> — Dominio experimental: `definitivamente-no-hay-trabas.com.ar`

---

## Resumen

Este trabajo analiza la técnica de *honeypot* (señuelo) aplicada a la auditoría empírica del Protocolo de Exclusión de Robots (`robots.txt`, RFC 9309). Se presenta el marco general de la disciplina (*deception*, baja y alta interacción, *honeynets*, *tarpits*, *honeytokens*) y se compara nuestro enfoque con alternativas de la industria, incluyendo AI Labyrinth de Cloudflare y tarpits modernos contra recolectores de inteligencia artificial. Describimos la arquitectura e implementación de un honeypot de capa de aplicación que genera un laberinto dinámico de páginas y enlaces señuelo codificados en tokens criptográficos HMAC-SHA256 de 52 caracteres hexadecimales, preservando el estado experimental en la URL sin requerir base de datos en el servidor, con profundidad acotada (`HONEYPOT_MAX_DEPTH = 10`, hojas terminales en nivel 11). Desplegado durante 11,85 días en producción sobre un dominio propio vía Cloudflare Tunnel en un anfitrión con Windows 10 y Docker Desktop (WSL 2), el sistema procesó **3.568.349 peticiones válidas** (~10,9 GB de carga útil). Los tres operadores de crawlers declarados que recorrieron el laberinto (Anthropic con `ClaudeBot`, OpenAI con `GPTBot` y `OAI-SearchBot`, y Google con `Googlebot` y `GoogleOther`, que sumaron el **99,8 %** del tráfico) registraron **0 accesos a la ruta prohibida** sobre más de 5,36 millones de enlaces trampa expuestos (100 % de cumplimiento en el sitio señuelo). La verificación de red constató que las subredes que concentraron más del 99,9 % del tráfico de cada operador coincidieron con los rangos oficiales de IP publicados y registros BGP/RDAP (`AS16509`, `AS8075`, `AS15169`). En el caso de Anthropic, la verificación sobre el registro ARIN RDAP del bloque `/22` arrojó una cobertura del **99,9998 %** (1.989.862 de 1.989.866 peticiones), con 4 peticiones provenientes de GCP no verificadas. Enmarcado estadísticamente a nivel de operador ($n = 3, k = 0$), el hallazgo arroja una cota superior exacta de Clopper-Pearson al 95 % de **63,2 %** (unilateral; 70,8 % bilateral), resultado que replica de forma independiente para `ClaudeBot` y `GPTBot` las observaciones de Liu et al. (IMC '25) en un entorno señuelo (`OAI-SearchBot` únicamente consultó `robots.txt` sin solicitar páginas). En contraste, se registraron **207 violaciones correspondientes a 6 direcciones IP** que falsificaban cabeceras de navegadores comerciales (`Chrome/124–150`): el 100 % incurrió en Nivel 2 (omisión de consultar `robots.txt`), ninguna descargó `/favicon.ico` (mientras que el control positivo del equipo con navegador real sí lo descargó), y el 79,2 % (164 de 207) incurrió en Nivel 3 (consumo de enlaces ocultos por CSS, $\chi^2 = 0,3188, gl = 4, p = 0,9886$). Concluimos que la variable que predice la intrusión es el rastreo ciego de enlaces sin consulta previa de `robots.txt`. El estudio discute alcances reales, limitaciones metodológicas, aspectos éticos bajo la Ley 25.326 y criterios sobre cuándo conviene emplear esta tecnología.

**Palabras clave:** honeypot, deception, web crawlers, robots.txt, RFC 9309, HMAC, tokens sin estado, ClaudeBot, GPTBot, Render Tree, BGP.

---

## 1. Introducción y marco conceptual

### 1.1. Contexto, planteamiento del problema y objetivos

El Protocolo de Exclusión de Robots (`robots.txt`), estandarizado formalmente por el IETF en el **RFC 9309** [1], permite a los administradores web manifestar qué recursos no deben ser rastreados por agentes automatizados. Al carecer de mecanismos criptográficos de autenticación o barreras en capas de red y transporte, su acatamiento es voluntario (*advisory*). Con el auge de los modelos fundacionales de inteligencia artificial (LLMs) y los sistemas de generación aumentada por recuperación (RAG), la recolección masiva de contenidos ha transformado la composición del tráfico de red: mediciones globales de 2024 señalan que el tráfico automatizado superó por primera vez al humano, alcanzando el 51 % del total [2]. En paralelo, investigaciones sobre la web pública han observado una adopción asimétrica de directivas defensivas entre medios periodísticos y fuentes dudosas [3], planteando interrogantes sobre el acatamiento efectivo de las directivas por parte de los operadores de IA frente a scrapers no declarados.

Asimismo, la investigación de Kim et al. [4] evaluó empíricamente más de 130 bots en la web pública, constatando que el acatamiento decae significativamente a medida que las directivas se vuelven más restrictivas y que proliferan actores evasivos que falsean cabeceras. Por su parte, Liu et al. [5] (IMC '25) estudiaron la eficacia real de `robots.txt` para proteger a creadores de contenido frente a recolectores de IA comercial, observando un acatamiento estricto por parte de operadores establecidos (como Anthropic y OpenAI) en contraste con infracciones sistemáticas de scrapers no cooperativos. Surge así una pregunta de investigación central: **¿Respetan efectivamente los agentes de IA las directivas de exclusión de `robots.txt` en el tráfico real de producción, o las violaciones provienen de recolectores camuflados que omiten el protocolo?**

**Objetivos del trabajo.**
1. Desarrollar el marco conceptual de los honeypots y posicionar nuestra herramienta frente a alternativas de mitigación y engaño (§1.2 y §4.3).
2. Diseñar, implementar y evaluar en producción un honeypot HTTP de capa 7 sin estado para auditar el cumplimiento del RFC 9309 de forma reproducible (§2 y §3).
3. Evaluar empíricamente el comportamiento de los crawlers en el entorno señuelo, acotando conclusiones y documentando aspectos éticos y operativos (§3.4, §4 y §5).

**Alcance y delimitación.** Son de autoría propia la arquitectura del laberinto, el código, el despliegue con Docker y Cloudflare Tunnel, el registro de 3,57 millones de peticiones y los análisis estadísticos. Se toman de la literatura las cifras de adopción [2, 3], las advertencias sobre *spoofing* [4] y los marcos de evaluación de agentes de IA [5]. El presente trabajo no pretende evaluar la totalidad de la web ni extrapolar a directivas complejas: audita el comportamiento de los agentes que visitaron un sitio señuelo único frente a una directiva `Disallow` benigna.

### 1.2. Fundamentos de la técnica Honeypot: historia, taxonomía y *tarpits*

La disciplina del engaño defensivo (*deception technology*) en seguridad informática data de las primeras trampas para rastrear intrusos documentadas por Stoll (1989) [6] y Cheswick (1992) [7]. Formalizada a principios de siglo por Spitzner (2002) [8] y Provos (2004) [9], la técnica define a un *honeypot* como un recurso informático de seguridad cuyo valor radica en ser sondeado, atacado o comprometido. Al no poseer propósitos operativos legítimos ni usuarios humanos asignados, toda interacción recibida es, por definición, anómala o sospechosa.

```
                    ┌──────────────────────────────────────────────┐
                    │           Tecnologías de Deception           │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌──────────────────┐                                               ┌──────────────────┐
│ Por Interacción  │                                               │ Por Especialidad │
└────────┬─────────┘                                               └────────┬─────────┘
         ├─ Baja: Emulación de banners (Dionaea, Cowrie)                    ├─ Honeynets: Redes distribuidas complejas
         ├─ Media: Emulación parcial de capas de aplicación                 ├─ Honeytokens: Credenciales y URLs señuelo
         └─ Alta: VMs reales y sandboxes instrumentadas                     └─ Tarpits: Retardo y laberintos de agotamiento
```

En la capa de aplicación web, los *honeytokens* (elementos señuelo con identificadores únicos) han evolucionado hacia mecanismos activos de disuasión. Entre ellos destacan los *tarpits* (fosos de brea) [10], diseñados para degradar el rendimiento de escáneres automatizados ralentizando las respuestas TCP/HTTP (como *slowloris*) o atrapando a los agentes en laberintos infinitos de enlaces dinámicos. En la industria moderna, soluciones comerciales como Cloudflare AI Labyrinth (2025) [11] emplean generación sintética de contenido para atrapar scrapers de IA no autorizados. Sin embargo, los laberintos tradicionales requieren almacenar árboles de URLs en bases de datos o computar respuestas pesadas con modelos generativos. Nuestro trabajo propone una alternativa orientada a la auditoría: un laberinto procedimental sin estado (*stateless*) mediante tokens HMAC que codifican los metadatos en la propia URL.

### 1.3. Conceptos fundamentales de Internetworking y capa de aplicación

La comprensión profunda del comportamiento de los crawlers y la efectividad de los honeypots web descansa sobre cinco pilares de la arquitectura de redes y protocolos:

**1. El Render Tree del navegador frente al procesamiento sintáctico de un crawler.**  
Un navegador web comercial construye dos modelos de objetos a partir del código recibido: el DOM (*Document Object Model*) derivado del HTML y el CSSOM (*CSS Object Model*) derivado de las hojas de estilo [12]. La conjunción de ambos conforma el **árbol de renderizado** (*Render Tree*), que calcula la geometría visual de la página. Si un nodo posee `display: none` o `opacity: 0`, se omite en el árbol de renderizado o se dibuja transparente: un usuario humano nunca interactúa con él. Por el contrario, la mayoría de los bots y scrapers de bajo costo emplean analizadores sintácticos de texto plano o expresiones regulares sobre el HTML crudo sin evaluar el CSSOM. El honeypot aprovecha esta divergencia arquitectónica: la navegación hacia un enlace oculto por CSS constituye una prueba directa de ceguera sintáctica.

**2. Túneles inversos y enrutamiento perimetral Anycast.**  
Desplegar un honeypot de investigación en infraestructura local sin IP pública estática requiere el uso de túneles inversos (Cloudflare Tunnel). El demonio `cloudflared` establece conexiones salientes multiplexadas mediante TLS/QUIC (puerto 7844) hacia múltiples puntos de presencia (PoP) de Cloudflare distribuidos globalmente bajo enrutamiento Anycast (RFC 4786) [13]. Esto aísla el servidor de origen de ataques directos a nivel de red (DDoS volumétrico) y permite absorber picos de tráfico sin exponer la dirección IP del anfitrión residencial.

**3. Preservación de la dirección IP real y sanitización de cabeceras de transporte.**  
Cuando una conexión atraviesa un proxy inverso o CDN perimetral, la dirección IP de origen en la capa de transporte TCP observada por el servidor web es la del nodo perimetral. Para transmitir la IP real del cliente, el proxy inyecta cabeceras HTTP como `CF-Connecting-IP` o `X-Forwarded-For` (RFC 7239) [14]. La preservación fidedigna de este dato en Nginx exige el uso de la directiva `set_real_ip_from` restringida estrictamente a los bloques CIDR de Cloudflare. Sin esta configuración, un atacante podría falsificar su identidad de red inyectando cabeceras arbitrarias.

**4. Validación de origen mediante BGP, Sistemas Autónomos y RDAP.**  
Dado que la cabecera HTTP `User-Agent` es texto libre fácilmente falsificable, la atribución de identidad en Internetworking exige validar la capa de red (Capa 3). Esto se logra cruzando la dirección IP de origen con la tabla global de enrutamiento BGP (RFC 4271) [15] para determinar el Sistema Autónomo (ASN) emisor y consultando los registros RIR a través del protocolo RDAP (RFC 7480) [16] o listas públicas oficiales de prefijos publicadas por los operadores (como Google o OpenAI).

**5. Semántica de caché y persistencia de `robots.txt` según el RFC 9309.**  
El RFC 9309 [1] especifica que los clientes deben almacenar en caché el archivo `robots.txt` para no saturar los servidores de origen, sugiriendo un período de validez de hasta 24 horas. En arquitecturas a gran escala, los operadores de crawlers emplean granjas distribuidas donde un nodo centralizado descarga y valida `robots.txt` y comparte la política en caché con los recolectores de contenido, lo que explica la ausencia de consultas directas de `robots.txt` desde cada dirección IP individual.

---

## 2. Arquitectura y funcionamiento del sistema

### 2.1. Componentes efectivamente desplegados y topología de red

El sistema se ejecutó en un anfitrión físico con Windows 10 Pro (x86_64) utilizando Docker Desktop 4.34 con backend WSL 2 (kernel Linux 5.15). Se desplegó una arquitectura modular compuesta por cinco servicios orquestados mediante Docker Compose, interconectados a través de tres redes puente (*bridge networks*) aisladas para garantizar contención y mínimo privilegio:

```
                            INTERNET (Crawlers / Clientes)
                                          │
                                          ▼
                         Red Perimetral Anycast (Cloudflare)
                                          │
                        Túnel TLS/QUIC (saliente puerto 7844)
                                          │
    ╔═════════════════════════════════════╪═════════════════════════════════════╗
    ║ Servidor Anfitrión (Windows 10 Pro / Docker Desktop WSL 2)                ║
    ║                                     ▼                                     ║
    ║                         ┌───────────────────────┐                         ║
    ║                         │  cloudflared (túnel)  │                         ║
    ║                         └───────────┬───────────┘                         ║
    ║  [frontend_net]                     │                                     ║
    ║                                     ▼                                     ║
    ║                         ┌───────────────────────┐                         ║
    ║                         │  Nginx 1.27 (Proxy)   │                         ║
    ║                         └───────────┬───────────┘                         ║
    ║                                     │                                     ║
    ║               ┌─────────────────────┴─────────────────────┐               ║
    ║  [backend_net]│                                           │[monitoring]   ║
    ║               ▼                                           ▼               ║
    ║     ┌───────────────────┐                       ┌───────────────────┐     ║
    ║     │ Honeypot (Python) │                       │ Promtail / Loki   │     ║
    ║     │  read_only: true  │                       │  (Logs & Métricas)│     ║
    ║     └───────────────────┘                       └─────────┬─────────┘     ║
    ║                                                           ▼               ║
    ║                                                 ┌───────────────────┐     ║
    ║                                                 │ Grafana Dashboard │     ║
    ║                                                 └───────────────────┘     ║
    ╚═══════════════════════════════════════════════════════════════════════════╝
```
*Figura 1. Topología de red y segmentación de servicios desplegados en el servidor anfitrión.*  
*(Nota: El diagrama de topología visualiza el aislamiento entre las tres zonas de red. En producción, el contenedor auxiliar de analítica en tiempo real fue detenido tras saturación de memoria, procesándose los logs de Nginx mediante scripts offline de streaming).*

- **`cloudflared` (`cloudflare/cloudflared:latest`):** Conector del túnel que mantiene sesiones seguras hacia Cloudflare y reenvía el tráfico a Nginx en `frontend_net`.
- **`nginx` (`nginx:1.27-alpine`):** Proxy inverso de alto rendimiento. Aplica la restauración de la IP real mediante `set_real_ip_from`, sirve `/robots.txt` estático, emite los logs estructurados en JSON y suprime cabeceras de depuración interna.
- **`honeypot` (`python:3.11-slim`):** Aplicación web Flask/Gunicorn que implementa la verificación criptográfica HMAC, la generación procedural de enlaces y las trampas de visibilidad CSS. Corre con la directiva `read_only: true` y un `tmpfs` efímero en `/tmp`.
- **`promtail` y `loki` (`grafana/loki:3.0.0`):** Pipeline de telemetría que ingiere los logs planos de Nginx en streaming hacia un almacén de series temporales.
- **`grafana` (`grafana/grafana:11.0.0`):** Tablero visual de métricas en tiempo real.

### 2.2. Aislamiento y recuperación de la dirección IP real en Nginx

Para asegurar que cada registro contenga la dirección IP pública del crawler y no la del túnel local (`127.0.0.1` o `172.x.x.x`), Nginx fue configurado con el módulo `ngx_http_realip_module`:

```nginx
# nginx/conf.d/honeypot.conf
set_real_ip_from 172.16.0.0/12;
set_real_ip_from 10.0.0.0/8;
real_ip_header CF-Connecting-IP;
real_ip_recursive on;

log_format json_analytics escape=json '{'
  '"time_local":"$time_iso8601",'
  '"client_ip":"$remote_addr",'
  '"request_method":"$request_method",'
  '"request_uri":"$request_uri",'
  '"status":$status,'
  '"body_bytes_sent":$body_bytes_sent,'
  '"http_referer":"$http_referer",'
  '"http_user_agent":"$http_user_agent"'
'}';

access_log /var/log/nginx/access.log json_analytics buffer=64k flush=5s;
```

Asimismo, se eliminaron del flujo de salida las cabeceras internas emitidas por el backend (`proxy_hide_header X-Honeypot-Token`, `proxy_hide_header X-Honeypot-Depth`) para evitar cualquier fuga de diagnóstico que delatara la naturaleza artificial del sitio.

### 2.3. Construcción del token criptográfico sin estado (HMAC-SHA256)

El diseño del honeypot resuelve el desafío del almacenamiento de estado: mantener un grafo de millones de páginas exigiría terabytes de base de datos y un elevado costo de I/O. Nuestro sistema preserva el estado directamente en el componente de ruta de la URL mediante un token criptográfico de 52 caracteres hexadecimales:

$$	ext{Token} = 	ext{seed}_{8	ext{h}} \mathbin{\Vert} 	ext{depth}_{2	ext{h}} \mathbin{\Vert} 	ext{variant}_{2	ext{h}} \mathbin{\Vert} 	ext{timestamp}_{8	ext{h}} \mathbin{\Vert} 	ext{session}_{22	ext{h}} \mathbin{\Vert} 	ext{mac}_{10	ext{h}}$$

El bloque $	ext{mac}_{10	ext{h}}$ consiste en los primeros 40 bits (10 caracteres hexadecimales) de un HMAC-SHA256 calculado sobre los 42 caracteres iniciales del payload utilizando una clave secreta (`SECRET_KEY`) conocida únicamente por el servidor:

```python
# honeypot/trap/tokens.py
import hmac
import hashlib

def verify_token(token_str: str, secret_key: bytes) -> tuple[bool, dict]:
    if len(token_str) != 52:
        return False, {}
    payload = token_str[:42]
    expected_mac = hmac.new(
        secret_key, payload.encode("ascii"), hashlib.sha256
    ).hexdigest()[:10]
    
    # Comparacion en tiempo constante para evitar ataques de temporizacion
    if not hmac.compare_digest(token_str[42:], expected_mac):
        return False, {}
        
    depth = int(payload[8:10], 16)
    variant = int(payload[10:12], 16)
    ts = int(payload[12:20], 16)
    return True, {"depth": depth, "variant": variant, "timestamp": ts}
```

**Justificación del truncamiento a 40 bits:** Aunque el RFC 2104 [20] recomienda no truncar a menos de 80 bits para firmas criptográficas de alta persistencia, en este diseño el token no constituye una credencial de autenticación interactiva frente a un oráculo adverso, sino un identificador efímero embebido en URLs públicas. Un truncamiento a 40 bits (espacio de $2^{40} pprox 1,099 	imes 10^{12}$ valores) otorga una probabilidad de acierto por intento a ciegas de:

$$P(	ext{éxito}) = rac{1}{2^{40}} pprox 9,09 	imes 10^{-13}$$

Incluso considerando las 6 direcciones IP infractoras observadas emitiendo un total de peticiones arbitrarias, la probabilidad acumulada de forjar accidentalmente un enlace válido es de:

$$rac{6}{2^{40}} pprox 5,46 	imes 10^{-12}$$

Adivinar una sola URL válida requeriría saturar los enlaces de red con cientos de miles de millones de peticiones que resultarían en errores HTTP 404 instantáneos. Esta optimización ahorra 20 bytes por enlace en la carga útil HTTP servida a través de millones de hipervínculos.

**Control de profundidad máxima:** Para impedir que los crawlers consuman recursos ilimitados, se configuró `HONEYPOT_MAX_DEPTH = 10`. Toda página solicitada con nivel $d < 10$ genera enlaces hacia páginas de nivel $d + 1$. Al alcanzarse $d = 10$, los enlaces generados apuntan a nivel 11, el cual devuelve páginas terminales ("hojas") que no contienen ningún hipervínculo saliente, extinguiendo el recorrido de forma natural.

### 2.4. Laberinto dinámico, técnicas de ocultamiento CSS y taxonomía de violaciones

En cada nodo no terminal del laberinto, el honeypot genera dinámicamente cinco hipervínculos salientes ($b = 5$) que conducen al siguiente nivel: uno con renderizado estándar y cuatro modificados con técnicas de ocultamiento CSS [12]:

1. **`visible`:** Renderizado por defecto en el flujo normal del documento HTML.
2. **`display: none` (inline):** Elemento retirado explícitamente mediante atributo `style="display: none;"`.
3. **`offscreen`:** Posicionado fuera de la ventana gráfica mediante `style="position: absolute; left: -9999px;"`.
4. **`display: none` (clase CSS):** Enlace asociado a una regla de clase declarada dentro de la etiqueta `<style>` en el encabezado.
5. **`opacity: 0`:** Elemento totalmente transparente e inhabilitado para punteros mediante `style="opacity: 0; pointer-events: none;"`.

En el archivo `/robots.txt`, se expone la ruta señuelo bajo una directiva benigna estandarizada:

```
User-agent: *
Disallow: /archivo-interno/
```

**Taxonomía rigurosa de violaciones en tres niveles:**
- **Nivel 1 (Violación directa de exclusión):** El cliente consulta formalmente `/robots.txt` y, con posterioridad, emite peticiones hacia la ruta prohibida `/archivo-interno/*`.
- **Nivel 2 (Rastreo no cooperativo a ciegas):** El cliente recorre el sitio y accede a rutas prohibidas sin haber solicitado previamente el archivo `/robots.txt`.
- **Nivel 3 (Evasión activa de presentación):** El cliente consume enlaces provistos de directivas CSS de invisibilidad (`display: none`, `offscreen`, `opacity: 0`), evidenciando el uso de analizadores sintácticos de texto desprovistos de motor de renderizado CSSOM.

---

## 3. Caso práctico

### 3.1. Simulación local, despliegue en producción y siembra

El entorno se validó inicialmente en local mediante `docker-compose -f docker-compose.local.yml up -d`, verificando que la invocación sintética de `curl` respetara la generación procedural de enlaces y que los accesos a `/archivo-interno/` registraran el incremento métrico esperado.

Para el despliegue en producción, se registró el dominio `definitivamente-no-hay-trabas.com.ar` y se configuró el túnel perimetral en Cloudflare. Con el fin de evaluar las rutas de descubrimiento, se generaron tokens específicos de siembra (*seed tokens*) distribuidos en pruebas internas. Durante los 11,85 días de operación continua, se registraron **0 accesos con tokens de semilla**. Este hallazgo es **consistente con un descubrimiento orgánico de la raíz** a través de los registros de *Certificate Transparency* (CT logs emitidos automáticamente por Let's Encrypt / Cloudflare al crear el certificado TLS) o mediante la mención del dominio en el repositorio público del proyecto en GitHub.

### 3.2. Evidencia concreta: registros crudos, secuencia de captura y panel de Grafana

A las pocas horas del despliegue, el primer agente indexador en arribar al dominio fue `ClaudeBot` (Anthropic). La traza cruda de Nginx documenta la secuencia exacta de exploración:

```
2026-10-19T07:11:46+00:00 216.73.217.x GET /robots.txt HTTP/1.1 200 116 "-" "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
2026-10-19T07:11:47+00:00 216.73.217.x GET / HTTP/1.1 200 1488 "-" "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
2026-10-19T07:11:47+00:00 216.73.217.x GET / HTTP/1.1 200 1488 "-" "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
2026-10-19T07:11:47.452+00:00 216.73.217.x GET /laberinto/f83e8b01010068f44d18... HTTP/1.1 200 1624 "-" "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"
```

Obsérvese la precisión temporal: `ClaudeBot` descarga `/robots.txt`, confirma la inexistencia de restricciones sobre la raíz `/`, realiza dos peticiones concurrentes sobre `/` y, **exactamente 221 ms tras la segunda petición a la portada**, emite su primer acceso hacia un nodo del laberinto. A lo largo de los días subsiguientes, consumió 1,99 millones de páginas del laberinto sin emitir jamás una petición hacia `/archivo-interno/`.

**Reconciliación métrica de Grafana:** El tablero visual en tiempo real registraba 213 accesos totales y 45 en la técnica `opacity_0`. Tras la auditoría detallada de las direcciones IP de origen, se determinó que 6 solicitudes correspondieron a pruebas de verificación manual efectuadas por los autores desde una conexión residencial (`181.4.69.0/24`). Al depurar estas pruebas internas, la cifra neta de violaciones producidas por actores externos quedó establecida en **207 accesos totales** y **39 en `opacity_0`** (ver Figura 4).

**El argumento definitivo del Favicon:** Una observación crítica de Internetworking valida que los 6 actores infractores no eran humanos. Al visitar un sitio mediante navegadores gráficos reales (como Chrome), el navegador solicita automáticamente el recurso `/favicon.ico` para representarlo en la pestaña de la interfaz. En nuestro experimento, la visita manual de control positivo del equipo de investigación desde navegador Chrome (`181.4.69.0/24`) emitió inmediatamente la solicitud `GET /favicon.ico`. En contraste, sobre las 207 solicitudes generadas por los 6 actores infractores que reportaban cabeceras de Chrome comercial, **ninguno solicitó `/favicon.ico`**. Esto confirma empíricamente que se trataba de scripts automatizados de recolección (*headless scrapers*) que parseaban hipervínculos sin interacción de usuario.

### 3.3. Depuración del conjunto de datos y lecciones operativas

Durante la ventana experimental de 11,85 días (del 18/10 al 30/10 de 2026), el servidor procesó **3.568.349 peticiones brutas**. La depuración reveló que 3.568.344 correspondieron a transacciones válidas servidas por Nginx y el honeypot, mientras que 5 solicitudes resultaron en errores HTTP 4xx (413 Payload Too Large y 400 Bad Request) provocados por escáneres genéricos de vulnerabilidades externas que remitieron cargas malformadas.

Se registraron tres incidencias operativas de relevancia:
1. **Hueco de captura del 27/10:** Una interrupción temporal de 8 horas y 57 minutos en la resolución DNS (por expiración de delegación NS en el registrador de dominio) redujo el volumen observado ese día a 107.149 peticiones. La conectividad se restableció íntegramente sin alterar la validez del estudio.
2. **Caída del pipeline de analítica:** La intensidad de las ráfagas concurrentes de `ClaudeBot` saturó la memoria del contenedor `analytics` y bloqueó la base de datos SQLite en producción. La telemetría definitiva se procesó mediante scripts fuera de línea (*streaming offline*) sobre los logs planos de Nginx, ratificando la robustez de almacenar logs en texto plano rotados frente a bases de datos relacionales en entornos de alto tráfico.
3. **Cadencia constante de GPTBot:** El 30/10, antes del corte programado de captura (17:57:05 UTC, totalizando 17,95 horas operativas), `GPTBot` emitió 128.201 peticiones, lo que representa exactamente una tasa de **7.141 req/h ($pprox 1,98	ext{ req/s}$)**, confirmando la operación ininterrumpida de su algoritmo de control de tasa por cubeta de fichas (*token bucket*).

### 3.4. Resultados empíricos obtenidos

#### 3.4.1. Volumen global y panorama de actividad
La Tabla 1 consolida la totalidad del tráfico procesado por el honeypot según la categoría y familia del agente.

**Tabla 1. Panorama de actividad consolidado por familia de agente clasificada.**

| Familia | Categoría | Peticiones | % Total | Subredes `/24` | Datos (GB) | `robots.txt` | Accesos a Trampa |
|---|---|---:|---:|---:|---:|---:|---:|
| **ClaudeBot** (Anthropic) | IA | 1.989.866 | 55,77 % | 3 | 6,11 GB | 155 | **0** |
| **GPTBot** (OpenAI) | IA | 1.558.875 | 43,69 % | 4 | 4,72 GB | 0 * | **0** |
| **GoogleOther** (Google) | I+D / IA [21] | 10.702 | 0,30 % | 4 * | 0,04 GB | 0 * | **0** |
| **Navegadores** (Camuflados) | Sin marca | 7.036 | 0,20 % | Múltiples | 0,004 GB | 12 | **207** |
| **Googlebot** (Google) | Buscador | 1.532 | 0,04 % | 4 * | 0,003 GB | 297 | **0** |
| **OAI-SearchBot** (OpenAI) | IA / Búsqueda | 49 | <0,01 % | 3 | <0,001 GB | 49 | **0** |
| **Applebot** (Apple) | Buscador | 2 | <0,01 % | 1 | <0,001 GB | 2 | **0** |
| **Herramientas / Escáneres / Otros** | Varios | 287 | <0,01 % | Múltiples | <0,001 GB | 14 | **0** |
| **TOTAL** | — | **3.568.349** | **100,00 %** | — | **~10,9 GB** | **529** | **207** |

*\* Consulta de `robots.txt` delegada por operador (ver §3.4.3). Las subredes de Googlebot y GoogleOther corresponden a 4 prefijos /24 compartidos en AS15169.*

#### 3.4.2. Dinámicas de rastreo de ClaudeBot y GPTBot
Los dos principales operadores de IA presentaron dinámicas temporales diametralmente opuestas:
- **`ClaudeBot`:** Operó mediante colas por lotes (*batch*). La latencia entre la generación del enlace y su consumo (`tok_age`) exhibió una mediana de **5,0 horas** con un piso rígido de 1 hora. Emitió ráfagas de hasta **38.787 req/h** (~10,8 req/s) sin cabecera `Referer`. Tras recolectar 1,99 millones de páginas en 50 horas, detuvo su rastreo el 25/10.
- **`GPTBot`:** Operó mediante transmisión continua (*streaming*), consumiendo el 50 % de los enlaces dentro de los **8,9 segundos** posteriores a su emisión. Mantuvo una cadencia rigurosa de **2,00 req/s** (coeficiente de variación CV = 0,068) con cabecera `Referer` válida en el 100 % de los casos, continuando su indexación hasta el cierre del experimento.

![Evolución diaria del volumen de tráfico por familia](graficos/serie-diaria.png)
*Figura 2. Volumen diario de peticiones por familia (UTC), evidenciando las ráfagas de ClaudeBot y la tasa constante de GPTBot.*

Ambos agentes alcanzaron la profundidad máxima ($d = 10$). Debido a la expansión exponencial, entre el 68 % y el 72 % de sus peticiones recayeron sobre hojas terminales sin enlaces salientes ($d = 11$, ver Figura 3 y Anexo C).

![Distribución de solicitudes por nivel de profundidad](graficos/profundidad.png)
*Figura 3. Solicitudes por nivel de profundidad en escala logarítmica frente a la ramificación teórica b = 5.*

#### 3.4.3. Consulta centralizada de `robots.txt` y verificación de rangos de red
Un análisis superficial por User-Agent sugeriría que `GPTBot` (1,56 millones de peticiones) y `GoogleOther` (10.702 peticiones) rastrearon el sitio sin consultar `robots.txt`. Sin embargo, el análisis temporal y de red demostró una arquitectura de consulta delegada por operador:
- **OpenAI:** El 21/10 a las 05:30:30 UTC, `OAI-SearchBot` descargó `/robots.txt`. Exactamente **0,75 segundos después**, desde la misma subred IP (`74.7.242.0/24`), `GPTBot` inició la navegación masiva del laberinto, compartiendo la política almacenada en caché.
- **Google:** `Googlebot` descargó `/robots.txt` 297 veces desde subredes coincidentes con las empleadas por `GoogleOther`.

**Tabla 2. Cobertura de tráfico de crawlers declarados en rangos de red oficiales.**

| Operador | Subredes observadas predominantes | Sistema Autónomo (BGP / ASN) | Fuente oficial de validación | Peticiones en rango | Cobertura |
|---|---|---|---|---:|---:|
| **Anthropic** (`ClaudeBot`) | `216.73.217.0/24` (1.590.538), `216.73.216.0/24` (399.324); residual `34.162.0.0/16` (4) | AS16509 (Amazon AWS-ANTHROPIC / ARIN `216.73.216.0/22`); GCP AS396982 | Registro ARIN (`216.73.216.0/22`) [24] | 1.989.862 / 1.989.866 | **99,9998 %** * |
| **OpenAI** (`GPTBot`, `OAI-SearchBot`) | `74.7.242.0/24` (1.557.329), `132.196.86.0/24` (751), `172.182.207.0/24` (410), `172.182.202.0/24` (385); `OAI-SearchBot`: `74.7.175.0/24` (38), `74.7.230.0/24` (9), `51.8.102.0/24` (2) | AS8075 (Microsoft Corporation / Azure) | `openai.com/gptbot.json` [22] y `searchbot.json` [23] | 1.558.924 / 1.558.924 | **100,00 %** |
| **Google** (`GoogleOther`, `Googlebot`) | `66.249.73.0/24` (12.071), `192.178.6.0/24` (94), `66.249.69.0/24` (50), `66.249.70.0/24` (19) (4 subredes en AS15169) | AS15169 (Google LLC) | `developers.google.com/.../googlebot.json` [21] y `special-crawlers.json` | 12.234 / 12.234 | **100,00 %** |

*\* Cobertura según método: Anthropic no publica un archivo JSON de rangos IP oficiales; la verificación descansa en la titularidad del bloque /22 asignado a Anthropic en ARIN RDAP (AS16509). Las 4 solicitudes provenientes del bloque de Google Cloud Platform (34.162.0.0/16) quedan fuera de dicho bloque y no verificadas.*

#### 3.4.4. Cumplimiento del RFC 9309 y caracterización de violaciones
La Tabla 3 detalla la tasa observada de cumplimiento en la ruta prohibida `/archivo-interno/`.

**Tabla 3. Cumplimiento de exclusión por operador observado.**

| Operador | Crawlers activos | Páginas con enlaces | Enlaces trampa expuestos | Trampas seguidas | Tasa de infracción |
|---|---|---:|---:|---:|---:|
| **Anthropic** | ClaudeBot | 628.124 | 3.140.620 | 0 | 0,00 % |
| **OpenAI** | GPTBot, OAI-SearchBot | 436.250 | 2.181.250 | 0 | 0,00 % |
| **Google** | GoogleOther, Googlebot | 8.690 | 43.450 | 0 | 0,00 % |
| **TOTAL** | — | **1.073.064** | **5.365.320** | **0** | **0,00 %** |

A nivel de operador ($n = 3, k = 0$), el acatamiento fue del 100 %. Estadísticamente, la cota superior unilateral exacta de Clopper-Pearson al 95 % de confianza para la proporción de operadores infractores es:

$$	ext{Cota}_{95\%} = 1 - 0,05^{1/3} pprox 63,2\% \quad (70,8\% 	ext{ bilateral})$$

En agudo contraste, se registraron **207 violaciones protagonizadas por 6 direcciones IP** que simulaban cabeceras de navegadores Chrome comerciales sobre Windows, Linux y Mac (Tabla 4).

**Tabla 4. Perfil forense de los actores infractores.**

| Actor | Subred IP (/24) | PoP / País | Peticiones | A Trampa | Errores 404 | User-Agent declarado | Cadencia (p50) | Prof. |
|---|---|---|---:|---:|---:|---|---:|---:|
| **A1** | `154.28.229.0/24` | IAD / EE. UU. | 90 | 43 | 0 | Chrome/131 (Linux) | 178 ms | 2 |
| **A2** | `103.196.9.0/24` | BOS / EE. UU. | 111 | 53 | 55 | Chrome/130–131 (Linux) | 5 ms | 2 |
| **C** | `158.69.55.0/24` | YYZ / Canadá | 200 | 98 | 100 | Chrome/124 (Win10) | 13 ms | 3 |
| **B1** | `93.123.109.0/24` | AMS / P. Bajos | 334 | 4 | 315 | Chrome/150 (Win10) | 1 ms | 1 |
| **B2** | `45.138.12.0/24` | WAW / Polonia | 297 | 4 | 285 | Chrome/150 (Win10) | 88 ms | 1 |
| **D** | `45.138.12.0/24` | WAW / Polonia | 14 | 5 | 0 | Chrome/133 (Win/Mac) | 111 ms | 1 |

El 100 % de estos actores omitió consultar `/robots.txt` (**Nivel 2**). Respecto a la técnica de ocultamiento, 43 accesos ingresaron por la variante `visible` y 164 por técnicas ocultas por CSS, determinando que **164 de 207 solicitudes (79,2 %) constituyeron infracciones de Nivel 3**.

![Distribución de accesos a la ruta trampa según técnica CSS](graficos/trampa-tecnicas.png)
*Figura 4. Accesos a la ruta trampa según variante de ocultamiento CSS frente al valor esperado bajo consumo equiprobable (41,4).*

La prueba de bondad de ajuste de Chi-cuadrado sobre las 5 variantes (43 en `visible`, 43 en `display: none inline`, 42 en `offscreen`, 40 en `display: none clase`, 39 en `opacity: 0`) arrojó:

$$\chi^2 = 0,3188, \quad gl = 4, \quad p = 0,9886$$

Dado que $p > 0,05$, no se rechaza la hipótesis nula de equiprobabilidad: los scrapers consumieron los enlaces ocultos con frecuencias estadísticamente indistinguibles de una selección aleatoria uniforme, confirmando la ausencia total de interpretación CSS.

---

## 4. Análisis crítico

### 4.1. Ventajas y limitaciones de la técnica

**Ventajas principales:**
1. **Ausencia total de estado en servidor:** Al calcularse la firma HMAC sobre la marcha, el honeypot genera grafos arbitrariamente profundos con un consumo de memoria plano inferior a 60 MB, inmune a ataques de denegación de servicio por agotamiento de almacenamiento.
2. **Atribución de Nivel 3 sin falsos positivos:** La combinación de una directiva `Disallow` en `robots.txt` con enlaces invisibles por CSS permite discriminar de forma determinística entre usuarios legítimos, crawlers cooperativos y scrapers ciegos.
3. **Bajo costo computacional:** La verificación HMAC-SHA256 en Python insume menos de 15 microsegundos por petición, permitiendo despachar miles de solicitudes por segundo en hardware modesto.

**Limitaciones metodológicas y de diseño:**
1. **Dependencia de la sintaxis relativa:** El honeypot requiere que el scraper extraiga y siga enlaces en formato relativo (`/laberinto/<token>`). Scrapers diseñados para extraer únicamente texto sin navegar hipervínculos no son auditados.
2. **Censura muestral por terminación:** Al acotar la profundidad a $d = 10$, los crawlers que consumen por lotes no alcanzaron a visitar la totalidad de los nodos generados, censurando la observación de ramas profundas.
3. **Truncamiento HMAC frente al estándar:** Como se analizó en §2.3, los 40 bits de firma son óptimos para mitigar el sondeo a ciegas en la web pero no cumplen la recomendación formal de 80 bits del RFC 2104 para firmas criptográficas de alta seguridad.

### 4.2. Casos reales documentados en la industria

El empleo de honeypots de capa de aplicación contra la recolección no autorizada cuenta con antecedentes relevantes en la industria:
- **Project Honeypot y http:BL (2004–presente) [25]:** Pioneros en la inserción de enlaces trampa invisibles en sitios web para recolectar direcciones IP de spammers y alimentar listas de bloqueo por reputación DNS.
- **AI Labyrinth de Cloudflare (2025) [11]:** Solución comercial orientada a engañar a recolectores de IA mediante páginas generadas sintéticamente por LLMs perimetrales, diseñada para degradar la calidad de los modelos de entrenamiento que consumen datos del laberinto.
- **Spidertrap y Nepenthes/Dionaea [26]:** Herramientas de código abierto que generan laberintos dinámicos para ralentizar indexadores maliciosos mediante consumo deliberado de sus recursos de red.

### 4.3. Comparación técnica con herramientas afines

La Tabla 5 compara nuestro diseño con las principales tecnologías de mitigación y engaño.

**Tabla 5. Comparativa técnica de alternativas frente a la auditoría de crawlers.**

| Enfoque | Objetivo primordial | Telemetría / Atribución | Ventaja | Limitación |
|---|---|---|---|---|
| **Honeypot HMAC (Este trabajo)** | Auditoría científica de `robots.txt` | Atribución exacta de nivel 1, 2 y 3; sin estado | Consumo nulo de base de datos; reproducible | No mitiga activamente el scraping agresivo |
| **Cloudflare AI Labyrinth [11]** | Contaminación de datos de IA | Detección perimetral y envenenamiento sintético | Genera contenido creíble mediante LLMs | Alto costo computacional de inferencia; propietario |
| **Tarpits clásicos (Spidertrap) [26]** | Agotamiento de recursos del bot | Registro básico de URLs visitadas | Atrapa al bot en ciclos infinitos | Requiere estado en servidor; riesgo de bucles SEO |
| **WAF comercial (Cloudflare / AWS)** | Bloqueo perimetral reactivo | Clasificación por firmas y reputación IP | Protección activa inmediata en Capa 7 | Reglas de caja negra; falsos positivos con usuarios |

### 4.4. Relación con la literatura previa

Nuestros resultados enriquecen y matizan las conclusiones de las investigaciones empíricas contemporáneas:
1. **Replicación independiente de Liu et al. (IMC '25) [5]:** Evaluaron la eficacia de `robots.txt` sobre sitios reales y concluyeron que los agentes de OpenAI y Anthropic acatan rigurosamente las directivas de exclusión de contenidos. Nuestro experimento confirma este hallazgo en un entorno señuelo bajo condiciones de tráfico real para `ClaudeBot` y `GPTBot` (quienes sumaron 3,55 millones de peticiones y 0 violaciones).
2. **Coexistencia de agentes según Kim et al. [4]:** Demostraron que el tráfico web presenta una marcada bifurcación entre crawlers declarados que operan en rangos oficiales y actores no cooperativos con cabeceras falsificadas. Las 207 violaciones registradas en nuestro honeypot provienen con exactitud de este segundo grupo.

### 4.5. Amenazas a la validez

**Amenazas a la validez interna:**
- **Directiva única benigna:** El sitio evaluó exclusivamente una directiva `Disallow: /archivo-interno/` sin comodines complejos (`*`, `$`) ni reglas contradictorias (`Allow`). No puede descartarse que directivas más complejas induzcan fallas de interpretación en los analizadores de los crawlers.
- **Interrupción del 27/10:** La caída de 8,9 horas en el DNS redujo la exposición de ese día, si bien no afectó la tasa observada de cumplimiento en los 11 días restantes.

**Amenazas a la validez externa:**
- **Sitio señuelo único:** Al tratarse de un dominio creado *ex profeso* sin contenido periodístico ni transaccional de alto valor, no atrajo a recolectores especializados en scraping comercial agresivo, como `Bytespider` (ByteDance) [5], cuya ausencia en nuestro conjunto de datos limita la generalización a actores no cooperativos avanzados.
- **Ventana de 12 días:** Aunque se capturaron 3,57 millones de peticiones, el período no captura cambios evolutivos a largo plazo en las políticas de indexación de los operadores.

### 4.6. Consideraciones éticas, privacidad y reproducibilidad

**Marco normativo y privacidad de datos:**  
El experimento se diseñó observando los principios del *Menlo Report* [27] sobre ética en investigación de TIC y la **Ley N.º 25.326 de Protección de los Datos Personales de la República Argentina** [28]. No se involucraron usuarios humanos reales ni se capturaron datos personales sensibles. Las direcciones IP públicas de terceros recopiladas en los logs constituyen información técnica de red; con el fin de proteger la privacidad, todas las direcciones IP de terceros han sido **enmascaradas estrictamente a prefijos `/24`** en las tablas y reportes públicos. Las direcciones IP del equipo de investigación se identificaron explícitamente para permitir la depuración. Los registros crudos completos se encuentran bajo custodia local cifrada y no son distribuidos públicamente.

**Reproducibilidad:**  
El código fuente íntegro del honeypot, los archivos de orquestación Docker Compose y los datos agregados diarios (`serie_temporal_diaria.csv`) se encuentran disponibles en el repositorio público de GitHub. Dichos agregados permiten reproducir las tablas de volumen y estadística descriptiva de este informe mediante el script `scripts/estadisticas_y_graficos.py`.

---

## 5. Conclusiones y recomendaciones

### 5.1. Cuándo conviene (y cuándo no) implementar esta tecnología

**Cuándo conviene:**
1. **Auditoría de observabilidad:** En entornos corporativos o educativos para medir empíricamente qué porcentaje del tráfico automatizado respeta las directivas declaradas.
2. **Detección temprana y alimentación de listas de bloqueo:** Como trampa perimetral en subdominios aislados para identificar direcciones IP de scrapers no cooperativos que consumen enlaces ocultos y bloquearlos en el cortafuegos.
3. **Protección de rutas de alto costo:** Para aislar endpoints costosos (como búsquedas complejas o APIs de exportación) detectando accesos no humanos antes de que saturen los servidores.

**Cuándo no conviene:**
1. **Sitios web con dependencia crítica de SEO:** Implementar trampas de visibilidad CSS en portales de noticias o comercio electrónico puede ser penalizado por los motores de búsqueda legítimos bajo sospechas de *cloaking* (técnica prohibida de optimización engañosa).
2. **Entornos con clientes de accesibilidad estricta:** La manipulación de enlaces invisibles sin atributos semánticos adecuados puede confundir a lectores de pantalla utilizados por personas con discapacidad visual.

### 5.2. Conclusiones del estudio

1. **Acatamiento estricto de los operadores de IA declarados:** Anthropic (`ClaudeBot`), OpenAI (`GPTBot`, `OAI-SearchBot`) y Google (`Googlebot`, `GoogleOther`) respetaron en un 100 % la directiva de exclusión en el sitio señuelo (0 accesos a la ruta trampa sobre 5,36 millones de enlaces expuestos), con orígenes de red validados en más del 99,9 % mediante registros BGP y RDAP oficiales (incluyendo el registro ARIN RDAP del bloque `/22` de Anthropic).
2. **Las violaciones provienen exclusivamente de scrapers encubiertos:** Las 207 violaciones registradas fueron cometidas por 6 direcciones IP que falsificaban User-Agents de Chrome comercial. El 100 % de ellas omitió consultar `robots.txt` y ninguna descargó `/favicon.ico`, consumiendo enlaces ocultos por CSS de manera uniforme ($\chi^2 = 0,3188, p = 0,9886$).
3. **Viabilidad de la arquitectura sin estado:** El empleo de tokens criptográficos HMAC de 52 caracteres permitió gestionar 3,57 millones de transacciones con un consumo plano de recursos, demostrando que la disciplina de *deception* puede aplicarse a escala de producción sin sobrecargar la infraestructura de red.

### 5.3. Trabajos futuros

1. **Evaluación de directivas avanzadas y comodines:** Extender el estudio a directivas `Allow` concurrentes y patrones con expresiones regulares estandarizadas en el RFC 9309.
2. **Honeypots adaptativos con tarpits dinámicos:** Incorporar respuestas de latencia variable que degraden el ancho de banda del recolector únicamente cuando se constate una violación de Nivel 2 o Nivel 3.
3. **Despliegue multi-región:** Evaluar si la ubicación geográfica y la latencia del túnel perimetral influyen en la asignación de cuotas de rastreo por parte de los operadores de IA.

---

## 6. Referencias bibliográficas

1. Koster, M., Illyes, H., & Zeller, M. (2022). *Robots Exclusion Protocol*. RFC 9309, Internet Engineering Task Force (IETF). DOI: [10.17487/RFC9309](https://doi.org/10.17487/RFC9309).
2. Imperva Threat Research (2024). *2024 Imperva Bad Bot Report: Automated Traffic Reaches New Heights*. Thales Group. Disponible en: <https://www.imperva.com/resources/resource-library/reports/bad-bot-report/>.
3. Steinacker, L., Meese, J., & Hurcombe, E. (2024). *AI Crawlers and the News: Assessing the Asymmetric Adoption of Robots.txt Directives*. En *Digital Journalism*, pp. 1–21. DOI: [10.1080/21670811.2024.2389145](https://doi.org/10.1080/21670811.2024.2389145).
4. Kim, D., Park, S., & Lee, K. (2024). *Empirical Analysis of Robots.txt Adherence Across 130 Web Crawlers*. En *Proceedings of the 2024 ACM Web Conference (WWW '24)*, pp. 1120–1131.
5. Liu, Y., Zhang, X., & Wang, H. (2025). *Evaluating Robots.txt Efficacy in Protecting Content Creators From AI Crawlers*. En *Proceedings of the ACM Internet Measurement Conference (IMC '25)*, pp. 78–99. DOI: [10.1145/3730567.3732913](https://doi.org/10.1145/3730567.3732913).
6. Stoll, C. (1989). *The Cuckoo's Egg: Tracking a Spy Through the Maze of Computer Espionage*. Doubleday, Nueva York.
7. Cheswick, B. (1992). *An Evening with Berferd In Which a Hacker is Lured into a Sandbox*. En *Proceedings of the Winter USENIX Conference*, San Francisco, CA.
8. Spitzner, L. (2002). *Honeypots: Tracking Hackers*. Addison-Wesley Longman Publishing Co., Inc.
9. Provos, N. (2004). *A Virtual Honeypot Framework*. En *Proceedings of the 13th USENIX Security Symposium*, San Diego, CA.
10. Bae, H., Choi, J., & Kim, Y. (2024). *Tarpits Revisited: Application-Layer Delay Tactics Against Automated Web Scraping*. En *IEEE Transactions on Dependable and Secure Computing*, 21(3), pp. 1450–1463.
11. Cloudflare Research (2025). *AI Labyrinth: Deception-Based Defense Mechanisms Against Unauthorized AI Scraping*. Cloudflare Blog. Disponible en: <https://blog.cloudflare.com/>.
12. World Wide Web Consortium (W3C) (2023). *CSS Display Module Level 3 / CSS Object Model (CSSOM)*. W3C Recommendation. Disponible en: <https://www.w3.org/TR/css-display-3/>.
13. Abley, J., & Lindqvist, K. (2006). *Operation of Anycast Services*. RFC 4786, IETF. DOI: [10.17487/RFC4786](https://doi.org/10.17487/RFC4786).
14. Petersson, A., & Nilsson, M. (2014). *Forwarded HTTP Extension*. RFC 7239, IETF. DOI: [10.17487/RFC7239](https://doi.org/10.17487/RFC7239).
15. Rekhter, Y., Li, T., & Hares, S. (2006). *A Border Gateway Protocol 4 (BGP-4)*. RFC 4271, IETF. DOI: [10.17487/RFC4271](https://doi.org/10.17487/RFC4271).
16. Hollenbeck, S., & Kong, N. (2015). *Registration Data Access Protocol (RDAP)*. RFC 7480, IETF. DOI: [10.17487/RFC7480](https://doi.org/10.17487/RFC7480).
17. Krawczyk, H., Bellare, M., & Canetti, R. (1997). *HMAC: Keyed-Hashing for Message Authentication*. RFC 2104, IETF. DOI: [10.17487/RFC2104](https://doi.org/10.17487/RFC2104).
18. Google Search Central (2026). *Googlebot and Special Crawlers IP Ranges*. Google LLC. Disponible en: <https://developers.google.com/static/search/apis/ipranges/googlebot.json>.
19. OpenAI (2026). *GPTBot IP Ranges*. OpenAI Platform Documentation. Disponible en: <https://openai.com/gptbot.json>.
20. OpenAI (2026). *OAI-SearchBot IP Ranges*. OpenAI Documentation. Disponible en: <https://openai.com/searchbot.json>.
21. Anthropic (2026). *ClaudeBot Crawling and Network Identity*. Anthropic Documentation. Disponible en: <https://docs.anthropic.com/en/docs/crawling/claudebot>.
22. Clopper, C. J., & Pearson, E. S. (1934). *The Use of Confidence or Fiducial Limits Illustrated in the Case of the Binomial*. En *Biometrika*, 26(4), pp. 404–413. DOI: [10.2307/2331986](https://doi.org/10.2307/2331986).
23. Project Honeypot (2026). *http:BL API Documentation and Distributed Crawler Tracking*. Disponible en: <https://www.projecthoneypot.org/httpbl_api.php>.
24. Baeza-Yates, R., & Ribeiro-Neto, B. (2011). *Modern Information Retrieval: The Concepts and Technology Behind Search*. 2da Edición, Addison-Wesley.
25. U.S. Department of Homeland Security (2012). *The Menlo Report: Ethical Principles Guiding Information and Communication Technology Research*. Disponible en: <https://www.dhs.gov/publication/menlo-report>.
26. Honorable Congreso de la Nación Argentina (2000). *Ley N.º 25.326: Protección de los Datos Personales*. Boletín Oficial de la República Argentina.
27. Unión Europea (2016). *Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD)*. Diario Oficial de la Unión Europea.
28. Fielding, R., Nottingham, M., & Reschke, J. (2022). *HTTP Semantics*. RFC 9110, IETF. DOI: [10.17487/RFC9110](https://doi.org/10.17487/RFC9110).

---

# Anexos

## Anexo A. Serie diaria completa de peticiones por familia (UTC)

La siguiente tabla refleja los datos exactos consolidados en el archivo canónico `data/serie_temporal_diaria.csv` del repositorio.

| Fecha (UTC) | ClaudeBot | GPTBot | GoogleOther | Googlebot | Navegadores | Resto | Total Día |
|---|---:|---:|---:|---:|---:|---:|---:|
| **18/10/2026** | 0 | 0 | 0 | 0 | 90 | 69 | 159 |
| **19/10/2026** | 6 | 0 | 25 | 12 | 568 | 23 | 634 |
| **20/10/2026** | 32.597 | 0 | 9.067 | 779 | 279 | 20 | 42.742 |
| **21/10/2026** | 42.700 | 132.805 | 1.609 | 619 | 1.021 | 17 | 178.771 |
| **22/10/2026** | 40.198 | 162.594 | 1 | 14 | 402 | 29 | 203.238 |
| **23/10/2026** | 523.098 | 172.256 | 0 | 9 | 1.368 | 21 | 696.752 |
| **24/10/2026** | 887.244 | 171.489 | 0 | 41 | 905 | 54 | 1.059.733 |
| **25/10/2026** | 463.997 | 172.139 | 0 | 0 | 869 | 18 | 637.023 |
| **26/10/2026** | 24 | 171.730 | 0 | 44 | 688 | 44 | 172.530 |
| **27/10/2026** † | 2 | 107.097 | 0 | 0 | 35 | 15 | 107.149 |
| **28/10/2026** | 0 | 169.894 | 0 | 10 | 24 | 8 | 169.936 |
| **29/10/2026** | 0 | 170.670 | 0 | 2 | 283 | 6 | 170.961 |
| **30/10/2026** ‡ | 0 | 128.201 | 0 | 2 | 504 | 14 | 128.721 |
| **TOTAL** | **1.989.866** | **1.558.875** | **10.702** | **1.532** | **7.036** | **338** | **3.568.349** |

*† Ventana afectada por interrupción de DNS de 8 h 57 min. ‡ Corte programado de captura a las 17:57:05 UTC (17,95 h operativas).*

## Anexo B. Detalle forense individual de los 6 actores infractores

Todos los actores que violaron el protocolo exhibieron cabeceras falsificadas simulando navegadores Google Chrome comerciales. En cumplimiento de la política de privacidad, las direcciones IP se presentan anonimizadas con máscara `/24`:

1. **Actor A1 (`154.28.229.0/24`):** Originado en centros de datos de Ashburn (IAD, Virginia, EE. UU.). Emitió 90 peticiones, de las cuales 43 accedieron a la ruta trampa (profundidad máxima $d = 2$). Reportó `User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`. Cadencia p50 de 178 ms. Sin consulta previa de `robots.txt` y sin petición de `/favicon.ico`.
2. **Actor A2 (`103.196.9.0/24`):** PoP Boston (BOS, EE. UU.). Emitió 111 solicitudes (53 a trampa, 55 errores 404 por mutación de URLs). Alternó cadenas de Chrome 130 y 131 sobre Linux con ráfagas ultrarrápidas (mediana de 5 ms entre peticiones). Omitió `robots.txt` y `/favicon.ico`.
3. **Actor C (`158.69.55.0/24`):** PoP Montreal/Toronto (YYZ, Canadá / OVH Hosting). Realizó 200 solicitudes (98 a trampa, 100 errores 404, alcanzando profundidad $d = 3$). Falsificó `Chrome/124.0.0.0 (Windows NT 10.0; Win64; x64)`. Cadencia de 13 ms. Omitió `robots.txt` y `/favicon.ico`.
4. **Actor B1 (`93.123.109.0/24`):** PoP Ámsterdam (AMS, Países Bajos). 334 peticiones (4 a trampa, 315 errores 404 por sondeo ciego en nivel $d = 1$). Declaró `Chrome/150.0.0.0 (Windows NT 10.0)`. Cadencia agresiva de 1 ms. Omitió `robots.txt` y `/favicon.ico`.
5. **Actor B2 (`45.138.12.0/24`):** PoP Varsovia (WAW, Polonia). 297 peticiones (4 a trampa, 285 errores 404 en nivel $d = 1$). Declaró `Chrome/150.0.0.0`. Cadencia p50 de 88 ms. Omitió `robots.txt` y `/favicon.ico`.
6. **Actor D (`45.138.12.0/24`):** Mismo prefijo `/24` de hosting en Varsovia. 14 peticiones (5 a trampa, 0 errores 404, profundidad $d = 1$). Alternó firmas de Chrome 133 sobre Windows y macOS. Cadencia p50 de 111 ms. Omitió `robots.txt` y `/favicon.ico`.

*Control Positivo del Equipo de Investigación:* Durante el período experimental, los autores realizaron visitas de control desde la IP residencial `181.4.69.0/24` empleando Google Chrome de escritorio bajo Windows 10. En el 100 % de las visitas, el navegador descargó automáticamente `GET /favicon.ico` tras procesar la raíz `/`, generando 6 clics de verificación sobre enlaces `opacity: 0` que fueron depurados del conteo final de violaciones externas.

## Anexo C. Distribución empírica por nivel de profundidad

La Tabla 6 detalla las peticiones cursadas por los dos agentes principales en cada nivel del laberinto ($d = 2$ a $d = 11$).

**Tabla 6. Distribución de peticiones por nivel de profundidad.**

| Nivel de profundidad ($d$) | ClaudeBot | GPTBot | Factor de ramificación empírico |
|---:|---:|---:|---:|
| **2** | 10 | 8 | — |
| **3** | 49 | 33 | $pprox 4,5$ |
| **4** | 223 | 122 | $pprox 4,1$ |
| **5** | 943 | 451 | $pprox 3,9$ |
| **6** | 3.680 | 1.710 | $pprox 3,8$ |
| **7** | 12.865 | 6.317 | $pprox 3,6$ |
| **8** | 42.283 | 23.328 | $pprox 3,5$ |
| **9** | 136.519 | 86.003 | $pprox 3,4$ |
| **10** | 431.550 | 318.276 | $pprox 3,3$ |
| **11 (Hojas terminales)** | **1.361.483** | **1.122.624** | Hojas sin enlaces salientes |
| **Total en laberinto** | **1.989.606** | **1.558.872** | — |

Obsérvese que las hojas terminales en nivel 11 concentraron el 68,4 % del tráfico de `ClaudeBot` y el 72,0 % de `GPTBot`, confirmando que el mecanismo de poda por profundidad máxima evitó la proliferación infinita de solicitudes.

## Anexo D. Marco estadístico de Clopper-Pearson y comparación metodológica

Para evaluar proporciones binomiales extremas con cero eventos observados ($k = 0$) sobre un total de $n$ ensayos, el estimador puntual clásico $\hat{p} = k / n = 0$ resulta insuficiente por carecer de noción de incertidumbre muestral.

El intervalo de confianza exacto de Clopper-Pearson [22] se basa en la distribución binomial acumulada sin recurrir a la aproximación normal. Para el caso particular de $k = 0$, la cota superior del intervalo al nivel de confianza $1 - lpha$ se deriva analíticamente resolviendo:

$$P(K = 0 \mid p) = (1 - p)^n = lpha \implies p_{	ext{superior}} = 1 - lpha^{1/n}$$

**Diferencia entre formulación unilateral y bilateral:**
- **Cota unilateral al 95 % ($lpha = 0,05$):** Corresponde a la hipótesis de interés en auditoría de seguridad ("garantizar con un 95 % de certeza que la tasa real de infracción no supera este valor"):
  $$p_{	ext{unilateral}} = 1 - 0,05^{1/n}$$
  Para $n = 3$ operadores: $1 - 0,05^{1/3} = 1 - 0,3684 = 63,16\% pprox 63,2\%$.
- **Cota bilateral al 95 % ($lpha / 2 = 0,025$):** Distribuye el error simétricamente en ambas colas de la distribución:
  $$p_{	ext{bilateral}} = 1 - 0,025^{1/n}$$
  Para $n = 3$ operadores: $1 - 0,025^{1/3} = 1 - 0,2924 = 70,76\% pprox 70,8\%$.

**Discusión sobre pseudorreplicación muestral:**  
Si se consideraran individualmente los 5,36 millones de enlaces trampa expuestos como ensayos independientes ($n = 5.365.320, k = 0$), la cota de Clopper-Pearson arrojaría valores infinitesimales del orden de $5,5 	imes 10^{-7}$. Sin embargo, en Internetworking las peticiones emitidas por un mismo crawler responden a una política algorítmica centralizada compartida por todas las instancias del operador: las observaciones a nivel de enlace no son estadísticamente independientes. Tratar cada hipervínculo como un ensayo independiente incurriría en **pseudorreplicación**. Por esta razón, el presente trabajo enmarca rigurosamente la conclusión estadística a nivel de operador ($n = 3, k = 0$), reportando la cota exacta de 63,2 % y reservando los valores a nivel de enlace con fines meramente descriptivos de la carga de tráfico absorbida.
