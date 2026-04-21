from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from models.database import Base
from config import settings
from routers.auth import router as auth_router, init_auth_table
from routers.image_proxy import router as img_proxy_router
import os

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def lifespan(app):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await init_auth_table()
    yield

app = FastAPI(title="BubuBay Kleinanzeigen", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(img_proxy_router)

# Override get_session dependency
async def get_session():
    async with async_session() as session:
        yield session

# Monkey-patch
from models import database
database.get_session = get_session

from routers import accounts, products, listing, analytics, kleinanzeigen, product_masters

from starlette.requests import Request

@app.post("/api/frontend-error")
async def frontend_error(request: Request):
    data = await request.json()
    print("FRONTEND ERROR:", data)
    return {"ok": True}

app.include_router(accounts.router)
app.include_router(products.router)
app.include_router(listing.router)
app.include_router(analytics.router)
app.include_router(kleinanzeigen.router)
app.include_router(product_masters.router)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

STATIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, 'assets')), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, 'index.html'))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
