import React, { useState, useEffect } from "react";
import ProductCard from "./product";
import { Link } from "react-router-dom";

const NewArrival = ({ id }) => {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/products/new");
        const result = await response.json();

        // Cek jika respons memiliki struktur data yang valid
        const products = result?.data || result;

        if (Array.isArray(products)) {
          setNewProducts(products);
        } else {
          console.warn("Data produk tidak dalam format array:", products);
        }
      } catch (error) {
        console.error("Gagal mengambil produk terbaru:", error);
      }
    };

    fetchNewProducts();
  }, []);

  return (
    <section id={id} className="px-10 py-16">
      <h2 className="text-2xl font-bold mb-6 text-center">PRODUK TERBARU</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {newProducts.length > 0 ? (
          newProducts.map((product, index) => (
            <Link to={`/detailproduct/${product.id}`} key={index}>
              <ProductCard {...product} />
            </Link>
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500">Tidak ada produk terbaru</p>
        )}
      </div>
    </section>
  );
};

export default NewArrival;
