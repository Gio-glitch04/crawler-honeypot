/* SLIDE 12: CARACTERIZACIÓN DE IA (GPTBot vs ClaudeBot) */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-11">
  <div class="slide-coord-line">
    <span>SECCIÓN 12 · CARACTERIZACIÓN DE IA</span>
    <span class="coord-spec">COMPARATIVA EMPÍRICA DE ARQUITECTURAS</span>
  </div>
  <h1 class="slide-title-hero">Comportamiento de Rastreadores de IA: GPTBot vs. ClaudeBot</h1>
  <p class="slide-lead-desc">
    Disparidad radical en arquitecturas de red: procesamiento reactivo continuo frente a encolado diferido en ráfagas
  </p>

  <div class="grid-halves">
    <!-- GRÁFICO EMPÍRICO DE PROFUNDIDAD -->
    <div class="cad-visual-container">
      <img src="assets/profundidad.png" alt="Distribución de peticiones por profundidad" style="max-height:280px; margin:auto;">
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Tope del laberinto:</strong> HONEYPOT_MAX_DEPTH = 10</span>
        <span class="cad-caption-tag"><strong>Nodos Hoja:</strong> Nivel 11 (is_leaf = true)</span>
      </div>
    </div>

    <!-- COMPARATIVA ARQUITECTÓNICA COMPACTA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>ARQUITECTURAS DE RASTREO COMPARADAS</span>
        <span class="cad-tag">TELEMETRÍA EMPÍRICA</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <!-- TARJETA CLAUDEBOT -->
        <div style="background:rgba(10, 15, 28, 0.9); border-left:3px solid var(--accent-amber); border:1px solid var(--border-card); border-left-width:3px; padding:12px 14px; border-radius:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:var(--accent-amber); font-size:13.5px; font-family:var(--font-mono);">ClaudeBot (Anthropic)</strong>
            <span class="cad-tag" style="color:var(--accent-amber); border-color:var(--accent-amber);">1,99 M REQS (55,8 %)</span>
          </div>
          <ul class="cad-item-list" style="font-size:13px; gap:4px;">
            <li><strong>Latencia (tok_age):</strong> Mediana de <strong>5,0 horas</strong> (cola batch desacoplada).</li>
            <li><strong>Cabecera Referer:</strong> Omitida en el <strong>100 % de los casos (0 % Referer)</strong>.</li>
            <li><strong>Ráfagas:</strong> Picos agresivos de hasta <strong>38.787 req/h (~10,8 req/s)</strong>.</li>
            <li><strong>Validación Red:</strong> <strong>99,9998 %</strong> verificado en bloque ARIN /22 AS16509.</li>
          </ul>
        </div>

        <!-- TARJETA GPTBOT -->
        <div style="background:rgba(10, 15, 28, 0.9); border-left:3px solid var(--accent-blue); border:1px solid var(--border-card); border-left-width:3px; padding:12px 14px; border-radius:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:var(--accent-blue); font-size:13.5px; font-family:var(--font-mono);">GPTBot (OpenAI)</strong>
            <span class="cad-tag">1,56 M REQS (43,7 %)</span>
          </div>
          <ul class="cad-item-list" style="font-size:13px; gap:4px;">
            <li><strong>Latencia (tok_age):</strong> Mediana de <strong>8,9 segundos</strong> (seguimiento en caliente).</li>
            <li><strong>Cabecera Referer:</strong> Enviada en el <strong>100 % de las peticiones</strong>.</li>
            <li><strong>Cadencia:</strong> Tasa constante de <strong>2,00 req/s</strong> (CV = 0,068, token bucket).</li>
            <li><strong>Validación Red:</strong> <strong>100,00 %</strong> en prefijos oficiales Azure (AS8075).</li>
          </ul>
        </div>
      </div>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">✓ Cumplimiento Estricto:</span> Ambos agentes registraron 0 accesos sobre más de 5,32 millones de enlaces trampa expuestos.
      </div>
    </div>
  </div>
</section>
`);