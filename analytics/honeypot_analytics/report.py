"""Informe estático del experimento con Pandas (specs.md capa 4).

Lee todos los CSV enriquecidos (DATA_DIR/enriched), recalcula la
clasificación sobre el histórico completo y genera en DATA_DIR/reports:
  by_family.csv   métricas por familia de bot
  actors.csv      métricas por actor (familia/UA + ASN)
  trap_hits.csv   cada acceso a /trap/ con su nivel de violación
  report.md       resumen y prueba de la hipótesis (IA vs buscadores)

    python -m honeypot_analytics.report
"""
import glob
import os

import pandas as pd

from . import pipeline

DATA_DIR = os.environ.get("DATA_DIR", "/data")


def load() -> pd.DataFrame:
    files = sorted(glob.glob(os.path.join(DATA_DIR, "enriched", "events-*.csv.gz")))
    if not files:
        raise SystemExit("No hay datos enriquecidos; correr antes honeypot_analytics.daily")
    df = pd.concat((pd.read_csv(f, dtype=str, keep_default_na=False) for f in files), ignore_index=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, format="ISO8601")
    df["asn"] = pd.to_numeric(df["asn"], errors="coerce").astype("Int64")
    df = df.drop_duplicates(subset=["timestamp", "remote_ip", "request_uri", "http_user_agent"])
    return pipeline.classify(df.sort_values("timestamp").reset_index(drop=True))


def actor_table(df: pd.DataFrame) -> pd.DataFrame:
    g = df.groupby("actor")
    t = pd.DataFrame({
        "bot_family": g["bot_family"].first(),
        "bot_category": g["bot_category"].first(),
        "asn": g["asn"].first(),
        "asn_org": g["asn_org"].first(),
        "ua_verification": g["ua_verification"].agg(lambda s: s.mode().iat[0]),
        "requests": g.size(),
        "ips": g["remote_ip"].nunique(),
        "robots_fetches": g["route"].agg(lambda s: int((s == "robots").sum())),
        "trap_hits": g["route"].agg(lambda s: int((s == "trap").sum())),
        "level1_hits": g["violation_level"].agg(lambda s: int((s == 1).sum())),
        "level2_hits": g["violation_level"].agg(lambda s: int((s == 2).sum())),
        "level3_hits": g["hidden_link"].agg(lambda s: int(s.sum())),
        "first_seen": g["timestamp"].min(),
        "last_seen": g["timestamp"].max(),
    })
    t["violator"] = t["trap_hits"] > 0
    return t.sort_values(["bot_category", "trap_hits"], ascending=[True, False])


def family_table(actors: pd.DataFrame) -> pd.DataFrame:
    g = actors.groupby(["bot_category", "bot_family"])
    t = g[["requests", "robots_fetches", "trap_hits", "level1_hits", "level2_hits", "level3_hits"]].sum()
    t["actors"] = g.size()
    t["violating_actors"] = g["violator"].sum()
    t["violation_rate"] = (t["violating_actors"] / t["actors"]).round(3)
    return t.reset_index().sort_values(["bot_category", "trap_hits"], ascending=[True, False])


def hypothesis(actors: pd.DataFrame) -> str:
    """H1: la tasa de inobservancia de crawlers de IA es mayor que la de
    buscadores. Unidad: actor. Prueba exacta de Fisher unilateral."""
    a = actors[actors["bot_category"] == "ai"]
    # Para el control se excluyen los UA de buscador que llegan desde un ASN
    # inesperado (posible suplantación).
    s = actors[(actors["bot_category"] == "search") & (actors["ua_verification"] != "suspect")]
    av, an = int(a["violator"].sum()), len(a)
    sv, sn = int(s["violator"].sum()), len(s)
    lines = ["## Hipótesis: IA vs buscadores (unidad: actor = familia + ASN)", "",
             "| Grupo | Actores | Con acceso a /trap/ | Tasa |", "|---|---|---|---|",
             f"| IA | {an} | {av} | {av / an:.1%} |" if an else "| IA | 0 | 0 | n/d |",
             f"| Buscadores | {sn} | {sv} | {sv / sn:.1%} |" if sn else "| Buscadores | 0 | 0 | n/d |", ""]
    if an and sn:
        try:
            from scipy.stats import fisher_exact
            odds, p = fisher_exact([[av, an - av], [sv, sn - sv]], alternative="greater")
            lines.append(f"Prueba exacta de Fisher (unilateral, H1: tasa IA > tasa buscadores): "
                         f"odds ratio = {odds:.3g}, p = {p:.4g}.")
        except ImportError:
            lines.append("scipy no instalado: no se calculó la prueba de Fisher.")
    else:
        lines.append("Datos insuficientes para la prueba.")
    return "\n".join(lines)


def main():
    df = load()
    out = os.path.join(DATA_DIR, "reports")
    os.makedirs(out, exist_ok=True)
    actors = actor_table(df)
    families = family_table(actors)
    traps = df[df["route"] == "trap"]
    actors.to_csv(os.path.join(out, "actors.csv"))
    families.to_csv(os.path.join(out, "by_family.csv"), index=False)
    traps.to_csv(os.path.join(out, "trap_hits.csv"), index=False)

    tech = traps["link_technique"].value_counts().rename_axis("técnica").reset_index(name="accesos")
    md = [
        "# Informe: Crawler Compliance Honeypot", "",
        f"Período: {df['timestamp'].min():%Y-%m-%d %H:%M} a {df['timestamp'].max():%Y-%m-%d %H:%M} UTC. "
        f"Peticiones: {len(df)}. Descargas de robots.txt: {int((df['route'] == 'robots').sum())}. "
        f"Accesos a /trap/: {len(traps)}.", "",
        "## Violaciones por nivel", "",
        f"- Nivel 1 (leyó robots.txt y entró igual): {int((traps['violation_level'] == 1).sum())}",
        f"- Nivel 2 (entró sin leer robots.txt): {int((traps['violation_level'] == 2).sum())}",
        f"- Nivel 3 (siguió un enlace oculto por CSS): {int(traps['hidden_link'].sum())}", "",
        "## Accesos a /trap/ por técnica de enlace", "", tech.to_markdown(index=False) if len(tech) else "(sin datos)", "",
        "## Por familia de bot", "", families.to_markdown(index=False), "",
        hypothesis(actors), "",
    ]
    with open(os.path.join(out, "report.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(md))
    print(f"Informe generado en {out}")


if __name__ == "__main__":
    main()
