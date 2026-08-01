# AV.BY Analytics MVP

Веб-панель для анализа объявлений: топ марок, моделей, годов выпуска и средняя цена.

## Запуск после git clone

Требуются Git, Docker и Docker Compose.

```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd avby-analytics
cp .env.example .env
docker compose up --build -d
```

Откройте: http://localhost:8000

Для остановки:

```bash
docker compose down
```

Можно использовать Makefile:

```bash
make start
make logs
make stop
```

## Первая проверка

На главной странице загрузите `sample.csv`. После импорта панель покажет статистику.

## Публикация в новый GitHub-репозиторий

Создайте пустой репозиторий без README, затем выполните:

```bash
git init
git add .
git commit -m "Initial AV.BY analytics MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/avby-analytics.git
git push -u origin main
```

После этого проект можно устанавливать на другом компьютере обычным `git clone`.

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

## Ограничение аналитики

Один снимок показывает, какие автомобили чаще выставлены. Для оценки реальных продаж необходимо ежедневно сохранять объявления и считать исчезнувшие позиции.
