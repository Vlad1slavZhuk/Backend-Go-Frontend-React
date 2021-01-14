package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"test/go-server/models"
	"time"

	"github.com/gorilla/mux"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/jackc/tern/migrate"
	"github.com/joho/godotenv"
)

var db *pgxpool.Pool

func init() {
	loadTheEnv()
	createDBInstance()
}

func loadTheEnv() {
	err := godotenv.Load("go-server/.env")
	if err != nil {
		log.Fatal("Error loading environment")
	}
}

func createDBInstance() {
	// DB connection string
	connectionString := os.Getenv("DB_URI")

	connection, err := pgxpool.Connect(context.Background(), connectionString)
	if err != nil {
		log.Printf("Error connecting")
	}

	conn, err := connection.Acquire(context.Background())
	if err != nil {
		log.Println(err)
	}

	log.Println("Connected to Postgres database!")
	db = connection
	ctx, cancel := context.WithTimeout(context.Background(), 9*time.Second)
	defer cancel()
	migrator, err := migrate.NewMigrator(ctx, conn.Conn(), "version")
	if err != nil {
		log.Println(err)
	}

	err = migrator.LoadMigrations("go-server/migrations")
	if err != nil {
		log.Println(err)
	}

	log.Println("Migrate success!")

	err = migrator.Migrate(ctx)
	if err != nil {
		log.Println(err)
	}

	ver, err := migrator.GetCurrentVersion(ctx)
	if err != nil {
		log.Println(err)
	}

	log.Println("Current version of the database: ", ver)
}

func GetAllCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	cars := getAllCar()
	json.NewEncoder(w).Encode(cars)
}

func CreateCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	var car models.Car
	_ = json.NewDecoder(r.Body).Decode(&car)
	insertCar(&car)
	json.NewEncoder(w).Encode(car)
}

func UpdateCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	data := mux.Vars(r)

	id, err := strconv.Atoi(data["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	var car models.Car
	_ = json.NewDecoder(r.Body).Decode(&car)
	updateCar(id, &car)
	json.NewEncoder(w).Encode(car)
}

func DeleteCar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Context-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	data := mux.Vars(r)
	id, err := strconv.Atoi(data["id"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
	if err := deleteCar(id); err != nil {
		log.Println("Fail")
	}
	json.NewEncoder(w).Encode(data)
}

func getAllCar() []*models.Car {
	rows, err := db.Query(context.Background(), fmt.Sprintf("SELECT * FROM %s ORDER BY id ASC;", "cars"))
	if err != nil {
		log.Println(err)
		return nil
	}

	cars := make([]*models.Car, 0)

	for rows.Next() {
		car := new(models.Car)
		err = rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Price)
		if err != nil {
			return nil
		}

		cars = append(cars, car)
	}

	return cars
}

func insertCar(car *models.Car) *models.Car {
	if len(car.Brand) == 0 || len(car.Model) == 0 || car.Price == 0 {
		return nil
	}
	query := fmt.Sprintf("INSERT INTO %s (brand, model, price) VALUES ($1, $2, $3) RETURNING id;", "cars")
	row := db.QueryRow(context.Background(), query, car.Brand, car.Model, car.Price)
	if err := row.Scan(&car.ID); err != nil {
		return nil
	}
	log.Println("Created Car!")
	return car
}

func updateCar(id int, car *models.Car) {
	log.Println(car)
	query := fmt.Sprintf("UPDATE %s SET brand = $1, model = $2, price = $3 WHERE id = $4;", "cars")
	_, err := db.Exec(context.Background(), query, car.Brand, car.Model, car.Price, id)
	if err != nil {
		log.Println(err)
	}
	log.Println("Update car! ID =", car.ID)
}

func deleteCar(id int) error {
	log.Println(id)
	query := fmt.Sprintf("DELETE FROM %s WHERE id=$1;", "cars")
	_, err := db.Exec(context.Background(), query, id)
	if err != nil {
		log.Println(err)
	}

	cars := getAllCar()

	if len(cars) != 0 {
		newID := 1

		for _, car := range cars {
			_, err := db.Exec(context.Background(), fmt.Sprintf("UPDATE %v SET id=$1 WHERE id=$2;", "cars"), newID, car.ID)
			if err != nil {
				return err
			}
			newID++
		}
	}

	_, err = db.Exec(context.Background(), fmt.Sprintf("ALTER SEQUENCE %v RESTART WITH %v;", "cars_id_seq", len(cars)+1))
	if err != nil {
		return err
	}

	log.Println("Deleted car!")
	return nil
}
