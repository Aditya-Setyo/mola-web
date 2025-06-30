import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { apiGet, apiPost } from "../api"; // impor fungsi fetch dari api.js
import { backendURL } from "../api"; // untuk akses gambar dari backend
import {
  FaTrashAlt,
  FaMinus,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

const ChartPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCheckout = async () => {
  try {
    const res = await apiPost("/orders/checkout");
    console.log("Checkout response:", res);

    const redirectUrl = res?.data?.redirect_url?.redirect_url;
    if (redirectUrl) {
      alert("Mengalihkan ke pembayaran...");
      window.location.href = redirectUrl;
    } else {
      alert("Gagal mendapatkan URL pembayaran.");
    }
  } catch (err) {
    console.error("Gagal checkout:", err);
    alert("Terjadi kesalahan saat checkout.");
  }
};

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "null" || token === "undefined") {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
const fetchCart = async () => {
  try {
    const res = await apiGet("/carts", true);

    // Ambil URL pembayaran dari respons
    const paymentUrl = res?.data?.cart?.payment_url;

    // Kalau payment_url tersedia, langsung redirect ke Midtrans
    if (paymentUrl) {
      alert("Anda memiliki transaksi yang belum diselesaikan. Mengarahkan ke halaman pembayaran...");
      window.location.href = paymentUrl;
      return; // stop di sini agar tidak setItems lagi
    }

    const cartItems = res?.data?.cart?.cart_items || [];

    const transformedItems = cartItems.map((item) => ({
      id: item.cart_item_id,
      name: item.product?.name,
      price: item.product?.price,
      qty: item.quantity,
      color_id: item.color_id,
      size_id: item.size_id,
      product: item.product,
    }));

    setItems(transformedItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
  } finally {
    setLoading(false);
  }
};


    fetchCart();
  }, []);


  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const [selectedItems, setSelectedItems] = useState([]);
  const selected = items.filter((it) => selectedItems.includes(it.id));
  const subtotal = selected.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  const total = subtotal * 0.3;

  return (
    <div>
      <Navbar />
      <main className="px-4 md:px-20 py-10">
        <h1 className="text-3xl font-extrabold mb-6">YOUR CART</h1>

        {!isLoggedIn && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 rounded">
            Anda belum login. Silakan login untuk melihat dan mengelola keranjang Anda.
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Keranjang Anda kosong.</p>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-4 border rounded-lg p-4 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(it.id)}
                    onChange={() => {
                      setSelectedItems((prev) =>
                        prev.includes(it.id)
                          ? prev.filter((sid) => sid !== it.id)
                          : [...prev, it.id]
                      );
                    }}
                    className="w-4 h-4 mr-2 accent-black"
                  />

                  <img
                    src={
                      it.product?.image_url
                        ? `${backendURL}${it.product.image_url}`
                        : "https://via.placeholder.com/70x90"
                    }
                    alt={it.product?.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{it.product?.name}</h4>

                    {it.product?.has_variant ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>Size: {it.size_id?.name || "-"}</span>
                        <span>|</span>
                        <span>Color:</span>
                        <span
                          className="inline-block w-4 h-4 rounded-full border"
                          style={{ backgroundColor: it.color_id?.code || "#ccc" }}
                          title={it.color_id?.name || ""}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Tanpa varian</p>
                    )}

                    <p className="mt-1 font-semibold">
                      Rp {it.product?.price?.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQty(it.id, -1)}>
                      <FaMinus />
                    </button>
                    <span>{it.qty}</span>
                    <button onClick={() => updateQty(it.id, 1)}>
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>

            <aside className="border rounded-lg p-6 space-y-4 h-fit shadow-md">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              {selected.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Pilih produk terlebih dahulu untuk melihat total.
                </p>
              ) : (
                <dl className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="font-medium">
                      Rp {subtotal.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Preorder (30%)</dt>
                    <dd className="font-medium text-blue-500">
                      Rp {total.toLocaleString()}
                    </dd>
                  </div>
                  <hr />
                  <div className="flex justify-between text-base font-bold">
                    <dt>Total</dt>
                    <dd>Rp {total.toLocaleString()}</dd>
                  </div>
                </dl>
              )}

              <button
                disabled={selected.length === 0}
                onClick={handleCheckout}
                className={`w-full py-3 rounded-full flex items-center justify-center gap-2 transition ${selected.length > 0
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Go to Checkout
                <FaArrowRight />
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChartPage;
