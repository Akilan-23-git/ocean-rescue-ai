from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.emergency import router as emergency_router
from app.api.missions import router as missions_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="MSAR Emergency API",
    description="SMS emergency webhook and mission sync for Maritime Search & Rescue",
    version="1.0.0-phase-a",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emergency_router)
app.include_router(missions_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "phase": "A", "service": "msar-emergency-api"}
