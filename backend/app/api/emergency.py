from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import PlainTextResponse

from app.config import get_settings
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
