/* SLIDE 09: MECANISMO DE TRAMPAS CSS & TAXONOMÍA */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-8">
  <div class="slide-coord-line">
    <span>SECCIÓN 09 · INGENIERÍA DE ENGAÑO (DECEPTION)</span>
    <span class="coord-spec">TAXONOMÍA DE 3 NIVELES</span>
  </div>
  <h1 class="slide-title-hero">Mecanismos de Trampas CSS y Taxonomía de Violaciones</h1>
  <p class="slide-lead-desc">
    Generación de enlaces camuflados mediante clases aleatorias y clasificación formal de infracciones
  </p>

  <div class="grid-halves equal">
    <!-- PANEL 1: LAS 5 VARIANTES DE ENLACES TRAMPA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>5 VARIANTES: 1 CONTROL + 4 OCULTAS</span>
        <span class="cad-tag">OFUSCACIÓN</span>
      </div>

      <div class="cad-spec-grid" style="grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">1. VISIBLE (Control)</div>
          <div class="cad-spec-pill-val" style="color:var(--accent-blue); font-size:11.5px;">Texto normal en HTML</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">2. NONE INLINE</div>
          <div class="cad-spec-pill-val" style="color:var(--accent-amber); font-size:11.5px;">style="display:none"</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">3. NONE CLASS</div>
          <div class="cad-spec-pill-val" style="color:var(--accent-emerald); font-size:11.5px;">clase dinámica {display:none}</div>
        </div>
        <div class="cad-spec-pill">
          <div class="cad-spec-pill-title">4. OPACITY ZERO</div>
          <div class="cad-spec-pill-val" style="color:var(--accent-rose); font-size:11.5px;">clase dinámica {opacity:0}</div>
        </div>
        <div class="cad-spec-pill" style="grid-column: span 2;">
          <div class="cad-spec-pill-title">5. OFFSCREEN (Fuera de Pantalla)</div>
          <div class="cad-spec-pill-val" style="color:var(--text-primary); font-size:11.5px;">position:absolute; left:-10000px; width:1px; height:1px; overflow:hidden</div>
        </div>
      </div>

      <ul class="cad-item-list" style="margin-top:10px;">
        <li><strong>Factor de ramificación:</strong> Cada página emite 5 enlaces públicos normales y 5 enlaces trampa hacia la ruta vedada <code>/archivo-interno/</code>.</li>
        <li><strong>Clases CSS dinámicas aleatorias:</strong> Nombres aleatorios de clase generados por petición para evitar reglas estáticas en scrapers.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-blue); font-weight:700;">Arnés de Pruebas:</span> Antes de producción, un simulador en red local imitó a GPTBot, ClaudeBot, Googlebot, Bytespider, un Googlebot falso y un script de Python.
      </div>
    </div>

    <!-- PANEL 2: TAXONOMÍA DE VIOLACIONES FORMALES -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>TAXONOMÍA CANÓNICA DE INFRACCIONES</span>
        <span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose);">CLASIFICACIÓN</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="background:rgba(10, 15, 28, 0.9); border-left:3px solid var(--accent-amber); padding:8px 10px; border-radius:3px;">
          <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--accent-amber);">NIVEL 1: Violación Simple</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">El agente consulta <code>robots.txt</code> pero desobedece la regla e ingresa a la ruta prohibida. (0 casos en todo el experimento).</div>
        </div>

        <div style="background:rgba(10, 15, 28, 0.9); border-left:3px solid var(--accent-rose); padding:8px 10px; border-radius:3px;">
          <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--accent-rose);">NIVEL 2: Omisión Total (207 / 207 = 100 %)</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">El bot ingresa a la ruta prohibida <strong>sin haber solicitado jamás</strong> <code>robots.txt</code> desde su subred.</div>
        </div>

        <div style="background:rgba(10, 15, 28, 0.9); border-left:3px solid #e11d48; padding:8px 10px; border-radius:3px;">
          <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:#f43f5e;">NIVEL 3: Ceguera Visual CSS (164 / 207 = 79,2 %)</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Se suma a cualquiera de los otros: entra por un enlace invisible, señal de que no mira la página como un navegador.</div>
        </div>
      </div>

      <div class="cad-callout-card" style="margin-top:10px;">
        <span style="color:var(--accent-rose); font-weight:700;">Hallazgo Forense:</span> El 100 % de los accesos a la ruta prohibida incurrió en Nivel 2 y el 79,2 % en Nivel 3.
      </div>
    </div>
  </div>
</section>
`);
