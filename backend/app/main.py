from fastapi import FastAPI

from app.api.routes import ai, health, incidents, ingest, timeline
from app.core.config import settings
from app.db.session import init_db


app = FastAPI(title=settings.app_name, debug=settings.debug)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(incidents.router, prefix=settings.api_prefix)
app.include_router(ingest.router, prefix=settings.api_prefix)
app.include_router(timeline.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)

