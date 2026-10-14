"""Enriquecimiento IP -> ASN con MaxMind GeoLite2-ASN (o DB-IP ASN Lite,
mismo formato MMDB y mismos nombres de campo)."""
import functools
import ipaddress
import os

import maxminddb

DEFAULT_PATHS = [
    os.environ.get("ASN_DB_PATH", ""),
    "/usr/share/GeoIP/GeoLite2-ASN.mmdb",
    "/usr/share/GeoIP/dbip-asn-lite.mmdb",
]


class AsnLookup:
    def __init__(self, path: str | None = None):
        candidates = [path] if path else [p for p in DEFAULT_PATHS if p]
        for p in candidates:
            if p and os.path.exists(p):
                self.reader = maxminddb.open_database(p)
                self.path = p
                break
        else:
            raise FileNotFoundError(f"No se encontró base ASN en {candidates}")

    @functools.lru_cache(maxsize=200_000)
    def lookup(self, ip: str) -> tuple[int | None, str | None]:
        try:
            ipaddress.ip_address(ip)
        except ValueError:
            return None, None
        rec = self.reader.get(ip) or {}
        return rec.get("autonomous_system_number"), rec.get("autonomous_system_organization")
