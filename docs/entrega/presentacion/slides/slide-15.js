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
    Captura estructurada de eventos mediante Nginx, Promtail y Loki en tiempo real
  </p>

  <div class="grid-halves">
    <!-- CAPTURA REAL DEL DASHBOARD DE PRODUCCIÓN -->
    <div class="cad-visual-container">
      <img src="assets/grafana-dashboard-produccion.jpg" alt="Dashboard de Grafana en producción" style="max-height:280px; margin:auto;">
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Loki 3.5.0:</strong> Stream Logs JSON</span>
        <span class="cad-caption-tag"><strong>Grafana OSS:</strong> Supervisión continua</span>
        <span class="cad-caption-tag"><strong>Host:</strong> Win10 Pro / WSL2</span>
      </div>
    </div>

    <!-- RESOLUCIÓN DE PROBLEMAS OPERATIVOS -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>RESOLUCIÓN DE PROBLEMAS OPERATIVOS</span>
        <span class="cad-tag">EXPERIENCIA REAL</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Saturación en Ráfagas de Analítica:</strong> Durante las ráfagas de ClaudeBot (hasta 38.787 req/h), la memoria del contenedor <code>analytics</code> se saturó y bloqueó la base SQLite en producción.
        </li>
        <li>
          <strong>Desacoplamiento Arquitectónico:</strong> Separamos la <em>ingesta en caliente</em> (Promtail para visualización instantánea) del <em>análisis forense masivo</em> (scripts Python en streaming offline sobre logs JSON planos rotados de Nginx).
        </li>
        <li>
          <strong>Cabeceras Ocultas de Auditoría:</strong> Django inyectaba <code>X-Honeypot-Technique</code> y <code>X-Honeypot-Depth</code>; Nginx las guardaba en los logs y las purgaba hacia el cliente con <code>proxy_hide_header</code>.
        </li>
      </ul>

      <div class="cad-callout-card">
        <strong style="color:var(--accent-blue); font-family:var(--font-mono); font-size:11.5px;">PATRÓN RECOMENDADO:</strong>
        <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">
          Ingesta ligera en caliente sin cómputo analítico bloqueante sobre el host en producción.
        </div>
      </div>
    </div>
  </div>
</section>
`);