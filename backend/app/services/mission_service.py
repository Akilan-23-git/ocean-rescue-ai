from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import uuid4

from app.config import get_settings
from app.schemas.emergency import EmergencySMSEvent, ParsedEmergency, ParseValidationResult
from app.schemas.mission import Coordinates, MissionRecord, MissionStatus, MissionTriggerType


class MissionStore:
    def __init__(self, data_dir: Optional[Path] = None) -> None:
        settings = get_settings()
        self._dir = data_dir or Path(settings.msar_data_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._path = self._dir / "missions.json"
        self._lock = threading.Lock()
        if not self._path.exists():
            self._write({"missions": [], "sequence": 0, "messageSids": {}})

    def _read(self) -> dict:
        with self._path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, payload: dict) -> None:
        with self._path.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, default=str)

    def list_missions(self) -> list[MissionRecord]:
        with self._lock:
            data = self._read()
            return [MissionRecord.model_validate(m) for m in data.get("missions", [])]

    def get_by_message_sid(self, message_sid: str) -> Optional[MissionRecord]:
        with self._lock:
            data = self._read()
            mid = data.get("messageSids", {}).get(message_sid)
            if not mid:
                return None
            for m in data.get("missions", []):
                if m.get("missionId") == mid or m.get("id") == mid:
                    return MissionRecord.model_validate(m)
            return None

    def next_mission_id(self) -> str:
        with self._lock:
            data = self._read()
            year = datetime.now(timezone.utc).year
            seq = int(data.get("sequence", 0)) + 1
            data["sequence"] = seq
            self._write(data)
            return f"MSAR-{year}-{seq:04d}"

    def save_mission(self, mission: MissionRecord, message_sid: Optional[str] = None) -> MissionRecord:
        with self._lock:
            data = self._read()
            missions = data.get("missions", [])
            missions.insert(0, mission.model_dump(mode="json"))
            data["missions"] = missions
            if message_sid:
                data.setdefault("messageSids", {})[message_sid] = mission.missionId
            self._write(data)
            return mission


_store = MissionStore()


def get_mission_store() -> MissionStore:
    return _store


def create_mission_from_sms(
    event: EmergencySMSEvent,
    validation: ParseValidationResult,
) -> MissionRecord:
    """Create a mission from a validated SMS parse result (or needs-review shell)."""
    store = get_mission_store()
    existing = store.get_by_message_sid(event.messageSid)
    if existing:
        return existing

    mission_id = store.next_mission_id()
    now = datetime.now(timezone.utc).isoformat()
    parsed = validation.parsed

    if not validation.ok or parsed is None:
        # Store an error / needs-review record without inventing coordinates
        mission = MissionRecord(
            id=str(uuid4()),
            missionId=mission_id,
            name=f"SMS Emergency {mission_id}",
            status=MissionStatus.NEEDS_REVIEW,
            incidentType="search_rescue",
            objectType="missing_person",
            numberOfPeople=1,
            lastKnownPosition=None,
            incidentDateTime=event.receivedAt.astimezone(timezone.utc).isoformat(),
            additionalNotes="Emergency received, but validation failed. LOCATION_REQUIRED or data invalid.",
            triggerType=MissionTriggerType.SMS,
            source=event.sender,
            rawMessage=event.body,
            messageSid=event.messageSid,
            locationRequired=True,
            validationErrors=validation.errors,
            createdAt=now,
            updatedAt=now,
            receivedAt=event.receivedAt.astimezone(timezone.utc).isoformat(),
            timeline=[
                {
                    "id": str(uuid4()),
                    "type": "created",
                    "title": "SMS emergency received — needs review",
                    "description": "; ".join(validation.errors) or "Validation failed",
                    "timestamp": now,
                    "actor": "SMS Gateway",
                }
            ],
        )
        return store.save_mission(mission, event.messageSid)

    has_location = parsed.hasLocation and parsed.latitude is not None and parsed.longitude is not None
    status = MissionStatus.NEW_EMERGENCY if has_location else MissionStatus.NEEDS_REVIEW

    notes = parsed.message
    if validation.locationRequired or not has_location:
        notes = f"{parsed.message}\n\nLOCATION_REQUIRED: Emergency received, but location is missing."

    position = (
        Coordinates(lat=parsed.latitude, lng=parsed.longitude)
        if has_location and parsed.latitude is not None and parsed.longitude is not None
        else None
    )

    mission = MissionRecord(
        id=str(uuid4()),
        missionId=mission_id,
        name=f"SMS Emergency — {parsed.emergencyType.replace('_', ' ').title()}",
        rescueTeamName="SMS Emergency Desk",
        incidentType=parsed.emergencyType,
        objectType="missing_person",
        numberOfPeople=parsed.numberOfPeople,
        lastKnownPosition=position,
        incidentDateTime=parsed.incidentTime.astimezone(timezone.utc).isoformat(),
        additionalNotes=notes,
        status=status,
        triggerType=MissionTriggerType.SMS,
        source=event.sender,
        rawMessage=event.body,
        messageSid=event.messageSid,
        locationRequired=not has_location,
        validationErrors=validation.errors,
        createdAt=now,
        updatedAt=now,
        receivedAt=event.receivedAt.astimezone(timezone.utc).isoformat(),
        timeline=[
            {
                "id": str(uuid4()),
                "type": "created",
                "title": "Mission auto-created from SMS",
                "description": f"From {event.sender}",
                "timestamp": now,
                "actor": "SMS Gateway",
            }
        ],
    )
    return store.save_mission(mission, event.messageSid)
