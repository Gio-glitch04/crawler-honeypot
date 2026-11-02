/* SLIDE 02: EL PANORAMA DEL SCRAPING Y LA CARRERA DE IA */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-1">
  <div class="slide-coord-line">
    <span>SECCIÓN 02 · CONTEXTO DEL ECOSISTEMA WEB</span>
    <span class="coord-spec">IMPACTO EN CAPA 7</span>
  </div>
  <h1 class="slide-title-hero">El Auge del Scraping Masivo y la Presión de la IA</h1>
  <p class="slide-lead-desc">
    La carrera por ingestar la web abierta y su impacto asimétrico sobre los servidores de origen
  </p>

  <div class="grid-halves equal">
    <!-- PANEL 1: ASIMETRÍA DE INGESTA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>ASIMETRÍA EN LA INGESTA DE CONTENIDO</span>
        <span class="cad-tag">TENDENCIA L7</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="115" height="70" rx="4" fill="#111c35" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="72" y="44" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">WEB PÚBLICA</text>
        <text x="72" y="64" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="11" text-anchor="middle">Contenido & Ancho Banda</text>

        <line x1="130" y1="50" x2="270" y2="50" stroke="#f59e0b" stroke-width="2" class="wire-pulse-fast"/>
        <text x="200" y="40" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">INGESTA MASIVA</text>
        <text x="200" y="68" fill="#fca5a5" font-family="'Space Grotesk', sans-serif" font-size="10.5" font-weight="600" text-anchor="middle">0 visitas devueltas</text>

        <rect x="270" y="15" width="135" height="70" rx="4" fill="#2d131f" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="337" y="44" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">CLUSTER IA</text>
        <text x="337" y="64" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="11" text-anchor="middle">GPT-4 / Claude / Llama</text>

        <circle r="3.5" fill="#f59e0b">
          <animateMotion dur="1.8s" repeatCount="indefinite" path="M 130 50 L 270 50"/>
        </circle>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Ruptura del acuerdo web:</strong> Los buscadores indexaban a cambio de derivar visitas; los LLMs extraen contenido textual para preentrenamiento y RAG sin retorno de tráfico (Steinacker et al., 2025).</li>
        <li><strong>Carga asimétrica:</strong> Mediciones de Imperva (Bad Bot Report 2025) señalan que el tráfico automatizado supera el 51 % en la web; ráfagas masivas consumen CPU y ancho de banda en servidores independientes.</li>
        <li><strong>Externalización de costos:</strong> El servidor de origen asume la factura de infraestructura mientras el operador comercial monetiza el modelo sin reciprocidad.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Dilema Operativo:</span> Servidores independientes financian el entrenamiento de LLMs sin reciprocidad de tráfico ni consentimiento expreso.
      </div>
    </div>

    <!-- PANEL 2: DEFICIENCIAS DEL PERÍMETRO CONVENCIONAL -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>POROSIDAD DE LAS DEFENSAS CLÁSICAS</span>
        <span class="cad-tag">SEGURIDAD L7</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="115" height="70" rx="4" fill="#141f38" stroke="#f59e0b" stroke-dasharray="4 4" stroke-width="1.5"/>
        <text x="72" y="42" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">ROBOTS.TXT</text>
        <text x="72" y="60" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="11" text-anchor="middle">RFC 9309 Voluntario</text>
        <text x="72" y="74" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">(Sin freno en TCP)</text>

        <path d="M 130 50 L 210 50" stroke="#38bdf8" stroke-width="2" class="wire-pulse-fast"/>
        <text x="170" y="40" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">EVASIÓN</text>

        <rect x="210" y="15" width="195" height="70" rx="4" fill="#0f1932" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="307" y="40" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">PROXIES RESIDENCIALES</text>
        <text x="307" y="58" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="11" text-anchor="middle">Rotación de IP masiva</text>
        <text x="307" y="74" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">Falso User-Agent Chrome</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>RFC 9309 no es un firewall:</strong> Es un protocolo consultivo; cualquier cliente HTTP puede ignorarlo deliberadamente sin bloqueo a nivel L4.</li>
        <li><strong>Evasión de listas negras:</strong> Scrapers no declarados rotan direcciones IP residenciales y fingen firmas de navegadores de escritorio (Kim et al., IMC 2025).</li>
        <li><strong>Vacío en la literatura:</strong> Auditorías como Liu et al. (IMC 2025) miden robots.txt convencional pero no evalúan trampas señuelo ni ofuscación CSSOM.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-rose); font-weight:700;">Falla Estructural:</span> La reputación de IP y las cabeceras HTTP son fácilmente falseables por actores no declarados.
      </div>
    </div>
  </div>
</section>
`);
