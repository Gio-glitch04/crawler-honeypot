/* SLIDE 09: MECÁNICA DE LA TRAMPA Y DIFERENCIACIÓN */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-8">
  <div class="slide-coord-line">
    <span>SECCIÓN 09 · OFUSCACIÓN & INGENIERÍA INVERSA</span>
    <span class="coord-spec">LÓGICA DE DISCRIMINACIÓN</span>
  </div>
  <h1 class="slide-title-hero">Mecánica de Captura: La Trampa CSS en Detalle</h1>
  <p class="slide-lead-desc">
    Divergencia entre motores de renderizado completo (CSSOM) y extractores sintácticos ciegos
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: ESQUEMA VECTORIAL -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 340" xmlns="http://www.w3.org/2000/svg">
        <!-- SERVIDOR HONEYPOT (ORIGEN) -->
        <rect x="210" y="10" width="200" height="50" rx="4" fill="#152244" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="310" y="32" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">SERVIDOR HONEYPOT</text>
        <text x="310" y="48" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">HTML: 5 Públicos + 5 Trampas [L7]</text>

        <!-- RAMA IZQUIERDA: NAVEGADOR HUMANO -->
        <path d="M 260 60 L 130 100" stroke="#10b981" stroke-width="2" class="wire-pulse-steady" fill="none"/>
        <rect x="25" y="100" width="210" height="135" rx="4" fill="#101c36" stroke="#10b981" stroke-width="1.2"/>
        <text x="130" y="124" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">NAVEGADOR HUMANO</text>
        <text x="130" y="140" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Chromium / Gecko / WebKit</text>

        <rect x="40" y="152" width="180" height="26" rx="3" fill="#080d1a" stroke="#263c70" stroke-width="1"/>
        <text x="130" y="169" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">Calcula CSSOM (display:none)</text>

        <rect x="40" y="186" width="180" height="34" rx="3" fill="#080d1a" stroke="#10b981" stroke-width="1"/>
        <text x="130" y="202" fill="#fff" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Solo Enlaces Visibles</text>
        <text x="130" y="214" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">0 ACCESOS A TRAMPAS</text>

        <!-- RAMA DERECHA: SCRAPER NO DECLARADO -->
        <path d="M 360 60 L 490 100" stroke="#f43f5e" stroke-width="2" class="wire-pulse-steady" fill="none"/>
        <rect x="385" y="100" width="210" height="135" rx="4" fill="#101c36" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="490" y="124" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">SCRAPER NO DECLARADO</text>
        <text x="490" y="140" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">requests / curl / regex / Scrapy</text>

        <rect x="400" y="152" width="180" height="26" rx="3" fill="#080d1a" stroke="#263c70" stroke-width="1"/>
        <text x="490" y="169" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">Parseo Plano: Ciego a CSS</text>

        <rect x="400" y="186" width="180" height="34" rx="3" fill="#080d1a" stroke="#f43f5e" stroke-width="1"/>
        <text x="490" y="202" fill="#fff" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Extrae todo el HTML crudo</text>
        <text x="490" y="214" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">SIGUE /archivo-interno/</text>

        <!-- TRAYECTORIA DE CAPTURA EN EL TARPIT -->
        <path d="M 490 235 L 490 270 L 310 270 L 310 290" stroke="#f43f5e" stroke-width="2" class="wire-pulse-fast" fill="none"/>

        <rect x="185" y="290" width="250" height="42" rx="4" fill="#162444" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="310" y="310" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="800" text-anchor="middle">¡ATRAPADO EN EL TARPIT!</text>
        <text x="310" y="324" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Django decodifica HMAC · Alerta en Grafana</text>

        <circle cx="310" cy="311" r="14" fill="none" stroke="#f43f5e" stroke-width="1.5">
          <animate attributeName="r" values="6; 26; 6" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0; 0.85; 0" keyTimes="0; 0.7; 1" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Principio:</strong> La ceguera al motor de estilos aísla a los robots con fidelidad del 100%</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: EXPLICACIÓN DETALLADA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>TÉCNICAS DE OFUSCACIÓN EVALUADAS</span>
        <span class="cad-tag">5 VARIANTES CSS</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Visible de Control:</strong> Enlace público de referencia para medir la tasa de extracción de base de los scrapers.
        </li>
        <li>
          <strong>Inline display: none:</strong> Atributo en línea (<code>style="display:none"</code>). Detectable por regex básica si el scraper la contempla.
        </li>
        <li>
          <strong>Clase CSS Dinámica:</strong> Nombre efímero (ej. <code>._k8f12a { display: none }</code>) inyectado en bloque <code>&lt;style&gt;</code>. Resiste filtros simples.
        </li>
        <li>
          <strong>Offscreen:</strong> <code>position: absolute; left: -9999px;</code>. Fuera del viewport visual humano.
        </li>
        <li>
          <strong>Opacidad Cero:</strong> <code>opacity: 0; pointer-events: none;</code>. Oculto visualmente pero presente en el árbol DOM.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Fidelidad Forense:</span> 0 falsos positivos humanos sobre 207 capturas analizadas empíricamente.
      </div>
    </div>
  </div>
</section>
`);