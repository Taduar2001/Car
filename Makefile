.PHONY: start stop restart logs test

start:
	docker compose up --build -d

stop:
	docker compose down

restart:
	docker compose down
	docker compose up --build -d

logs:
	docker compose logs -f web

test:
	python -m compileall app
