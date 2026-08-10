import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Isolate data before app imports store
TEST_DATA = Path(__file__).parent / "_testdata"
TEST_DATA.mkdir(exist_ok=True)
os.environ["MSAR_DATA_DIR"] = str(TEST_DATA)
os.environ["TWILIO_VALIDATE_SIGNATURE"] = "false"
os.environ["TWILIO_AUTH_TOKEN"] = "test_token"

from app.main import app  # noqa: E402
from app.services.sms_parser import parse_emergency_sms  # noqa: E402
from app.services.mission_service import MissionStore, get_mission_store  # noqa: E402


@pytest.fixture(autouse=True)
def clean_store():
    store_path = TEST_DATA / "missions.json"
    if store_path.exists():
        store_path.unlink()
    # reset singleton file
    get_mission_store()._path = store_path
    get_mission_store()._write({"missions": [], "sequence": 0, "messageSids": {}})
    yield


client = TestClient(app)

VALID_BODY = """SOS
PERSONS: 2
LAT: 12.8456
LON: 80.1234
TIME: 2026-08-10T19:30:00Z
MESSAGE: TWO PERSONS FELL OVERBOARD"""


def test_parse_valid_sms():
    result = parse_emergency_sms(VALID_BODY)
    assert result.ok
    assert result.parsed is not None
    assert result.parsed.numberOfPeople == 2
    assert result.parsed.latitude == 12.8456
    assert result.parsed.longitude == 80.1234
    assert result.parsed.hasLocation


def test_parse_missing_location():
    body = """SOS
PERSONS: 2
TIME: 2026-08-10T19:30:00Z
MESSAGE: HELP"""
    result = parse_emergency_sms(body)
    assert result.ok
    assert result.locationRequired
    assert result.parsed is not None
    assert result.parsed.latitude is None


def test_parse_invalid_latitude():
    body = """SOS
PERSONS: 2
LAT: 120.0
LON: 80.1234
TIME: 2026-08-10T19:30:00Z
MESSAGE: HELP"""
    result = parse_emergency_sms(body)
    assert result.ok  # needs review path
    assert result.locationRequired


def test_parse_invalid_persons():
    body = """SOS
PERSONS: 0
LAT: 12.8456
LON: 80.1234
TIME: 2026-08-10T19:30:00Z
MESSAGE: HELP"""
    result = parse_emergency_sms(body)
    assert not result.ok


def test_parse_invalid_time():
    body = """SOS
PERSONS: 2
LAT: 12.8456
LON: 80.1234
TIME: not-a-date
MESSAGE: HELP"""
    result = parse_emergency_sms(body)
    assert not result.ok


def test_parse_empty():
    result = parse_emergency_sms("")
    assert not result.ok


def test_webhook_creates_mission():
    response = client.post(
        "/api/emergency/sms",
        data={
            "MessageSid": "SM_TEST_001",
            "From": "+15551234567",
            "To": "+15557654321",
            "Body": VALID_BODY,
        },
    )
    assert response.status_code == 200
    assert "MSAR-" in response.text
    missions = client.get("/api/missions").json()["data"]
    assert len(missions) == 1
    assert missions[0]["triggerType"] == "SMS"
    assert missions[0]["status"] == "new_emergency"
    assert missions[0]["lastKnownPosition"]["lat"] == 12.8456


def test_duplicate_messagesid():
    payload = {
        "MessageSid": "SM_DUP_001",
        "From": "+15551111111",
        "To": "+15552222222",
        "Body": VALID_BODY,
    }
    r1 = client.post("/api/emergency/sms", data=payload)
    r2 = client.post("/api/emergency/sms", data=payload)
    assert r1.status_code == 200
    assert r2.status_code == 200
    missions = client.get("/api/missions").json()["data"]
    assert len(missions) == 1


def test_missing_location_needs_review():
    body = """SOS
PERSONS: 3
TIME: 2026-08-10T19:30:00Z
MESSAGE: LOCATION UNKNOWN"""
    response = client.post(
        "/api/emergency/sms",
        data={
            "MessageSid": "SM_NOLOC_001",
            "From": "STATION-01",
            "To": "+15550001111",
            "Body": body,
        },
    )
    assert response.status_code == 200
    mission = client.get("/api/missions").json()["data"][0]
    assert mission["status"] == "needs_review"
    assert mission["locationRequired"] is True
    assert mission["lastKnownPosition"] is None


def test_invalid_signature_rejected(monkeypatch):
    monkeypatch.setenv("TWILIO_VALIDATE_SIGNATURE", "true")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "secret")
    from app.config import get_settings

    get_settings.cache_clear()
    # Rebuild client with new settings — use direct validation
    from app.services.sms_service import validate_twilio_signature
    from app.config import Settings
    from unittest.mock import MagicMock

    req = MagicMock()
    req.headers = {}
    settings = Settings(twilio_validate_signature=True, twilio_auth_token="secret")
    assert validate_twilio_signature(req, {}, settings) is False
    get_settings.cache_clear()


def test_health():
    assert client.get("/health").json()["status"] == "ok"
