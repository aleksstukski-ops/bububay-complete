from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.database import ProductMaster, get_session

router = APIRouter(prefix="/api/product-masters", tags=["product_masters"])


class ProductMasterCreate(BaseModel):
    sku: Optional[str] = None
    source_type: Optional[str] = ""
    source_url: Optional[str] = ""
    source_reference: Optional[str] = ""

    title: str
    brand: Optional[str] = ""
    description_short: Optional[str] = ""
    description_long: Optional[str] = ""
    category_hint: Optional[str] = ""
    condition: Optional[str] = ""
    condition_notes: Optional[str] = ""

    cost_price: Optional[float] = 0
    target_price: Optional[float] = 0
    min_price: Optional[float] = 0
    max_price: Optional[float] = 0
    currency: Optional[str] = "EUR"

    shipping_mode: Optional[str] = ""
    shipping_cost: Optional[float] = 0
    location_city: Optional[str] = ""
    location_plz: Optional[str] = ""

    quantity_total: Optional[int] = 0
    quantity_reserved: Optional[int] = 0
    quantity_available: Optional[int] = 0

    status: Optional[str] = "draft"

    restricted_product_flag: Optional[bool] = False
    brand_risk_flag: Optional[bool] = False
    manual_review_required: Optional[bool] = False


class ProductMasterUpdate(BaseModel):
    sku: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    source_reference: Optional[str] = None

    title: Optional[str] = None
    brand: Optional[str] = None
    description_short: Optional[str] = None
    description_long: Optional[str] = None
    category_hint: Optional[str] = None
    condition: Optional[str] = None
    condition_notes: Optional[str] = None

    cost_price: Optional[float] = None
    target_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    currency: Optional[str] = None

    shipping_mode: Optional[str] = None
    shipping_cost: Optional[float] = None
    location_city: Optional[str] = None
    location_plz: Optional[str] = None

    quantity_total: Optional[int] = None
    quantity_reserved: Optional[int] = None
    quantity_available: Optional[int] = None

    status: Optional[str] = None

    restricted_product_flag: Optional[bool] = None
    brand_risk_flag: Optional[bool] = None
    manual_review_required: Optional[bool] = None


def serialize_product_master(pm: ProductMaster) -> dict:
    return {
        "id": pm.id,
        "sku": pm.sku,
        "source_type": pm.source_type,
        "source_url": pm.source_url,
        "source_reference": pm.source_reference,
        "title": pm.title,
        "brand": pm.brand,
        "description_short": pm.description_short,
        "description_long": pm.description_long,
        "category_hint": pm.category_hint,
        "condition": pm.condition,
        "condition_notes": pm.condition_notes,
        "cost_price": pm.cost_price,
        "target_price": pm.target_price,
        "min_price": pm.min_price,
        "max_price": pm.max_price,
        "currency": pm.currency,
        "shipping_mode": pm.shipping_mode,
        "shipping_cost": pm.shipping_cost,
        "location_city": pm.location_city,
        "location_plz": pm.location_plz,
        "quantity_total": pm.quantity_total,
        "quantity_reserved": pm.quantity_reserved,
        "quantity_available": pm.quantity_available,
        "status": pm.status,
        "restricted_product_flag": pm.restricted_product_flag,
        "brand_risk_flag": pm.brand_risk_flag,
        "manual_review_required": pm.manual_review_required,
        "created_at": pm.created_at.isoformat() if pm.created_at else None,
        "updated_at": pm.updated_at.isoformat() if pm.updated_at else None,
    }


@router.get("")
async def list_product_masters(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(ProductMaster).order_by(ProductMaster.id.desc()))
    items = result.scalars().all()
    return [serialize_product_master(item) for item in items]


@router.post("")
async def create_product_master(data: ProductMasterCreate, db: AsyncSession = Depends(get_session)):
    if not data.title or not data.title.strip():
        raise HTTPException(400, "Titel ist erforderlich")

    pm = ProductMaster(
        **data.model_dump(exclude_unset=True),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(pm)
    await db.commit()
    await db.refresh(pm)
    return serialize_product_master(pm)


@router.get("/{pm_id}")
async def get_product_master(pm_id: int, db: AsyncSession = Depends(get_session)):
    pm = await db.get(ProductMaster, pm_id)
    if not pm:
        raise HTTPException(404, "Product Master nicht gefunden")
    return serialize_product_master(pm)


@router.put("/{pm_id}")
async def update_product_master(pm_id: int, data: ProductMasterUpdate, db: AsyncSession = Depends(get_session)):
    pm = await db.get(ProductMaster, pm_id)
    if not pm:
        raise HTTPException(404, "Product Master nicht gefunden")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pm, key, value)

    pm.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(pm)
    return serialize_product_master(pm)
