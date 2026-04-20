from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import base64
from datetime import datetime, timezone
from models.database import Account, get_session

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

class AccountCreate(BaseModel):
    name: str
    phone_id: int = 1
    platform: str = "kleinanzeigen"
    email: str = ""
    password: str = ""
    location_city: str = ""
    location_plz: str = ""

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    phone_id: Optional[int] = None
    platform: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None
    password: Optional[str] = None
    location_city: Optional[str] = None
    location_plz: Optional[str] = None

@router.post("")
async def create_account(data: AccountCreate, db: AsyncSession = Depends(get_session)):
    acc = Account(
        name=data.name,
        phone_id=data.phone_id,
        platform=data.platform,
        email=data.email,
        password_encrypted=base64.b64encode(data.password.encode()).decode() if data.password else "",
        location_city=data.location_city,
        location_plz=data.location_plz,
    )
    db.add(acc)
    await db.commit()
    await db.refresh(acc)
    return {k: v for k, v in {
        "id": acc.id, "name": acc.name, "phone_id": acc.phone_id,
        "platform": acc.platform, "is_active": acc.is_active,
        "email": acc.email, "location_city": acc.location_city,
        "location_plz": acc.location_plz, "session_active": acc.session_active,
        "last_login": acc.last_login.isoformat() if acc.last_login else None,
        "created_at": acc.created_at.isoformat() if acc.created_at else None,
    }.items()}

@router.get("")
async def list_accounts(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Account).order_by(Account.id))
    accounts = result.scalars().all()
    return [{k: v for k, v in {
        "id": a.id, "name": a.name, "phone_id": a.phone_id,
        "platform": a.platform, "is_active": a.is_active,
        "email": a.email, "location_city": a.location_city,
        "location_plz": a.location_plz, "session_active": a.session_active,
        "last_login": a.last_login.isoformat() if a.last_login else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }.items()} for a in accounts]

@router.put("/{aid}")
async def update_account(aid: int, data: AccountUpdate, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, aid)
    if not acc:
        raise HTTPException(404, "Account not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        if k == "password":
            acc.password_encrypted = base64.b64encode(v.encode()).decode() if v else ""
        else:
            setattr(acc, k, v)
    await db.commit()
    await db.refresh(acc)
    return {"ok": True}

@router.delete("/{aid}")
async def delete_account(aid: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, aid)
    if not acc:
        raise HTTPException(404, "Account not found")
    await db.delete(acc)
    await db.commit()
    return {"ok": True}

@router.post("/{aid}/login")
async def login_account(aid: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, aid)
    if not acc:
        raise HTTPException(404, "Account not found")
    # TODO: Echter Login via Playwright/Selenium
    # Für jetzt: Session simulieren
    acc.session_active = True
    acc.last_login = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True, "message": f"Login für {acc.name} erfolgreich (simuliert)"}

@router.post("/{aid}/logout")
async def logout_account(aid: int, db: AsyncSession = Depends(get_session)):
    acc = await db.get(Account, aid)
    if not acc:
        raise HTTPException(404, "Account not found")
    acc.session_active = False
    acc.cookie_data = ""
    await db.commit()
    return {"ok": True}
