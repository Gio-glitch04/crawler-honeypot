"""Enriquecimiento (ASN, familia de bot) y clasificación de violaciones
según experiment.md §4."""
import pandas as pd

from . import bots
from .asn import AsnLookup

HIDDEN_TECHNIQUES = {"display_none_inline", "display_none_class", "opacity_0", "offscreen"}
KNOWN_CATEGORIES = {"ai", "search", "seo", "scanner", "tool"}


def enrich(df: pd.DataFrame, asn: AsnLookup) -> pd.DataFrame:
    df = df.copy()
    looked = df["remote_ip"].map(asn.lookup)
    df["asn"] = looked.map(lambda t: t[0]).astype("Int64")
    df["asn_org"] = looked.map(lambda t: t[1] or "")
    fam = df["http_user_agent"].map(bots.classify)
    df["bot_family"] = fam.map(lambda t: t[0])
    df["bot_category"] = fam.map(lambda t: t[1])
    df["ua_verification"] = [
        bots.verify(f, None if pd.isna(a) else int(a)) for f, a in zip(df["bot_family"], df["asn"])
    ]
    # Actor: unidad de análisis. Para bots conocidos, familia + ASN (los bots
    # rotan IPs dentro de su red); para el resto, UA exacto + ASN.
    asn_str = df["asn"].astype("string").fillna("?")
    known = df["bot_category"].isin(KNOWN_CATEGORIES)
    df["actor"] = (df["bot_family"].where(known, df["http_user_agent"]) + "|AS" + asn_str)
    return df


def classify(df: pd.DataFrame) -> pd.DataFrame:
    """Agrega a cada fila de /trap/:
      robots_before_ip / robots_before_actor: si hubo GET /robots.txt previo
      violation_level: 1 (leyó robots.txt y aun así entró) o 2 (nunca lo leyó)
      hidden_link: el enlace seguido estaba oculto por CSS (Nivel 3)
      link_age_s: segundos entre que se generó el enlace y que se siguió
    `df` debe incluir las descargas de robots.txt del período de referencia."""
    df = df.copy()
    robots = df[df["route"] == "robots"]
    first_ip = robots.groupby("remote_ip")["timestamp"].min()
    first_actor = robots.groupby("actor")["timestamp"].min()

    is_trap = df["route"] == "trap"
    ts = df["timestamp"]
    before_ip = df["remote_ip"].map(first_ip) < ts
    before_actor = df["actor"].map(first_actor) < ts
    df["robots_before_ip"] = before_ip.fillna(False) & is_trap
    df["robots_before_actor"] = before_actor.fillna(False) & is_trap

    df["violation_level"] = pd.Series(pd.NA, index=df.index, dtype="Int64")
    df.loc[is_trap, "violation_level"] = 2
    df.loc[is_trap & (df["robots_before_ip"] | df["robots_before_actor"]), "violation_level"] = 1
    df["hidden_link"] = is_trap & df["link_technique"].isin(HIDDEN_TECHNIQUES)
    df["violation"] = "none"
    lvl = df.loc[is_trap, "violation_level"].astype(str)
    df.loc[is_trap, "violation"] = lvl + df.loc[is_trap, "hidden_link"].map({True: "+3", False: ""})

    issued = pd.to_numeric(df["link_issued"], errors="coerce")
    df["link_age_s"] = (ts.astype("int64") // 10**9 - issued).where(issued.notna())
    return df
