/* SLIDE 14: ANÁLISIS FORENSE DE LAS 6 IPS INFRACTORAS */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-13">
  <div class="slide-coord-line">
    <span>SECCIÓN 14 · AUDITORÍA FORENSE DE ATRIBUCIÓN</span>
    <span class="coord-spec">LOS 6 ACTORES INFRACTORES (TABLA 4 CANÓNICA)</span>
  </div>
  <h1 class="slide-title-hero">Análisis Forense Detallado: Los 6 Actores Infractores</h1>
  <p class="slide-lead-desc">
    Desglose forense de los únicos actores que violaron robots.txt: subredes, países, perfiles de ataque y cadencias
  </p>

  <!-- TABLA FORENSE DE ALTA VISIBILIDAD -->
  <div class="cad-box-panel" style="padding:10px 14px; flex-shrink:0;">
    <table class="cad-forensic-table">
      <thead>
        <tr>
          <th>Actor</th>
          <th>Subred IP (/24)</th>
          <th>PoP / País</th>
          <th>Peticiones</th>
          <th>A Trampa</th>
          <th>Errores 404</th>
          <th>User-Agent Declarado</th>
          <th>Cadencia</th>
          <th>Prof.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong style="color:var(--accent-blue);">A1</strong></td>
          <td><code>154.28.229.0/24</code></td>
          <td>IAD / EE. UU.</td>
          <td>90</td>
          <td><strong style="color:var(--accent-rose); font-size:13px;">43</strong></td>
          <td>0</td>
          <td>Chrome/131 (Linux)</td>
          <td>178 ms</td>
          <td>2</td>
        </tr>
        <tr>
          <td><strong style="color:var(--accent-blue);">A2</strong></td>
          <td><code>103.196.9.0/24</code></td>
          <td>BOS / EE. UU.</td>
          <td>111</td>
          <td><strong style="color:var(--accent-rose); font-size:13px;">53</strong></td>
          <td>55</td>
          <td>Chrome/130–131 (Linux)</td>
          <td>5 ms</td>
          <td>2</td>
        </tr>
        <tr>
          <td><strong style="color:var(--accent-blue);">C</strong></td>
          <td><code>158.69.55.0/24</code></td>
          <td>YYZ / Canadá</td>
          <td>200</td>
          <td><strong style="color:var(--accent-rose); font-size:13px;">98</strong></td>
          <td>100</td>
          <td>Chrome/124 (Win10)</td>
          <td>13 ms</td>
          <td>3</td>
        </tr>
        <tr>
          <td><strong style="color:var(--accent-blue);">B1</strong></td>
          <td><code>93.123.109.0/24</code></td>
          <td>AMS / P. Bajos</td>
          <td>334</td>
          <td><strong style="color:var(--accent-amber); font-size:13px;">4</strong></td>
          <td>315</td>
          <td>Chrome/150 (Win10)</td>
          <td>1 ms</td>
          <td>1</td>
        </tr>
        <tr>
          <td><strong style="color:var(--accent-blue);">B2</strong></td>
          <td><code>45.138.12.0/24</code></td>
          <td>WAW / Polonia</td>
          <td>297</td>
          <td><strong style="color:var(--accent-amber); font-size:13px;">4</strong></td>
          <td>285</td>
          <td>Chrome/150 (Win10)</td>
          <td>88 ms</td>
          <td>1</td>
        </tr>
        <tr>
          <td><strong style="color:var(--accent-blue);">D</strong></td>
          <td><code>45.138.12.0/24</code></td>
          <td>WAW / Polonia</td>
          <td>14</td>
          <td><strong style="color:var(--accent-rose); font-size:13px;">5</strong></td>
          <td>0</td>
          <td>Chrome/133 (Win/Mac)</td>
          <td>111 ms</td>
          <td>1</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="grid-halves equal" style="margin-top:10px;">
    <!-- PANEL 1: CEGUERA Y PRUEBA DEL FAVICON -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>PRUEBA DE HEADLESS Y FIRMA DEL FAVICON</span>
        <span class="cad-tag">0 / 207 FAVICON</span>
      </div>
      <p style="font-size:13.5px; line-height:1.45;">
        El <strong>100 % de los infractores</strong> omitió consultar <code>robots.txt</code> (Nivel 2). La visita manual del equipo con Chrome real solicitó inmediatamente <code>/favicon.ico</code>; en contraste, <strong>ninguno de los 6 actores solicitó favicon</strong>, confirmando que eran scripts automatizados ciegos.
      </p>
      <div class="cad-callout-card">
        <span style="color:var(--accent-rose); font-weight:700;">Infracción Nivel 3:</span> 164 de las 207 capturas (79,2 %) ingresaron por hipervínculos ocultos por CSS.
      </div>
    </div>

    <!-- PANEL 2: ESCANEO VS SCRAPING -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>PROBES DE VULNERABILIDAD VS. SCRAPERS</span>
        <span class="cad-tag">FILTRADO DE EXPLOITS</span>
      </div>
      <p style="font-size:13.5px; line-height:1.45;">
        Los actores <strong>B1 y B2</strong> fueron escáneres oportunistas de rutas administrativas (<code>wp-login.php</code>, <code>phpinfo</code>) con 315 y 285 errores 404, cayendo incidentalmente en la trampa. Por su parte, <strong>A1, A2, C y D</strong> fueron scrapers de enlaces que alcanzaron profundidades 2 y 3.
      </p>
      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Aislamiento Total:</span> El laberinto detecta y contiene tanto crawlers de contenido como escáneres oportunistas.
      </div>
    </div>
  </div>
</section>
`);