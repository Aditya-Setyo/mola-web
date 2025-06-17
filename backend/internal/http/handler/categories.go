package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type CategoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) CategoryHandler {
	return CategoryHandler{categoryService}
}

func (h CategoryHandler) GetAll(ctx echo.Context) error {
	categories, err := h.categoryService.GetAll(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(categories) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Category not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"categories": categories,
	}))
}

func (h CategoryHandler) Create(ctx echo.Context) error {
	request := new(dto.CreateCategoryRequest)
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err := h.categoryService.Create(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"category": request.Name,
	}))
}

// Ingat ini masih belum pasti bikin update category =========================================
func (h CategoryHandler) Update(ctx echo.Context) error{
	categoryID, err:= strconv.ParseUint(ctx.Param("categoryID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	request := new(dto.UpdateCategoryRequest) 
	if err := ctx.Bind(request); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	request.ID = uint(categoryID)
	err = h.categoryService.Update(ctx.Request().Context(), request)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"category": request.Name,
	}))
}


func (h CategoryHandler) Delete(ctx echo.Context) error {
	categoryID, err := strconv.ParseUint(ctx.Param("categoryID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	err = h.categoryService.Delete(ctx.Request().Context(), uint(categoryID))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"category": categoryID,
	}))
}