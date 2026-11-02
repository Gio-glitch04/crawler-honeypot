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

| # | Diapositiva | Orador | Minuto Objetivo | Enfoque Principal |
|---|---|---|---|---|
| **01** | Portada y pregunta | Joel | `00:00 - 00:55` | Pregunta de investigación, dominio señuelo, 3.568.349 pedidos, adelanto 0 / 207. |
| **02** | El trato roto de la web | Joel | `00:55 - 02:05` | Trueque roto buscador-sitio, 51 % de tráfico automático (Imperva 2025), robots.txt no es un firewall. |
| **03** | Tres tipos de visitantes | Joel | `02:05 - 03:10` | Buscadores, IA declarada (99,46 %, 0 entradas sobre 5,32 M enlaces) y 6 disfrazados (207). |
| **04** | Honeypot, laberinto y ceguera | Joel | `03:10 - 04:25` | Honeypot de baja interacción, tarpit con hojas en nivel 11, ceguera al CSS de los robots baratos. |
| **05** | Modelo OSI | Giovanni | `04:25 - 05:25` | Pila OSI: PC hogareña, túnel saliente sin puertos abiertos, TLS en el borde, honeypot de capa 7. |
| **06** | Arquitectura en producción | Giovanni | `05:25 - 06:40` | Windows 10 + Docker WSL 2, 3 redes aisladas, Django en solo lectura, se detuvo analytics el 21/10. |
| **07** | La IP real | Giovanni | `06:40 - 07:50` | IP interna del túnel, X-Forwarded-For falsificable, solo `CF-Connecting-IP` desde 10.98.0.0/24. |
| **08** | Tokens sin base de datos | Giovanni | `07:50 - 09:10` | Token de 52 hex con HMAC-SHA256 de 40 bits (1 en ~183 mil millones), mediana de 2 ms sin base de datos. |
| **09** | Trampas y niveles de falta | Joel | `09:10 - 10:45` | 5 variantes de enlace (1 control + 4 ocultas), 3 niveles de falta y el arnés de pruebas. |
| **10** | 12 días de guardia | Giovanni | `10:45 - 12:20` | Siembra 18/10 (0 visitas por semillas), pico 1.059.733 el 24/10, hueco de 8 h 57 min el 27/10. |
| **11** | El tope del laberinto | Giovanni | `12:20 - 13:15` | Ramificación 5, tope 10, hojas en nivel 11 con 68–72 % de los pedidos de ClaudeBot y GPTBot. |
| **12** | GPTBot vs ClaudeBot | Julio | `13:15 - 14:25` | GPTBot en vivo (8,9 s, ~2/s) vs ClaudeBot por tandas (5,0 h, 38.787/h); verificación por red. |
| **13** | 207 entradas y chi-cuadrado | Julio | `14:25 - 15:40` | 43/43/42/40/39 por técnica, χ² = 0,3188 (p = 0,9886), 79,2 % Nivel 3 y cota del 63,2 %. |
| **14** | Los 6 infractores | Julio | `15:40 - 16:55` | Tabla 4: 6 orígenes en centros de datos (CA, US, PL, NL), Chrome viejo, `.git`, favicon 0 de 6. |
| **15** | Grafana y la conciliación | Giovanni | `16:55 - 17:40` | Grafana 12 + Loki 3.5: 213 en el panel − 6 clics de prueba = 207. |
| **16** | Cuatro aprendizajes | Julio | `17:40 - 18:50` | robots.txt por operador (749 ms), User-Agent es texto libre, huella TLS perdida, literatura IMC 2025. |
| **17** | Defensa y cierre | Julio | `18:50 - 20:00` | Tres escalones de defensa, límites del estudio y cierre. |

Reparto: Joel ≈ 6:00 (01–04 y 09), Giovanni ≈ 8:00 (05–08, 10, 11 y 15), Julio ≈ 6:00 (12–14, 16 y 17). El texto completo de cada bloque, con las señas de puntero, está en `prompter.html`.

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
   * Cifrado y terminación TLS en el borde de Cloudflare.
   * Formato estructurado JSON en los registros de Nginx (`honeypot_access.json`).
   * Representación hexadecimal de los tokens (52 caracteres).
   * Criptografía simétrica HMAC-SHA256. Por terminar TLS en el borde, no hay huella JA3/JA4 en el origen.
3. **Capa 5 (Sesión):**
   * Sesiones persistentes HTTP (Keep-Alive).
   * Conexiones salientes del túnel entre `cloudflared` y el borde de Cloudflare (QUIC por defecto).
   * Comunicación inter-proceso mediante sockets TCP entre Nginx y Gunicorn.
4. **Capa 4 (Transporte):**
   * Túnel saliente hacia Cloudflare (QUIC sobre UDP por defecto).
   * Sockets TCP internos dentro de las subredes bridge de Docker.
   * **Cero puertos L4 abiertos en el router residencial:** la IP hogareña no expone ningún servicio.
5. **Capa 3 (Red):**
   * Enrutamiento Anycast global de Cloudflare.
   * Direccionamiento IPv4 e IPv6 público y atribución de Sistemas Autónomos (BGP / ASN).
   * Aislamiento en tres redes bridge de Docker: `tunnel_net` (`10.98.0.0/24`), `honeypot_net` y `telemetry_net` (rango asignado por Docker).
6. **Capa 2 (Enlace de Datos):**
   * Conmutadores virtuales bridge de Docker (`docker0`, interfaces virtuales `veth*`).
   * Aislamiento MAC entre subredes de contenedores.
   * Tramas Ethernet virtuales gestionadas por el kernel Linux de WSL 2.
7. **Capa 1 (Física):**
   * PC de escritorio con Windows 10 (22H2).
   * Interfaz de red de hardware Ethernet / Wi-Fi.
   * Conexión hogareña a Internet.

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
