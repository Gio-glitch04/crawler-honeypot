"""Texto señuelo pseudoaleatorio y determinista por token.

Simula un catálogo de datasets abiertos (coherente con las semillas en
GitHub/foros de datasets descritas en experiment.md).
"""
import random

TOPICS = [
    "rendimiento de cultivos", "precipitaciones mensuales", "precios mayoristas",
    "humedad de suelo", "índices NDVI", "transporte de granos", "consumo eléctrico",
    "calidad del agua", "temperaturas máximas", "censo ganadero", "exportaciones",
    "superficie sembrada", "costos logísticos", "sensores IoT", "imágenes satelitales",
]
REGIONS = [
    "Córdoba", "Santa Fe", "Buenos Aires", "Entre Ríos", "La Pampa", "Mendoza",
    "Salta", "Tucumán", "Chaco", "Neuquén", "Río Negro", "Misiones",
]
FORMATS = ["CSV", "Parquet", "JSON", "GeoJSON", "XLSX", "NetCDF"]
SENTENCES = [
    "El conjunto de datos fue consolidado a partir de {n} registros de campo.",
    "Las series cubren el período {y0}-{y1} con frecuencia {freq}.",
    "Los valores faltantes se imputaron mediante interpolación lineal por región.",
    "Se incluyen metadatos de procedencia y licencia CC BY 4.0.",
    "La última revisión corrigió {k} inconsistencias detectadas en la versión anterior.",
    "Cada archivo incluye un diccionario de variables y unidades de medida.",
    "Los identificadores de estación siguen la nomenclatura del organismo de origen.",
    "Las coordenadas se expresan en EPSG:4326 con precisión de cinco decimales.",
    "El volumen total comprimido es de aproximadamente {mb} MB.",
    "Se recomienda citar el dataset usando el DOI indicado en la ficha técnica.",
]
FREQS = ["diaria", "semanal", "mensual", "trimestral", "anual"]


def dataset(seed: str) -> dict:
    rng = random.Random(seed)
    y0 = rng.randint(1995, 2018)
    topic = rng.choice(TOPICS)
    region = rng.choice(REGIONS)
    paragraphs = []
    for _ in range(rng.randint(2, 4)):
        sents = rng.sample(SENTENCES, k=rng.randint(3, 5))
        paragraphs.append(" ".join(
            s.format(n=rng.randint(1_000, 900_000), y0=y0, y1=rng.randint(y0 + 1, 2026),
                     freq=rng.choice(FREQS), k=rng.randint(2, 400), mb=rng.randint(3, 4_000))
            for s in sents
        ))
    return {
        "title": f"Dataset de {topic} — {region}",
        "summary": f"Series históricas de {topic} en {region}, formato {rng.choice(FORMATS)}.",
        "paragraphs": paragraphs,
        "rows": [
            {"year": y, "value": round(rng.uniform(10, 1000), 2)}
            for y in range(y0, y0 + rng.randint(4, 9))
        ],
    }


def link_label(seed: str) -> str:
    rng = random.Random(seed)
    return f"{rng.choice(TOPICS).capitalize()} ({rng.choice(REGIONS)})"
