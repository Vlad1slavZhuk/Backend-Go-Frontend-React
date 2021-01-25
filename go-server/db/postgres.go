package db

import (
	"Backend-Go-Frontend-React/go-server/models"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/jackc/tern/migrate"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func LoadTheEnv() {
	err := godotenv.Load("go-server/.env")
	if err != nil {
		log.Fatal("Error loading environment")
	}
}

func CreateDBInstance() {
	// DB connection string
	connectionString := os.Getenv("DB_URI")

	connection, err := pgxpool.Connect(context.Background(), connectionString)
	if err != nil {
		log.Fatal("Error connecting")
	}

	conn, err := connection.Acquire(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to Postgres database!")
	DB = connection
	ctx, cancel := context.WithTimeout(context.Background(), 9*time.Second)
	defer cancel()
	migrator, err := migrate.NewMigrator(ctx, conn.Conn(), "version")
	if err != nil {
		log.Fatal(err)
	}

	err = migrator.LoadMigrations("go-server/migrations")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Migrate success!")

	err = migrator.Migrate(ctx)
	if err != nil {
		log.Fatal(err)
	}

	ver, err := migrator.GetCurrentVersion(ctx)
	if err != nil {
		log.Println(err)
	}

	log.Println("Current version of the database: ", ver)
}

func IsExistUser(u *models.User) (bool, error) {
	query := `SELECT EXISTS(SELECT id FROM users WHERE username=$1);`
	row := DB.QueryRow(context.Background(), query, u.Username)
	var status bool
	if err := row.Scan(&status); err != nil {
		return status, err
	}
	return status, nil
}

func IsExistUserByIdAndUsername(id int, username string) (bool, error) {
	query := `SELECT EXISTS(SELECT id FROM users WHERE id=$1 AND username=$2);`
	row := DB.QueryRow(context.Background(), query, id, username)
	var status bool
	if err := row.Scan(&status); err != nil {
		return status, err
	}
	return status, nil
}

func RegisterUser(u *models.User) (int64, error) {
	query := `INSERT INTO users (username, password) values ($1, $2) RETURNING id;`
	row := DB.QueryRow(context.Background(), query, u.Username, u.Password)
	var id int64
	if err := row.Scan(&id); err != nil {
		return -1, err
	}
	return id, nil
}

func GetIdByUsername(u *models.User) (int64, error) {
	query := `SELECT id FROM users WHERE username=$1;`
	row := DB.QueryRow(context.Background(), query, u.Username)
	var id int64
	if err := row.Scan(&id); err != nil {
		return -1, err
	}
	return id, nil
}

func GetAll() ([]*models.Car, error) {
	size, err := GetSizeCars()
	if err != nil {
		return nil, err
	}
	if size == 0 {
		return nil, errors.New("Empty cars.")
	}

	query := `SELECT id, brand, model, price FROM cars ORDER BY id ASC;`
	rows, err := DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	cars := make([]*models.Car, 0, size)

	for rows.Next() {
		car := new(models.Car)
		if err = rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Price); err != nil {
			return nil, err
		}

		cars = append(cars, car)
	}

	return cars, nil
}

func GetCar(id int) (*models.Car, error) {
	query := `SELECT id, brand, model, price FROM cars WHERE id = $1;`
	row := DB.QueryRow(context.Background(), query, id)
	car := new(models.Car)
	if err := row.Scan(&car.ID, &car.Brand, &car.Model, &car.Price); err != nil {
		return nil, err
	}

	return car, nil
}

func CreateCar(car *models.Car) (int64, error) {
	query := `INSERT INTO cars (brand, model, price) VALUES ($1,$2,$3) RETURNING id;`
	row := DB.QueryRow(context.Background(), query, car.Brand, car.Model, car.Price)

	var id int64
	if err := row.Scan(&id); err != nil {
		return -1, err
	}

	return id, nil
}

// Update data of a car
func UpdateCar(car *models.Car) error {
	query := `UPDATE cars SET brand = $1, model = $2, price = $3 WHERE id = $4;`
	_, err := DB.Exec(context.Background(), query, car.Brand, car.Model, car.Price, car.ID)
	if err != nil {
		return err
	}

	return nil
}

// Delete data of car
func DeleteCar(id int) error {
	query := `DELETE FROM cars WHERE id=$1;`
	_, err := DB.Exec(context.Background(), query, id)
	if err != nil {
		return err
	}
	count, _ := GetSizeCars()
	if count == 0 {
		return nil
	}

	cars, _ := GetAll()
	log.Println(len(cars))

	newID := 1
	for _, car := range cars {
		log.Println(car.ID)
		_, err := DB.Exec(context.Background(), fmt.Sprintf("UPDATE %v SET id=$1 WHERE id=$2;", "cars"), newID, car.ID)
		if err != nil {
			return err
		}
		newID++
	}

	_, err = DB.Exec(context.Background(), fmt.Sprintf("ALTER SEQUENCE %v RESTART WITH %v;", "cars_id_seq", count+1))
	if err != nil {
		return err
	}

	log.Println("Deleted car!")
	return nil
}

// Get Size of cars
func GetSizeCars() (int64, error) {
	query := `SELECT COUNT(*) FROM cars;`
	row := DB.QueryRow(context.Background(), query)

	var size int64
	if err := row.Scan(&size); err != nil {
		return -1, err
	}

	return size, nil
}
