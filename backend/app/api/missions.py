from fastapi import APIRouter

from app.schemas.mission import MissionListResponse, MissionRecord
from app.services.mission_service import get_mission_store

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("", response_model=MissionListResponse)
def list_missions() -> MissionListResponse:
    missions = get_mission_store().list_missions()
    return MissionListResponse(data=missions)


@router.get("/{mission_id}", response_model=MissionRecord)
def get_mission(mission_id: str) -> MissionRecord:
    for mission in get_mission_store().list_missions():
        if mission.missionId == mission_id or mission.id == mission_id:
            return mission
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Mission not found")
