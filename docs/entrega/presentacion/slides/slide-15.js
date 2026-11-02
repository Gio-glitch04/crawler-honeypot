/* SLIDE 15: OBSERVABILIDAD EN VIVO (GRAFANA) */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-14">
  <div class="slide-coord-line">
    <span>SECCIÓN 15 · TELEMETRÍA DE RED & OBSERVABILIDAD</span>
    <span class="coord-spec">DASHBOARD EN PRODUCCIÓN</span>
  </div>
  <h1 class="slide-title-hero">Observabilidad y Telemetría: Grafana en Producción</h1>
  <p class="slide-lead-desc">
    Captura estructurada de eventos mediante Nginx, Promtail y Loki con reconciliación forense
  </p>

  <div class="grid-halves">
    <!-- CAPTURA REAL DEL DASHBOARD DE PRODUCCIÓN -->
    <div class="cad-visual-container">
      <img src="assets/dashboard.png" alt="Dashboard de Producción en Grafana" style="max-height:280px; margin:auto; border-radius:4px;">
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Panel:</strong> Grafana 10.4 + Loki 3.5.0</span>
        <span class="cad-caption-tag"><strong>Formato:</strong> JSON Estructurado Nginx</span>
      </div>
    </div>

    <!-- PANEL EXPLICATIVO Y RECONCILIACIÓN -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>PIPELINE TELEMÉTRICO & RECONCILIACIÓN FORENSE</span>
        <span class="cad-tag">LOKI & STREAMING</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Nginx Log JSON en Memoria:</strong> Registro de <code>time_local</code>, <code>remote_addr</code> restituida, <code>status</code>, <code>body_bytes_sent</code>, <code>http_referer</code> y <code>http_user_agent</code>.
        </li>
        <li>
          <strong>Reconciliación de Accesos a Trampa:</strong> El dashboard registra <strong>213 accesos brutos</strong> a <code>/trap/</code> y 45 a <code>opacity_0</code>. Al depurar 6 pruebas manuales interactivas del equipo de cátedra, se obtienen los <strong>207 accesos netos</strong> y <strong>39 en opacity_0</strong> documentados en el informe.
        </li>
        <li>
          <strong>Incidencia de Ingesta (21/10):</strong> Loki sufrió OOM por el volumen masivo de ráfagas; la telemetría final canónica se procesó mediante streaming offline en Python directo sobre <code>honeypot_access.json.tar.gz</code>.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Integridad Forense:</span> La coincidencia matemática exacta entre logs brutos y métricas procesadas garantiza reproducibilidad total.
      </div>
    </div>
  </div>
</section>
`);
