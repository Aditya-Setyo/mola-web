import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { apiGet, apiPost, backendURL } from "../api";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // Handle tambah ke keranjang
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
      navigate("/loginpage");
      return;
    }

    try {
      await apiPost("/carts", {
        product_id: product.id,
        quantity,
      });

      alert("Produk berhasil ditambahkan ke keranjang!");
      navigate("/chartpage");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menambahkan ke keranjang.");
    }
  };

  // Handle tombol Beli Sekarang
  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      navigate("/loginpage");
      return;
    }

    try {
      const orderId = `ORDER-${Date.now()}`;
      const grossAmount = product.price * quantity;

      const payload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
          },
        ],
      };

      const res = await apiPost("/payments/midtrans", payload);
      const redirectUrl = res.redirect_url || res.data?.redirect_url?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert("URL pembayaran tidak ditemukan.");
        console.error("redirect_url tidak ada:", res);
      }
    } catch (error) {
      console.error("Gagal proses pembayaran:", error);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  // Ambil kategori untuk kebutuhan modal jika ingin
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      const withAuth = !!token && token !== "null" && token !== "undefined";

      try {
        const res = await apiGet("/categories", withAuth);
        setCategories(res?.data?.categories || []);
      } catch (err) {
        console.error("Gagal ambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);


  // Ambil data produk berdasarkan ID
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/products/${id}`, { signal });
        setProduct(res?.data?.product || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Gagal ambil produk:", err);
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  // Ambil ulasan dari semua produk, lalu filter sesuai ID produk saat ini
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiGet("/reviews");
        const productReviews = res.filter((r) => r.product_id === Number(id));
        setReviews(productReviews);
      } catch (err) {
        console.error("Gagal ambil ulasan:", err);
      }
    };
    fetchReviews();
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
        <div className="text-center py-20 text-red-500">Produk tidak ditemukan.</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="px-4 py-8 md:px-20 md:py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gambar produk */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-row md:flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <img
                  key={n}
                  src={
                    product.image_url
                      ? `${backendURL}${product.image_url}`
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
                  ? `${backendURL}${product.image_url}`
                  : "https://via.placeholder.com/400x500?text=No+Image"
              }
              alt={product.name}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Detail informasi produk */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center text-yellow-500 space-x-1 mb-4">
              {[...Array(4)].map((_, i) => <FaStar key={i} />)}
              <FaStarHalfAlt />
              <span className="text-sm text-gray-600 ml-2">4.5/5 (1.2k)</span>
            </div>

            <div className="text-2xl font-semibold text-gray-900 mb-6">
              Rp {product.price?.toLocaleString()}
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
              {/* Counter jumlah */}
              <div className="flex items-center border rounded">
                <button onClick={decrement} className="px-3 py-1 hover:bg-gray-100">
                  <FaMinus />
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button onClick={increment} className="px-3 py-1 hover:bg-gray-100">
                  <FaPlus />
                </button>
              </div>

              {/* Tombol Keranjang dan Beli Sekarang */}
              <button
                onClick={() => {
                  if (product.category?.name?.toLowerCase() === "pakaian") {
                    setShowModal(true);
                  } else {
                    handleAddToCart();
                  }
                }}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Keranjang
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Tab Deskripsi / Ulasan */}
        <div className="border-t pt-6 mt-10">
          <div className="flex justify-center space-x-6 text-sm font-semibold text-gray-600 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 border-b-2 ${activeTab === "description" ? "border-black text-black" : "border-transparent"}`}
            >
              Deskripsi Produk
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 border-b-2 ${activeTab === "reviews" ? "border-black text-black" : "border-transparent"}`}
            >
              Ulasan
            </button>
          </div>

          {/* Konten tab */}
          {activeTab === "description" ? (
            <div className="text-gray-700 max-w-3xl mx-auto px-4 ml-4">
              <h4 className="text-xl font-semibold mb-2">Detail Produk</h4>
              <p className="text-justify">{product.description || "Tidak ada deskripsi."}</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <div key={review.id || i} className="border p-4 rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{review.user_name || `User ${i + 1}`}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, j) => (
                          <FaStar
                            key={j}
                            className={`text-sm ${j < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium text-gray-900">{review.product_name || "-"}</span>
                    </p>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 col-span-full">Belum ada ulasan.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Modal pilih ukuran & warna */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 space-y-4">
            <h3 className="text-lg font-semibold">Pilih Ukuran & Warna</h3>

            <div>
              <label className="block text-sm font-medium">Ukuran</label>
              <select
                className="border w-full px-3 py-2 rounded"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Pilih Ukuran</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.name}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Warna</label>
              <select
                className="border w-full px-3 py-2 rounded"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                <option value="">Pilih Warna</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  setShowModal(false);
                }}
                className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;
