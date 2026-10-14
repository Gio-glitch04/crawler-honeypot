FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY honeypot_analytics ./honeypot_analytics

RUN useradd --system --no-create-home app
USER app

# Por defecto: planificador que corre el batch de enriquecimiento cada 24 h.
CMD ["python", "-m", "honeypot_analytics.scheduler"]
