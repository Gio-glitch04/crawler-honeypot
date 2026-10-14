"""Genera una URL semilla /public/<token> por canal de difusión, para poder
atribuir el tráfico entrante a cada canal (GitHub, Reddit, HN, ...).

    docker compose run --rm honeypot-app python manage.py seed_urls github reddit hn
"""
import os

from django.core.management.base import BaseCommand

from trap import tokens


class Command(BaseCommand):
    help = "Genera URLs semilla atribuibles por canal"

    def add_arguments(self, parser):
        parser.add_argument("channels", nargs="+")

    def handle(self, *args, channels, **opts):
        domain = os.environ.get("HONEYPOT_DOMAIN") or (os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")[0])
        self.stdout.write("channel,url")
        for ch in channels:
            self.stdout.write(f"{ch},https://{domain}/public/{tokens.issue(tokens.PUBLIC, 0)}")
