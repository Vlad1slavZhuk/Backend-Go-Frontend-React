package models

type Car struct {
	ID    int64  `json:"id"`
	Brand string `json:"brand"`
	Model string `json:"model"`
	Price int64  `json:"price"`
}
