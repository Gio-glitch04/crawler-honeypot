"""Genera, desde los CSV de data/, las tablas del informe y la Figura 2.

Entradas : data/serie_temporal_diaria.csv, data/verificacion_rangos.csv
Salidas  : data/tablas_generadas.md  (Tabla 2 y Anexo A, listas para pegar)
           graficos/serie-diaria.png (Figura 2, mismas cifras que el Anexo A)
Uso: python scripts/generar_tablas.py   (correr antes verificar_rangos_ip.py)
"""
import csv
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
D = os.path.join(ROOT, "data")
FIG_DIRS = [os.path.join(ROOT, "docs", "entrega", "graficos"), os.path.join(ROOT, "..", "graficos")]


def fmt(n):
    return f"{int(n):,}".replace(",", ".")


def pct(a, b):
    p = 100 * a / b
    return "100,00 %" if a == b else f"{p:.4f} %".replace(".", ",")


serie = list(csv.DictReader(open(os.path.join(D, "serie_temporal_diaria.csv"), encoding="utf-8")))
ver = list(csv.DictReader(open(os.path.join(D, "verificacion_rangos.csv"), encoding="utf-8")))
cols = ["claudebot", "gptbot", "googleother", "googlebot", "navegadores", "resto"]

# ---- comprobaciones internas ----
for r in serie:
    assert sum(int(r[c]) for c in cols) == int(r["total"]), r["fecha"]
tot = {c: sum(int(r[c]) for r in serie) for c in cols}
tot_all = sum(tot.values())
assert tot_all == 3_568_349, tot_all
for fam, esperado in [("claudebot", 1_989_866), ("gptbot", 1_558_875), ("googleother", 10_702),
                      ("googlebot", 1_532), ("navegadores", 7_036)]:
    assert tot[fam] == esperado, (fam, tot[fam])
op_tot = {}
for r in ver:
    op_tot.setdefault(r["operador"], 0)
    op_tot[r["operador"]] += int(r["peticiones"])
assert op_tot["Anthropic"] == tot["claudebot"]
assert op_tot["OpenAI"] == tot["gptbot"] + 49
assert op_tot["Google"] == tot["googleother"] + tot["googlebot"]
gpt30 = int([r for r in serie if r["fecha"].endswith("10-30")][0]["gptbot"])
horas30 = 17 + 57.083 / 60  # corte 17:57:05 UTC
print(f"GPTBot 30/10: {gpt30} en {horas30:.2f} h = {gpt30/horas30:,.0f} req/h = {gpt30/horas30/3600:.3f} req/s")
print("Comprobaciones internas OK; total =", tot_all)

# ---- Tabla 2 ----
FUENTE = {"Anthropic": "Registro ARIN `216.73.216.0/22` [23] (Anthropic no publica lista de prefijos)",
          "OpenAI": "`gptbot.json` [21] y `searchbot.json` [22]",
          "Google": "`googlebot.json` y `special-crawlers.json` [20]"}
lines = ["| Operador | Subredes observadas (peticiones) | AS (BGP) | Fuente de verificación | Verificadas / total | Cobertura |",
         "|---|---|---|---|---:|---:|"]
for op in ["Anthropic", "OpenAI", "Google"]:
    rows = [r for r in ver if r["operador"] == op]
    subn = []
    for r in rows:
        n = fmt(r["peticiones"])
        if r["familia"] == "OAI-SearchBot":
            subn.append(f"`{r['cidr']}` ({n}, OAI-SearchBot)")
        elif r["verificable"] == "si":
            subn.append(f"`{r['cidr']}` ({n})")
        else:
            subn.append(f"{r['cidr']} ({n})")
    asns = sorted({a for r in rows for a in r["asn"].split(",") if a})
    v = sum(int(r["peticiones"]) for r in rows if r["verificado"] == "si")
    t = sum(int(r["peticiones"]) for r in rows)
    lines.append(f"| **{op}** | {'; '.join(subn)} | {', '.join(asns) or 's/d'} | {FUENTE[op]} | {fmt(v)} / {fmt(t)} | **{pct(v, t)}** |")
tabla2 = "\n".join(lines)

# ---- Anexo A ----
a = ["| Fecha (UTC) | ClaudeBot | GPTBot | GoogleOther | Googlebot | Navegadores | Resto | Total día |",
     "|---|---:|---:|---:|---:|---:|---:|---:|"]
for r in serie:
    y, m, d = r["fecha"].split("-")
    mark = " †" if d == "27" else (" ‡" if d == "30" else "")
    a.append(f"| **{d}/{m}/{y}**{mark} | " + " | ".join(fmt(r[c]) for c in cols) + f" | **{fmt(r['total'])}** |")
a.append("| **Total** | " + " | ".join(f"**{fmt(tot[c])}**" for c in cols) + f" | **{fmt(tot_all)}** |")
anexoA = "\n".join(a)

with open(os.path.join(D, "tablas_generadas.md"), "w", encoding="utf-8") as f:
    f.write("<!-- TABLA2 -->\n" + tabla2 + "\n<!-- /TABLA2 -->\n\n<!-- ANEXOA -->\n" + anexoA + "\n<!-- /ANEXOA -->\n")

# ---- Figura 2 (desde el mismo CSV) ----
dias = [r["fecha"][8:10] + "/" + r["fecha"][5:7] for r in serie]
claude = [int(r["claudebot"]) for r in serie]
gpt = [int(r["gptbot"]) for r in serie]
resto = [int(r["googleother"]) + int(r["googlebot"]) + int(r["navegadores"]) + int(r["resto"]) for r in serie]
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": 0.3})
fig, ax = plt.subplots(figsize=(7, 3.2))
ax.bar(dias, claude, label="ClaudeBot", color="#d97706")
ax.bar(dias, gpt, bottom=claude, label="GPTBot", color="#2563eb")
ax.bar(dias, resto, bottom=[x + y for x, y in zip(claude, gpt)], label="Resto", color="#6b7280")
i27 = dias.index("27/10")
ax.axvline(i27, color="red", ls=":", lw=1)
ax.text(i27 + 0.1, 900000, "hueco de\ncaptura 27/10", fontsize=7, color="red", va="top")
ax.set_ylabel("Peticiones por día (UTC)")
ax.legend(frameon=False)
fig.tight_layout()
for d_ in FIG_DIRS:
    os.makedirs(d_, exist_ok=True)
    fig.savefig(os.path.join(d_, "serie-diaria.png"), dpi=200)
plt.close(fig)
print("Tablas y figura generadas desde data/*.csv")
