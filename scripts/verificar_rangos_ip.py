import ipaddress
import json
import urllib.request

urls = {
    "gptbot.json": "https://openai.com/gptbot.json",
    "searchbot.json": "https://openai.com/searchbot.json",
    "googlebot.json": (
        "https://developers.google.com/static/search/apis/ipranges/googlebot.json"
    ),
    "special-crawlers.json": (
        "https://developers.google.com/static/search/apis/ipranges/special-crawlers.json"
    ),
}

# Subredes reales documentadas en informe-tecnico-honeypot.md (§5.1, §5.2, §5.3)
observed_subnets = {
    "ClaudeBot": [
        ("216.73.217.0/24", 1590538),
        ("216.73.216.0/24", 399324),
        ("34.162.0.0/16", 4),
    ],
    "GPTBot": [
        ("74.7.242.0/24", 1557329),
        ("132.196.86.0/24", 751),
        ("172.182.207.0/24", 410),
        ("172.182.202.0/24", 385),
    ],
    "OAI-SearchBot": [
        ("74.7.175.0/24", 38),
        ("74.7.230.0/24", 9),
        ("51.8.102.0/24", 2),
    ],
    "Googlebot/GoogleOther": [
        ("66.249.73.0/24", 12071),
        ("192.178.6.0/24", 94),
        ("66.249.69.0/24", 50),
        ("66.249.70.0/24", 19),
    ],
}

fetched = {}
for name, url in urls.items():
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read().decode())
        prefixes = [
            p.get("ipv4Prefix")
            for p in data.get("prefixes", [])
            if p.get("ipv4Prefix")
        ]
        fetched[name] = (
            data.get("creationTime"),
            [ipaddress.ip_network(p) for p in prefixes],
        )
        print(
            f"[OK] {name}: creationTime={data.get('creationTime')}, {len(prefixes)} prefijos IPv4"
        )

print("\n--- Cruce contra subredes observadas en el log y BGP ASN (RIPE Stat) ---")
for bot, items in observed_subnets.items():
    print(f"\nBot: {bot}")
    for cidr, reqs in items:
        net = ipaddress.ip_network(cidr)
        sample_ip = str(net.network_address + 1)
        bgp_prefix, asns = "N/A", []
        for attempt in range(2):
            try:
                ripe_url = f"https://stat.ripe.net/data/network-info/data.json?resource={sample_ip}"
                req = urllib.request.Request(
                    ripe_url, headers={"User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=5) as r:
                    ripe_data = json.loads(r.read().decode()).get("data", {})
                    bgp_prefix = ripe_data.get("prefix")
                    asns = ripe_data.get("asns")
                break
            except Exception:
                pass
        matched_in = []
        for name, (ct, official_nets) in fetched.items():
            for onet in official_nets:
                if net.subnet_of(onet) or onet.subnet_of(net):
                    matched_in.append(f"{name}:{onet}")
        print(
            f"  {cidr:18s} ({reqs:7d} reqs) | BGP: {str(bgp_prefix):18s} AS{asns} | JSON: {matched_in}"
        )
