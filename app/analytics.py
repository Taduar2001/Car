from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session
from .models import Listing


def top_brands(db: Session, limit=15):
    q = (select(Listing.brand, func.count(func.distinct(Listing.source_id)).label("count"))
         .where(Listing.active.is_(True)).group_by(Listing.brand).order_by(desc("count")).limit(limit))
    return [{"name": n, "count": c} for n, c in db.execute(q)]


def top_models(db: Session, limit=20):
    label = (Listing.brand + " " + Listing.model)
    q = (select(label.label("name"), func.count(func.distinct(Listing.source_id)).label("count"))
         .where(Listing.active.is_(True)).group_by(Listing.brand, Listing.model)
         .order_by(desc("count")).limit(limit))
    return [{"name": n, "count": c} for n, c in db.execute(q)]


def top_years(db: Session, limit=20):
    q = (select(Listing.year, func.count(func.distinct(Listing.source_id)).label("count"))
         .where(Listing.active.is_(True)).group_by(Listing.year).order_by(desc("count")).limit(limit))
    return [{"name": str(n), "count": c} for n, c in db.execute(q)]


def summary(db: Session):
    total = db.scalar(select(func.count(func.distinct(Listing.source_id))).where(Listing.active.is_(True))) or 0
    avg_price = db.scalar(select(func.avg(Listing.price_usd)).where(Listing.active.is_(True)))
    return {"active_listings": total, "avg_price_usd": round(avg_price or 0, 2)}
