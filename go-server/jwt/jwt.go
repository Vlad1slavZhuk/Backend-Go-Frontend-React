package jwt

import (
	"Backend-Go-Frontend-React/go-server/db"
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var secret string = "Secret Code"

func GenerateToken(id int64, name string) (string, error) {
	atClaims := jwt.MapClaims{}
	atClaims["id"] = id
	atClaims["username"] = name
	atClaims["exp"] = time.Now().Add(time.Minute * 10).Unix() // Time to exp
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
	token, err := at.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return token, nil
}

// TODO
func VerifyToken(tok string) error {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tok, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		id, err := strconv.Atoi(fmt.Sprint(claims["id"]))
		if err != nil {
			return err
		}
		status, err := db.IsExistUserByIdAndUsername(id, fmt.Sprint(claims["username"]))
		if err != nil || !status {
			return errors.New("Fake token.")
		}
	} else {
		log.Println(err)
	}

	return nil
}
