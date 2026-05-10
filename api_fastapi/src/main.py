from fastapi import FastAPI

from api.routes import router as import_router
from config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    debug=settings.DEBUG,
)

app.include_router(import_router)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "version": settings.API_VERSION}
