build: build-web build-api

build-web:
	docker build -t lost-and-found-app:latest lost-and-found-client/.

build-api:
	docker build -t lost-and-found-app:latest api/.
