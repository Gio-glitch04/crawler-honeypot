"""Configuración mínima: sin base de datos, sin sesiones, sin admin.

El estado de los enlaces se codifica en el propio token (ver trap/tokens.py),
así que no hace falta persistencia (decisión 4 de memory.md).
"""
import os

DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key")
# Clave HMAC de los tokens de enlace. Si cambia, los tokens viejos pasan a "invalid".
TOKEN_SECRET = os.environ.get("HONEYPOT_TOKEN_SECRET", SECRET_KEY)

# Ruta prohibida en robots.txt. Por defecto "trap" (specs.md), pero conviene
# un nombre neutro en producción: un scraper atento evitaría "/trap/".
TRAP_PATH = os.environ.get("HONEYPOT_TRAP_PATH", "trap").strip("/") or "trap"

ALLOWED_HOSTS = [h.strip() for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",") if h.strip()]

INSTALLED_APPS = ["trap"]
MIDDLEWARE = ["trap.middleware.NoStoreMiddleware"]
ROOT_URLCONF = "honeypot_site.urls"
WSGI_APPLICATION = "honeypot_site.wsgi.application"
DATABASES = {}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    }
]

USE_TZ = True
TIME_ZONE = "UTC"
LANGUAGE_CODE = "es-ar"
APPEND_SLASH = False

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "WARNING"},
}
