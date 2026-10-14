class NoStoreMiddleware:
    """Evita que Cloudflare o el crawler cacheen respuestas.

    Si Cloudflare cachea /robots.txt el origen deja de ver esas peticiones y la
    clasificación Nivel 1 / Nivel 2 se rompe, así que se aplica a todo.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["CDN-Cache-Control"] = "no-store"
        return response
