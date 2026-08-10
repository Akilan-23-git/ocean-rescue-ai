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


class SOSRequest(BaseModel):
    deviceId: str = Field(min_length=4, max_length=128)
    latitude: float
    longitude: float
    accuracy: float = Field(ge=0)
    timestamp: datetime
    emergencyType: str = "man_overboard"
    numberOfPeople: int = Field(default=1, ge=1)
    clientEventId: Optional[str] = None


class SOSResponse(BaseModel):
    success: bool
    duplicate: bool = False
    missionId: Optional[str] = None
    status: Optional[str] = None
    message: str
    errors: list[str] = Field(default_factory=list)
    gpsAccuracyMeters: Optional[float] = None
