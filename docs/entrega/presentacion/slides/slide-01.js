/* SLIDE 01: PORTADA & FICHA TÉCNICA */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page active" id="slide-0">
  <div class="slide-coord-line">
    <span>SECCIÓN 01 · INVESTIGACIÓN & DEFENSA DE CÁTEDRA</span>
    <span class="coord-spec">FACENA UNNE · 2026</span>
  </div>
  <h1 class="slide-title-hero">Honeypots Web para Medir el Cumplimiento de robots.txt (RFC 9309)</h1>
  <p class="slide-lead-desc">
    Diseño con tokens HMAC sin estado y estudio empírico en un dominio señuelo frente a buscadores y recolectores de IA
  </p>

  <div class="cad-stats-bar">
    <div class="cad-stat-unit">
      <div class="cad-stat-number">3.568.349</div>
      <div class="cad-stat-label">Peticiones Válidas (~10,9 GB)</div>
    </div>
    <div class="cad-stat-unit amber">
      <div class="cad-stat-number">11,85 DÍAS</div>
      <div class="cad-stat-label">18 al 30 de Octubre 2026</div>
    </div>
    <div class="cad-stat-unit emerald">
      <div class="cad-stat-number">100 %</div>
      <div class="cad-stat-label">Bots Declarados (0 / 5,36M)</div>
    </div>
    <div class="cad-stat-unit coral">
      <div class="cad-stat-number">207</div>
      <div class="cad-stat-label">Capturas Trampa (6 Actores)</div>
    </div>
  </div>

  <div class="grid-halves equal">
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>PREGUNTA & ALCANCE EXPERIMENTAL</span>
        <span class="cad-tag">OBJETIVO</span>
      </div>
      <p>
        Determinar empíricamente si los recolectores de IA (<code>ClaudeBot</code>, <code>GPTBot</code>) y buscadores (<code>Googlebot</code>) respetan las directivas de exclusión de <strong>RFC 9309</strong> en tráfico público, y evaluar la resistencia de scrapers encubiertos frente a técnicas de ofuscación CSS.
      </p>

      <div class="cad-spec-grid">
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">Dominio Señuelo</div>
          <div class="cad-spec-pill-val" style="color:var(--accent-blue); font-family:var(--font-mono); font-size:12px;">definitivamente-no-hay-trabas.com.ar</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">Infraestructura</div>
          <div class="cad-spec-pill-val">Windows 10 (22H2) + Docker WSL 2</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">Perímetro L4</div>
          <div class="cad-spec-pill-val">Cloudflare Tunnel (cloudflared:2025.9.1)</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">Telemetría</div>
          <div class="cad-spec-pill-val">Nginx JSON + Streaming Offline en Python</div>
        </div>
      </div>
    </div>

    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>FICHA TÉCNICA DE DEFENSA ORAL</span>
        <span class="cad-tag">INTERNETWORKING 2026</span>
      </div>
      <ul class="cad-item-list">
        <li><strong>Autores:</strong> Joel Jesús Marcori, Julio César Pintos, Giovanni Oscar Piazza (FaCENA, UNNE).</li>
        <li><strong>Eje Temático:</strong> Protocolos L4/L7, modelo OSI, túneles inversos, restitución de IP y observabilidad.</li>
        <li><strong>Evidencia Empírica:</strong> Telemetría real en Grafana y análisis estadístico en Python sobre logs estructurados.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-blue); font-family:var(--font-mono); font-size:11.5px; font-weight:700;">⚡ MODO DUAL:</span>
        <span style="font-size:13px; color:var(--text-secondary); margin-left:6px;">Presiona <span class="key-spec-tag">P</span> para abrir el Teleprompter independiente en un monitor secundario.</span>
      </div>
    </div>
  </div>
</section>
`);
