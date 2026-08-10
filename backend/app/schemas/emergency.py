from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EmergencySMSEvent(BaseModel):
    messageSid: str
    sender: str
    recipient: str
    body: str
    receivedAt: datetime
    source: str = "SMS"


class ParsedEmergency(BaseModel):
    emergencyType: str
    numberOfPeople: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incidentTime: datetime
    message: str
    hasLocation: bool = False


class ParseValidationResult(BaseModel):
    ok: bool
    parsed: Optional[ParsedEmergency] = None
    errors: list[str] = Field(default_factory=list)
    locationRequired: bool = False


class SmsProcessResult(BaseModel):
    success: bool
    duplicate: bool = False
    missionId: Optional[str] = None
    status: Optional[str] = None
    message: str
    errors: list[str] = Field(default_factory=list)
