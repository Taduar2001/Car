# AV.BY Analytics MVP

Панель аналитики объявлений: топ марок, моделей, годов и средняя цена.

## Запуск через Docker
```bash
docker compose up --build
```
Откройте http://localhost:8000 и загрузите `sample.csv`.

## Запуск без Docker
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Формат CSV
Обязательные колонки: `source_id,brand,model,year`.
Дополнительные: `url,price_usd,city`.

## Важно про показатель «продаются больше всего»
Один снимок данных показывает, какие авто **чаще выставлены**. Для оценки скорости продаж нужно ежедневно сохранять снимки и считать объявления, которые исчезли. Перед автоматическим сбором данных согласуйте доступ с AV.BY и соблюдайте robots.txt, условия сервиса и лимиты запросов.
