from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional

from app.schemas.emergency import ParsedEmergency, ParseValidationResult

SUPPORTED_EMERGENCY_TYPES = {
    "SOS": "man_overboard",
    "MAN_OVERBOARD": "man_overboard",
    "OVERBOARD": "man_overboard",
    "DISTRESS": "vessel_distress",
    "MAYDAY": "vessel_distress",
}


def _parse_iso_time(raw: str) -> Optional[datetime]:
    text = raw.strip()
    if not text:
        return None
    try:
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        dt = datetime.fromisoformat(text)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except ValueError:
        return None


def parse_emergency_sms(body: str) -> ParseValidationResult:
    """Parse the MSAR emergency SMS format into a typed result."""
    errors: list[str] = []
    if not body or not body.strip():
        return ParseValidationResult(ok=False, errors=["Empty message body"])

    lines = [line.strip() for line in body.strip().splitlines() if line.strip()]
    if not lines:
        return ParseValidationResult(ok=False, errors=["Empty message body"])

    first = lines[0].upper().replace(" ", "_")
    emergency_key = first.split(":")[0] if ":" in first else first
    if emergency_key not in SUPPORTED_EMERGENCY_TYPES:
        # Allow first line to be a key:value; otherwise treat unknown as SOS if body has PERSONS
        if "PERSONS" in body.upper() or "LAT" in body.upper():
            emergency_key = "SOS"
        else:
            errors.append(f"Unsupported emergency type: {lines[0]}")
            emergency_key = "SOS"

    fields: dict[str, str] = {}
    for line in lines[1:] if emergency_key in SUPPORTED_EMERGENCY_TYPES or lines[0].upper().startswith("SOS") else lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[key.strip().upper()] = value.strip()

    # Also support single-line key extraction via regex fallbacks
    def field(*names: str) -> Optional[str]:
        for name in names:
            if name in fields and fields[name]:
                return fields[name]
            match = re.search(rf"(?im)^{name}\s*:\s*(.+)$", body)
            if match:
                return match.group(1).strip()
        return None

    persons_raw = field("PERSONS", "PEOPLE", "PAX")
    lat_raw = field("LAT", "LATITUDE")
    lon_raw = field("LON", "LNG", "LONGITUDE")
    time_raw = field("TIME", "INCIDENT_TIME", "UTC")
    message = field("MESSAGE", "MSG", "NOTE") or ""

    number_of_people: Optional[int] = None
    if persons_raw is None:
        errors.append("Missing PERSONS")
    else:
        try:
            number_of_people = int(persons_raw)
            if number_of_people <= 0:
                errors.append("PERSONS must be a positive integer")
                number_of_people = None
        except ValueError:
            errors.append("Invalid PERSONS value")

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_required = False

    if lat_raw is None and lon_raw is None:
        location_required = True
    elif lat_raw is None or lon_raw is None:
        errors.append("Incomplete coordinates (both LAT and LON required)")
        location_required = True
    else:
        try:
            latitude = float(lat_raw)
            if not -90 <= latitude <= 90:
                errors.append("Latitude out of range (-90..90)")
                latitude = None
        except ValueError:
            errors.append("Invalid LATITUDE")

        try:
            longitude = float(lon_raw)
            if not -180 <= longitude <= 180:
                errors.append("Longitude out of range (-180..180)")
                longitude = None
        except ValueError:
            errors.append("Invalid LONGITUDE")

        if latitude is None or longitude is None:
            location_required = True

    incident_time: Optional[datetime] = None
    if time_raw is None:
        incident_time = datetime.now(timezone.utc)
    else:
        incident_time = _parse_iso_time(time_raw)
        if incident_time is None:
            errors.append("Invalid TIME (expected ISO-8601 UTC)")

    # Hard-fail validation (reject / needs review): invalid coords/people/time
    hard_errors = [
        e
        for e in errors
        if e.startswith("Invalid")
        or "out of range" in e
        or e.startswith("PERSONS must")
        or e.startswith("Unsupported")
        or e.startswith("Incomplete")
        or e == "Missing PERSONS"
        or e == "Empty message body"
    ]

    # Location missing alone is allowed as NEEDS_REVIEW
    soft_only_missing_location = location_required and not hard_errors and number_of_people is not None and incident_time is not None

    if hard_errors and not soft_only_missing_location:
        # If only location issues from invalid coords, still produce needs_review path
        invalid_coord = any("Latitude" in e or "Longitude" in e or "LATITUDE" in e or "LONGITUDE" in e or "Incomplete" in e for e in errors)
        if invalid_coord and number_of_people is not None and incident_time is not None:
            parsed = ParsedEmergency(
                emergencyType=SUPPORTED_EMERGENCY_TYPES.get(emergency_key, "man_overboard"),
                numberOfPeople=number_of_people,
                latitude=None,
                longitude=None,
                incidentTime=incident_time,
                message=message or "Emergency SMS received",
                hasLocation=False,
            )
            return ParseValidationResult(
                ok=True,
                parsed=parsed,
                errors=errors,
                locationRequired=True,
            )
        return ParseValidationResult(ok=False, errors=errors)

    if number_of_people is None or incident_time is None:
        return ParseValidationResult(ok=False, errors=errors or ["Validation failed"])

    parsed = ParsedEmergency(
        emergencyType=SUPPORTED_EMERGENCY_TYPES.get(emergency_key, "man_overboard"),
        numberOfPeople=number_of_people,
        latitude=latitude,
        longitude=longitude,
        incidentTime=incident_time,
        message=message or "Emergency SMS received",
        hasLocation=latitude is not None and longitude is not None,
    )
    return ParseValidationResult(
        ok=True,
        parsed=parsed,
        errors=errors,
        locationRequired=location_required or not parsed.hasLocation,
    )
