package main

import (
	"Backend-Go-Frontend-React/go-server/db"
	"Backend-Go-Frontend-React/go-server/handlers"
	"Backend-Go-Frontend-React/go-server/jwt"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var paths = map[string]bool{
	"/signin":   false,
	"/logout":   true,
	"/signup":   false,
	"/api/cars": true,
	"/api/car":  true,
}

func main() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	db.LoadTheEnv()
	db.CreateDBInstance()

	mux := mux.NewRouter()

	mux.HandleFunc("/signin", handlers.SignIn).Methods(http.MethodPost)            // login
	mux.HandleFunc("/signup", handlers.SignUp).Methods(http.MethodPost)            // register
	mux.HandleFunc("/logout", handlers.Logout).Methods(http.MethodPost)            // log out
	mux.HandleFunc("/api/cars", handlers.GetAll).Methods(http.MethodGet)           // get all cars
	mux.HandleFunc("/api/car", handlers.CreateCar).Methods(http.MethodPost)        // create car
	mux.HandleFunc("/api/car/{id}", handlers.GetCar).Methods(http.MethodGet)       // get car
	mux.HandleFunc("/api/car/{id}", handlers.UpdateCar).Methods(http.MethodPut)    // update car
	mux.HandleFunc("/api/car/{id}", handlers.DeleteCar).Methods(http.MethodDelete) // delete car

	h := cors.Default().Handler(mux) // CORS

	log.Println("Address: http://localhost:8000")

	server := &http.Server{
		Addr:         ":8000",
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		Handler:      Middleware(h),
	}

	go func() {
		log.Fatal(http.ListenAndServe(":8000", server.Handler))
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	// Block until a signal is received.
	sig := <-c
	log.Println("Got signal:", sig)
	defer close(c)

	// gracefully shutdown the server, waiting max 30 seconds for current operations to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("API Shutdown: %v", err)
	}
	log.Printf("API is shutdown...")
}

func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

		if r.Method == "OPTIONS" {
			return
		}

		log.Println("ip:", r.RemoteAddr, r.URL.Path, r.Method)

		token := r.Header.Get("Token")

		if paths[r.URL.Path] || strings.HasPrefix(r.URL.Path, "/api/car/") {
			if len(token) == 0 {
				http.Error(w, "You aren`t authorized.", http.StatusUnauthorized)
				return
			} else {
				if err := jwt.VerifyToken(token); err != nil {
					log.Println("Erorr: ", err)
				}
			}
		}

		h.ServeHTTP(w, r)
	})
}
