# Guía de Uso: Presentación y Teleprompter (Modo Dual / Grabación)

Este directorio contiene la presentación interactiva y la consola de control con teleprompter para la defensa del trabajo de investigación sobre el **Honeypot de Crawlers (RFC 9309)** para la cátedra de **Internetworking**.

---

## 🖥️ Configuración para Grabación en Dos Monitores

El sistema utiliza la API estándar de navegadores **`BroadcastChannel`** (`honeypot_presentation_sync`), lo que permite que dos ventanas independientes del navegador (en la misma máquina o en diferentes monitores) se comuniquen y se sincronicen bidireccionalmente **en tiempo real y sin necesidad de ningún servidor backend**:

```
+------------------------------------+          +------------------------------------+
|            MONITOR 1               |          |            MONITOR 2               |
|      (PANTALLA DE GRABACIÓN)       |  SYNC    |  (CONSOLA DE CONTROL & PROMPTER)   |
|                                    |<-------->|                                    |
|   `index.html` (Diapositivas)      |          |   `prompter.html` (Guión + Control)|
|   - Modo Pantalla Completa (F)     |          |   - Cronómetro 20:00 (Pacing)      |
|   - Diagramas Vectoriales Animados |          |   - Guión oral completo palabra    |
|   - Gráficos SVG interactivos      |          |   - Avance/retroceso de 17 slides  |
|   - Mapeo Gráfico del Modelo OSI   |          |   - Ajustes de fuente y scroll     |
+------------------------------------+          +------------------------------------+
```

### Pasos para Grabar la Presentación:
1. **Abrir la Presentación Principal:**
   - Haz doble clic en `presentacion/index.html` o ábrelo con Google Chrome, Microsoft Edge, Brave o Firefox.
2. **Abrir la Consola de Teleprompter:**
   - En `index.html`, haz clic en el botón **`MODO PRESENTADOR [P]`** ubicado en la barra superior o presiona la tecla <kbd>P</kbd>.
   - Se abrirá una ventana emergente (`prompter.html`).
   - *(Alternativa)*: También puedes abrir directamente `presentacion/prompter.html` en una pestaña o ventana independiente.
3. **Mover las Ventanas a cada Monitor:**
   - Arrastra `index.html` al **Monitor 1** (el monitor que vas a grabar con OBS Studio, Loom, Camtasia, etc.) y presiona <kbd>F</kbd> para activar **Pantalla Completa**.
   - Arrastra `prompter.html` al **Monitor 2** (tu pantalla frente a tu cámara).
4. **Sincronización Automática:**
   - Verifica que el distintivo superior en el teleprompter indique `🟢 SINCRONIZADO`.
   - Cualquier acción que realices en el teleprompter (avanzar diapositiva con <kbd>▶</kbd>, pausar o iniciar el cronómetro con <kbd>Espacio</kbd>, o saltar a una diapositiva específica) cambiará instantáneamente la pantalla que estás grabando.

---

## ⏱️ Presupuesto de Tiempo (20 Minutos Exactos · 17 Diapositivas)

El cronómetro cuenta hacia atrás desde los **20:00** y evalúa tu ritmo de discurso (**Pacing**) indicándote si vas `A TIEMPO`, `ADELANTADO` o `RETRASADO`:

| # | Diapositiva | Minuto Objetivo | Enfoque Principal |
|---|---|---|---|
| **01** | Portada y Ficha Técnica | `00:00 - 01:10` | Ficha técnica, dominio público, 3.568.349 reqs, pregunta de investigación. |
| **02** | El Auge del Scraping y la IA | `01:10 - 02:20` | Presión por preentrenar LLMs, quiebre del pacto de la web, consumo asimétrico de red. |
| **03** | Taxonomía de Rastreadores | `02:20 - 03:30` | Buscadores (Googlebot) vs IA (ClaudeBot, GPTBot) vs Scrapers hostiles encubiertos. |
| **04** | Marco Conceptual & Tarpit | `03:30 - 04:40` | RFC 9309 como sugerencia voluntaria, tarpits dinámicos y divergencia CSSOM vs Regex. |
| **05** | **Mapeo en el Modelo OSI** | `04:40 - 05:50` | **Gráfico interactivo de las 7 capas OSI**, ubicando protocolos, túnel, Nginx y Django. |
| **06** | Arquitectura del Sistema | `05:50 - 07:00` | Windows 10 + Docker WSL2, 3 redes bridge aisladas, túnel Argo QUIC (*Paquete animado*). |
| **07** | Restitución de Identidad L7 | `07:00 - 08:10` | Pérdida de IP en L4, vulnerabilidad de spoofing, mitigación estricta con `CF-Connecting-IP`. |
| **08** | Motor Sin Estado (HMAC-SHA256) | `08:10 - 09:20` | Token de 52 hex, firma truncada a 40 bits ($2^{40}$ combinaciones), inmutabilidad de Django. |
| **09** | Mecanismo de Trampa | `09:20 - 10:30` | 5 técnicas CSS, clases dinámicas aleatorias (*Animación de compuerta y captura*). |
| **10** | Evolución Cronológica (Serie) | `10:30 - 11:40` | *Gráfico interactivo SVG animado*: pico del 24/10 (1,63 M), corte del 27/10 y autorrecuperación. |
| **11** | Dinámica de Grafos (BFS vs DFS)| `11:40 - 12:50` | *Diagrama de árbol combinatorio*: ramificación $b=5$ y cota en nivel 11 por nodos hoja. |
| **12** | Caracterización de Bots de IA | `12:50 - 14:00` | GPTBot (reactivo 8,9s, 100% referer) vs ClaudeBot (batch diferido 5,0h, 10,8 req/s). |
| **13** | La Trampa & Test Chi-Cuadrado | `14:00 - 15:10` | *Gráfico de barras SVG animado*: conteos reales vs $E=41,4$, $\chi^2=0,3188, p=0,9886$. |
| **14** | Análisis Forense: Las 6 IPs | `15:10 - 16:20` | *Tabla forense*: orígenes (OVH, DataCamp), rotación temporal en 2 min y escaneo de `.env`/`.git`. |
| **15** | Observabilidad en Producción | `16:20 - 17:30` | Desacoplamiento de ingesta en vivo (Promtail-Loki) vs análisis batch con NumPy/Polars. |
| **16** | Lecciones de Internetworking | `17:30 - 18:45` | robots.txt por operador (OAI-SearchBot), ceguera a CSS, límites de JA3/JA4 en túneles. |
| **17** | Recomendaciones & Conclusión | `18:45 - 20:00` | Trampas en producción, filtrado de ASNs de hosting, repositorio abierto y cierre. |

---

## 📁 Arquitectura Modular del Proyecto

La presentación cuenta con una estructura desacoplada y modular para facilitar su mantenimiento y edición sin saturar el código:

```
presentacion/
  ├── index.html                 # Shell principal ultra ligero (~115 líneas)
  ├── prompter.html              # Consola de teleprompter independiente
  ├── css/
  │   ├── theme.css              # Variables, cuadrícula milimétrica CAD y reset
  │   ├── layout.css             # Grids (halves, thirds), paneles, tablas y HUD
  │   └── animations.css         # Keyframes, pulsos radar y animaciones de barras
  ├── js/
  │   └── presentation.js        # Controlador central, timer, atajos y BroadcastChannel
  ├── slides/                    # 17 componentes de diapositivas aislados e independientes
  │   ├── slide-01.js a slide-17.js
  └── assets/                    # Capturas y diagramas de telemetría de producción
```

* **Cero problemas de CORS**: Funciona al 100 % abriendo directamente `file:///` con doble clic o montándolo sobre cualquier servidor HTTP local.
* **Gráficos en cada cuadro**: Todos los paneles de clasificación y texto cuentan con mini-diagramas y animaciones vectoriales SVG representativas.

---

## 🌐 Representación Gráfica del Modelo OSI (Slide 05)

En la diapositiva 05 se introduce un **diagrama técnico interactivo de la pila OSI completa (Capas 1 a 7)**, vinculando cada capa con las decisiones de diseño del honeypot:

1. **Capa 7 (Aplicación):**
   * Negociación HTTP/1.1 y HTTP/2.
   * Directivas de exclusión de robots (`RFC 9309`).
   * Motor de tarpit dinámico en Django (`/public/` vs `/archivo-interno/`).
   * Divergencia de parsing: Render Tree / CSSOM frente a tokens léxicos planos.
   * Restitución autenticada de `CF-Connecting-IP`.
2. **Capa 6 (Presentación):**
   * Cifrado y terminación TLS 1.3 en el Edge de Cloudflare.
   * Formato estructurado JSON en los registros de Nginx (`honeypot_access.json`).
   * Codificación Base64URL y representación hexadecimal de tokens.
   * Criptografía simétrica HMAC-SHA256 (ausencia de JA3/JA4 en origen).
3. **Capa 5 (Sesión):**
   * Sesiones persistentes HTTP (Keep-Alive).
   * Multiplexación de túnel Argo QUIC entre `cloudflared` y el borde de Cloudflare.
   * Comunicación inter-proceso mediante sockets TCP entre Nginx y Gunicorn.
4. **Capa 4 (Transporte):**
   * Túnel saliente QUIC por **UDP (puerto 7844)** hacia Cloudflare.
   * Sockets TCP internos dentro de las subredes bridge de Docker.
   * **Cero puertos L4 abiertos en el router residencial:** Neutralización total de ataques SYN Flood y escaneos de puertos L4 dirigidos a la IP hogareña.
5. **Capa 3 (Red):**
   * Enrutamiento Anycast global de Cloudflare.
   * Direccionamiento IPv4 e IPv6 público y atribución de Sistemas Autónomos (BGP / ASN).
   * Aislamiento por subredes privadas RFC 1918 en Docker (`10.98.0.0/24`, `10.98.1.0/24`, `10.98.2.0/24`).
6. **Capa 2 (Enlace de Datos):**
   * Conmutadores virtuales bridge de Docker (`docker0`, interfaces virtuales `veth*`).
   * Aislamiento MAC entre subredes de contenedores.
   * Tramas Ethernet virtuales gestionadas por el kernel Linux 5.15 de WSL2.
7. **Capa 1 (Física):**
   * Host físico con Windows 10 Pro.
   * Interfaz de red de hardware Ethernet / Wi-Fi.
   * Conexión por fibra óptica residencial a Internet.

---

## ⌨️ Atajos de Teclado

### En la Consola de Teleprompter (`prompter.html`):
- <kbd>Espacio</kbd>: Iniciar / Pausar el cronómetro de 20 minutos.
- <kbd>→</kbd> o <kbd>N</kbd>: Siguiente diapositiva (cambia ambas pantallas simultáneamente).
- <kbd>←</kbd> o <kbd>B</kbd>: Diapositiva anterior (cambia ambas pantallas simultáneamente).
- <kbd>R</kbd>: Reiniciar cronómetro a 20:00.
- <kbd>S</kbd>: Activar / Desactivar Auto-scroll del guión.

### En la Pantalla de Presentación (`index.html`):
- <kbd>→</kbd> / <kbd>←</kbd>: Navegar diapositivas.
- <kbd>P</kbd> o <kbd>O</kbd>: Abrir la consola de Teleprompter en ventana emergente.
- <kbd>F</kbd>: Activar / Desactivar Pantalla Completa (*Fullscreen*).
- <kbd>Espacio</kbd>: Iniciar / Pausar cronómetro.
