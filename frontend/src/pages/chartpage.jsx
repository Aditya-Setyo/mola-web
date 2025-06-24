import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  FaMinus,
  FaPlus,
  FaTrashAlt,
  FaArrowRight,
} from "react-icons/fa";

const ChartPage = () => {
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null); // ✅ Simpan cartId
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return setLoading(false);
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/carts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Gagal ambil keranjang:", errData);
        return;
      }

      const data = await res.json();
      console.log("Cart data:", data);

      setCartId(data.data?.cart?.cart_id || null);
      setItems(data.data?.cart?.cart_items || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (item, newQty) => {
    if (newQty < 1 || !cartId) return;

    try {
      await fetch(`http://localhost:8081/api/v1/carts/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_item_id: item.cart_item_id,
          cart_id: cartId,
          product_id: item.product.id,
          quantity: newQty,
          note: item.note,
        }),
      });

      fetchCart();
    } catch (err) {
      console.error("Update qty gagal:", err);
    }
  };

  const deleteItem = async (cartItemId) => {
    try {
      await fetch(`http://localhost:8081/api/v1/carts/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
    } catch (err) {
      console.error("Gagal hapus item:", err);
    }
  };

  const toggleSelect = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const selectedList = items.filter((it) => selectedItems.includes(it.cart_item_id));
  const subtotal = selectedList.reduce(
    (s, it) => s + (it.product?.price || 0) * it.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <main className="px-4 md:px-20 py-10">
        <h1 className="text-3xl font-bold mb-6">🛒 Keranjang Belanja</h1>

        {loading ? (
          <p>Memuat...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Keranjang kosong.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-center gap-4 border p-4 rounded-lg shadow"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.cart_item_id)}
                    onChange={() => toggleSelect(item.cart_item_id)}
                    className="accent-black w-5 h-5"
                  />
                  <img
                    src={
                      item.product?.image_url
                        ? `http://localhost:8081${item.product.image_url}`
                        : "https://via.placeholder.com/70x90"
                    }
                    alt={item.product?.name}
                    className="w-20 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Size: {item.product?.size || "-"} | Color:{" "}
                      {item.product?.color || "-"}
                    </p>
                    <p className="font-bold text-black">
                      Rp {item.product?.price?.toLocaleString() || "0"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item, item.quantity - 1)}
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item, item.quantity + 1)}
                        className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.cart_item_id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>

            <aside className="border rounded-lg p-6 shadow space-y-4 bg-white">
              <h2 className="font-bold text-xl">Order Summary</h2>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Preorder (30%)</span>
                <span className="text-blue-500">Rp {(subtotal * 0.3).toLocaleString()}</span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total to Pay</span>
                <span>Rp {(subtotal * 0.3).toLocaleString()}</span>
              </div>

              <button
                disabled={selectedItems.length === 0}
                className={`w-full py-3 rounded-full text-white font-semibold flex items-center justify-center gap-2 ${selectedItems.length ? "bg-black hover:bg-gray-900" : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Go to Checkout → <FaArrowRight />
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ChartPage;
