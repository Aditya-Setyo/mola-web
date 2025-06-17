package cache

const (
    CacheKeyProductsGetById        = "products:get-by-id" 
    CacheKeyProductsGetAll         = "products:get-all"
    CacheKeyProductsGetByCategoryId = "products:get-by-category-id"
)

var ListCacheKeysProductToInvalidate = []string{
	CacheKeyProductsGetById,
	CacheKeyProductsGetAll,
	CacheKeyProductsGetByCategoryId,
}

