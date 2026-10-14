"""Batch diario (specs.md §5): toma los eventos de un día desde Loki (o de
los archivos de log), los enriquece con ASN, clasifica las violaciones,
guarda un CSV y reinyecta el resultado en Loki.

    python -m honeypot_analytics.daily                 # ayer (UTC), desde Loki
    python -m honeypot_analytics.daily --date 2026-10-20
    python -m honeypot_analytics.daily --source files  # desde los .json de Nginx
"""
import argparse
import os
from datetime import date, datetime, time, timedelta, timezone

import pandas as pd

from . import loki_push, pipeline, sources
from .asn import AsnLookup

DATA_DIR = os.environ.get("DATA_DIR", "/data")
ROBOTS_LOOKBACK_DAYS = int(os.environ.get("ROBOTS_LOOKBACK_DAYS", "30"))


def run(day: date, source: str = "loki", push: bool = True, asn_db: str | None = None) -> pd.DataFrame:
    start = datetime.combine(day, time.min, tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    hist_start = start - timedelta(days=ROBOTS_LOOKBACK_DAYS)

    if source == "loki":
        events = sources.from_loki('{job="honeypot"}', start, end)
        robots_hist = sources.from_loki('{job="honeypot", route="robots"}', hist_start, start)
    else:
        events = sources.from_files(start=start, end=end)
        hist = sources.from_files(start=hist_start, end=start)
        robots_hist = hist[hist["route"] == "robots"]

    asn = AsnLookup(asn_db)
    combined = pd.concat([robots_hist.assign(_hist=True), events.assign(_hist=False)], ignore_index=True)
    combined = pipeline.classify(pipeline.enrich(combined, asn))
    result = combined[~combined["_hist"]].drop(columns="_hist").reset_index(drop=True)

    out_dir = os.path.join(DATA_DIR, "enriched")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"events-{day.isoformat()}.csv.gz")
    result.to_csv(out, index=False)

    traps = result[result["route"] == "trap"]
    print(f"[{day}] eventos={len(result)} robots={int((result['route'] == 'robots').sum())} "
          f"trap={len(traps)} nivel1={int((traps['violation_level'] == 1).sum())} "
          f"nivel2={int((traps['violation_level'] == 2).sum())} nivel3={int(traps['hidden_link'].sum())} -> {out}")

    if push and len(result):
        print(f"[{day}] enviados a Loki: {loki_push.push(result)}")
    return result


def _day(value: str) -> date:
    if value == "today":
        return datetime.now(timezone.utc).date()
    return date.fromisoformat(value)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--date", type=_day, default=None, help="día UTC AAAA-MM-DD o 'today' (por defecto: ayer)")
    p.add_argument("--source", choices=["loki", "files"], default="loki")
    p.add_argument("--no-push", action="store_true", help="no reinyectar en Loki")
    p.add_argument("--asn-db", default=None, help="ruta a GeoLite2-ASN.mmdb")
    a = p.parse_args()
    day = a.date or (datetime.now(timezone.utc).date() - timedelta(days=1))
    run(day, a.source, push=not a.no_push, asn_db=a.asn_db)


if __name__ == "__main__":
    main()
