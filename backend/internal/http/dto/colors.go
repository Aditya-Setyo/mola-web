package dto

type CreateColorRequest struct {
	Name string `json:"name"`
}

type GetAllColors struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type UpdateColorRequest struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type DeleteColorRequest struct {
	ID uint `json:"id"`
}