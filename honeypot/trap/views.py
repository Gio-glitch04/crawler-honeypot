import random
import secrets

from django.http import HttpResponse
from django.shortcuts import render

from . import content, tokens

ROBOTS_TXT = """User-agent: *
Disallow: /trap/
"""

# Cabeceras internas que Nginx registra ($upstream_http_x_honeypot_*) y
# elimina antes de responder al cliente (proxy_hide_header).
H_ROUTE = "X-Honeypot-Route"
H_TECHNIQUE = "X-Honeypot-Technique"
H_ISSUED = "X-Honeypot-Token-Issued"
H_DEPTH = "X-Honeypot-Depth"

PUBLIC_LINKS_PER_PAGE = 5


def _tag(response, route, token=None, technique=None):
    response[H_ROUTE] = route
    if token is not None:
        response[H_TECHNIQUE] = token.technique
        if token.issued_at is not None:
            response[H_ISSUED] = str(token.issued_at)
            response[H_DEPTH] = str(token.depth)
    elif technique:
        response[H_TECHNIQUE] = technique
    return response


def _css_classes():
    """Nombres de clase aleatorios por petición, para que no se puedan
    filtrar los enlaces ocultos por nombre de clase sin interpretar el CSS."""
    def name():
        return random.choice("abcdefghijklmnopqrstuvwxyz") + secrets.token_hex(4)
    return {"none": name(), "opacity": name(), "offscreen": name()}


def _links(depth):
    """Enlaces públicos visibles + una trampa por técnica, en orden aleatorio
    dentro de cada grupo. Los ids cambian en cada petición (decisión 5)."""
    public = []
    for _ in range(PUBLIC_LINKS_PER_PAGE):
        tid = tokens.issue(tokens.PUBLIC, depth)
        public.append({"href": f"/public/{tid}", "label": content.link_label(tid)})
    traps = []
    for technique in tokens.TRAP_TECHNIQUES:
        tid = tokens.issue(technique, depth)
        traps.append({"href": f"/trap/{tid}", "label": content.link_label(tid), "technique": technique})
    random.shuffle(traps)
    return public, traps


def _page(request, template, route, depth, seed, token=None, status=200):
    public, traps = _links(depth)
    ctx = {
        "css": _css_classes(),
        "public_links": public,
        "trap_links": traps,
        "dataset": content.dataset(seed),
    }
    response = render(request, template, ctx, status=status)
    return _tag(response, route, token)


def robots_txt(request):
    response = HttpResponse(ROBOTS_TXT, content_type="text/plain; charset=utf-8")
    return _tag(response, "robots")


def home(request):
    return _page(request, "trap/home.html", "home", depth=1, seed=secrets.token_hex(8))


def public_page(request, token):
    tok = tokens.decode(token)
    depth = (tok.depth or 0) + 1
    return _page(request, "trap/dataset.html", "public", depth=depth, seed=token, token=tok)


def trap_page(request, token):
    # Toda petición bajo /trap/ es una violación, tenga o no un token válido:
    # "bare" = /trap/ a secas (típico de quien lee el Disallow y explora),
    # "invalid" = id manipulado o inventado.
    if token:
        tok = tokens.decode(token)
    else:
        tok = tokens.Token("", "bare", None, None)
    depth = (tok.depth or 0) + 1
    return _page(request, "trap/dataset.html", "trap", depth=depth, seed=token or "bare", token=tok)


def not_found(request, exception=None):
    response = HttpResponse("<h1>404</h1>", status=404)
    return _tag(response, "other")
