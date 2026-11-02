/* SLIDE 04: MARCO CONCEPTUAL & TARPIT */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-3">
  <div class="slide-coord-line">
    <span>SECCIÓN 04 · FUNDAMENTOS TEÓRICOS</span>
    <span class="coord-spec">MECANISMOS DE DEFENSA WEB</span>
  </div>
  <h1 class="slide-title-hero">Marco Conceptual: Honeypots, Tarpits y RFC 9309</h1>
  <p class="slide-lead-desc">
    La brecha operativa entre directivas voluntarias y la ceguera al renderizado DOM/CSS
  </p>

  <div class="grid-thirds">
    <!-- PANEL 1: RFC 9309 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>RFC 9309 (ROBOTS.TXT)</span>
        <span class="cad-tag">DIRECTIVA L7</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="14" width="44" height="62" rx="3" fill="#111c35" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="30" y1="26" x2="56" y2="26" stroke="#38bdf8" stroke-width="1.8"/>
        <line x1="30" y1="38" x2="56" y2="38" stroke="#cbd5e1" stroke-width="1.2"/>
        <line x1="30" y1="50" x2="52" y2="50" stroke="#f43f5e" stroke-width="1.2"/>
        <line x1="30" y1="62" x2="58" y2="62" stroke="#94a3b8" stroke-width="1.2"/>

        <rect x="80" y="16" width="188" height="26" rx="3" fill="#0f1932" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="90" y="33" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700">Disallow: /archivo-interno/</text>

        <rect x="80" y="48" width="188" height="26" rx="3" fill="#0f1932" stroke="#263c70" stroke-width="1.2"/>
        <text x="90" y="65" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5">Voluntario: 0 control en L4</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Estándar IETF formal:</strong> Regla de exclusión consultiva sin enforcement forzoso en la red.</li>
        <li><strong>Dependencia ética:</strong> No existe mecanismo a nivel socket o TCP para impedir que un cliente descargue la URL.</li>
        <li><strong>Caché centralizada:</strong> Proveedores masivos (OpenAI, Google) consultan y comparten directivas en caché por operador.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Protocolo Ciego:</span> No previene ataques ni scraping malicioso si el cliente elige omitirlo.
      </div>
    </div>

    <!-- PANEL 2: TARPIT DINÁMICO L7 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>TARPIT DINÁMICO L7</span>
        <span class="cad-tag">LABERINTO DEFENSIVO</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="32" r="8" fill="#152244" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="38" y1="40" x2="24" y2="62" stroke="#38bdf8" stroke-width="1.2"/>
        <line x1="38" y1="40" x2="52" y2="62" stroke="#38bdf8" stroke-width="1.2"/>
        <circle cx="24" cy="62" r="6" fill="#152244" stroke="#10b981" stroke-width="1.2"/>
        <circle cx="52" cy="62" r="6" fill="#152244" stroke="#10b981" stroke-width="1.2"/>

        <rect x="80" y="16" width="188" height="26" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="90" y="33" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700">Grafo Infinito Stateless</text>

        <rect x="80" y="48" width="188" height="26" rx="3" fill="#0f1932" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="90" y="65" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5">Cota Hoja: Nivel 11</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Fundamentos de Deception:</strong> De Spitzner (2002) y LaBrea (Liston, 2001) a los tarpits L7 modernos (Cloudflare AI Labyrinth).</li>
        <li><strong>Sin persistencia en base de datos:</strong> Generación y validación al vuelo por firmas criptográficas HMAC en RAM ($O(1)$).</li>
        <li><strong>Clausura determinista:</strong> Se corta en profundidad 10 emitiendo nodos hoja terminales en nivel 11 sin enlaces salientes.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-blue); font-weight:700;">Neutralización:</span> Transforma el costo del scraping en un bucle cerrado sin fin útil ni impacto en disco.
      </div>
    </div>

    <!-- PANEL 3: OFUSCACIÓN CSS -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>CSSOM VS PARSEO PLANO</span>
        <span class="cad-tag">DISCRIMINACIÓN</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="20" width="58" height="50" rx="3" fill="#111c35" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="43" y="42" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">DOM</text>
        <text x="43" y="56" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">&lt;a href&gt;</text>

        <path d="M 76 45 L 122 45" stroke="#f59e0b" stroke-width="2" class="wire-pulse-fast"/>
        <text x="99" y="38" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" text-anchor="middle">CSSOM</text>

        <rect x="126" y="15" width="142" height="60" rx="3" fill="#2d131f" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="197" y="34" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">RENDER TREE</text>
        <text x="197" y="48" fill="#fca5a5" font-family="'Space Grotesk', sans-serif" font-size="9" text-anchor="middle">display: none;</text>
        <text x="197" y="62" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" text-anchor="middle">0x0 px (Invisible)</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Brecha de Renderizado:</strong> Scrapers livianos usan regex o parseo HTML plano sin computar estilos CSS ni visibilidad.</li>
        <li><strong>Técnicas Señuelo:</strong> Enlaces ocultos con <code>display:none</code>, <code>opacity:0</code>, posiciones fuera de pantalla y clases dinámicas.</li>
        <li><strong>Inmunidad Humana:</strong> Un usuario con navegador visual nunca activa estos enlaces; su consumo delata automatización.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Discriminación Visual:</span> Separa crawlers avanzados de extractores ciegos sin interacción invasiva.
      </div>
    </div>
  </div>
</section>
`);
