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
        <text x="200" y="34" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">749 ms antes</text>

        <rect x="255" y="15" width="150" height="55" rx="3" fill="#0f1932" stroke="#10b981" stroke-width="1.5"/>
        <text x="330" y="38" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">GPTBot Cluster</text>
        <text x="330" y="54" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Rastreo masivo L7</text>
      </svg>

      <ul class="cad-item-list">
        <li>
          <strong>robots.txt se Consulta por Operador:</strong> GPTBot nunca solicitó <code>robots.txt</code> con su User-Agent propio; su satélite <code>OAI-SearchBot</code> lo leyó 749 ms antes de que GPTBot arrancara, desde la misma red. Auditar por User-Agent aislado es un sesgo metodológico.
        </li>
        <li>
          <strong>Pérdida de Huella TLS en Túneles L7:</strong> Al delegar la terminación SSL en Cloudflare, se perdió la visibilidad de firmas JA3/JA4 en el origen. Recuperarla exigiría que el cifrado termine en el propio origen.
        </li>
        <li>
          <strong>Atribución L3/L4 Rigurosa:</strong> La verificación sólida descansa en prefijos BGP, ASNs y registros RDAP, no en cabeceras HTTP manipulables.
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
        <text x="315" y="54" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">207 entradas · 6 IPs</text>
      </svg>

      <ul class="cad-item-list">
        <li>
          <strong>Mecanismo Discriminador Altamente Efectivo:</strong> Las 207 entradas vinieron de scripts que no renderizan (ningún origen pidió favicon). Las clases dinámicas impiden aprender una regla fija; el enlace transparente puede tocarse sin querer, por eso se cruza con otros indicios.
        </li>
        <li>
          <strong>Arquitectura Cero Estado (Stateless):</strong> Validar URLs mediante firmas HMAC-SHA256 en memoria respondió 3,57M peticiones con una mediana de 2 ms y sin base de datos.
        </li>
        <li>
          <strong>Convergencia con Literatura:</strong> Se replica el cumplimiento observado por Liu et al. (IMC 2025) y Kim et al. (IMC 2025) para grandes operadores de IA.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Resiliencia Operativa:</span> Validar una firma en memoria evita el cuello de botella de una base de datos ante ráfagas.
      </div>
    </div>
  </div>
</section>
`);
