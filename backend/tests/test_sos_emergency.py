import os
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DATA = Path(__file__).parent / "_testdata_sos"
TEST_DATA.mkdir(exist_ok=True)
os.environ["MSAR_DATA_DIR"] = str(TEST_DATA)
os.environ["TWILIO_VALIDATE_SIGNATURE"] = "false"
os.environ["TWILIO_AUTH_TOKEN"] = "test_token"

from app.main import app  # noqa: E402
from app.services.mission_service import get_mission_store  # noqa: E402


@pytest.fixture(autouse=True)
def clean_store():
    store_path = TEST_DATA / "missions.json"
    if store_path.exists():
        store_path.unlink()
    get_mission_store()._path = store_path
    get_mission_store()._write({"missions": [], "sequence": 0, "messageSids": {}})
    yield


client = TestClient(app)


def _sos_payload(**overrides):
    base = {
        "deviceId": "sos-device-test-001",
        "latitude": 12.845612,
        "longitude": 80.123421,
        "accuracy": 8.0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "emergencyType": "man_overboard",
        "numberOfPeople": 1,
        "clientEventId": "sos-evt-unique-001",
    }
    base.update(overrides)
    return base


def test_sos_creates_mission():
    response = client.post("/api/emergency/sos", json=_sos_payload())
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["duplicate"] is False
    assert body["missionId"].startswith("MSAR-")
    assert body["gpsAccuracyMeters"] == 8.0

    missions = client.get("/api/missions").json()["data"]
    assert len(missions) == 1
    m = missions[0]
    assert m["triggerType"] == "SOS_DEVICE"
    assert m["source"] == "SOS_DEVICE"
    assert m["status"] == "new_emergency"
    assert m["objectType"] == "missing_person"
    assert m["lastKnownPosition"]["lat"] == 12.845612
    assert m["lastKnownPosition"]["lng"] == 80.123421
    assert m["gpsAccuracy"] == 8.0
    assert m["deviceId"] == "sos-device-test-001"


def test_sos_duplicate_client_event():
    payload = _sos_payload(clientEventId="sos-dup-001")
    r1 = client.post("/api/emergency/sos", json=payload)
    r2 = client.post("/api/emergency/sos", json=payload)
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r2.json()["duplicate"] is True
    assert r1.json()["missionId"] == r2.json()["missionId"]
    assert len(client.get("/api/missions").json()["data"]) == 1


def test_sos_invalid_latitude():
    response = client.post("/api/emergency/sos", json=_sos_payload(latitude=120.0, clientEventId="bad-lat"))
    assert response.status_code == 422


def test_sos_invalid_longitude():
    response = client.post("/api/emergency/sos", json=_sos_payload(longitude=200.0, clientEventId="bad-lon"))
    assert response.status_code == 422


def test_sos_negative_accuracy_rejected_by_schema():
    response = client.post(
        "/api/emergency/sos",
        json=_sos_payload(accuracy=-1, clientEventId="bad-acc"),
    )
    assert response.status_code == 422


def test_sos_and_sms_coexist():
    sos = client.post("/api/emergency/sos", json=_sos_payload(clientEventId="coexist-sos"))
    assert sos.status_code == 200
    sms = client.post(
        "/api/emergency/sms",
        data={
            "MessageSid": "SM_COEXIST_001",
            "From": "+15551234567",
            "To": "+15557654321",
            "Body": """SOS
PERSONS: 2
LAT: 13.1
LON: 80.2
TIME: 2026-08-10T19:30:00Z
MESSAGE: TEST""",
        },
    )
    assert sms.status_code == 200
    missions = client.get("/api/missions").json()["data"]
    triggers = {m["triggerType"] for m in missions}
    assert "SOS_DEVICE" in triggers
    assert "SMS" in triggers


def test_health_phase_b():
    health = client.get("/health").json()
    assert health["status"] == "ok"
    assert health["phase"] == "B"
