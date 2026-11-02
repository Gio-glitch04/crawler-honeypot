/* SLIDE 05: MAPEO DEL SISTEMA EN EL MODELO OSI (7 CAPAS) */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-4">
  <div class="slide-coord-line">
    <span>SECCIÓN 05 · FUNDAMENTOS DE RED</span>
    <span class="coord-spec">CORRESPONDENCIA ARQUITECTÓNICA</span>
  </div>
  <h1 class="slide-title-hero">Mapeo del Experimento en las 7 Capas del Modelo OSI</h1>
  <p class="slide-lead-desc">
    Correspondencia exacta entre las capas teóricas de red y los componentes desplegados en producción
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: DIAGRAMA VECTORIAL DE LA PILA OSI COMPLETA -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 350" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="osiGradL7" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
            <stop offset="1%" stop-color="#152244" stop-opacity="0.9"/>
          </linearGradient>
        </defs>

        <!-- L7: APLICACIÓN -->
        <rect x="10" y="10" width="430" height="42" rx="4" fill="url(#osiGradL7)" stroke="#38bdf8" stroke-width="1.8"/>
        <text x="24" y="28" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L7 · APLICACIÓN</text>
        <text x="24" y="44" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">RFC 9309, HTTP/1.1-H2, Django Tarpit, CSSOM vs Regex, CF-IP</text>
        <rect x="450" y="10" width="160" height="42" rx="4" fill="#101932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="530" y="36" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Nginx & Django</text>

        <!-- L6: PRESENTACIÓN -->
        <rect x="10" y="58" width="430" height="42" rx="4" fill="#152244" stroke="#a78bfa" stroke-width="1.2"/>
        <text x="24" y="76" fill="#a78bfa" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L6 · PRESENTACIÓN</text>
        <text x="24" y="92" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">TLS terminado en el borde, Logs JSON Nginx, tokens HMAC en hex</text>
        <rect x="450" y="58" width="160" height="42" rx="4" fill="#101932" stroke="#a78bfa" stroke-width="1.2"/>
        <text x="530" y="84" fill="#a78bfa" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">Cloudflare Edge</text>

        <!-- L5: SESIÓN -->
        <rect x="10" y="106" width="430" height="42" rx="4" fill="#152244" stroke="#f472b6" stroke-width="1.2"/>
        <text x="24" y="124" fill="#f472b6" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L5 · SESIÓN</text>
        <text x="24" y="140" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">Túnel cloudflared saliente (QUIC por defecto), HTTP Keep-Alive</text>
        <rect x="450" y="106" width="160" height="42" rx="4" fill="#101932" stroke="#f472b6" stroke-width="1.2"/>
        <text x="530" y="132" fill="#f472b6" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">cloudflared Tunnel</text>

        <!-- L4: TRANSPORTE -->
        <rect x="10" y="154" width="430" height="42" rx="4" fill="#152244" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="24" y="172" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L4 · TRANSPORTE</text>
        <text x="24" y="188" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">UDP (QUIC saliente) y TCP interno. Cero puertos abiertos</text>
        <rect x="450" y="154" width="160" height="42" rx="4" fill="#101932" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="530" y="180" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">QUIC UDP / TCP</text>

        <!-- L3: RED -->
        <rect x="10" y="202" width="430" height="42" rx="4" fill="#152244" stroke="#10b981" stroke-width="1.2"/>
        <text x="24" y="220" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L3 · RED</text>
        <text x="24" y="236" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">Anycast BGP, IPv4/IPv6, Subredes Docker (10.98.0.0/24)</text>
        <rect x="450" y="202" width="160" height="42" rx="4" fill="#101932" stroke="#10b981" stroke-width="1.2"/>
        <text x="530" y="228" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">BGP / Docker IP</text>

        <!-- L2: ENLACE DE DATOS -->
        <rect x="10" y="250" width="430" height="42" rx="4" fill="#152244" stroke="#34d399" stroke-width="1.2"/>
        <text x="24" y="268" fill="#34d399" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L2 · ENLACE DE DATOS</text>
        <text x="24" y="284" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">Bridges virtuales Docker (veth*), Ethernet virtual en WSL2</text>
        <rect x="450" y="250" width="160" height="42" rx="4" fill="#101932" stroke="#34d399" stroke-width="1.2"/>
        <text x="530" y="276" fill="#34d399" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">WSL2 Bridges</text>

        <!-- L1: FÍSICA -->
        <rect x="10" y="298" width="430" height="42" rx="4" fill="#152244" stroke="#94a3b8" stroke-width="1.2"/>
        <text x="24" y="316" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700">L1 · FÍSICA</text>
        <text x="24" y="332" fill="#f1f5f9" font-family="'Space Grotesk', sans-serif" font-size="11">PC de escritorio con Windows 10, conexión hogareña</text>
        <rect x="450" y="298" width="160" height="42" rx="4" fill="#101932" stroke="#94a3b8" stroke-width="1.2"/>
        <text x="530" y="324" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">PC hogareña</text>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Eje Central:</strong> Desacople entre transporte L4 y semántica HTTP en L7</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: LECCIONES POR CAPA EN LA MATERIA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>IMPLICACIONES DE RED EN EL EXPERIMENTO</span>
        <span class="cad-tag">PILAR PROTOCOLAR</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Capas Superiores (L6-L7):</strong> El experimento evalúa semántica web en L7 (RFC 9309, cabeceras HTTP, parsers CSSOM). En L6, TLS se termina en el borde de Cloudflare, lo que protege el origen pero impide la huella TLS (JA3/JA4) del visitante.
        </li>
        <li>
          <strong>Transporte y Sesión (L4-L5):</strong> Cero puertos abiertos en el router residencial. La PC abre desde adentro las conexiones salientes de <code>cloudflared</code> hacia el borde Anycast (QUIC por defecto).
        </li>
        <li>
          <strong>Red y Enlace (L1-L3):</strong> 3 redes bridge aisladas (<code>tunnel_net</code> en 10.98.0.0/24; las otras con rango asignado por Docker) sobre Windows 10 con Docker Desktop (WSL 2).
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Conclusión OSI:</span> La efectividad defensiva en L7 se sustenta en el aislamiento y blindaje de las capas de transporte L4/L5 en el perímetro.
      </div>
    </div>
  </div>
</section>
`);
