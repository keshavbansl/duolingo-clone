from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .database import engine, init_db

from .routers.home import router as home_router
from .routers.lessons import router as lessons_router

app = FastAPI(
    title="Duolingo Clone API",
    description="Backend API for the Duolingo-inspired language learning application.",
    version="1.0.0",
)


app.include_router(home_router, prefix="/api")
app.include_router(lessons_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://duolingo-clone-alone-4bf2.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/")
def root():
    return {
        "message": "Duolingo Clone API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "service": "duolingo-clone-api",
            "database": "connected",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "service": "duolingo-clone-api",
            "database": "disconnected",
        }