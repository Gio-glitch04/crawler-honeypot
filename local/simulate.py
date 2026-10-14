"""Simula crawlers contra el honeypot local. Cada bot usa una IP pública
ficticia en CF-Connecting-IP (la red local está marcada como "Cloudflare" en
local/cloudflare_*.conf).

Resultado esperado tras correr el batch:
  GPTBot           lee robots.txt y sigue todo     -> 5 accesos Nivel 1 (4 con +3)
  Bytespider       no lee robots.txt, sigue todo   -> 5 accesos Nivel 2 (4 con +3)
  Googlebot        lee robots.txt, solo /public/   -> sin violaciones
  ClaudeBot        lee robots.txt, solo /public/   -> sin violaciones
  Googlebot falso  ASN ajeno, sigue el visible     -> 1 acceso Nivel 2, "suspect"
  python-requests  /trap/ y /trap/deadbeef         -> 2 accesos Nivel 2 (bare, invalid)
"""
import os
import re
import sys

import requests

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://nginx-proxy"
HOST = os.environ.get("SIM_HOST", "localhost")

BOTS = [
    ("20.15.1.1", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", True, "all"),
    ("66.249.66.1", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", True, "public"),
    ("110.249.1.1", "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)", False, "all"),
    ("34.1.1.1", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", True, "public"),
    ("5.5.5.5", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", False, "visible"),
]


def get(path, ip, ua, ref=None):
    headers = {"Host": HOST, "User-Agent": ua, "CF-Connecting-IP": ip}
    if ref:
        headers["Referer"] = ref
    r = requests.get(BASE + path, headers=headers, timeout=10)
    leaked = [k for k in r.headers if k.lower().startswith("x-honeypot")]
    if leaked:
        sys.exit(f"ERROR: cabeceras internas expuestas al cliente: {leaked}")
    print(f"{r.status_code} {ip:<12} {path[:40]:<40} {ua.split(';')[-2 if ';' in ua else 0][:30].strip()}")
    return r


def links(html):
    return re.findall(r'href="(/(?:public|trap)/[0-9a-f]+)"', html)


def visible_traps(html):
    return re.findall(r'<p>Archivo histórico: <a href="(/trap/[0-9a-f]+)"', html)


for ip, ua, reads_robots, policy in BOTS:
    if reads_robots:
        get("/robots.txt", ip, ua)
    home = get("/", ip, ua)
    if policy == "all":
        targets = links(home.text)
    elif policy == "public":
        targets = [l for l in links(home.text) if l.startswith("/public/")]
    else:
        targets = visible_traps(home.text)
    for t in targets:
        get(t, ip, ua, ref=f"http://{HOST}/")

get("/trap/", "45.1.1.1", "python-requests/2.32.3")
get("/trap/deadbeef", "45.1.1.1", "python-requests/2.32.3")
print("\nSimulación terminada. Siguiente paso: correr el batch (ver LOCAL.md).")
