import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Pagination from "../components/pagination";
import { Link } from "react-router-dom";
import { apiGet, backendURL } from "../api";

import IlustrasiSkincare from "../assets/bgskincare.png";
import IlustrasiSkincare1 from "../assets/bgskincare1.png";
import IlustrasiSkincare2 from "../assets/bgskincare2.png";

const ShopSkincare = () => {
  const productRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 4;

  const handleScrollToProducts = () => {
    productRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const json = await apiGet("/products", false); // public, no token
        const allProducts = Array.isArray(json?.data?.products)
          ? json.data.products
          : [];

        const skincareOnly = allProducts.filter((product) => {
          const categoryName =
            product.category_name ||
            product.category?.name ||
            (typeof product.category === "string" ? product.category : "");
          return categoryName?.toLowerCase().includes("skincare");
        });

        const total = skincareOnly.length;
        setTotalPages(Math.ceil(total / itemsPerPage));

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        setProducts(skincareOnly.slice(start, end));
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div>
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center bg-no-repeat h-[100vh] md:min-h-screen flex justify-center md:justify-start items-center px-4 sm:px-6 md:px-16"
        style={{ backgroundImage: `url(${IlustrasiSkincare})` }}
      >
        <div className="backdrop-blur-sm bg-white/70 p-6 sm:p-10 rounded-lg max-w-xl w-full text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
            Wujudkan <br /> Kilau Alami yang Memikat
          </h1>
          <button
            onClick={handleScrollToProducts}
            className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition duration-300"
          >
            Beli Sekarang
          </button>
        </div>
      </section>

      {/* DISKON SECTION */}
      <section
        className="relative bg-cover bg-center bg-no-repeat h-[100vh] md:min-h-screen flex justify-center md:justify-start items-center px-4 sm:px-6 md:px-16"
        style={{ backgroundImage: `url(${IlustrasiSkincare1})` }}
      >
        <div className="backdrop-blur-sm bg-white/70 p-6 sm:p-10 rounded-lg max-w-xl w-full text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
            Penawaran Khusus <br /> Diskon 30%
          </h1>
          <button
            onClick={handleScrollToProducts}
            className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition duration-300"
          >
            Beli Sekarang
          </button>
        </div>
      </section>

      {/* DETAIL PRODUK SECTION */}
      <section className="px-4 py-12 md:px-20 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div className="flex justify-center">
            <img
              src={IlustrasiSkincare2}
              alt="Anti-Aging Cream"
              className="max-h-[500px] w-full object-contain"
            />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              Anti-Aging Cream
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Produk perawatan wajah untuk mengurangi tanda-tanda penuaan dan
              membuat kulit terasa lebih lembut, halus, dan bercahaya.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Diperkaya dengan bahan aktif alami yang aman digunakan sehari-hari.
              Cocok untuk semua jenis kulit.
            </p>
            <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition">
              Selengkapnya →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopSkincare;
