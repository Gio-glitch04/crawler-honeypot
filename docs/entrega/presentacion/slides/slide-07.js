/* SLIDE 07: RESTITUCIÓN DE IP REAL EN NGINX */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-6">
  <div class="slide-coord-line">
    <span>SECCIÓN 07 · AUDITORÍA & ATRIBUCIÓN FORENSE</span>
    <span class="coord-spec">CADENA DE CONFIANZA L7</span>
  </div>
  <h1 class="slide-title-hero">Restitución de IP Real y Mitigación de Spoofing L7</h1>
  <p class="slide-lead-desc">
    Mecánica de reconstrucción de identidad forense a través del túnel inverso y prevención de envenenamiento
  </p>

  <div class="grid-halves equal">
    <!-- PANEL 1: EL RIESGO DE SPOOFING L7 -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>VULNERABILIDAD: ENVENENAMIENTO DE CABECERAS</span>
        <span class="cad-tag" style="color:var(--accent-rose); border-color:var(--accent-rose);">SPOOFING L7</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="120" height="70" rx="3" fill="#2d131f" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="75" y="42" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">ATACANTE L7</text>
        <text x="75" y="58" fill="#fca5a5" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Inyecta cabecera falsa</text>
        <text x="75" y="74" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">66.249.66.1 (Google)</text>

        <line x1="140" y1="50" x2="260" y2="50" stroke="#f43f5e" stroke-width="2.5" class="wire-pulse-fast"/>
        <text x="200" y="40" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">✕ Spoofing No Filtrado</text>

        <rect x="260" y="15" width="145" height="70" rx="3" fill="#152244" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="332" y="42" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">REGISTRO FORENSE</text>
        <text x="332" y="58" fill="#fca5a5" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Log asume falsa IP</text>
        <text x="332" y="74" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">[ATRIBUCIÓN ROTA]</text>
      </svg>

      <ul class="cad-item-list">
        <li><strong>Problema L4:</strong> Nginx solo ve la IP interna del contenedor del túnel (<code>10.98.0.2</code>).</li>
        <li><strong>Riesgo de falsificación:</strong> Si se confía ciegamente en <code>X-Forwarded-For</code>, un bot puede inyectar IPs legítimas para evadir bloqueos y adulterar la telemetría.</li>
        <li><strong>Contaminación forense:</strong> Los registros terminan atribuyendo actividad maliciosa a entidades inocentes como Googlebot.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-rose); font-weight:700;">Riesgo Crítico:</span> Sin validación perimetral, los registros forenses pierden validez probatoria.
      </div>
    </div>

    <!-- PANEL 2: MITIGACIÓN ROBUSTA -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>CONFIGURACIÓN ESTRICTA EN NGINX</span>
        <span class="cad-tag" style="color:var(--accent-emerald); border-color:var(--accent-emerald);">MITIGACIÓN</span>
      </div>

      <svg class="box-mini-svg" viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="120" height="70" rx="3" fill="#0f1932" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="75" y="42" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">CLOUDFLARE EDGE</text>
        <text x="75" y="58" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">CF-Connecting-IP</text>
        <text x="75" y="74" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">Firma L7 Inmutable</text>

        <line x1="140" y1="50" x2="260" y2="50" stroke="#10b981" stroke-width="2.5" class="wire-pulse-fast"/>
        <text x="200" y="40" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">✓ set_real_ip_from</text>

        <rect x="260" y="15" width="145" height="70" rx="3" fill="#0f281e" stroke="#10b981" stroke-width="1.5"/>
        <text x="332" y="42" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">NGINX REAL_IP</text>
        <text x="332" y="58" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">remote_addr restituida</text>
        <text x="332" y="74" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="700" text-anchor="middle">[IP REAL SEGURA]</text>
      </svg>

      <div style="background:rgba(10, 15, 28, 0.9); border:1px solid var(--border-card); padding:8px 12px; font-family:var(--font-mono); font-size:11.5px; color:var(--accent-blue); border-radius:4px;">
        set_real_ip_from 10.98.0.0/24;<br>
        real_ip_header CF-Connecting-IP;<br>
        real_ip_recursive on;
      </div>

      <ul class="cad-item-list">
        <li><strong>Filtro de confianza explícito:</strong> Solo se aceptan cabeceras provenientes de la subred privada del túnel.</li>
        <li><strong>Inmutabilidad L7:</strong> Cloudflare sobreescribe <code>CF-Connecting-IP</code> con la IP pública del socket TCP antes de despachar.</li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Atribución Exacta:</span> Garantiza trazabilidad inequívoca de cada petición registrada en el pipeline.
      </div>
    </div>
  </div>
</section>
`);