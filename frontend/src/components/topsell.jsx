import React, { useState, useEffect } from "react";
import ProductCard from "./product";

const TopSell = () => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/products/top");
        const result = await response.json();

        // Cek jika respons memiliki struktur data yang valid
        const products = result?.data || result;

        if (Array.isArray(products)) {
          setTopProducts(products);
        } else {
          console.warn("Data penjualan teratas tidak dalam format array:", products);
        }
      } catch (error) {
        console.error("Gagal mengambil data produk teratas:", error);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <section className="px-10 py-16">
      <h2 className="text-2xl font-bold mb-6 text-center">PENJUALAN TERATAS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500">Tidak ada produk teratas</p>
        )}
      </div>
    </section>
  );
};

export default TopSell;
