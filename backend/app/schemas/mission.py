from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class MissionTriggerType(str, Enum):
    MANUAL = "MANUAL"
    SMS = "SMS"
    SOS_DEVICE = "SOS_DEVICE"


class MissionStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SIMULATING = "simulating"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ARCHIVED = "archived"
    NEW_EMERGENCY = "new_emergency"
    NEEDS_REVIEW = "needs_review"
    ERROR = "error"


class Coordinates(BaseModel):
    lat: float
    lng: float


class MissionRecord(BaseModel):
    """Shared mission shape compatible with the React Mission model."""

    id: str
    missionId: str
    name: str
    rescueTeamName: str = "SMS Emergency Desk"
    incidentType: str = "man_overboard"
    objectType: str = "missing_person"
    numberOfPeople: int = 1
    lifeJacketStatus: str = "unknown"
    additionalNotes: str = ""
    status: MissionStatus = MissionStatus.NEW_EMERGENCY
    lastKnownPosition: Optional[Coordinates] = None
    incidentDateTime: str
    referencePoints: list[dict[str, Any]] = Field(default_factory=list)
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    notes: list[dict[str, Any]] = Field(default_factory=list)
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    searchHistory: list[str] = Field(default_factory=list)
    outcome: str = "ongoing"
    triggerType: MissionTriggerType = MissionTriggerType.SMS
    source: str = "SMS"
    rawMessage: Optional[str] = None
    messageSid: Optional[str] = None
    locationRequired: bool = False
    validationErrors: list[str] = Field(default_factory=list)
    gpsAccuracy: Optional[float] = None
    deviceId: Optional[str] = None
    createdAt: str
    updatedAt: str
    receivedAt: Optional[str] = None


class MissionListResponse(BaseModel):
    success: bool = True
    data: list[MissionRecord]
