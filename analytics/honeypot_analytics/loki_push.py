"""Reinyecta los eventos enriquecidos en Loki (job=honeypot_enriched) para
que Grafana pueda agrupar por ASN, categoría de bot y nivel de violación."""
import json
import os

import pandas as pd
import requests

LOKI_URL = os.environ.get("LOKI_URL", "http://loki:3100")
FIELDS = [
    "remote_ip", "request_uri", "http_user_agent", "status", "link_technique", "link_age_s",
    "asn", "asn_org", "bot_family", "bot_category", "ua_verification", "actor",
    "robots_before_ip", "robots_before_actor", "violation_level", "hidden_link",
]


def _value(v):
    if v is pd.NA or (isinstance(v, float) and pd.isna(v)):
        return None
    if hasattr(v, "item"):
        return v.item()
    return v


def push(df: pd.DataFrame, url: str = LOKI_URL, batch: int = 2000) -> int:
    sent = 0
    for start in range(0, len(df), batch):
        chunk = df.iloc[start:start + batch]
        streams: dict[tuple, list] = {}
        for _, row in chunk.iterrows():
            key = (row["route"], row["bot_category"], row["violation"])
            line = json.dumps({f: _value(row[f]) for f in FIELDS}, ensure_ascii=False, default=str)
            streams.setdefault(key, []).append([str(row["timestamp"].value), line])
        payload = {"streams": [
            {"stream": {"job": "honeypot_enriched", "route": r, "category": c, "violation": v},
             "values": sorted(values)}
            for (r, c, v), values in streams.items()
        ]}
        resp = requests.post(f"{url}/loki/api/v1/push", json=payload, timeout=60)
        resp.raise_for_status()
        sent += len(chunk)
    return sent
