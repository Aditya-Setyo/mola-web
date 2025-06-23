import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { HashLink } from "react-router-hash-link";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8081/api/v1/products/${id}`, { signal });
        const json = await res.json();
        console.log("📦 Data dari server:", json);
        setProduct(json?.data?.product || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("❌ Gagal ambil produk:", err);
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-500 animate-pulse">
          Memuat detail produk...
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-red-500">
          Produk tidak ditemukan.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="px-4 py-8 md:px-20 md:py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gambar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-row md:flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <img
                  key={n}
                  src={
                    product.image_url
                      ? `http://localhost:8081${product.image_url}`
                      : "https://via.placeholder.com/80?text=No+Img"
                  }
                  alt={`thumb-${n}`}
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
            </div>
            <img
              src={
                product.image_url
                  ? `http://localhost:8081${product.image_url}`
                  : "https://via.placeholder.com/400x500?text=No+Image"
              }
              alt={product.name}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Informasi Produk */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center text-yellow-500 space-x-1 mb-4">
              {[...Array(4)].map((_, i) => <FaStar key={i} />)}
              <FaStarHalfAlt />
              <span className="text-sm text-gray-600 ml-2">4.5/5 (1.2k)</span>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl font-semibold text-gray-900">
                Rp {product.price?.toLocaleString()}
              </span>
            </div>

            {product.size && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Ukuran</p>
                <span className="border rounded px-4 py-1 text-sm">{product.size}</span>
              </div>
            )}

            {product.color && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Warna</p>
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: product.color }}
                />
              </div>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border rounded">
                <button onClick={decrement} className="px-3 py-1 hover:bg-gray-100">
                  <FaMinus />
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button onClick={increment} className="px-3 py-1 hover:bg-gray-100">
                  <FaPlus />
                </button>
              </div>
              <HashLink to="/chartpage" smooth>
                <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                  Keranjang
                </button>
              </HashLink>
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Tab Deskripsi & Ulasan */}
        <div className="border-t pt-6 mt-10">
          <div className="flex justify-center space-x-6 text-sm font-semibold text-gray-600 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 border-b-2 ${
                activeTab === "description"
                  ? "border-black text-black"
                  : "border-transparent"
              }`}
            >
              Deskripsi Produk
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 border-b-2 ${
                activeTab === "reviews"
                  ? "border-black text-black"
                  : "border-transparent"
              }`}
            >
              Ulasan
            </button>
          </div>

          {activeTab === "description" ? (
            <div className="text-gray-700 max-w-3xl mx-auto px-4">
              <h4 className="text-xl font-semibold mb-2">Detail Produk</h4>
              <p>{product.description || "Tidak ada deskripsi."}</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-gray-800">User {i}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, j) => (
                        <FaStar key={j} className="text-sm" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Produk bagus dan sesuai deskripsi. Recommended!
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
