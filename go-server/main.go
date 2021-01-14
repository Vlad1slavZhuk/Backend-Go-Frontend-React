package main

import (
	"fmt"
	"log"
	"net/http"
	"test/go-server/router"
)

func main() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)
	r := router.Router()
	fmt.Println("Starting server on port 8000...")

	log.Fatal(http.ListenAndServe(":8000", setHeaders(r)))
}

func setHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//anyone can make a CORS request (not recommended in production)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE, PUT, POST, OPTIONS")
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, cache-control")

		if r.Method == "OPTIONS" {
			return
		}

		h.ServeHTTP(w, r)
	})
}
