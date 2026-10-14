"""Clasificación de User-Agents en familias y categorías.

Categorías:
  ai        crawlers/agentes de empresas de IA (grupo de la hipótesis)
  search    indexadores de buscadores tradicionales (grupo de control)
  seo       crawlers SEO/marketing
  scanner   escáneres de seguridad/Internet
  tool      librerías y herramientas HTTP genéricas
  browser   UA de navegador sin marca de bot (humano o bot camuflado)
  empty     sin User-Agent
  other     bot no catalogado

El orden importa: se usa la primera coincidencia (subcadena, sin mayúsculas).
Revisar y ampliar la lista durante el experimento.
"""
import re

# (subcadena en el UA, familia, categoría)
SIGNATURES = [
    # --- IA ---
    ("gptbot", "GPTBot", "ai"),
    ("chatgpt-user", "ChatGPT-User", "ai"),
    ("oai-searchbot", "OAI-SearchBot", "ai"),
    ("claudebot", "ClaudeBot", "ai"),
    ("claude-user", "Claude-User", "ai"),
    ("claude-searchbot", "Claude-SearchBot", "ai"),
    ("claude-web", "Claude-Web", "ai"),
    ("anthropic-ai", "anthropic-ai", "ai"),
    ("ccbot", "CCBot", "ai"),
    ("perplexitybot", "PerplexityBot", "ai"),
    ("perplexity-user", "Perplexity-User", "ai"),
    ("bytespider", "Bytespider", "ai"),
    ("amazonbot", "Amazonbot", "ai"),
    ("meta-externalagent", "Meta-ExternalAgent", "ai"),
    ("meta-externalfetcher", "Meta-ExternalFetcher", "ai"),
    ("facebookbot", "FacebookBot", "ai"),
    ("cohere-training-data-crawler", "cohere-training-data-crawler", "ai"),
    ("cohere-ai", "cohere-ai", "ai"),
    ("mistralai-user", "MistralAI-User", "ai"),
    ("duckassistbot", "DuckAssistBot", "ai"),
    ("youbot", "YouBot", "ai"),
    ("ai2bot", "AI2Bot", "ai"),
    ("diffbot", "Diffbot", "ai"),
    ("imagesiftbot", "ImagesiftBot", "ai"),
    ("omgilibot", "Omgilibot", "ai"),
    ("omgili", "Omgili", "ai"),
    ("timpibot", "Timpibot", "ai"),
    ("pangubot", "PanguBot", "ai"),
    ("img2dataset", "img2dataset", "ai"),
    ("webzio-extended", "webzio-extended", "ai"),
    ("googleother", "GoogleOther", "ai"),
    ("google-cloudvertexbot", "Google-CloudVertexBot", "ai"),
    # --- Buscadores ---
    ("adsbot-google", "AdsBot-Google", "search"),
    ("googlebot", "Googlebot", "search"),
    ("bingbot", "Bingbot", "search"),
    ("yandexbot", "YandexBot", "search"),
    ("yandex.com/bots", "YandexBot", "search"),
    ("baiduspider", "Baiduspider", "search"),
    ("duckduckbot", "DuckDuckBot", "search"),
    ("applebot", "Applebot", "search"),
    ("slurp", "Yahoo-Slurp", "search"),
    ("seznambot", "SeznamBot", "search"),
    ("qwantbot", "Qwantbot", "search"),
    ("sogou", "Sogou", "search"),
    ("petalbot", "PetalBot", "search"),
    ("mojeekbot", "MojeekBot", "search"),
    ("yeti/", "Naver-Yeti", "search"),
    ("coccocbot", "coccocbot", "search"),
    # --- SEO ---
    ("ahrefsbot", "AhrefsBot", "seo"),
    ("semrushbot", "SemrushBot", "seo"),
    ("mj12bot", "MJ12bot", "seo"),
    ("dotbot", "DotBot", "seo"),
    ("dataforseobot", "DataForSeoBot", "seo"),
    ("blexbot", "BLEXBot", "seo"),
    ("serpstatbot", "serpstatbot", "seo"),
    ("barkrowler", "Barkrowler", "seo"),
    # --- Escáneres ---
    ("censysinspect", "CensysInspect", "scanner"),
    ("expanse", "Expanse", "scanner"),
    ("zgrab", "zgrab", "scanner"),
    ("masscan", "masscan", "scanner"),
    ("nmap", "Nmap", "scanner"),
    ("l9explore", "l9explore", "scanner"),
    ("internetmeasurement", "InternetMeasurement", "scanner"),
    ("nuclei", "Nuclei", "scanner"),
    # --- Herramientas ---
    ("python-requests", "python-requests", "tool"),
    ("python-urllib", "python-urllib", "tool"),
    ("python-httpx", "python-httpx", "tool"),
    ("aiohttp", "aiohttp", "tool"),
    ("scrapy", "Scrapy", "tool"),
    ("go-http-client", "Go-http-client", "tool"),
    ("curl/", "curl", "tool"),
    ("wget", "Wget", "tool"),
    ("okhttp", "okhttp", "tool"),
    ("node-fetch", "node-fetch", "tool"),
    ("axios", "axios", "tool"),
    ("headlesschrome", "HeadlessChrome", "tool"),
    ("libwww-perl", "libwww-perl", "tool"),
    ("java/", "Java", "tool"),
]

_BOTLIKE = re.compile(r"bot|crawl|spider|scrap|fetch|agent", re.I)

# ASN donde se espera ver a cada familia. Si llega desde otro ASN se marca como
# posible suplantación. Solo se listan casos documentados; para el resto la
# verificación queda "unknown" (contrastar con las listas de IPs que publica
# cada operador, p. ej. openai.com/gptbot.json).
EXPECTED_ASNS = {
    "Googlebot": {15169},
    "AdsBot-Google": {15169},
    "GoogleOther": {15169},
    "Bingbot": {8075},
    "Applebot": {714, 6185},
    "YandexBot": {13238, 208722},
    "Baiduspider": {55967, 38365},
}


def classify(user_agent: str | None) -> tuple[str, str]:
    ua = (user_agent or "").strip()
    if not ua or ua == "-":
        return "(empty)", "empty"
    low = ua.lower()
    for needle, family, category in SIGNATURES:
        if needle in low:
            return family, category
    if _BOTLIKE.search(ua):
        return "other-bot", "other"
    if low.startswith("mozilla/"):
        return "browser", "browser"
    return "other", "other"


def verify(family: str, asn: int | None) -> str:
    expected = EXPECTED_ASNS.get(family)
    if not expected or asn is None:
        return "unknown"
    return "verified" if asn in expected else "suspect"
