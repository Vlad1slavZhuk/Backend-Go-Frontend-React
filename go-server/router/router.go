package router

import (
	"test/go-server/middleware"

	"github.com/gorilla/mux"
)

func Router() *mux.Router {

	router := mux.NewRouter()

	router.HandleFunc("/api/cars", middleware.GetAllCar).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/create/car", middleware.CreateCar).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/update/car/{id}", middleware.UpdateCar).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/delete/car/{id}", middleware.DeleteCar).Methods("DELETE", "OPTIONS")

	return router
}
