from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from models.database import Product, Account, AccountAssignment, ListingSettings, get_session

router = APIRouter(prefix="/api/listing", tags=["listing"])

class SettingsUpdate(BaseModel):
    default_discount_percent: Optional[float] = None
    default_price_type: Optional[str] = None
    default_category: Optional[str] = None
    standard_text: Optional[str] = None
    keywords: Optional[str] = None

class AssignRequest(BaseModel):
    product_id: int
    account_id: int

@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(ListingSettings).order_by(ListingSettings.id))
    s = result.scalars().first()
    if not s:
        s = ListingSettings()
        db.add(s)
        await db.commit()
        await db.refresh(s)
    return s

@router.put("/settings")
async def update_settings(data: SettingsUpdate, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(ListingSettings).order_by(ListingSettings.id))
    s = result.scalars().first()
    if not s:
        s = ListingSettings()
        db.add(s)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    await db.commit()
    await db.refresh(s)
    return s

@router.post("/assign")
async def assign_product(data: AssignRequest, db: AsyncSession = Depends(get_session)):
    p = await db.get(Product, data.product_id)
    a = await db.get(Account, data.account_id)
    if not p or not a:
        raise HTTPException(404, "Product or Account not found")
    p.account_id = data.account_id
    assignment = AccountAssignment(product_id=data.product_id, account_id=data.account_id)
    db.add(assignment)
    await db.commit()
    return {"ok": True}

@router.post("/auto-distribute")
async def auto_distribute(db: AsyncSession = Depends(get_session)):
    accounts_result = await db.execute(select(Account).where(Account.is_active == True))
    accounts = accounts_result.scalars().all()
    if not accounts:
        raise HTTPException(400, "No active accounts")
    
    pending = await db.execute(select(Product).where(Product.status == "pending", Product.account_id == None))
    products = pending.scalars().all()
    
    per_account = 30
    distributed = 0
    for i, p in enumerate(products):
        acc = accounts[i % len(accounts)]
        p.account_id = acc.id
        p.status = "listed"
        distributed += 1
    
    await db.commit()
    return {"distributed": distributed}
