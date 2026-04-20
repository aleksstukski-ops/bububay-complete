from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from models.database import Product, get_session
from services import scrape_amazon

router = APIRouter(prefix="/api/products", tags=["products"])

class ImportRequest(BaseModel):
    urls: list[str]

class ProductCreate(BaseModel):
    title: Optional[str] = ""
    amazon_url: Optional[str] = ""
    brand: Optional[str] = ""
    description: Optional[str] = ""
    price_original: Optional[float] = 0
    price_set: Optional[float] = 0
    price_type: Optional[str] = "fixed"
    discount_percent: Optional[float] = 0
    category: Optional[str] = ""
    condition: Optional[str] = "wie_neu"
    shipping_type: Optional[str] = "versand"
    shipping_cost: Optional[float] = 4.99
    location_city: Optional[str] = ""
    location_plz: Optional[str] = ""
    account_id: Optional[int] = None
    status: Optional[str] = "pending"

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    amazon_url: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price_original: Optional[float] = None
    price_set: Optional[float] = None
    price_type: Optional[str] = None
    discount_percent: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    shipping_type: Optional[str] = None
    shipping_cost: Optional[float] = None
    location_city: Optional[str] = None
    location_plz: Optional[str] = None
    status: Optional[str] = None
    account_id: Optional[int] = None
    sold_price: Optional[float] = None

class BulkStatusRequest(BaseModel):
    ids: list[int]
    status: str

@router.post("/import")
async def import_products(data: ImportRequest, db: AsyncSession = Depends(get_session)):
    results = {"imported": 0, "skipped": 0, "failed": 0, "details": []}
    for url in data.urls:
        url = url.strip()
        if not url:
            continue
        existing = await db.execute(select(Product).where(Product.amazon_url == url))
        if existing.scalar_one_or_none():
            results["skipped"] += 1
            results["details"].append({"url": url, "status": "skipped"})
            continue
        scraped = await scrape_amazon(url)
        product = Product(
            amazon_url=url,
            title=scraped.get("title", "Unbekannt"),
            brand=scraped.get("brand", ""),
            description=scraped.get("description", ""),
            price_original=scraped.get("price", 0),
            price_set=scraped.get("price", 0),
            images=scraped.get("images", []),
        )
        db.add(product)
        results["imported"] += 1
        results["details"].append({"url": url, "status": "imported", "title": product.title})
        await db.commit()
    return results

@router.post("")
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_session)):
    product = Product(**data.model_dump(exclude_unset=True))
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.get("")
async def list_products(
    status: Optional[str] = None,
    account_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
):
    q = select(Product).order_by(Product.id.desc())
    if status:
        q = q.where(Product.status == status)
    if account_id:
        q = q.where(Product.account_id == account_id)
    if search:
        q = q.where(Product.title.ilike(f"%{search}%"))
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/{pid}")
async def get_product(pid: int, db: AsyncSession = Depends(get_session)):
    p = await db.get(Product, pid)
    if not p:
        raise HTTPException(404, "Not found")
    return p

@router.put("/{pid}")
async def update_product(pid: int, data: ProductUpdate, db: AsyncSession = Depends(get_session)):
    p = await db.get(Product, pid)
    if not p:
        raise HTTPException(404, "Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        if k == "status" and v == "listed":
            p.listed_at = datetime.now(timezone.utc)
        elif k == "status" and v == "sold":
            p.sold_at = datetime.now(timezone.utc)
        setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return p

@router.delete("/{pid}")
async def delete_product(pid: int, db: AsyncSession = Depends(get_session)):
    p = await db.get(Product, pid)
    if not p:
        raise HTTPException(404, "Not found")
    await db.delete(p)
    await db.commit()
    return {"ok": True}

@router.post("/bulk-status")
async def bulk_status(data: BulkStatusRequest, db: AsyncSession = Depends(get_session)):
    updated = 0
    for pid in data.ids:
        p = await db.get(Product, pid)
        if p:
            p.status = data.status
            if data.status == "listed":
                p.listed_at = datetime.now(timezone.utc)
            elif data.status == "sold":
                p.sold_at = datetime.now(timezone.utc)
            updated += 1
    await db.commit()
    return {"updated": updated}
