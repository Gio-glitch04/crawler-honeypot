"""Verifica las subredes observadas contra las fuentes de cada operador.

Entrada : data/subredes_por_operador.csv (unica fuente de conteos; transcripcion de la
          corrida sobre el log exportado el 30/10/2026, el log crudo no se publica).
Salida  : data/verificacion_rangos.csv (una fila por subred) y resumen por operador.

Fuentes:
  OpenAI / Google : listas JSON oficiales (un /24 coincide si se solapa con un prefijo publicado).
  Anthropic       : NO publica lista de prefijos; se usa pertenencia al bloque ARIN 216.73.216.0/22.
  BGP / ASN       : RIPE Stat (network-info), si hay red disponible.
Uso: python scripts/verificar_rangos_ip.py
"""
import csv
import ipaddress
import json
import os
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
IN_CSV = os.path.join(ROOT, "data", "subredes_por_operador.csv")
OUT_CSV = os.path.join(ROOT, "data", "verificacion_rangos.csv")

URLS = {
    "OpenAI": [
        "https://openai.com/gptbot.json",
        "https://openai.com/searchbot.json",
    ],
    "Google": [
        "https://developers.google.com/static/search/apis/ipranges/googlebot.json",
        "https://developers.google.com/static/search/apis/ipranges/special-crawlers.json",
    ],
}
ARIN_ANTHROPIC = ipaddress.ip_network("216.73.216.0/22")


def get_json(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


official = {}
for op, urls in URLS.items():
    official[op] = []
    for u in urls:
        try:
            d = get_json(u)
            pref = [ipaddress.ip_network(p["ipv4Prefix"]) for p in d.get("prefixes", []) if p.get("ipv4Prefix")]
            official[op] += pref
            print(f"[OK] {u}: creationTime={d.get('creationTime')}, {len(pref)} prefijos IPv4")
        except Exception as e:  # sin red o fuente caida
            print(f"[ERROR] {u}: {e}")


def bgp(cidr):
    sample = str(ipaddress.ip_network(cidr).network_address + 1)
    try:
        d = get_json(f"https://stat.ripe.net/data/network-info/data.json?resource={sample}", timeout=8)["data"]
        return d.get("prefix") or "", ",".join(f"AS{a}" for a in d.get("asns", []))
    except Exception:
        return "", ""


rows_out = []
with open(IN_CSV, newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        verificado, metodo, prefijo_oficial = "no", "", ""
        if r["verificable"] == "si":
            net = ipaddress.ip_network(r["cidr"])
            if r["operador"] == "Anthropic":
                metodo = "ARIN /22"
                if net.subnet_of(ARIN_ANTHROPIC):
                    verificado, prefijo_oficial = "si", str(ARIN_ANTHROPIC)
            else:
                metodo = "JSON oficial"
                for o in official.get(r["operador"], []):
                    if net.subnet_of(o) or o.subnet_of(net):
                        verificado, prefijo_oficial = "si", str(o)
                        break
            bgp_prefix, asn = bgp(r["cidr"])
        else:
            bgp_prefix, asn = "", ""
        rows_out.append({**r, "metodo": metodo, "verificado": verificado,
                         "prefijo_oficial": prefijo_oficial, "bgp_prefix": bgp_prefix, "asn": asn})
        print(f"{r['operador']:10s} {r['cidr'][:38]:38s} {int(r['peticiones']):>9,d}  verificado={verificado} {prefijo_oficial} {bgp_prefix} {asn}")

with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()))
    w.writeheader()
    w.writerows(rows_out)

print("\n--- Resumen por operador ---")
for op in dict.fromkeys(r["operador"] for r in rows_out):
    tot = sum(int(r["peticiones"]) for r in rows_out if r["operador"] == op)
    ver = sum(int(r["peticiones"]) for r in rows_out if r["operador"] == op and r["verificado"] == "si")
    print(f"{op:10s} {ver:>9,d} / {tot:>9,d} = {100*ver/tot:.4f} %")
print("escrito:", os.path.abspath(OUT_CSV))
