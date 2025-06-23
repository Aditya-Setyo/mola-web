import React, { useState, useEffect } from "react";
import ProductCard from "./product";
import { Link } from "react-router-dom";

const TopSell = () => {
  const [products, setProducts] = useState([]);
  const [currentPage] = useState(1);
  const [, setTotalPages] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/v1/products");
        const json = await res.json();

        const allProducts = Array.isArray(json?.data?.products)
          ? json.data.products
          : [];

        console.log("🔥 Semua Produk:", allProducts);

        // Ambil nama kategori dari berbagai kemungkinan struktur
        const TeratasOnly = allProducts.filter((product) => {
          const categoryName =
            product.category_name ||
            product.category?.name ||
            (typeof product.category === "string" ? product.category : "");

          return categoryName?.toLowerCase().includes("penjualan teratas");
        });

        console.log("Produk Teratas:", TeratasOnly);

        const total = TeratasOnly.length;
        const pages = Math.ceil(total / itemsPerPage);
        setTotalPages(pages);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        setProducts(TeratasOnly.slice(start, end));
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <section className="px-10 py-16">
      <h2 className="text-2xl font-bold mb-6 text-center">PENJUALAN TERATAS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <Link to={`/productdetails/${product.id}`}>
              <div
                key={product.id}
                className="w-full max-w-xs bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between transition-transform hover:scale-105"
              >
                <img
                  src={`http://localhost:8081${product.image_url}`}
                  alt={product.name}
                  className="w-full h-48 object-contain bg-white"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Rp {product.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500">Tidak ada produk terbaru</p>
        )}
      </div>
    </section >
  );
};

export default TopSell;
