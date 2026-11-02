/* SLIDE 08: EL MOTOR SIN ESTADO (HMAC-SHA256) */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-7">
  <div class="slide-coord-line">
    <span>SECCIÓN 08 · CRIPTOGRAFÍA & RENDIMIENTO</span>
    <span class="coord-spec">ARQUITECTURA STATELESS</span>
  </div>
  <h1 class="slide-title-hero">El Motor Sin Estado: Laberinto Criptográfico HMAC</h1>
  <p class="slide-lead-desc">
    Generación y validación matemática de URLs sin base de datos ni escrituras en disco
  </p>

  <!-- BARRA HERO COMPACTA: ANATOMÍA DEL TOKEN WIRE -->
  <div style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 6px; padding: 10px 16px; margin-bottom: 14px; flex-shrink: 0;">
    <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--accent-blue); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <span>ANATOMÍA DEL TOKEN WIRE (52 CARACTERES HEXADECIMALES)</span>
      <span class="cad-tag">CERO I/O A DISCO</span>
    </div>
    <div style="display: grid; grid-template-columns: 2fr 1fr 0.9fr 1.1fr; gap: 10px;">
      <div style="background: rgba(10, 15, 28, 0.9); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 6px 10px;">
        <div style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--accent-blue);">UUIDv4 (32 hex)</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">128 bits aleatorios · Anti-memorización</div>
      </div>
      <div style="background: rgba(10, 15, 28, 0.9); border: 1px solid var(--accent-amber); border-radius: 4px; padding: 6px 10px;">
        <div style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--accent-amber);">Epoch (8 hex)</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">Timestamp · Latencia del crawler</div>
      </div>
      <div style="background: rgba(10, 15, 28, 0.9); border: 1px solid var(--accent-emerald); border-radius: 4px; padding: 6px 10px;">
        <div style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--accent-emerald);">Depth (2 hex)</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">Profundidad actual (0 a 10)</div>
      </div>
      <div style="background: rgba(10, 15, 28, 0.9); border: 1px solid var(--accent-rose); border-radius: 4px; padding: 6px 10px;">
        <div style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--accent-rose);">HMAC (10 hex)</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">Firma de 40 bits SHA-256</div>
      </div>
    </div>
  </div>

  <div class="grid-halves equal">
    <!-- COLUMNA IZQUIERDA: DIAGRAMA DE VERIFICACIÓN EN MEMORIA RAM -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>VALIDACIÓN DETERMINISTA EN MEMORIA RAM</span>
        <span class="cad-tag">LATENCIA &lt; 0.1 MS</span>
      </div>

      <svg viewBox="0 0 460 110" style="width: 100%; height: 100px; background: rgba(10, 15, 28, 0.9); border: 1px solid var(--border-subtle); border-radius: 4px; display: block;" xmlns="http://www.w3.org/2000/svg">
        <!-- Entrada -->
        <rect x="15" y="20" width="110" height="70" rx="3" fill="#152244" stroke="#38bdf8" stroke-width="1.2"/>
        <text x="70" y="44" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">PETICIÓN L7</text>
        <text x="70" y="62" fill="#fff" font-family="'JetBrains Mono', monospace" font-size="10.5" text-anchor="middle">/t/{52_hex}/</text>
        <text x="70" y="78" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Sin acceso a BD</text>

        <!-- Canal Entrada -->
        <path d="M 125 55 L 175 55" stroke="#38bdf8" stroke-width="2.5" class="wire-pulse-fast"/>

        <!-- Motor Django RAM -->
        <rect x="175" y="12" width="170" height="86" rx="4" fill="#0f281e" stroke="#10b981" stroke-width="1.5"/>
        <text x="260" y="36" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">MOTOR DJANGO RAM</text>
        <text x="260" y="54" fill="#fff" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">Recalcula HMAC(Key, datos)</text>
        <text x="260" y="70" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">5 iteraciones en microsegundos</text>
        <text x="260" y="86" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">compare_digest() [Anti-Timing]</text>

        <!-- Canal Salida -->
        <path d="M 345 55 L 395 55" stroke="#10b981" stroke-width="2.5" class="wire-pulse-steady"/>

        <!-- Veredicto -->
        <rect x="395" y="20" width="55" height="70" rx="3" fill="#111c35" stroke="#10b981" stroke-width="1.2"/>
        <text x="422" y="44" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">200 OK</text>
        <text x="422" y="60" fill="#94a3b8" font-family="'Space Grotesk', sans-serif" font-size="9" text-anchor="middle">Ó</text>
        <text x="422" y="78" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">404 Err</text>
      </svg>

      <ul class="cad-item-list" style="margin-top: 10px;">
        <li><strong>Propiedades Matemáticas:</strong> 52 caracteres hexadecimales compactos: $32 + 8 + 2 + 10$.</li>
        <li><strong>Resistencia a Colisiones:</strong> $6 / 2^{40} \approx 5,46 \times 10^{-12}$ de probabilidad de adivinar un token válido al azar.</li>
        <li><strong>Truncamiento a 40 bits vs RFC 2104:</strong> Compromiso deliberado frente a los $\ge 80$ bits recomendados para preservar URLs compactas; vulnerarlo online exigiría $\approx 1,8 \times 10^{11}$ peticiones por la red.</li>
      </ul>
    </div>

    <!-- COLUMNA DERECHA: VENTAJAS ARQUITECTÓNICAS -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>EFICIENCIA OPERATIVA FRENTE A BASES DE DATOS</span>
        <span class="cad-tag">ALTO RENDIMIENTO</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Consumo Plano de Recursos:</strong> Procesó 3,56 millones de peticiones con una huella de memoria RAM estrictamente inferior a <strong>60 MB</strong>.
        </li>
        <li>
          <strong>Inmunidad contra Agotamiento de I/O:</strong> Un crawler que solicita miles de páginas por minuto colapsaría una base de datos relacional por contención de bloqueos e I/O de disco.
        </li>
        <li>
          <strong>Tiempo Constante de Verificación:</strong> La función <code>hmac.compare_digest</code> opera en tiempo constante, neutralizando cualquier intento de timing attack.
        </li>
        <li>
          <strong>Auditoría Temporal Criptográfica:</strong> La marca de tiempo Epoch embebida permite calcular con exactitud la antigüedad del token en el cliente (<code>tok_age</code>).
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Principio de Diseño:</span> La criptografía de clave simétrica reemplaza el almacenamiento persistente con costo computacional $O(1)$.
      </div>
    </div>
  </div>
</section>
`);
