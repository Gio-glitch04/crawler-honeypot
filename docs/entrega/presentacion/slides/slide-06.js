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
    Infraestructura de producción real: Windows 10 Pro, Docker WSL2, 3 redes bridge y túnel Argo
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: DIAGRAMA VECTORIAL DE LA ARQUITECTURA REAL -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 640 350" xmlns="http://www.w3.org/2000/svg">
        <!-- BORDE CLOUDFLARE -->
        <rect x="10" y="10" width="180" height="330" rx="4" fill="#0f1932" stroke="#f59e0b" stroke-width="1.8"/>
        <text x="100" y="34" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">BORDE CLOUDFLARE</text>
        <text x="100" y="50" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Anycast BGP · WAF · TLS 1.3</text>

        <rect x="20" y="70" width="160" height="60" rx="3" fill="#162444" stroke="#263c70" stroke-width="1.2"/>
        <text x="100" y="96" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Crawler / Cliente</text>
        <text x="100" y="114" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">TCP Handshake [L4]</text>

        <rect x="20" y="150" width="160" height="85" rx="3" fill="#162444" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="100" y="174" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Inyección L7 Headers</text>
        <text x="100" y="196" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">CF-Connecting-IP</text>
        <text x="100" y="214" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">CF-Ray (Datacenter)</text>

        <!-- TÚNEL CIFRADO QUIC -->
        <line x1="190" y1="192" x2="245" y2="192" stroke="#38bdf8" stroke-width="2.5" class="wire-pulse-fast"/>
        <text x="217" y="184" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">QUIC</text>

        <!-- HOST FÍSICO WINDOWS 10 + DOCKER WSL2 -->
        <rect x="245" y="10" width="385" height="330" rx="4" fill="#0d1830" stroke="#38bdf8" stroke-width="1.8"/>
        <text x="437" y="34" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">HOST FÍSICO: WIN10 + DOCKER WSL2</text>
        <text x="437" y="50" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Kernel Linux 5.15 · Cero puertos abiertos</text>

        <!-- CONTENEDOR CLOUDFLARED -->
        <rect x="260" y="70" width="170" height="55" rx="3" fill="#162444" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="345" y="94" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">cloudflared</text>
        <text x="345" y="112" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Túnel Outbound Cifrado</text>

        <!-- RED 1: tunnel_net -->
        <line x1="345" y1="125" x2="345" y2="155" stroke="#38bdf8" stroke-width="2" class="wire-pulse-steady"/>

        <!-- CONTENEDOR NGINX -->
        <rect x="260" y="155" width="170" height="65" rx="3" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <text x="345" y="180" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">nginx-proxy (1.29)</text>
        <text x="345" y="198" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">ngx_http_realip_module</text>

        <!-- RED 2: honeypot_net -->
        <line x1="345" y1="220" x2="345" y2="250" stroke="#10b981" stroke-width="2" class="wire-pulse-steady"/>

        <!-- CONTENEDOR DJANGO -->
        <rect x="260" y="250" width="170" height="70" rx="3" fill="#162444" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="345" y="274" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">honeypot-app (Django)</text>
        <text x="345" y="292" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">read_only: true (Sin BD)</text>
        <text x="345" y="308" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">HMAC Stateless en RAM</text>

        <!-- TELEMETRÍA: PROMTAIL & LOKI -->
        <rect x="455" y="70" width="160" height="250" rx="3" fill="#101c36" stroke="#263c70" stroke-width="1.2" stroke-dasharray="3 3"/>
        <text x="535" y="94" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">telemetry_net</text>

        <rect x="470" y="115" width="130" height="45" rx="3" fill="#162444" stroke="#263c70" stroke-width="1.2"/>
        <text x="535" y="138" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Promtail</text>
        <text x="535" y="152" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Ingesta logs JSON</text>

        <line x1="535" y1="160" x2="535" y2="195" stroke="#38bdf8" stroke-width="1.8" class="wire-pulse-steady"/>

        <rect x="470" y="195" width="130" height="45" rx="3" fill="#162444" stroke="#263c70" stroke-width="1.2"/>
        <text x="535" y="218" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Loki 3.5.0</text>
        <text x="535" y="232" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Indexación LogQL</text>

        <!-- PAQUETE ANIMADO -->
        <circle r="3.5" fill="#38bdf8">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M 100 100 L 100 192 L 345 97 L 345 187 L 345 285"/>
        </circle>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Flujo de datos:</strong> WAN → Cloudflare → QUIC → Nginx → Django → Loki</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: DESCRIPCIÓN TÉCNICA Y PARÁMETROS -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>INFRAESTRUCTURA DE PRODUCCIÓN</span>
        <span class="cad-tag">DESPLIEGUE REAL</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Host Físico:</strong> Windows 10 Pro ejecutando Docker Desktop con backend WSL2 (Linux 5.15). No se utilizó un VPS remoto comercial.
        </li>
        <li>
          <strong>Túnel Inverso Argo (cloudflared):</strong> Tráfico saliente cifrado sin abrir puertos en el router hogareño ni exponer la IP residencial.
        </li>
        <li>
          <strong>3 Redes Docker Bridge Aisladas:</strong>
          <code>tunnel_net</code> (10.98.0.0/24), <code>honeypot_net</code> (10.98.1.0/24) y <code>telemetry_net</code> (10.98.2.0/24).
        </li>
        <li>
          <strong>Nginx 1.29-alpine:</strong> Restitución de IP real con <code>ngx_http_realip_module</code> y formateo de logs a JSON estructurado.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Seguridad Perimetral:</span> Cero superficie de ataque L4 expuesta a escaneos portuarios directos sobre el host.
      </div>
    </div>
  </div>
</section>
`);