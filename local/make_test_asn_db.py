"""Crea una base GeoLite2-ASN FALSA para pruebas locales, con los rangos que
usa simulate.py. No sirve para datos reales."""
import sys

from mmdb_writer import MMDBWriter
from netaddr import IPSet

NETWORKS = [
    ("20.0.0.0/8", 8075, "MICROSOFT-CORP-MSN-AS-BLOCK"),
    ("66.249.64.0/19", 15169, "GOOGLE"),
    ("110.249.0.0/16", 396986, "BYTEDANCE"),
    ("34.0.0.0/8", 396982, "GOOGLE-CLOUD-PLATFORM"),
    ("45.0.0.0/8", 14061, "DIGITALOCEAN-ASN"),
    ("5.5.0.0/16", 64500, "EXAMPLE-HOSTING"),
    ("10.0.0.0/8", 64501, "LAN-DE-PRUEBA"),
    ("172.16.0.0/12", 64501, "LAN-DE-PRUEBA"),
]

out = sys.argv[1] if len(sys.argv) > 1 else "/geoip/GeoLite2-ASN.mmdb"
w = MMDBWriter(ip_version=4, database_type="GeoLite2-ASN")
for net, asn, org in NETWORKS:
    w.insert_network(IPSet([net]), {"autonomous_system_number": asn, "autonomous_system_organization": org})
w.to_db_file(out)
print(f"Base ASN de prueba escrita en {out}")
