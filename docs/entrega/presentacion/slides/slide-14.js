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
    <div class="cad-box-title" style="margin-bottom:6px;">
      <span>MATRIZ FORENSE DE INFRACTORES (207 CAPTURAS REGISTRADAS)</span>
      <span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose);">100% NIVEL 2</span>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:12px; font-family:var(--font-mono); text-align:left;">
      <thead>
        <tr style="border-bottom:1px solid var(--border-card); color:var(--accent-blue);">
          <th style="padding:5px 6px;">ID</th>
          <th style="padding:5px 6px;">SUBRED /24</th>
          <th style="padding:5px 6px;">POP CLOUDFLARE</th>
          <th style="padding:5px 6px;">PAÍS</th>
          <th style="padding:5px 6px;">USER-AGENT DECLARADO</th>
          <th style="padding:5px 6px; text-align:right;">TRAMPA</th>
          <th style="padding:5px 6px; text-align:right;">%</th>
          <th style="padding:5px 6px;">PROF. MÁX.</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">C</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">158.69.55.0/24</td>
          <td style="padding:5px 6px;">YYZ (Toronto)</td>
          <td style="padding:5px 6px;">CA</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/124 Win10, sin idioma</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">98</td>
          <td style="padding:5px 6px; text-align:right;">47,34 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 3</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">A2</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">103.196.9.0/24</td>
          <td style="padding:5px 6px;">BOS (Boston)</td>
          <td style="padding:5px 6px;">US</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/130–131 Linux en-US</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">53</td>
          <td style="padding:5px 6px; text-align:right;">25,60 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 2</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">A1</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">154.28.229.0/24</td>
          <td style="padding:5px 6px;">IAD (Ashburn)</td>
          <td style="padding:5px 6px;">US</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/131 Linux en-US</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">43</td>
          <td style="padding:5px 6px; text-align:right;">20,77 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 2</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">D</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">45.138.12.0/24</td>
          <td style="padding:5px 6px;">WAW (Varsovia)</td>
          <td style="padding:5px 6px;">PL</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/133, 7 días aislados</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">5</td>
          <td style="padding:5px 6px; text-align:right;">2,42 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 1</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">B2</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">45.138.12.0/24</td>
          <td style="padding:5px 6px;">WAW (Varsovia)</td>
          <td style="padding:5px 6px;">PL</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/150 Win10 fr-FR</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">4</td>
          <td style="padding:5px 6px; text-align:right;">1,93 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 1</span></td>
        </tr>
        <tr style="background:rgba(244,63,94,0.08);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">B1</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">93.123.109.0/24</td>
          <td style="padding:5px 6px;">AMS (Ámsterdam)</td>
          <td style="padding:5px 6px;">NL</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/150 fr-FR · sondeo .git</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">4</td>
          <td style="padding:5px 6px; text-align:right;">1,93 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">NIV. 1</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="grid-halves" style="margin-top:10px;">
    <!-- COLUMNA IZQUIERDA: PATRONES DE ATAQUE -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>PATRONES DE COMPORTAMIENTO IDENTIFICADOS</span>
        <span class="cad-tag">FORENSE L7</span>
      </div>

      <ul class="cad-item-list" style="font-size:12.5px;">
        <li>
          <strong>Servidores Alquilados, no Hogares:</strong> Los 6 orígenes salieron de centros de datos de Canadá, EE. UU., Polonia y Países Bajos. C cortó en dos sesiones de exactamente 100 peticiones.
        </li>
        <li>
          <strong>Dos Firmas de Herramienta:</strong> A1 y A2 comparten perfil y cadencia (barrido en segundos); B1 y B2 comparten diccionario <code>fr-FR</code> y buscaban carpetas <code>.git</code> (600 respuestas 404).
        </li>
        <li>
          <strong>Chrome Desactualizado:</strong> Declararon Chrome 124 a 150 (la 150 salió el 30/06/2026) cuando las vigentes en el experimento eran la 155 y la 156: cabeceras fijas de un script.
        </li>
      </ul>
    </div>

    <!-- COLUMNA DERECHA: PRUEBAS DE CONTROL Y ÉTICA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>DISCRIMINACIÓN POSITIVA & PRIVACIDAD</span>
        <span class="cad-tag">LEY 25.326</span>
      </div>

      <ul class="cad-item-list" style="font-size:12.5px;">
        <li>
          <strong>Control Positivo de Favicon:</strong> Ninguno de los 6 orígenes pidió <code>/favicon.ico</code>; nuestras pruebas desde <code>181.4.69.0/24</code> (Argentina) sí. Es un indicio, no una prueba: GPTBot lo pidió una vez.
        </li>
        <li>
          <strong>Protección de Datos Personales:</strong> En cumplimiento estricto de la <strong>Ley 25.326</strong>, todas las IPs se publican enmascaradas a <code>/24</code> para impedir re-identificación de personas físicas.
        </li>
        <li>
          <strong>Conservación de Evidencia:</strong> Los registros originales se conservan cifrados y solo con fines académicos.
        </li>
      </ul>
    </div>
  </div>
</section>
`);
