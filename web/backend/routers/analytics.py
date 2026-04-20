from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.database import Product, SellerShare, Account, get_session

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/revenue")
async def revenue(db: AsyncSession = Depends(get_session)):
    # Revenue per account
    result = await db.execute(
        select(Account.name, func.sum(Product.sold_price), func.count(Product.id))
        .join(Product, Product.account_id == Account.id)
        .where(Product.status == "sold")
        .group_by(Account.id)
    )
    return [{"account": row[0], "revenue": row[1] or 0, "sold": row[2]} for row in result.all()]

@router.get("/stats")
async def stats(db: AsyncSession = Depends(get_session)):
    total = await db.execute(select(func.count(Product.id)))
    pending = await db.execute(select(func.count(Product.id)).where(Product.status == "pending"))
    listed = await db.execute(select(func.count(Product.id)).where(Product.status == "listed"))
    sold = await db.execute(select(func.count(Product.id)).where(Product.status == "sold"))
    revenue = await db.execute(select(func.sum(Product.sold_price)).where(Product.status == "sold"))
    return {
        "total": total.scalar() or 0,
        "pending": pending.scalar() or 0,
        "listed": listed.scalar() or 0,
        "sold": sold.scalar() or 0,
        "total_revenue": float(revenue.scalar() or 0),
    }
