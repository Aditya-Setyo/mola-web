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
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableStock, setAvailableStock] = useState(null);


  const increment = () => {
    if (availableStock === null || quantity < availableStock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
      navigate("/loginpage");
      return;
    }

    let payload;

    if (product.has_variant) {
      const variant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );

      if (!variant) {
        alert("Varian tidak ditemukan. Silakan periksa pilihan warna dan ukuran.");
        return;
      }

      payload = {
        product_id: product.id,
        quantity,
        product_variant_id: variant.id,
        size: selectedSize,
        color: selectedColor,
      };
    } else {
      payload = {
        product_id: product.id,
        quantity,
      };
    }

    try {
      // console.log("Payload ke /carts:", payload);
      await apiPost("/carts", payload);
      alert("Produk berhasil ditambahkan ke keranjang!");
      navigate("/chartpage");
    } catch (error) {
      console.error("Gagal tambah ke keranjang:", error);
      alert("Terjadi kesalahan saat menambahkan ke keranjang.");
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      navigate("/loginpage");
      return;
    }

    try {
      // Cek apakah ada transaksi pending di cart
      const resCart = await apiGet("/carts", true);
      const pendingPaymentUrl = resCart?.data?.cart?.payment_url;
      if (pendingPaymentUrl) {
        alert("Anda masih memiliki transaksi yang belum selesai. Mengarahkan ke halaman pembayaran...");
        window.location.href = pendingPaymentUrl;
        return;
      }

      if (!product || !product.id) {
        alert("Data produk tidak lengkap.");
        return;
      }

      let variantId = null;

      if (product.has_variant) {
        const selectedVariant = product.variants?.find(
          (v) => v.size === selectedSize && v.color === selectedColor
        );
        if (!selectedVariant) {
          alert("Pilih ukuran dan warna terlebih dahulu.");
          return;
        }
        variantId = selectedVariant.id;
      } else {
        // Produk tanpa variant, ambil default variant
        if (!product.variants || product.variants.length === 0) {
          alert("Produk tidak memiliki variant default.");
          return;
        }
        variantId = product.variants[0].id;
      }

      const item = {
        product_id: product.id,
        product_variant_id: variantId,
        quantity,
      };

      const payload = { selected_items: [item] };
      console.log("📦 Payload Checkout:", payload);

      const checkout = await apiPost("/orders/checkout", payload, true);
      const redirectUrl = checkout?.data?.redirect_url?.redirect_url || checkout?.redirect_url;

      if (redirectUrl) {
        alert("Mengalihkan ke pembayaran...");
        window.location.href = redirectUrl;
      } else {
        alert("Gagal mendapatkan URL pembayaran.");
      }
    } catch (error) {
      console.error("🚨 Error saat checkout:", error);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

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

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiGet("/products", { signal });
        const allProducts = res?.data?.products || [];
        const found = allProducts.find((item) => item.id === id);
        setProduct(found || null);
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

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product || !product.id) {
        console.warn(" Produk belum siap, menunggu sebelum ambil review.");
        return;
      }

      try {
        const res = await apiGet(`/products/review/${product.id}`);
        const productReviews = Array.isArray(res?.data?.reviews)
          ? res.data.reviews
          : [];

        const reviewsFormatted = productReviews.map((review) => ({
          id: review.id,
          user_name: review.user_name || "Pengguna",
          rating: review.rating || 0,
          review: review.review || "Tidak ada komentar.",
          product_name: product?.name || "Tanpa Nama",
        }));

        setReviews(reviewsFormatted);
      } catch (err) {
        console.error(`Gagal ambil ulasan untuk produk ${product.id}:`, err);
        setReviews([]);
      }
    };

    // 💡 Hanya panggil fetchReviews kalau product sudah ada dan punya id
    if (product && product.id) {
      fetchReviews();
    }
  }, [id, product]);



  const sizes = product?.has_variant && Array.isArray(product.variants)
    ? [...new Set(product.variants.map((v) => v.size))].map((name, i) => ({
      id: i,
      name,
    }))
    : [];

  const colors = product?.has_variant && Array.isArray(product.variants)
    ? [...new Set(product.variants.map((v) => v.color))].map((name, i) => ({
      id: i,
      name,
    }))
    : [];

  // Untuk produk tanpa varian → jalankan sekali saat product berubah
  useEffect(() => {
    if (product && !product.has_variant) {
      setAvailableStock(product.stock ?? null);
    }
  }, [product]);


  // Untuk produk dengan varian → jalankan ketika varian berubah
  useEffect(() => {
    if (product?.has_variant) {
      const variant = product.variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      setAvailableStock(variant?.stock ?? null);
    }
  }, [product, selectedSize, selectedColor]);

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
          <div className="flex flex-col md:flex-row gap-4">
            {/* Thumbnail samping */}
            <div className="flex md:flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-16 h-16 rounded overflow-hidden border shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={
                      product.image_url
                        ? `${backendURL}${product.image_url}`
                        : "https://via.placeholder.com/80?text=No+Img"
                    }
                    alt={`thumb-${n}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Gambar utama */}
            <div className="flex-1 max-w-xl mx-auto md:mx-0 aspect-square rounded-lg overflow-hidden border shadow">
              <img
                src={
                  product.image_url
                    ? `${backendURL}${product.image_url}`
                    : "https://via.placeholder.com/400x400?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center text-yellow-500 space-x-1 mb-4">
              {[...Array(4)].map((_, i) => (
                <FaStar key={i} />
              ))}
              <FaStarHalfAlt />
              <span className="text-sm text-gray-600 ml-2">4.5/5 (1.2k)</span>
            </div>

            <div className="text-2xl font-semibold text-gray-900 mb-6">
              Rp {product.price?.toLocaleString()}
            </div>

            {/* Jika produk punya varian, tampilkan pilihan warna, ukuran, dan info stok */}
            {product.has_variant ? (
              <>
                {/* Warna Tersedia */}
                {colors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Warna Tersedia
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                          className={`w-8 h-8 rounded-full border-2 focus:outline-none ${selectedColor === color.name
                            ? "ring-2 ring-black"
                            : "border-gray-300"
                            }`}
                          style={{ backgroundColor: color.name || "#ccc" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ukuran Tersedia */}
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Ukuran Tersedia
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size.name)}
                          className={`w-10 h-10 rounded-full border text-sm font-medium hover:bg-gray-200 transition ${selectedSize === size.name
                            ? "bg-black text-white"
                            : "text-gray-800 border-gray-300"
                            }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stok berdasarkan varian */}
                <div className="text-sm text-gray-700 mb-6">
                  Stok tersedia:{" "}
                  <span className="font-semibold">
                    {typeof availableStock === "number"
                      ? availableStock
                      : product.has_variant
                        ? "Pilih ukuran dan warna terlebih dahulu"
                        : "Tidak tersedia"}
                  </span>
                </div>
              </>
            ) : (
              // Produk tanpa varian → hanya tampilkan stok langsung
              <div className="text-sm text-gray-700 mb-6">
                Stok tersedia:{" "}
                <span className="font-semibold">
                  {typeof availableStock === "number" ? availableStock : "Tidak tersedia"}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center border rounded">
                <button
                  onClick={decrement}
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  <FaMinus />
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={increment}
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  <FaPlus />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Keranjang
              </button>

              <button
                onClick={handleBuyNow}
                disabled={availableStock <= 0}
                className={`px-6 py-2 rounded text-white ${availableStock <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
                  }`}
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-10">
          <div className="flex justify-center space-x-6 text-sm font-semibold text-gray-600 mb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 border-b-2 ${activeTab === "description"
                ? "border-black text-black"
                : "border-transparent"
                }`}
            >
              Deskripsi Produk
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 border-b-2 ${activeTab === "reviews"
                ? "border-black text-black"
                : "border-transparent"
                }`}
            >
              Rating & Ulasan
            </button>
          </div>

          {activeTab === "description" ? (
            <div className="text-gray-700 max-w-3xl mx-auto px-4 ml-4">
              <h4 className="text-xl font-semibold mb-2">Detail Produk</h4>
              <p className="text-justify">
                {product.description || "Tidak ada deskripsi."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <div
                    key={review.id || i}
                    className="border p-4 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-gray-800">
                        {review.user_name || `User ${i + 1}`}
                      </h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, j) => (
                          <FaStar
                            key={j}
                            className={`text-sm ${j < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium text-gray-900">
                        {review.product_name || "-"}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">{review.review}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 col-span-full">
                  Belum ada  Rating & Ulasan.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
