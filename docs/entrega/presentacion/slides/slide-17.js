/* SLIDE 17: CONCLUSIONES Y RECOMENDACIONES DE INGENIERÍA */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-16">
  <div class="slide-coord-line">
    <span>SECCIÓN 17 · CIERRE & RECOMENDACIONES DE INGENIERÍA</span>
    <span class="coord-spec">CONCLUSIÓN DE LA INVESTIGACIÓN</span>
  </div>
  <h1 class="slide-title-hero">Recomendaciones de Ingeniería y Cierre de la Defensa</h1>
  <p class="slide-lead-desc">
    Estrategias defensivas en profundidad para arquitecturas web expuestas a indexación agresiva
  </p>

  <div class="grid-thirds" style="margin-bottom: 12px; flex: 1;">
    <!-- RECOMENDACIÓN 1 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>1. DEFENSA EN PROFUNDIDAD</span>
        <span class="cad-tag">ESTRATEGIA</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="15" width="240" height="16" rx="2" fill="#152244" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="140" y="27" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">Capa 1: robots.txt (RFC 9309)</text>

        <rect x="35" y="35" width="210" height="16" rx="2" fill="#0f281e" stroke="#10b981" stroke-width="1.2"/>
        <text x="140" y="47" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">Capa 2: Tarpit Stateless HMAC</text>

        <rect x="50" y="55" width="180" height="16" rx="2" fill="#2d131f" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="140" y="67" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="9.5" text-anchor="middle">Capa 3: Trampas CSS + WAF</text>
      </svg>

      <p style="font-size:13.5px; line-height:1.45;">
        Combinar directivas estándar con tarpits criptográficos y filtrado CSSOM. El estándar protege contra agentes éticos; el tarpit contiene scrapers agresivos.
      </p>

      <div class="cad-callout-card">
        <span style="color:var(--accent-blue); font-weight:700;">Enfoque Híbrido:</span> Contención ética para bots formales y trampas para no declarados.
      </div>
    </div>

    <!-- RECOMENDACIÓN 2 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>2. AUDITORÍA POR OPERADOR</span>
        <span class="cad-tag">TELEMETRÍA</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="45" cy="40" r="18" fill="#152244" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="45" y="44" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">ASN</text>

        <path d="M 68 40 L 125 40" stroke="#38bdf8" stroke-width="2" class="wire-pulse-fast"/>

        <rect x="125" y="18" width="140" height="44" rx="3" fill="#0f1932" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="195" y="36" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">Correlación Total</text>
        <text x="195" y="50" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10" text-anchor="middle">Satélites + Crawlers</text>
      </svg>

      <p style="font-size:13.5px; line-height:1.45;">
        Vincular el tráfico por ASN y dominio de operador en vez de confiar en cadenas de <em>User-Agent</em> aisladas que distorsionan el cumplimiento real.
      </p>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Trazabilidad L3/L7:</span> La atribución sólida cruza la IP con listas oficiales y registros RDAP.
      </div>
    </div>

    <!-- RECOMENDACIÓN 3 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>3. RESILIENCIA COMPUTACIONAL</span>
        <span class="cad-tag">RENDIMIENTO</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 280 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="18" width="105" height="44" rx="3" fill="#0f281e" stroke="#10b981" stroke-width="1.5"/>
        <text x="72" y="36" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">HMAC RAM</text>
        <text x="72" y="50" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10" text-anchor="middle">Sin base de datos</text>

        <path d="M 125 40 L 165 40" stroke="#10b981" stroke-width="2"/>

        <rect x="165" y="18" width="95" height="44" rx="3" fill="#152244" stroke="#10b981" stroke-width="1.2"/>
        <text x="212" y="44" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="800" text-anchor="middle">Anti-DoS</text>
      </svg>

      <p style="font-size:13.5px; line-height:1.45;">
        Construir motores defensivos sin estado (stateless) para resistir millones de peticiones sin penalizaciones de concurrencia ni bloqueos de I/O.
      </p>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Sin Estado:</span> Validar firmas en memoria sostiene ráfagas de miles de pedidos por hora.
      </div>
    </div>
  </div>

  <!-- CAJETÍN DE CONCLUSIÓN FORMAL COMPACTO -->
  <div class="cad-callout-card" style="padding:12px 18px; flex-shrink:0;">
    <div style="display:flex; justify-content:space-between; align-items:center; gap:20px;">
      <div>
        <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--accent-blue); margin-bottom:4px;">
          CONCLUSIÓN GENERAL DE LA INVESTIGACIÓN:
        </div>
        <div style="font-size:13.5px; color:#f1f5f9; line-height:1.45;">
          Los modelos fundacionales de IA (OpenAI, Anthropic) y los buscadores tradicionales (Google) respetan estrictamente las exclusiones de <strong>RFC 9309</strong> (0 violaciones sobre 5,36M enlaces). Por el contrario, los recolectores encubiertos y escáneres hostiles ignoran las directivas pero resultan vulnerables al filtrado por renderizado <strong>DOM/CSSOM</strong> (79,2 % entró por enlaces ocultos; ningún origen pidió favicon). Límites: una regla permisiva, un dominio, 12 días y 3 operadores (cota del 63,2 %).
        </div>
      </div>
      <div style="text-align:right; min-width:210px; padding-left:20px; border-left:1px solid var(--border-card); flex-shrink:0;">
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);">AUTORES & CÁTEDRA</div>
        <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:#fff; margin-top:2px;">Marcori · Pintos · Piazza</div>
        <div style="font-size:11.5px; color:var(--accent-emerald); margin-top:2px;">FaCENA UNNE · 2026</div>
      </div>
    </div>
  </div>
</section>
`);
