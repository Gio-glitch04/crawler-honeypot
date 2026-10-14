"""Tokens de enlace sin estado.

Cada enlace generado lleva un id opaco de 52 caracteres hex:

    uuid4 (32) | emitido_en, epoch en segundos (8) | profundidad (2) | firma (10)

La firma es HMAC-SHA256(secreto, uuid|ts|profundidad|técnica). La técnica de
ocultamiento no viaja en claro: al recibir el token se prueba la firma contra
cada técnica conocida. Así el id no delata cómo estaba escondido el enlace,
pero el servidor puede recuperarlo, y además detecta ids inventados o
manipulados (técnica "invalid").
"""
import hashlib
import hmac
import time
import uuid
from dataclasses import dataclass

from django.conf import settings

# Técnicas de los enlaces. "public" es el enlace visible a /public/,
# el resto son variantes de enlace a /trap/.
VISIBLE = "visible"            # trampa visible (control: el bot "ve" el enlace)
DISPLAY_NONE_INLINE = "display_none_inline"  # style="display:none" en el atributo
DISPLAY_NONE_CLASS = "display_none_class"    # display:none vía clase CSS aleatoria
OPACITY = "opacity_0"          # opacity:0 vía clase CSS aleatoria
OFFSCREEN = "offscreen"        # posicionado fuera del viewport
PUBLIC = "public"

TRAP_TECHNIQUES = (VISIBLE, DISPLAY_NONE_INLINE, DISPLAY_NONE_CLASS, OPACITY, OFFSCREEN)
ALL_TECHNIQUES = TRAP_TECHNIQUES + (PUBLIC,)

TOKEN_LEN = 52
MAX_DEPTH = 0xFF


@dataclass(frozen=True)
class Token:
    id: str
    technique: str  # una de ALL_TECHNIQUES, o "invalid"
    issued_at: int | None
    depth: int | None


def _sign(uid: str, ts_hex: str, depth_hex: str, technique: str) -> str:
    msg = f"{uid}|{ts_hex}|{depth_hex}|{technique}".encode()
    return hmac.new(settings.TOKEN_SECRET.encode(), msg, hashlib.sha256).hexdigest()[:10]


def issue(technique: str, depth: int = 0) -> str:
    uid = uuid.uuid4().hex
    ts_hex = f"{int(time.time()):08x}"
    depth_hex = f"{min(depth, MAX_DEPTH):02x}"
    return uid + ts_hex + depth_hex + _sign(uid, ts_hex, depth_hex, technique)


def decode(token_id: str) -> Token:
    token_id = token_id.lower()
    if len(token_id) != TOKEN_LEN or any(c not in "0123456789abcdef" for c in token_id):
        return Token(token_id, "invalid", None, None)
    uid, ts_hex, depth_hex, sig = token_id[:32], token_id[32:40], token_id[40:42], token_id[42:]
    for technique in ALL_TECHNIQUES:
        if hmac.compare_digest(sig, _sign(uid, ts_hex, depth_hex, technique)):
            return Token(token_id, technique, int(ts_hex, 16), int(depth_hex, 16))
    return Token(token_id, "invalid", None, None)
