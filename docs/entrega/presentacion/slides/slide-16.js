/* SLIDE 16: HALLAZGOS CLAVE DE INTERNETWORKING */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-15">
  <div class="slide-coord-line">
    <span>SECCIÓN 16 · LECCIONES DE LA MATERIA</span>
    <span class="coord-spec">SÍNTESIS DE PROTOCOLOS Y REDES</span>
  </div>
  <h1 class="slide-title-hero">Hallazgos Clave y Lecciones de Internetworking</h1>
  <p class="slide-lead-desc">
    Desmitificación de robots.txt, comportamiento de scrapers y arquitectura de sistemas distribuidos
  </p>

  <div class="grid-halves equal">
    <!-- PANEL 1: CACHÉ DE OPERADOR -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>REDES & PROTOCOLOS L7</span>
        <span class="cad-tag">NIVEL OPERADOR</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 85" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="130" height="55" rx="3" fill="#152244" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="80" y="38" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">OAI-SearchBot</text>
        <text x="80" y="54" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Descarga robots.txt</text>

        <path d="M 145 42 L 255 42" stroke="#38bdf8" stroke-width="2.5" class="wire-pulse-fast"/>
        <text x="200" y="34" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">0,75 s / Caché</text>

        <rect x="255" y="15" width="150" height="55" rx="3" fill="#0f1932" stroke="#10b981" stroke-width="1.5"/>
        <text x="330" y="38" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">GPTBot Cluster</text>
        <text x="330" y="54" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Rastreo masivo L7</text>
      </svg>

      <ul class="cad-item-list">
        <li>
          <strong>robots.txt se Consulta por Operador:</strong> GPTBot nunca solicitó <code>robots.txt</code> con su User-Agent propio; su satélite <code>OAI-SearchBot</code> lo descargó y compartió en caché en 0,75s. Auditar por User-Agent aislado es un sesgo metodológico.
        </li>
        <li>
          <strong>Pérdida de Huella TLS en Túneles L7:</strong> Al delegar la terminación SSL en Cloudflare, se perdió la visibilidad de firmas JA3/JA4 en el origen. Para fingerprinting criptográfico se requeriría un proxy TCP/SNI directo (Spectrum).
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Visión de Red:</span> La auditoría efectiva exige correlacionar bloques CIDR y ASNs completos en lugar de strings de User-Agent manipulables.
      </div>
    </div>

    <!-- PANEL 2: OFUSCACIÓN DINÁMICA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>SEGURIDAD & APLICACIÓN</span>
        <span class="cad-tag">RESILIENCIA</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 85" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="180" height="55" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="105" y="38" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">CLASES DINÁMICAS</text>
        <text x="105" y="54" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">._k9f21b7a { display: none }</text>

        <rect x="225" y="15" width="180" height="55" rx="3" fill="#0f281e" stroke="#10b981" stroke-width="1.5"/>
        <text x="315" y="38" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">FIDELIDAD FORENSE</text>
        <text x="315" y="54" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">100% Bots Capturados</text>
      </svg>

      <ul class="cad-item-list">
        <li>
          <strong>La Ofuscación CSS es un Detector Infalible:</strong> Las 207 capturas provinieron de scripts ciegos al diseño visual (0/207 favicon). Las clases dinámicas aleatorias neutralizan extractores con cero falsos positivos humanos.
        </li>
        <li>
          <strong>Arquitectura Cero Estado (Stateless):</strong> Validar URLs mediante firmas HMAC-SHA256 en memoria RAM procesó más de 3,56 millones de peticiones con un consumo plano inferior a 60 MB de memoria RAM sin bases de datos.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Resiliencia Operativa:</span> La validación matemática en memoria supera ampliamente las arquitecturas defensivas basadas en base de datos.
      </div>
    </div>
  </div>
</section>
`);