from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (UniqueConstraint("source_id", "snapshot_date", name="uq_listing_snapshot"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[str] = mapped_column(String(80), index=True)
    url: Mapped[str] = mapped_column(String(500), default="")
    brand: Mapped[str] = mapped_column(String(80), index=True)
    model: Mapped[str] = mapped_column(String(120), index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    price_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    snapshot_date: Mapped[str] = mapped_column(String(10), index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
