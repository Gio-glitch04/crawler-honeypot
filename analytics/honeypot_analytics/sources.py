"""Carga de eventos: desde Loki (API HTTP) o desde los archivos JSON de Nginx."""
import glob
import gzip
import json
import os
from datetime import datetime, timezone

import pandas as pd
import requests

LOKI_URL = os.environ.get("LOKI_URL", "http://loki:3100")
TRAP_PATH = os.environ.get("HONEYPOT_TRAP_PATH", "trap").strip("/") or "trap"
LOG_GLOB = os.environ.get("LOG_GLOB", "/var/log/nginx/honeypot_access.json*")

COLUMNS = [
    "timestamp", "msec", "remote_ip", "peer_ip", "via_cloudflare", "host", "scheme", "request_method",
    "request_uri", "status", "http_referer", "http_user_agent", "tls_version", "tls_cipher",
    "client_tls_version", "client_tls_cipher", "ja3", "ja4", "cf_country", "route",
    "link_technique", "link_issued", "link_depth", "request_time",
]


def _frame(records: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame.from_records(records)
    for col in COLUMNS:
        if col not in df.columns:
            df[col] = ""
    df = df[COLUMNS].fillna("")
    # $msec (epoch con milisegundos) ordena bien robots.txt -> /trap/ dentro
    # del mismo segundo; $time_iso8601 solo tiene resolución de segundos.
    msec = pd.to_numeric(df["msec"], errors="coerce")
    iso = pd.to_datetime(df["timestamp"], utc=True, format="ISO8601", errors="coerce")
    df["timestamp"] = pd.to_datetime(msec, unit="s", utc=True).fillna(iso)
    df = df.dropna(subset=["timestamp"])
    # route vacío = Nginx no llegó al backend (p. ej. error 502): se deduce de la URI.
    missing = df["route"] == ""
    df.loc[missing, "route"] = df.loc[missing, "request_uri"].map(_route_from_uri)
    return df.sort_values("timestamp").reset_index(drop=True)


def _route_from_uri(uri: str) -> str:
    path = uri.split("?", 1)[0]
    if path == "/robots.txt":
        return "robots"
    if path == "/":
        return "home"
    for prefix, r in ((TRAP_PATH, "trap"), ("public", "public")):
        if path == f"/{prefix}" or path.startswith(f"/{prefix}/"):
            return r
    return "other"


def from_files(pattern: str = LOG_GLOB, start=None, end=None) -> pd.DataFrame:
    records = []
    for path in sorted(glob.glob(pattern)):
        opener = gzip.open if path.endswith(".gz") else open
        with opener(path, "rt", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    df = _frame(records)
    if start is not None:
        df = df[df["timestamp"] >= start]
    if end is not None:
        df = df[df["timestamp"] < end]
    return df.reset_index(drop=True)


def from_loki(query: str, start: datetime, end: datetime, url: str = LOKI_URL,
              batch: int = 5000) -> pd.DataFrame:
    """Lee todas las líneas de `query` entre start y end, paginando hacia adelante."""
    records = []
    cursor = int(start.timestamp() * 1e9)
    end_ns = int(end.timestamp() * 1e9)
    seen_at_cursor: set[str] = set()
    while cursor < end_ns:
        r = requests.get(f"{url}/loki/api/v1/query_range", timeout=60, params={
            "query": query, "start": cursor, "end": end_ns, "limit": batch, "direction": "forward",
        })
        r.raise_for_status()
        entries = []
        for stream in r.json()["data"]["result"]:
            entries.extend((int(ts), line) for ts, line in stream["values"])
        entries.sort()
        new = [(ts, line) for ts, line in entries if not (ts == cursor and line in seen_at_cursor)]
        if not new:
            break
        for _, line in new:
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        last = entries[-1][0]
        if len(entries) < batch:
            break
        seen_at_cursor = {line for ts, line in entries if ts == last}
        cursor = last
    return _frame(records)


def utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
