from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import PlainTextResponse

from app.config import get_settings
from app.schemas.emergency import SOSRequest, SOSResponse
from app.services.mission_service import create_mission_from_sos
from app.services.sms_service import (
    build_twiml_ack,
    process_incoming_sms,
    validate_twilio_signature,
)

router = APIRouter(prefix="/api/emergency", tags=["emergency"])


@router.post("/sms")
async def receive_emergency_sms(request: Request) -> Response:
    """Twilio inbound SMS webhook — validates signature, parses, creates mission."""
    settings = get_settings()
    form_data = await request.form()
    form = {k: str(v) for k, v in form_data.items()}

    if not validate_twilio_signature(request, form, settings):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Twilio signature",
        )

    result = await process_incoming_sms(form)
    twiml = build_twiml_ack(result.missionId, result.success, result.message)
    return PlainTextResponse(content=twiml, media_type="application/xml")


@router.post("/sos", response_model=SOSResponse)
async def receive_sos_device(payload: SOSRequest) -> SOSResponse:
    """Browser SOS device GPS → automatic mission creation."""
    try:
        mission, duplicate = create_mission_from_sos(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return SOSResponse(
        success=True,
        duplicate=duplicate,
        missionId=mission.missionId,
        status=mission.status.value,
        message="Duplicate SOS — existing mission returned" if duplicate else "SOS mission created",
        gpsAccuracyMeters=mission.gpsAccuracy,
    )
