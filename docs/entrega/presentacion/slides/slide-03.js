/* SLIDE 03: TAXONOMÍA DE RASTREADORES WEB */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-2">
  <div class="slide-coord-line">
    <span>SECCIÓN 03 · CLASIFICACIÓN DE ACTORES</span>
    <span class="coord-spec">PERFILES DE TRÁFICO OBSERVADOS</span>
  </div>
  <h1 class="slide-title-hero">Taxonomía de Rastreadores: Del Buscador al Bot Hostil</h1>
  <p class="slide-lead-desc">
    Identificación y caracterización de los tres perfiles de agentes que interactuaron con el honeypot
  </p>

  <div class="grid-thirds">
    <!-- PANEL 1: BUSCADORES COMERCIALES -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>1. BUSCADORES PÚBLICOS</span>
        <span class="cad-tag">SEARCH ENGINE</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="45" r="18" fill="#111c35" stroke="#38bdf8" stroke-width="1.8"/>
        <line x1="51" y1="58" x2="63" y2="70" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="38" cy="45" r="7" fill="none" stroke="#10b981" stroke-width="1.5"/>

        <rect x="80" y="16" width="188" height="26" rx="3" fill="#0f1932" stroke="#10b981" stroke-width="1.2"/>
        <text x="90" y="33" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700">✓ DNS PTR: crawl-*.google</text>

        <rect x="80" y="48" width="188" height="26" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="90" y="65" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5">Googlebot: 297 robots.txt</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Ejemplos:</strong> Googlebot (1.532 reqs), GoogleOther (10.702 reqs), Applebot (2 reqs).</li>
        <li><strong>Conducta RFC 9309:</strong> Verificación rigurosa previa de directivas antes de descender.</li>
        <li><strong>Atribución L3/L4:</strong> 99,8283 % verificable en prefijos JSON publicados por Google (AS15169); 21 peticiones no listadas en subredes 66.249.x.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Conformidad Total:</span> Tráfico legítimo con firma verificable y reciprocidad de indexación.
      </div>
    </div>

    <!-- PANEL 2: CRAWLERS DE ENTRENAMIENTO IA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>2. CRAWLERS DE IA (99,46%)</span>
        <span class="cad-tag">AI TRAINING</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="20" width="13" height="48" rx="2" fill="#152244" stroke="#f59e0b" stroke-width="1.5"/>
        <rect x="44" y="14" width="13" height="60" rx="2" fill="#152244" stroke="#f59e0b" stroke-width="1.5"/>
        <rect x="66" y="24" width="13" height="40" rx="2" fill="#152244" stroke="#f59e0b" stroke-width="1.5"/>

        <rect x="95" y="16" width="173" height="26" rx="3" fill="#0f1932" stroke="#f59e0b" stroke-width="1.2"/>
        <text x="105" y="33" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700">ClaudeBot · GPTBot</text>

        <rect x="95" y="48" width="173" height="26" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="105" y="65" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5">Caché vía OAI-SearchBot</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Ejemplos:</strong> ClaudeBot (1.989.866 reqs, 55,8 %), GPTBot (1.558.875 reqs, 43,7 %) + OAI-SearchBot (49 reqs, 49 robots.txt).</li>
        <li><strong>Conducta RFC 9309:</strong> 100 % de respeto (0 accesos sobre 5,36M enlaces trampa expuestos).</li>
        <li><strong>Validación de Red:</strong> ClaudeBot 99,9998 % en registro ARIN RDAP AS16509 (4 GCP sin verificar); GPTBot/SearchBot 100,00 % en Azure (AS8075).</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Alta Carga:</span> Consumen ancho de banda masivo (~10,9 GB) pero acatan cabalmente el estándar.
      </div>
    </div>

    <!-- PANEL 3: SCRAPERS HOSTILES -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>3. SCRAPERS HOSTILES (207)</span>
        <span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose);">HOSTILE BOT</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg">
        <polygon points="38,18 66,68 10,68" fill="#2d131f" stroke="#f43f5e" stroke-width="1.8"/>
        <text x="38" y="56" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" text-anchor="middle">!</text>

        <rect x="80" y="16" width="188" height="26" rx="3" fill="#0f1932" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="90" y="33" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700">Falso Chrome · Sin robots.txt</text>

        <rect x="80" y="48" width="188" height="26" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="90" y="65" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="10.5">207 capturas (6 actores)</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Ejemplos:</strong> Scrapers no declarados y escáneres oportunistas de rutas en 6 subredes /24.</li>
        <li><strong>Conducta RFC 9309:</strong> 100 % incurrió en Nivel 2 (omisión total de consultar <code>robots.txt</code>).</li>
        <li><strong>Firma Favicon:</strong> 0 de 207 solicitaron <code>/favicon.ico</code> (control humano sí); 79,2 % violó Nivel 3 (enlaces CSS).</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-rose); font-weight:700;">Detección Efectiva:</span> La discrepancia entre DOM crudo y Render Tree evidencia la omisión de motores visuales completos.
      </div>
    </div>
  </div>
</section>
`);
