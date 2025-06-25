import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  FaTrashAlt,
  FaMinus,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

const ChartPage = () => {
  const [items, setItems] = useState([]);
  const [promo, setPromo] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(cart.map((item) => ({ ...item, qty: item.quantity })));
    setLoading(false);
  }, []);

  const updateQty = (id, delta) => {
    setItems((prev) => {
      const updated = prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      );
      localStorage.setItem("cart", JSON.stringify(updated.map(({ qty, ...rest }) => ({ ...rest, quantity: qty }))));
      return updated;
    });
  };

  const removeItem = (id) => {
    const filtered = items.filter((it) => it.id !== id);
    setItems(filtered);
    localStorage.setItem("cart", JSON.stringify(filtered.map(({ qty, ...rest }) => ({ ...rest, quantity: qty }))));
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const preorder = promo === "SPRING20" ? subtotal * 0.3 : 0;
  const total = subtotal * preorder;

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
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Keranjang Anda kosong.</p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 border rounded-lg p-4 shadow-sm"
                  >
                    <img
                      src={it.image_url ? `http://localhost:8081${it.image_url}` : "https://via.placeholder.com/70x90"}
                      alt={it.name}
                      className="w-20 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{it.name}</h4>
                      <p className="text-xs text-gray-500">
                        Size: {it.size} &nbsp;|&nbsp; Color: {it.color}
                      </p>
                      <p className="mt-1 font-semibold">Rp {it.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <button
                        onClick={() => updateQty(it.id, -1)}
                        className="text-sm"
                      >
                        <FaMinus />
                      </button>
                      <span>{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.id, 1)}
                        className="text-sm"
                      >
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
                ))
              )}
            </div>

            <aside className="border rounded-lg p-6 space-y-4 h-fit shadow-md">
              <h3 className="font-semibold text-lg">Order Summary</h3>

              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium">Rp {subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Preorder (30%)</dt>
                  <dd className="font-medium text-red-500">
                    Rp {preorder.toLocaleString()}
                  </dd>
                </div>
                <hr />
                <div className="flex justify-between text-base font-bold">
                  <dt>Total</dt>
                  <dd>Rp {total.toLocaleString()}</dd>
                </div>
              </dl>
              <button
                disabled={items.length === 0}
                className={`w-full py-3 rounded-full flex items-center justify-center gap-2 transition ${items.length > 0
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
