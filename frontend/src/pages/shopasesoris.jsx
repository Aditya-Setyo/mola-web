import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Pagination from "../components/pagination";
import { Link } from "react-router-dom";

const ShopAsesoris = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/v1/products");
        const json = await res.json();

        const allProducts = Array.isArray(json?.data?.products)
          ? json.data.products
          : [];

        const asesorisOnly = allProducts.filter((product) => {
          const categoryName =
            product.category_name ||
            product.category?.name ||
            (typeof product.category === "string" ? product.category : "");

          return categoryName?.toLowerCase().includes("aksesoris");
        });

        const total = asesorisOnly.length;
        const pages = Math.ceil(total / itemsPerPage);
        setTotalPages(pages);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        setProducts(asesorisOnly.slice(start, end));
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div>
      <Navbar />

      <section className="px-4 py-12 md:px-20 md:py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-left text-gray-800">
          Asesoris
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} to={`/productdetails/${product.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition duration-200 h-full">
                  <img
                    src={`http://localhost:8081${product.image_url}`}
                    alt={product.name}
                    className="w-full h-48 object-contain bg-white"
                  />
                  <div className="flex-1 p-4 flex flex-col justify-between text-center">
                    <h3 className="text-base font-semibold text-gray-800 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Rp {product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-2 md:col-span-3 text-gray-500">
              Produk tidak ditemukan.
            </p>
          )}
        </div>
      </section>

      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ShopAsesoris;
