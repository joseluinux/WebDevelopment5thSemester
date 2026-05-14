from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as import_router
from api.chat_routes import router as chat_router
from config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    debug=settings.DEBUG,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Permite que o frontend Next.js chame o FastAPI diretamente.
# Em produção configure CORS_ORIGINS no .env com as origens reais.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(import_router)
app.include_router(chat_router)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "version": settings.API_VERSION}
