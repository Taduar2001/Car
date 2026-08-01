from pathlib import Path
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .analytics import top_brands, top_models, top_years, summary
from .importer import import_csv

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AV.BY Analytics")
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/analytics")
def analytics(db: Session = Depends(get_db)):
    return {"summary": summary(db), "brands": top_brands(db), "models": top_models(db), "years": top_years(db)}

@app.post("/api/import")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Нужен CSV-файл")
    tmp = Path("data") / "upload.csv"
    tmp.write_bytes(await file.read())
    try:
        return import_csv(str(tmp), db)
    except Exception as e:
        raise HTTPException(400, str(e))
