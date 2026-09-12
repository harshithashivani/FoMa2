FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec/array form) so ${PORT}/${RELOAD} get substituted at
# container start. Render injects PORT (default 10000) and requires the
# app to bind to it; locally PORT is unset so this falls back to 8000.
# RELOAD is only set to "true" in docker-compose.yml for local dev - never
# set it in production, --reload adds overhead and isn't meant for it.
CMD sh -c 'if [ "$RELOAD" = "true" ]; then \
      uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --reload; \
    else \
      uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}; \
    fi'