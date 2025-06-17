package dto

type GetAllCategories struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
type CreateCategoryRequest struct {
	Name string `json:"name"`
}

type UpdateCategoryRequest struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type DeleteCategoryRequest struct {
	ID uint `json:"id"`
}