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
          <th style="padding:5px 6px;">ASN / ISP</th>
          <th style="padding:5px 6px;">PAÍS</th>
          <th style="padding:5px 6px;">USER-AGENT DECLARADO</th>
          <th style="padding:5px 6px; text-align:right;">REQS</th>
          <th style="padding:5px 6px; text-align:right;">%</th>
          <th style="padding:5px 6px;">NIVEL</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">A1</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">206.189.155.0/24</td>
          <td style="padding:5px 6px;">AS14061 DigitalOcean</td>
          <td style="padding:5px 6px;">US</td>
          <td style="padding:5px 6px; color:var(--text-secondary);">Python-requests/2.31</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">100</td>
          <td style="padding:5px 6px; text-align:right;">48,31 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">A2</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">64.226.120.0/24</td>
          <td style="padding:5px 6px;">AS14061 DigitalOcean</td>
          <td style="padding:5px 6px;">NL</td>
          <td style="padding:5px 6px; color:var(--text-secondary);">Python-requests/2.31</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">7</td>
          <td style="padding:5px 6px; text-align:right;">3,38 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">C</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">178.128.246.0/24</td>
          <td style="padding:5px 6px;">AS14061 DigitalOcean</td>
          <td style="padding:5px 6px;">SG</td>
          <td style="padding:5px 6px; color:var(--text-secondary);">Go-http-client/1.1</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">46</td>
          <td style="padding:5px 6px; text-align:right;">22,22 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">B1</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">43.134.225.0/24</td>
          <td style="padding:5px 6px;">AS132203 Tencent</td>
          <td style="padding:5px 6px;">HK</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/126.0 (Spoofed)</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">34</td>
          <td style="padding:5px 6px; text-align:right;">16,43 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
        </tr>
        <tr style="border-bottom:1px solid rgba(38,60,112,0.3);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">B2</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">43.153.181.0/24</td>
          <td style="padding:5px 6px;">AS132203 Tencent</td>
          <td style="padding:5px 6px;">HK</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/126.0 (Spoofed)</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">19</td>
          <td style="padding:5px 6px; text-align:right;">9,18 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
        </tr>
        <tr style="background:rgba(244,63,94,0.08);">
          <td style="padding:5px 6px; font-weight:700; color:#fff;">D</td>
          <td style="padding:5px 6px; color:var(--accent-blue);">37.19.221.0/24</td>
          <td style="padding:5px 6px;">AS9009 M247 Europe</td>
          <td style="padding:5px 6px;">IT</td>
          <td style="padding:5px 6px; color:var(--accent-rose);">Chrome/150.0 (Datacenter)</td>
          <td style="padding:5px 6px; text-align:right; font-weight:700; color:var(--accent-amber);">1</td>
          <td style="padding:5px 6px; text-align:right;">0,48 %</td>
          <td style="padding:5px 6px;"><span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose); font-size:9.5px; padding:1px 4px;">N2 + N3</span></td>
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
          <strong>Scraping Distribuido en la Nube:</strong> El 73,9 % del tráfico hostil provino de DigitalOcean (grupos A y C en US, NL y SG) mediante librerías de automatización básica (Python y Go).
        </li>
        <li>
          <strong>Falsificación de Navegadores (Spoofing):</strong> Los actores B1, B2 y D simularon cabeceras completas de Google Chrome pero operaron desde centros de datos (Tencent Hong Kong y M247 Italia).
        </li>
        <li>
          <strong>Contexto de Chrome 150:</strong> Versión oficial estable lanzada el 30 de junio de 2026; la petición provino de proxy datacenter sin consulta de robots.txt ni solicitud de favicon.
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
          <strong>Control Positivo de Favicon:</strong> 0 de las 207 peticiones solicitó <code>/favicon.ico</code>; las pruebas de control humano desde <code>181.4.69.0/24</code> (Argentina) sí la solicitaron inmediatamente.
        </li>
        <li>
          <strong>Protección de Datos Personales:</strong> En cumplimiento estricto de la <strong>Ley 25.326</strong>, todas las IPs se publican enmascaradas a <code>/24</code> para impedir re-identificación de personas físicas.
        </li>
        <li>
          <strong>Conservación de Evidencia:</strong> Logs crudos preservados bajo hash criptográfico en entorno aislado sin exposición a internet.
        </li>
      </ul>
    </div>
  </div>
</section>
`);
