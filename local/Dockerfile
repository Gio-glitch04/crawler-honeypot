# Herramientas SOLO para pruebas locales: simulador de crawlers y base ASN falsa.
FROM python:3.12-slim
RUN pip install --no-cache-dir "requests>=2.32,<3" "mmdb-writer>=0.2,<1" "netaddr>=1.3,<2"
WORKDIR /tools
COPY simulate.py make_test_asn_db.py ./
