# MSAR Emergency API — Phase A

FastAPI backend for **real Twilio SMS → automatic mission creation**.

## Run locally

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# edit .env with Twilio credentials
uvicorn app.main:app --reload --port 8000
```

## Ngrok

```bash
ngrok http 8000
```

Set in `.env`:

```
TWILIO_WEBHOOK_BASE_URL=https://YOUR-SUBDOMAIN.ngrok-free.app
TWILIO_VALIDATE_SIGNATURE=true
```

Twilio Console → Phone Number → Messaging webhook (POST):

```
https://YOUR-SUBDOMAIN.ngrok-free.app/api/emergency/sms
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/emergency/sms` | Twilio inbound SMS |
| GET | `/api/missions` | List missions (frontend poll) |
| GET | `/api/missions/{id}` | Mission detail |
| GET | `/health` | Health check |

## Tests

```bash
cd backend
pytest -q
```

## SMS format

```
SOS
PERSONS: 2
LAT: 12.8456
LON: 80.1234
TIME: 2026-08-10T19:30:00Z
MESSAGE: TWO PERSONS FELL OVERBOARD
```
