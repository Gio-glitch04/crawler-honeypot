"""Recalcula las cifras estadisticas del informe y genera los graficos.

Los datos de entrada son los agregados publicados en el informe (no el log crudo).
Uso:  python scripts/estadisticas_y_graficos.py
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats

OUT = os.path.join(os.path.dirname(__file__), "..", "graficos")
os.makedirs(OUT, exist_ok=True)


def ub_one_sided(n, alpha=0.05):
    """Cota superior exacta (Clopper-Pearson unilateral) para k=0: 1-alpha^(1/n)."""
    return 1 - alpha ** (1 / n)


def ub_two_sided(n, alpha=0.05):
    return 1 - (alpha / 2) ** (1 / n)


print("== Cotas superiores para k = 0 ==")
casos = {
    "ClaudeBot (todas las trampas)": 3_140_620,
    "GPTBot (todas las trampas)": 2_181_250,
    "GoogleOther (todas las trampas)": 43_215,
    "Googlebot (todas las trampas)": 235,
    "ClaudeBot (solo visible)": 628_124,
    "GPTBot (solo visible)": 436_250,
    "GoogleOther (solo visible)": 8_643,
    "Googlebot (solo visible)": 47,
    "Total IA declarada (solo visible)": 1_073_017,
    "Unidad = operador (3 operadores)": 3,
    "Unidad = operador (4 operadores)": 4,
}
for k, n in casos.items():
    print(f"{k:38s} n={n:>9,d}  unilateral={ub_one_sided(n):.3e}  bilateral={ub_two_sided(n):.3e}  3/n={3/n:.3e}")

print("\n== Chi-cuadrado por tecnica (207 accesos) ==")
obs = [43, 43, 42, 40, 39]
chi = stats.chisquare(obs)
print(chi)
print("Solo ocultas (164):", stats.chisquare([43, 42, 40, 39]))
print("Nivel 3 =", 207 - 43, f"({(207-43)/207:.1%})")

# ---------------- Graficos ----------------
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": 0.3})

dias = ["18/10", "19/10", "20/10", "21/10", "22/10", "23/10", "24/10", "25/10", "26/10", "27/10", "28/10", "29/10", "30/10"]
claude = [0, 6, 32597, 42700, 40198, 523098, 887244, 463997, 24, 2, 0, 0, 0]
gpt = [0, 0, 0, 132805, 162594, 172256, 171489, 172139, 171730, 107097, 169894, 170670, 128201]
other = [90 + 69, 25 + 12 + 568 + 23, 9067 + 779 + 279 + 20, 1609 + 619 + 1021 + 17,
         1 + 14 + 402 + 29, 0 + 9 + 1368 + 21, 41 + 905 + 54, 869 + 18, 44 + 688 + 44,
         35 + 15, 10 + 24 + 8, 2 + 283 + 6, 2 + 504 + 14]
fig, ax = plt.subplots(figsize=(7, 3.2))
ax.bar(dias, claude, label="ClaudeBot", color="#d97706")
ax.bar(dias, gpt, bottom=claude, label="GPTBot", color="#2563eb")
ax.bar(dias, other, bottom=[a + b for a, b in zip(claude, gpt)], label="Resto", color="#6b7280")
ax.axvline(9, color="red", ls=":", lw=1)
ax.text(9.1, 900000, "hueco de\ncaptura 27/10", fontsize=7, color="red", va="top")
ax.set_ylabel("Peticiones por día (UTC)")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "serie-diaria.png"), dpi=200)
plt.close(fig)

niveles = list(range(2, 12))
cb = [10, 49, 223, 943, 3680, 12865, 42283, 136519, 431550, 1361483]
gp = [8, 33, 122, 451, 1710, 6317, 23328, 86003, 318276, 1122624]
fig, ax = plt.subplots(figsize=(7, 3.2))
ax.semilogy(niveles, cb, "o-", label="ClaudeBot", color="#d97706")
ax.semilogy(niveles, gp, "s-", label="GPTBot", color="#2563eb")
ax.semilogy(niveles, [10 * 5 ** i for i in range(10)], "k--", lw=0.8, label="Ramificación teórica b = 5 (ref.)")
ax.set_xlabel("Nivel de profundidad solicitado (11 = hojas sin enlaces)")
ax.set_ylabel("Peticiones (escala log)")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "profundidad.png"), dpi=200)
plt.close(fig)

tec = ["visible", "display:none\ninline", "offscreen", "display:none\nclase", "opacity:0"]
fig, ax = plt.subplots(figsize=(6, 3))
ax.bar(tec, obs, color=["#16a34a"] + ["#6b7280"] * 4)
ax.axhline(41.4, color="red", ls="--", lw=1, label="Esperado si sigue todos los href (41,4)")
ax.set_ylabel("Accesos a /archivo-interno/")
ax.legend(frameon=False)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "trampa-tecnicas.png"), dpi=200)
plt.close(fig)
print("graficos generados en", os.path.abspath(OUT))
