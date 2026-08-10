from datetime import datetime, timezone

from fastapi import Request
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from app.config import Settings
from app.schemas.emergency import EmergencySMSEvent, SmsProcessResult
from app.services.mission_service import create_mission_from_sms, get_mission_store
from app.services.sms_parser import parse_emergency_sms


def validate_twilio_signature(request: Request, form: dict[str, str], settings: Settings) -> bool:
    """Validate X-Twilio-Signature. Returns True when valid or when validation disabled."""
    if not settings.twilio_validate_signature:
        return True
    if not settings.twilio_auth_token:
        return False

    signature = request.headers.get("X-Twilio-Signature", "")
    if not signature:
        return False

    base = settings.twilio_webhook_base_url.rstrip("/")
    url = f"{base}/api/emergency/sms"
    validator = RequestValidator(settings.twilio_auth_token)
    return validator.validate(url, form, signature)


def build_twiml_ack(mission_id: str | None, success: bool, message: str) -> str:
    resp = MessagingResponse()
    if success and mission_id:
        resp.message(f"MSAR received your emergency alert. Mission {mission_id} created.")
    elif success:
        resp.message("MSAR received your emergency alert.")
    else:
        resp.message("MSAR could not process this alert. Operators have been notified for review.")
    return str(resp)


async def process_incoming_sms(form: dict[str, str]) -> SmsProcessResult:
    message_sid = form.get("MessageSid") or form.get("SmsSid") or ""
    sender = form.get("From") or "UNKNOWN"
    recipient = form.get("To") or ""
    body = form.get("Body") or ""

    if not message_sid:
        return SmsProcessResult(success=False, message="Missing MessageSid", errors=["Missing MessageSid"])

    store = get_mission_store()
    existing = store.get_by_message_sid(message_sid)
    if existing:
        return SmsProcessResult(
            success=True,
            duplicate=True,
            missionId=existing.missionId,
            status=existing.status.value,
            message="Duplicate MessageSid — existing mission returned",
        )

    event = EmergencySMSEvent(
        messageSid=message_sid,
        sender=sender,
        recipient=recipient,
        body=body,
        receivedAt=datetime.now(timezone.utc),
        source="SMS",
    )

    validation = parse_emergency_sms(body)
    mission = create_mission_from_sms(event, validation)

    return SmsProcessResult(
        success=True,
        duplicate=False,
        missionId=mission.missionId,
        status=mission.status.value,
        message="Mission created" if validation.ok else "Mission created for review",
        errors=validation.errors,
    )
