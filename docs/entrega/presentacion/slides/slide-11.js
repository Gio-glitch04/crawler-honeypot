/* SLIDE 11: TOPOLOGÍA DEL ÁRBOL & COTA DE PROFUNDIDAD */
window.PRESENTATION_SLIDES = window.PRESENTATION_SLIDES || [];
window.PRESENTATION_SLIDES.push(`
<section class="cad-slide-page" id="slide-10">
  <div class="slide-coord-line">
    <span>SECCIÓN 11 · TEORÍA DE GRAFOS & RECURSIÓN</span>
    <span class="coord-spec">ESPACIO DE DIRECCIONES</span>
  </div>
  <h1 class="slide-title-hero">Topología del Árbol del Tarpit y Cota de Profundidad</h1>
  <p class="slide-lead-desc">
    Estructura matemática del espacio de direcciones: factor de ramificación 5 y clausura determinista
  </p>

  <div class="grid-halves">
    <!-- COLUMNA IZQUIERDA: DIAGRAMA VECTORIAL DEL ÁRBOL DE EXPANSIÓN -->
    <div class="cad-visual-container">
      <svg class="cad-vector-svg" viewBox="0 0 620 320" xmlns="http://www.w3.org/2000/svg">
        <!-- NODO RAÍZ (NIVEL 0) -->
        <rect x="230" y="10" width="160" height="36" rx="3" fill="#152244" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="310" y="32" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">RAÍZ: Profundidad 0</text>

        <!-- RAMIFICACIÓN A NIVEL 1 (b = 5) -->
        <line x1="310" y1="46" x2="110" y2="105" stroke="#263c70" stroke-width="1.8"/>
        <line x1="310" y1="46" x2="210" y2="105" stroke="#263c70" stroke-width="1.8"/>
        <line x1="310" y1="46" x2="310" y2="105" stroke="#263c70" stroke-width="1.8"/>
        <line x1="310" y1="46" x2="410" y2="105" stroke="#263c70" stroke-width="1.8"/>
        <line x1="310" y1="46" x2="510" y2="105" stroke="#263c70" stroke-width="1.8"/>

        <circle cx="110" cy="105" r="11" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="210" cy="105" r="11" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="310" cy="105" r="11" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="410" cy="105" r="11" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <circle cx="510" cy="105" r="11" fill="#162444" stroke="#10b981" stroke-width="1.5"/>
        <text x="310" y="135" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="600" text-anchor="middle">NIVEL 1: 5 Enlaces Públicos + 5 Trampas</text>

        <!-- RECURSIÓN DETERMINISTA -->
        <path d="M 110 117 L 70 185 M 110 117 L 150 185" stroke="#1d2e57" stroke-width="1.2" stroke-dasharray="3 3"/>
        <path d="M 510 117 L 470 185 M 510 117 L 550 185" stroke="#1d2e57" stroke-width="1.2" stroke-dasharray="3 3"/>

        <rect x="50" y="185" width="520" height="40" rx="3" fill="#0f1932" stroke="#263c70" stroke-width="1.2" stroke-dasharray="4 4"/>
        <text x="310" y="210" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700" text-anchor="middle">RECURSIÓN DETERMINISTA: Niveles 2 a 10 (5ᵈ ramas)</text>

        <!-- CORTE Y HOJA (NIVEL 11) -->
        <line x1="310" y1="225" x2="310" y2="255" stroke="#f43f5e" stroke-width="2"/>
        <rect x="150" y="255" width="320" height="48" rx="4" fill="#1c1122" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="310" y="276" fill="#f43f5e" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="800" text-anchor="middle">NIVEL 11: NODO HOJA (is_leaf = true)</text>
        <text x="310" y="292" fill="#cbd5e1" font-family="'Space Grotesk', sans-serif" font-size="10.5" text-anchor="middle">0 enlaces salientes · Fin estricto del laberinto</text>
      </svg>
      <div class="cad-caption-bar">
        <span class="cad-caption-tag"><strong>Factor de ramificación:</strong> b = 5</span>
        <span class="cad-caption-tag"><strong>Profundidad máxima:</strong> 10</span>
        <span class="cad-caption-tag"><strong>Hojas terminales:</strong> Nivel 11 (68% al 72% peticiones)</span>
      </div>
    </div>

    <!-- COLUMNA DERECHA: RECURSIÓN Y ANÁLISIS DE GRAFOS -->
    <div class="cad-box-panel">
      <div class="cad-box-title">
        <span>BFS VS DFS EN CRAWLERS DE GRAN ESCALA</span>
        <span class="cad-tag">EXPLOSIÓN COMBINATORIA</span>
      </div>

      <ul class="cad-item-list">
        <li>
          <strong>Exploración en Anchura (BFS):</strong> Típica de GPTBot. Procesa todas las URLs de nivel <em>d</em> antes de descender al nivel <em>d+1</em>, demandando gran memoria para la cola de URLs.
        </li>
        <li>
          <strong>Exploración en Profundidad (DFS):</strong> Observada en scripts agresivos que siguen enlaces verticalmente hasta topar con la cota.
        </li>
        <li>
          <strong>Concentración en Hojas ($d = 11$):</strong> Debido a la expansión geométrica ($5^d$), entre el <strong>68 % y el 72 %</strong> del tráfico total recayó sobre nodos hoja terminales sin enlaces.
        </li>
        <li>
          <strong>Protección del Servidor:</strong> Sin cota, un árbol con <code>b = 5</code> a profundidad 10 demandaría <code>5¹⁰ ≈ 9,76 millones</code> de páginas. <span class="cad-tag">HONEYPOT_MAX_DEPTH=10</span> salvaguardó CPU y ancho de banda.
        </li>
      </ul>

      <div class="cad-callout-card">
        <span style="color:var(--accent-emerald); font-weight:700;">Control Algorítmico:</span> La condición <code>is_leaf = true</code> detiene de forma determinista cualquier recorrido recursivo sin estado residual.
      </div>
    </div>
  </div>
</section>
`);