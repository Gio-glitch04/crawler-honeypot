/* SLIDE 13: LA TRAMPA Y CHI-CUADRADO CON BARRAS ANIMADAS */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-12">
  <div class="slide-coord-line">
    <span>SECCIÓN 13 · ANÁLISIS FORENSE & ESTADÍSTICO</span>
    <span class="coord-spec">BONDAD DE AJUSTE (207 CAPTURAS · 5 VARIANTES)</span>
  </div>
  <h1 class="slide-title-hero">La Trampa en Acción: 207 Capturas y Análisis Chi²</h1>
  <p class="slide-lead-desc">
    Distribución de técnicas de ofuscación y evaluación estadística de ceguera al renderizado CSSOM
  </p>

  <div class="grid-halves">
    <!-- GRÁFICO VECTORIAL SVG DE LAS 5 TÉCNICAS -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg">
        <line x1="60" y1="20" x2="60" y2="240" stroke="#263c70" stroke-width="1.2"/>
        <line x1="60" y1="240" x2="590" y2="240" stroke="#263c70" stroke-width="1.2"/>

        <!-- Línea esperada (E = 41.4) sin colisión con las barras -->
        <line x1="60" y1="80" x2="590" y2="80" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="70" y="45" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="start">--- Frecuencia Esperada: E = 41,4 (Uniforme)</text>

        <!-- Barra 1: visible (43) -->
        <rect id="chiBar1" class="bar-grow" x="90" y="70" width="60" height="170" fill="#38bdf8" rx="3">
          <animate attributeName="height" from="0" to="170" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
          <animate attributeName="y" from="240" to="70" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
        </rect>
        <text x="120" y="60" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">43</text>
        <text x="120" y="260" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">visible</text>
        <text x="120" y="278" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">20,8 %</text>

        <!-- Barra 2: none inline (43) -->
        <rect id="chiBar2" class="bar-grow" x="190" y="70" width="60" height="170" fill="#38bdf8" rx="3">
          <animate attributeName="height" from="0" to="170" begin="0.1s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
          <animate attributeName="y" from="240" to="70" begin="0.1s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
        </rect>
        <text x="220" y="60" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">43</text>
        <text x="220" y="260" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">none in</text>
        <text x="220" y="278" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">20,8 %</text>

        <!-- Barra 3: offscreen (42) -->
        <rect id="chiBar3" class="bar-grow" x="290" y="75" width="60" height="165" fill="#38bdf8" rx="3">
          <animate attributeName="height" from="0" to="165" begin="0.2s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
          <animate attributeName="y" from="240" to="75" begin="0.2s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
        </rect>
        <text x="320" y="65" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">42</text>
        <text x="320" y="260" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">offscreen</text>
        <text x="320" y="278" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">20,3 %</text>

        <!-- Barra 4: none class (40) -->
        <rect id="chiBar4" class="bar-grow" x="390" y="82" width="60" height="158" fill="#38bdf8" rx="3">
          <animate attributeName="height" from="0" to="158" begin="0.3s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
          <animate attributeName="y" from="240" to="82" begin="0.3s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
        </rect>
        <text x="420" y="72" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">40</text>
        <text x="420" y="260" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">none cls</text>
        <text x="420" y="278" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">19,3 %</text>

        <!-- Barra 5: opacity: 0 (39) -->
        <rect id="chiBar5" class="bar-grow" x="490" y="86" width="60" height="154" fill="#38bdf8" rx="3">
          <animate attributeName="height" from="0" to="154" begin="0.4s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
          <animate attributeName="y" from="240" to="86" begin="0.4s" dur="1s" fill="freeze" calcMode="spline" keySplines="0.1 0.8 0.2 1" keyTimes="0;1"/>
        </rect>
        <text x="520" y="76" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">39</text>
        <text x="520" y="260" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">opacity 0</text>
        <text x="520" y="278" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">18,8 %</text>
      </svg>

      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Chi²:</strong> 0,3188</span>
        <span class="cad-caption-tag"><strong>p-valor:</strong> 0,9886</span>
        <span class="cad-caption-tag"><strong>gl:</strong> 4</span>
        <span class="cad-caption-tag"><strong>Total:</strong> 207 capturas (164 en CSS)</span>
      </div>
    </div>

    <!-- PANEL DE EVALUACIÓN CIENTÍFICA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>EVALUACIÓN RIGUROSA DE LA HIPÓTESIS</span>
        <span class="cad-tag">ESTADÍSTICA FORENSE</span>
      </div>

      <!-- FÓRMULA CHI-CUADRADO NATIVA UNICODE -->
      <div class="math-proof-banner">
        <div class="math-proof-formula">
          <span>χ² = ∑ (Oᵢ - Eᵢ)² / Eᵢ = 0,3188</span>
        </div>
        <div class="math-proof-metric">
          <div class="m-metric-val">p = 0,9886 (gl = 4)</div>
          <div class="m-metric-lbl">No se rechaza la hipótesis de equiprobabilidad</div>
        </div>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>100% Cumplimiento Oficial:</strong> 0 violaciones de ClaudeBot, GPTBot y Googlebot sobre más de 5,36 millones de enlaces trampa expuestos.
        </li>
        <li>
          <strong>Infracciones Nivel 3 (79,2 %):</strong> 164 de las 207 capturas ingresaron por enlaces invisibilizados por CSS; las restantes 43 por el enlace visible de control.
        </li>
        <li>
          <strong>Cota Clopper-Pearson al 95 %:</strong> A nivel de operador ($n = 3, k = 0$), arroja una cota superior exacta del <strong>63,2 %</strong> (unilateral; 70,8 % bilateral).
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-amber); font-weight:700;">Conclusión Estadística:</span> Los scrapers consumieron los enlaces con frecuencias indistinguibles de una selección aleatoria, demostrando ceguera absoluta al árbol CSSOM.
      </div>
    </div>
  </div>
</section>
`);