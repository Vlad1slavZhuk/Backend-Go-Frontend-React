run:
	go run go-server/main.go

run-db:
	docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:alpine
	docker exec -it postgres bash

down-db:
	docker rm -f postgres