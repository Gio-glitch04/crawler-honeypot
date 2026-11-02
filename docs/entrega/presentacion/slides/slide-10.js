/* SLIDE 10: CRONOLOGÍA Y EVOLUCIÓN TEMPORAL */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-9">
  <div class="slide-coord-line">
    <span>SECCIÓN 10 · TELEMETRÍA TEMPORAL</span>
    <span class="coord-spec">SERIE DE TIEMPO (18 AL 30 DE OCTUBRE · 11,85 DÍAS)</span>
  </div>
  <h1 class="slide-title-hero">Cronología del Experimento: Dinámica Temporal</h1>
  <p class="slide-lead-desc">
    11,85 días continuos de observación: picos de indexación de IA, ráfagas de escaneo y capturas
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: GRÁFICO VECTORIAL DE SERIES TEMPORALES -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 310" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="20" x2="50" y2="250" stroke="#263c70" stroke-width="1.2"/>
        <line x1="50" y1="250" x2="590" y2="250" stroke="#263c70" stroke-width="1.2"/>

        <line x1="50" y1="60" x2="590" y2="60" stroke="#162444" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="42" y="64" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="end">1.0M</text>

        <line x1="50" y1="150" x2="590" y2="150" stroke="#162444" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="42" y="154" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="end">500k</text>

        <!-- Curva de Tráfico General -->
        <path d="M 70 240 L 120 235 L 170 230 L 220 220 L 260 210 L 310 55 L 360 80 L 410 180 L 460 220 L 510 230 L 550 235 L 580 240" 
              fill="none" stroke="#38bdf8" stroke-width="2.5" class="wire-pulse-steady"/>

        <!-- Pico Diario 24 Octubre (1.059.733) -->
        <circle cx="310" cy="55" r="5" fill="#f59e0b" stroke="#fff" stroke-width="1.8"/>
        <rect x="235" y="8" width="150" height="24" rx="3" fill="#0f1932" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="310" y="24" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">Pico 24/10: 1,06M reqs</text>

        <!-- 207 Capturas Trampa -->
        <circle cx="260" cy="210" r="5" fill="#f43f5e" stroke="#fff" stroke-width="1.8"/>
        <rect x="185" y="170" width="150" height="24" rx="3" fill="#2d131f" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="260" y="186" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">207 Capturas Trampa</text>

        <!-- Eje Temporal -->
        <text x="70" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">18/10</text>
        <text x="170" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">20/10</text>
        <text x="260" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">22/10</text>
        <text x="310" y="270" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">24/10</text>
        <text x="410" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">26/10</text>
        <text x="510" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">28/10</text>
        <text x="580" y="270" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">30/10</text>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Volumen Válido:</strong> 3.568.349 peticiones (~10,9 GB)</span>
        <span class="cad-caption-tag"><strong>Ventana:</strong> 11,85 días (18/10 al 30/10)</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: HALLAZGOS DE LA DINÁMICA TEMPORAL -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>FASES CLAVE DE LA OBSERVACIÓN</span>
        <span class="cad-tag">CRONOLOGÍA</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>18–22 Oct (Descubrimiento & Despegue):</strong> Salida a DNS. Seeding en GitHub y Hacker News (0 visitas por tokens semilla; descubrimiento orgánico por CT logs y raíz, con 1 Referer de HN y 51 de Google). El 21/10 05:30:30 UTC, <code>OAI-SearchBot</code> consulta <code>robots.txt</code> y 749 ms después arranca <code>GPTBot</code>.
        </li>
        <li>
          <strong>19–26 Oct (Infractores):</strong> 6 actores camuflados como Chrome entran 207 veces a la trampa; ninguno pasa del nivel 3 del laberinto.
        </li>
        <li>
          <strong>24–25 Oct (Diluvio de IA):</strong> Ráfagas de <strong>ClaudeBot</strong> de hasta 38.787 req/h (~10,8 req/s). Pico diario global de 1.059.733 reqs el 24/10; el 25/10 ClaudeBot se retira sin haber tocado la trampa.
        </li>
        <li>
          <strong>26–30 Oct (Cadencia Constante):</strong> <strong>GPTBot</strong> operó con ritmo estricto de ~2,00 req/s (7.184 req/h mediana) hasta el corte final programado del 30/10 (17:57 UTC).
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Incidencia Host 27/10:</span> 8 h 57 min sin registro (03:03–12:00 UTC; ~64.000 reqs de GPTBot estimadas perdidas según su cadencia). Causa no confirmada; declarada en el informe.
      </div>
    </div>
  </div>
</section>
`);
