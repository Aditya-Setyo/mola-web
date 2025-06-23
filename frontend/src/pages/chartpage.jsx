import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
    FaTrashAlt,
    FaMinus,
    FaPlus,
    FaArrowRight,
    FaTag,
} from "react-icons/fa";
import axios from "axios";

const ChartPage = () => {
    const [items, setItems] = useState([]);
    const [promo, setPromo] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
        if (token) {
            fetchCart(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCart = async (token) => {
        try {
            const response = await axios.get("http://localhost:8081/api/v1/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data.items || []);
        } catch (error) {
            console.error("Gagal mengambil keranjang:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQty = (id, delta) => {
        if (!isLoggedIn) return;
        setItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
            )
        );
    };

    const removeItem = (id) =>
        setItems((prev) => prev.filter((it) => it.id !== id));

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = promo === "SPRING20" ? subtotal * 0.2 : 0;
    const delivery = 15;
    const total = subtotal - discount + delivery;

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
                        {/* CART LIST */}
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
                                            src={it.img || "https://via.placeholder.com/70x90"}
                                            alt={it.name}
                                            className="w-20 h-24 object-cover rounded"
                                        />

                                        <div className="flex-1">
                                            <h4 className="font-semibold">{it.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                Size: {it.size} &nbsp;|&nbsp; Color: {it.color}
                                            </p>
                                            <p className="mt-1 font-semibold">${it.price}</p>
                                        </div>

                                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                            <button
                                                onClick={() => updateQty(it.id, -1)}
                                                disabled={!isLoggedIn}
                                                className={!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{it.qty}</span>
                                            <button
                                                onClick={() => updateQty(it.id, 1)}
                                                disabled={!isLoggedIn}
                                                className={!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}
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

                        {/* ORDER SUMMARY */}
                        <aside className="border rounded-lg p-6 space-y-4 h-fit shadow-md">
                            <h3 className="font-semibold text-lg">Order Summary</h3>

                            <dl className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <dt>Subtotal</dt>
                                    <dd className="font-medium">${subtotal}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Discount (-20%)</dt>
                                    <dd className="font-medium text-red-500">
                                        −${discount.toFixed(0)}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Delivery Fee</dt>
                                    <dd className="font-medium">${delivery}</dd>
                                </div>
                                <hr />
                                <div className="flex justify-between text-base font-bold">
                                    <dt>Total</dt>
                                    <dd>${total}</dd>
                                </div>
                            </dl>

                            {/* Promo code */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Add promo code"
                                        value={promo}
                                        onChange={(e) => setPromo(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-full bg-gray-100 text-sm focus:outline-none"
                                        disabled={!isLoggedIn}
                                    />
                                </div>
                                <button
                                    className="bg-black text-white px-4 rounded-full text-sm"
                                    disabled={!isLoggedIn}
                                >
                                    Apply
                                </button>
                            </div>

                            {/* Checkout */}
                            <button
                                disabled={!isLoggedIn || items.length === 0}
                                className={`w-full py-3 rounded-full flex items-center justify-center gap-2 transition ${isLoggedIn && items.length > 0
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
