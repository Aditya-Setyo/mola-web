package dto

type GetAllSizes struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type UpdateSizeRequest struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type CreateSizeRequest struct {
	Name string `json:"name"`
}

type DeleteSizeRequest struct {
	ID uint `json:"id"`
}