from datetime import date, datetime
import pandas as pd
from sqlalchemy.orm import Session
from .models import Listing

REQUIRED = {"source_id", "brand", "model", "year"}

def import_csv(path: str, db: Session) -> dict:
    df = pd.read_csv(path)
    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"Нет обязательных колонок: {', '.join(sorted(missing))}")
    snap = date.today().isoformat()
    added = 0
    for row in df.fillna("").to_dict("records"):
        exists = db.query(Listing).filter_by(source_id=str(row["source_id"]), snapshot_date=snap).first()
        if exists:
            continue
        db.add(Listing(
            source_id=str(row["source_id"]), url=str(row.get("url", "")),
            brand=str(row["brand"]).strip(), model=str(row["model"]).strip(),
            year=int(row["year"]), price_usd=float(row["price_usd"]) if row.get("price_usd") != "" else None,
            city=str(row.get("city", "")) or None, snapshot_date=snap,
            first_seen=datetime.utcnow(), active=True,
        ))
        added += 1
    db.commit()
    return {"added": added, "rows": len(df)}
