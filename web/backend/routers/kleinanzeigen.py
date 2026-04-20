from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import Account, get_session
from services.kleinanzeigen_bot import bot
from pydantic import BaseModel
from typing import Optional
import asyncio
import sys
import os

# Cache import
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from cache import get as cache_get, set as cache_set, init_db

# Init cache DB
init_db()

router = APIRouter(prefix="/api/kleinanzeigen", tags=["kleinanzeigen"])


@router.post("/login/start/{account_id}")
async def login_start(account_id: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.open_login_page(account_id)


@router.post("/login/complete/{account_id}")
async def login_complete(account_id: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    result = await bot.save_session(account_id)
    if result["success"]:
        acc.session_active = True
        from datetime import datetime, timezone
        acc.last_login = datetime.now(timezone.utc)
        await db.commit()
    return result


@router.get("/session/check/{account_id}")
async def session_check(account_id: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    result = await bot.check_session(account_id)
    acc.session_active = result.get("valid", False)
    await db.commit()
    return result


# ── FIX 4: SQLite Cache + Background Refresh ──
@router.get("/listings/{account_id}")
async def get_listings(account_id: int, force_refresh: bool = Query(False), db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")

    cache_key = f"listings_{account_id}"

    if not force_refresh:
        cached = cache_get(cache_key, max_age=120)  # 2 Min
        if cached:
            # Background refresh
            asyncio.create_task(_refresh_listings_bg(account_id))
            return {"listings": cached["listings"], "stats": cached["stats"], "account": cached["account"], "stale": True}

    result = await bot.get_listings(account_id)
    if result.get("listings"):
        cache_set(cache_key, result)
    return {**result, "stale": False}


async def _refresh_listings_bg(account_id: int):
    try:
        result = await bot.get_listings(account_id)
        if result.get("listings"):
            cache_set(f"listings_{account_id}", result)
    except Exception:
        pass


@router.get("/messages/{account_id}")
async def get_messages(account_id: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.get_conversations(account_id)


# ── FIX 6: ID statt Index ──
@router.get("/messages/{account_id}/{conv_id}")
async def get_conversation(account_id: int, conv_id: str, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.get_conversation(account_id, conv_id)


class MessageData(BaseModel):
    message: str


@router.post("/messages/{account_id}/{conv_id}")
async def send_message(account_id: int, conv_id: str, data: MessageData, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.send_message(account_id, conv_id, data.message)


class ListingData(BaseModel):
    title: str
    description: str = ""
    price: float = 0
    city: str = ""
    plz: str = ""
    category: str = ""


@router.post("/listing/prepare/{account_id}")
async def prepare_listing(account_id: int, data: ListingData, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.create_listing(account_id, data.model_dump())


# ── FIX 6: ID statt Index ──
@router.get("/listing/{account_id}/{listing_id}")
async def get_listing_detail(account_id: int, listing_id: str, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    return await bot.get_listing_detail(account_id, listing_id)


class UpdateListingData(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


@router.put("/listing/{account_id}/{listing_id}")
async def update_listing(account_id: int, listing_id: str, data: UpdateListingData, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "Konto nicht gefunden")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    return await bot.update_listing(account_id, listing_id, update_data)
