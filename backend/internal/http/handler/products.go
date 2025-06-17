package handler

import (
	"mola-web/internal/http/dto"
	"mola-web/internal/service"
	"mola-web/pkg/response"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type ProductHandler struct {
	productService service.ProductService
}

func NewProductHandler(productService service.ProductService) ProductHandler {
	return ProductHandler{productService: productService}
}

func (h *ProductHandler) GetAll(ctx echo.Context) error {
	products, err := h.productService.GetAll(ctx.Request().Context())
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(products) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Product not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"products": products,
	}))
}

func (h *ProductHandler) GetByCategoryID(ctx echo.Context) error {
	categoryID, err := strconv.ParseUint(ctx.Param("categoryID"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	products, err := h.productService.GetProductByCategoryID(ctx.Request().Context(), uint(categoryID))
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(products) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Product not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"products": products,
	}))
}

func (h *ProductHandler) GetByName(ctx echo.Context) error {
	name := ctx.Param("name")
	products, err := h.productService.GetProductByName(ctx.Request().Context(), name)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if len(products) == 0 {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Product not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"products": products,
	}))
}

func (h *ProductHandler) GetByID(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Product not found"))
	}
	product, err := h.productService.GetByID(ctx.Request().Context(), productID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	if product == nil {
		return ctx.JSON(http.StatusNotFound, response.ErrorResponse(http.StatusNotFound, "Product not found"))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"product": product,
	}))
}

func (h *ProductHandler) UpdateStock(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	var stock int64
	if err := ctx.Bind(&stock); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	err = h.productService.UpdateStockProduct(ctx.Request().Context(), productID, stock)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"productID": productID,
	}))
}

func (h *ProductHandler) Create(ctx echo.Context) error {
	var req dto.CreateProductRequest

	// Ambil nilai form
	req.Name = ctx.FormValue("name")
	categoryIDStr := ctx.FormValue("category_id")
	description := ctx.FormValue("description")
	imageURL := ctx.FormValue("image_url")
	hasVariantStr := ctx.FormValue("has_variant")
	priceStr := ctx.FormValue("price")
	weightStr := ctx.FormValue("weight")
	colorIDStr := ctx.FormValue("color_id")
	sizeIDStr := ctx.FormValue("size_id")
	stockStr := ctx.FormValue("stock")

	// Konversi dan validasi nilai
	if categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.CategoryID = &temp
		}
	}
	if description != "" {
		req.Description = &description
	}
	if imageURL != "" {
		req.ImageURL = &imageURL
	}
	if hasVariantStr == "true" {
		req.HasVariant = true
	}
	if priceStr != "" {
		if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
			req.Price = price
		}
	}
	if weightStr != "" {
		if weight, err := strconv.ParseFloat(weightStr, 64); err == nil {
			req.Weight = weight
		}
	}
	if colorIDStr != "" {
		if id, err := strconv.ParseUint(colorIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.ColorID = &temp
		}
	}
	if sizeIDStr != "" {
		if id, err := strconv.ParseUint(sizeIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.SizeID = &temp
		}
	}
	if stockStr != "" {
		if stock, err := strconv.Atoi(stockStr); err == nil {
			req.Stock = stock
		}
	}

	// Ambil file upload
	image, err := ctx.FormFile("image")
	if err == nil {
		req.Image = image
	}

	// Validasi nama dan harga wajib diisi
	if req.Name == "" || req.Price <= 0 {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "name and valid price are required"))
	}

	// Panggil service
	err = h.productService.Create(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"product": req.Name,
	}))
}


func (h *ProductHandler) Update(ctx echo.Context) error {
	var req dto.UpdateProductRequest

	// Ambil ID produk dari URL
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid product ID"))
	}
	req.ID = productID

	// Ambil nilai form
	req.Name = ctx.FormValue("name")
	categoryIDStr := ctx.FormValue("category_id")
	description := ctx.FormValue("description")
	imageURL := ctx.FormValue("image_url")
	hasVariantStr := ctx.FormValue("has_variant")
	priceStr := ctx.FormValue("price")
	weightStr := ctx.FormValue("weight")
	colorIDStr := ctx.FormValue("color_id")
	sizeIDStr := ctx.FormValue("size_id")
	stockStr := ctx.FormValue("stock")

	// Konversi dan validasi nilai
	if categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.CategoryID = &temp
		}
	}
	if description != "" {
		req.Description = &description
	}
	if imageURL != "" {
		req.ImageURL = &imageURL
	}
	if hasVariantStr == "true" {
		req.HasVariant = true
	}
	if priceStr != "" {
		if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
			req.Price = price
		}
	}
	if weightStr != "" {
		if weight, err := strconv.ParseFloat(weightStr, 64); err == nil {
			req.Weight = weight
		}
	}
	if colorIDStr != "" {
		if id, err := strconv.ParseUint(colorIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.ColorID = &temp
		}
	}
	if sizeIDStr != "" {
		if id, err := strconv.ParseUint(sizeIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.SizeID = &temp
		}
	}
	if stockStr != "" {
		if stock, err := strconv.Atoi(stockStr); err == nil {
			req.Stock = stock
		}
	}

	// Ambil file upload jika ada
	image, err := ctx.FormFile("image")
	if err == nil {
		req.Image = image
	}

	// Validasi dasar
	if req.Name == "" || req.Price <= 0 {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "name and valid price are required"))
	}

	// Panggil service
	err = h.productService.Update(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}

	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"product": req.Name,
	}))
}

func (h *ProductHandler) Delete(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	err = h.productService.Delete(ctx.Request().Context(), productID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"product": productID,
	}))
}