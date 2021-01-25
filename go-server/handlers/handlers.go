package handlers

import (
	"Backend-Go-Frontend-React/go-server/db"
	"Backend-Go-Frontend-React/go-server/jwt"
	"Backend-Go-Frontend-React/go-server/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func SignIn(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(user.Username) == 0 || len(user.Password) == 0 {
		http.Error(w, "Invalid username or password.", http.StatusUnauthorized)
		return
	}

	if status, err := db.IsExistUser(&user); err != nil || !status {
		http.Error(w, "Not exist user.", http.StatusUnauthorized)
		return
	} else {
		id, err := db.GetIdByUsername(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		token, err := jwt.GenerateToken(id, user.Username)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Token", token)
		fmt.Fprintf(w, "%s", token)
	}

}

func Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Del("Token")
}

func SignUp(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if status, err := db.IsExistUser(&user); status || err != nil {
		http.Error(w, "Username taken", http.StatusUnauthorized)
		return
	}

	id, err := db.RegisterUser(&user)
	if err != nil || id == -1 {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "OK")
}

func GetAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	cars, err := db.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := json.NewEncoder(w).Encode(cars); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func GetCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	data := mux.Vars(r)
	id, err := strconv.Atoi(data["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	car, err := db.GetCar(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := json.NewEncoder(w).Encode(car); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func CreateCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var car models.Car
	if err := json.NewDecoder(r.Body).Decode(&car); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(car.Brand) == 0 || len(car.Model) == 0 || car.Price <= 0 {
		http.Error(w, "Empty fields", http.StatusBadRequest)
		return
	}

	id, err := db.CreateCar(&car)
	if id == -1 || err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	car.ID = id

	if err := json.NewEncoder(w).Encode(car); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func UpdateCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	data := mux.Vars(r)
	id, err := strconv.Atoi(data["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	size, err := db.GetSizeCars()
	log.Println(size)
	if err != nil || size == 0 {
		http.Error(w, "Error id", http.StatusBadRequest)
		return
	}

	if id < 0 || id > int(size) {
		http.Error(w, "Error id", http.StatusBadRequest)
		return
	}

	var car models.Car
	if err := json.NewDecoder(r.Body).Decode(&car); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if len(car.Brand) == 0 || len(car.Model) == 0 || car.Price <= 0 {
		http.Error(w, "Empty fields", http.StatusBadRequest)
		return
	} else {
		car.ID = int64(id)

		if err := db.UpdateCar(&car); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(car); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

}

func DeleteCar(w http.ResponseWriter, r *http.Request) {
	data := mux.Vars(r)
	id, err := strconv.Atoi(data["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	size, err := db.GetSizeCars()
	if err != nil || size == 0 || int64(id) > size || int64(id) <= 0 {
		http.Error(w, "Error id", http.StatusBadRequest)
		return
	}

	if err := db.DeleteCar(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "DELETE")
}
