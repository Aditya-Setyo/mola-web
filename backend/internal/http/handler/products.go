package handler

import (
	"fmt"
	"log"
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

	req.Name = ctx.FormValue("name")
	description := ctx.FormValue("description")
	imageURL := ctx.FormValue("image_url")
	hasVariantStr := ctx.FormValue("has_variant")

	// CategoryID
	if categoryIDStr := ctx.FormValue("category_id"); categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.CategoryID = &temp
		}
	}

	// Description
	if description != "" {
		req.Description = &description
	} else {
		desc := "-"
		req.Description = &desc
	}

	// ImageURL
	if imageURL != "" {
		req.ImageURL = &imageURL
	} else {
		url := "-"
		req.ImageURL = &url
	}

	// HasVariant
	if hasVariantStr == "true" {
		req.HasVariant = true
	}

	// Price
	if priceStr := ctx.FormValue("price"); priceStr != "" {
		if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
			req.Price = price
		}
	}

	// Weight
	if weightStr := ctx.FormValue("weight"); weightStr != "" {
		if weight, err := strconv.ParseFloat(weightStr, 64); err == nil {
			req.Weight = weight
		}
	}

	// Stock
	if stockStr := ctx.FormValue("stock"); stockStr != "" {
		if stock, err := strconv.Atoi(stockStr); err == nil {
			req.Stock = stock
		}
	}

	// Ambil file upload
	image, err := ctx.FormFile("image")
	if err == nil {
		req.Image = image
	}

	// Jika has_variant true, parse array dari form
	if req.HasVariant {
		log.Println("has variant")
		for i := 0; ; i++ {
			colorKey := fmt.Sprintf("variants[%d].color_id", i)
			sizeKey := fmt.Sprintf("variants[%d].size_id", i)
			stockKey := fmt.Sprintf("variants[%d].stock", i)
			log.Println("colorKey", colorKey, "sizeKey", sizeKey, "stockKey", stockKey)
			if ctx.FormValue(colorKey) == "" && ctx.FormValue(sizeKey) == "" {
				log.Println("break")
				break
			}
			
			var variant dto.CreateProductVariantRequest
			valid := false

			if colorStr := ctx.FormValue(colorKey); colorStr != "" {
				if val, err := strconv.ParseUint(colorStr, 10, 64); err == nil {
					temp := uint(val)
					variant.ColorID = &temp
					valid = true
				}
			}
			if sizeStr := ctx.FormValue(sizeKey); sizeStr != "" {
				if val, err := strconv.ParseUint(sizeStr, 10, 64); err == nil {
					temp := uint(val)
					variant.SizeID = &temp
					valid = true
				}
			}
			if stockStr := ctx.FormValue(stockKey); stockStr != "" {
				if val, err := strconv.Atoi(stockStr); err == nil {
					variant.Stock = val
					valid = true
				}
			}

			if valid {
				req.Variants = append(req.Variants, variant)
			}
			log.Println(variant)
		}
	}
	log.Println("reqVariant", req.Variants)

	// Validasi wajib
	if req.Name == "" || req.Price <= 0 {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "name and valid price are required"))
	}

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
		if err := ctx.Request().ParseMultipartForm(32 << 20); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Failed to parse form"))
	}
	// Ambil ID produk dari URL
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid product ID"))
	}
	req.ID = productID

	// Ambil nilai form
	req.Name = ctx.FormValue("name")
	description := ctx.FormValue("description")
	imageURL := ctx.FormValue("image_url")
	hasVariantStr := ctx.FormValue("has_variant")

	// CategoryID
	if categoryIDStr := ctx.FormValue("category_id"); categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 64); err == nil {
			temp := uint(id)
			req.CategoryID = &temp
		}
	}

	// Description
	if description != "" {
		req.Description = &description
	} else {
		desc := "-"
		req.Description = &desc
	}

	// ImageURL
	if imageURL != "" {
		req.ImageURL = &imageURL
	} else {
		url := "-"
		req.ImageURL = &url
	}

	// HasVariant
	if hasVariantStr == "true" {
		req.HasVariant = true
	}else {
		req.HasVariant = false
	}

	// Price
	if priceStr := ctx.FormValue("price"); priceStr != "" {
		if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
			req.Price = price
		}
	}

	// Weight
	if weightStr := ctx.FormValue("weight"); weightStr != "" {
		if weight, err := strconv.ParseFloat(weightStr, 64); err == nil {
			req.Weight = weight
		}
	}

	// Stock
	if stockStr := ctx.FormValue("stock"); stockStr != "" {
		if stock, err := strconv.Atoi(stockStr); err == nil {
			req.Stock = stock
		}
	}

	// Ambil file upload
	image, err := ctx.FormFile("image")
	if err == nil {
		req.Image = image
	}

	// Jika has_variant true, parse variant array
	if req.HasVariant {
		log.Println("has variant")
		for i := 0; ; i++ {
			idKey := fmt.Sprintf("variants[%d].id", i)
			colorKey := fmt.Sprintf("variants[%d].color_id", i)
			sizeKey := fmt.Sprintf("variants[%d].size_id", i)
			stockKey := fmt.Sprintf("variants[%d].stock", i)

			if ctx.FormValue(colorKey) == "" && ctx.FormValue(sizeKey) == "" && ctx.FormValue(idKey) == "" {
				log.Println("break")
				break
			}

			var variant dto.UpdateProductVariantRequest
			valid := false

			// ID varian (opsional, jika varian lama)
			if idStr := ctx.FormValue(idKey); idStr != "" {
				if idParsed, err := uuid.Parse(idStr); err == nil {
					variant.ID = &idParsed
					valid = true
				}
			}

			if colorStr := ctx.FormValue(colorKey); colorStr != "" {
				if val, err := strconv.ParseUint(colorStr, 10, 64); err == nil {
					temp := uint(val)
					variant.ColorID = &temp
					valid = true
				}
			}

			if sizeStr := ctx.FormValue(sizeKey); sizeStr != "" {
				if val, err := strconv.ParseUint(sizeStr, 10, 64); err == nil {
					temp := uint(val)
					variant.SizeID = &temp
					valid = true
				}
			}

			if stockStr := ctx.FormValue(stockKey); stockStr != "" {
				if val, err := strconv.Atoi(stockStr); err == nil {
					variant.Stock = val
					valid = true
				}
			}

			if valid {
				req.Variants = append(req.Variants, variant)
			}
		}
	}

	// Validasi dasar
	if req.Name == "" || req.Price <= 0 {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "name and valid price are required"))
	}

	// Jalankan service update
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


func (h *ProductHandler) AddReview(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	var req dto.ProductReviewRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, err.Error()))
	}
	req.ProductID = productID
	err = h.productService.InsertProductReview(ctx.Request().Context(), &req)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"product": productID,
	}))
}

func (h *ProductHandler) GetReviews(ctx echo.Context) error {
	productID, err := uuid.Parse(ctx.Param("productID"))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, response.ErrorResponse(http.StatusBadRequest, "Invalid todo ID"))
	}
	reviews, err := h.productService.GetProductReviews(ctx.Request().Context(), productID)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, response.ErrorResponse(http.StatusInternalServerError, err.Error()))
	}
	return ctx.JSON(http.StatusOK, response.SuccessResponse("success", map[string]interface{}{
		"reviews": reviews,
	}))
}