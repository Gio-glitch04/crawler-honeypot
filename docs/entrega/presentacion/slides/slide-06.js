/* SLIDE 06: ARQUITECTURA EFECTIVAMENTE DESPLEGADA */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-5">
  <div class="slide-coord-line">
    <span>SECCIÓN 06 · TOPOLOGÍA DE INFRAESTRUCTURA</span>
    <span class="coord-spec">DESPLIEGUE EN PRODUCCIÓN</span>
  </div>
  <h1 class="slide-title-hero">Arquitectura del Sistema Efectivamente Desplegado</h1>
  <p class="slide-lead-desc">
    Infraestructura de producción real: Windows 10 Pro, Docker WSL2, 3 redes bridge y túnel cloudflared
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: DIAGRAMA VECTORIAL DE LA ARQUITECTURA REAL -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 320" xmlns="http://www.w3.org/2000/svg">
        <!-- ZONA INTERNET / PERÍMETRO EXTERNO -->
        <rect x="15" y="15" width="130" height="290" rx="4" fill="#0f1932" stroke="#263c70" stroke-width="1.2"/>
        <text x="80" y="38" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">INTERNET PÚBLICA</text>
        <circle cx="80" cy="85" r="22" fill="#152244" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="80" y="90" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">CRAWLERS</text>
        <text x="80" y="125" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">GPTBot / Claude</text>
        <text x="80" y="140" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Googlebot / Scrapers</text>

        <!-- NUBE CLOUDFLARE EDGE (ANYCAST) -->
        <rect x="80" y="180" width="1" height="1"/>
        <path d="M 45 235 C 45 220, 60 210, 75 210 C 85 195, 110 195, 120 210 C 130 210, 140 220, 140 235 C 140 250, 125 260, 110 260 L 55 260 C 40 260, 45 245, 45 235 Z" 
              fill="#111c35" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="90" y="238" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">CLOUDFLARE</text>
        <text x="90" y="252" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="9" text-anchor="middle">Anycast CDN / WAF</text>

        <!-- TÚNEL ARGO (QUIC / TLS 1.3) HACIA HOST LOCAL -->
        <path d="M 145 235 L 205 235" stroke="#f59e0b" stroke-width="2.5" class="wire-pulse-fast"/>
        <text x="175" y="225" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">QUIC/UDP</text>

        <!-- HOST LOCAL WINDOWS 10 / WSL2 UBUNTU -->
        <rect x="205" y="15" width="400" height="290" rx="4" fill="#0b1329" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="405" y="38" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">HOST LOCAL: WINDOWS 10 PRO + DOCKER WSL2</text>

        <!-- CONTENEDOR 1: CLOUDFLARED (TUNNEL_NET) -->
        <rect x="220" y="55" width="115" height="75" rx="3" fill="#152244" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="277" y="76" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">cloudflared</text>
        <text x="277" y="92" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">tunnel_net</text>
        <text x="277" y="108" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">10.98.0.2</text>

        <!-- ENLACE HTTP INTERNO TUNNEL_NET -->
        <path d="M 335 92 L 365 92" stroke="#38bdf8" stroke-width="2" class="wire-pulse-steady"/>

        <!-- CONTENEDOR 2: NGINX REVERSE PROXY -->
        <rect x="365" y="55" width="115" height="75" rx="3" fill="#152244" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="422" y="76" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">NGINX REVERSE</text>
        <text x="422" y="92" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">set_real_ip_from</text>
        <text x="422" y="108" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">10.98.0.3</text>

        <!-- ENLACE HACIA DJANGO EN HONEYPOT_NET -->
        <path d="M 480 92 L 505 92 L 505 180 L 480 180" stroke="#10b981" stroke-width="2" class="wire-pulse-fast"/>
        <text x="515" y="140" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="start">Proxy L7</text>

        <!-- CONTENEDOR 3: DJANGO HONEYPOT CORE (HONEYPOT_NET) -->
        <rect x="365" y="155" width="115" height="75" rx="3" fill="#0f281e" stroke="#10b981" stroke-width="1.5"/>
        <text x="422" y="176" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">DJANGO ENGINE</text>
        <text x="422" y="192" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">HMAC Stateless</text>
        <text x="422" y="208" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="9" text-anchor="middle">0 escrituras a disco</text>

        <!-- ZONA DE TELEMETRÍA: PROMTAIL & LOKI -->
        <rect x="220" y="155" width="115" height="75" rx="3" fill="#152244" stroke="#a855f7" stroke-width="1.2"/>
        <text x="277" y="176" fill="#a855f7" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">PROMTAIL</text>
        <text x="277" y="192" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">Pipe JSON Log</text>
        <text x="277" y="208" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="middle">Loki (OOM 21/10)</text>

        <!-- ENLACE TELEMETRÍA OFFLINE PYTHON -->
        <rect x="220" y="245" width="260" height="45" rx="3" fill="#1a1528" stroke="#a855f7" stroke-width="1.2"/>
        <text x="350" y="263" fill="#a855f7" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">STREAMING OFFLINE EN PYTHON</text>
        <text x="350" y="278" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="9.5" text-anchor="middle">honeypot_access.json.tar.gz · 3,56M líneas validadas</text>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Host:</strong> Windows 10 Pro (22H2)</span>
        <span class="cad-caption-tag"><strong>Túnel:</strong> cloudflared:2025.9.1</span>
        <span class="cad-caption-tag"><strong>Redes Bridge:</strong> 3 aisladas</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: DESGLOSE ARQUITECTÓNICO FORMAL -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>TOPOLOGÍA DE RED Y SEGURIDAD FÍSICA</span>
        <span class="cad-tag">AISLAMIENTO</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Cero Puertos Expuestos (Inbound):</strong> Cloudflare Tunnel establece una conexión saliente TLS/QUIC. El firewall local y el router descartan el 100 % del tráfico entrante no solicitado.
        </li>
        <li>
          <strong>Aislamiento de Red L2/L3 en Docker:</strong>
          <ul style="margin-top:4px; margin-left:14px; font-size:12.5px; color:var(--text-secondary); line-height:1.4;">
            <li><code>tunnel_net</code> (<code>10.98.0.0/24</code>): Puente exclusivo entre cloudflared y Nginx.</li>
            <li><code>honeypot_net</code> (<code>172.20.0.0/16</code>): Nginx reverse proxy y motor Django.</li>
            <li><code>telemetry_net</code> (<code>172.21.0.0/16</code>): Pipeline de observabilidad Promtail / Loki / Grafana.</li>
          </ul>
        </li>
        <li>
          <strong>Modo de Ejecución de Contenedores:</strong> Contenedor Django ejecutado con sistema de archivos <code>read_only: true</code>; cero I/O a disco en peticiones web para evitar DoS por saturación de almacenamiento.
        </li>
        <li>
          <strong>Telemetría y Resiliencia Forense:</strong> Loki 3.5.0 sufrió OOM el 21/10 ante el diluvio de crawlers; los logs brutos de Nginx persistidos en disco permitieron procesamiento en streaming offline con validación 1:1.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Seguridad Perimetral:</span> El servidor permaneció oculto sin IP pública expuesta durante los 11,85 días del experimento.
      </div>
    </div>
  </div>
</section>
`);
