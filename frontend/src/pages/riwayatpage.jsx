import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { apiGet } from "../api";

const RiwayatPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const res = await apiGet("/orders/show", true);
            if (Array.isArray(res?.data?.order)) {
                setOrders(res.data.order);
            } else {
                console.warn("Data tidak berbentuk array:", res.data);
                setOrders([]);
            }
        } catch (err) {
            console.error("Gagal mengambil riwayat pesanan:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-grow p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">🧾 Riwayat Pesanan</h1>

                {loading ? (
                    <p className="text-gray-500">Memuat data...</p>
                ) : orders.length === 0 ? (
                    <p className="text-gray-500">Belum ada riwayat pesanan.</p>
                ) : (
                    <>
                        {/* Tabel untuk Desktop */}
                        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Kode Pesanan</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-2">{order.order_code}</td>
                                            <td className="px-4 py-2 capitalize">{order.payment_status}</td>
                                            <td className="px-4 py-2">Rp {order.total_amount.toLocaleString()}</td>
                                            <td className="px-4 py-2">
                                                <ul className="space-y-1">
                                                    {order.order_items?.map((item, i) => (
                                                        <li key={i}>{item.product?.name}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-4 py-2">
                                                <ul className="space-y-1">
                                                    {order.order_items?.map((item, i) => (
                                                        <li key={i}>{item.quantity}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Card View for Mobile */}
                        <div className="md:hidden flex flex-col gap-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-lg shadow p-4">
                                    <h2 className="font-semibold text-lg mb-2">{order.order_code}</h2>
                                    <p className="text-sm text-gray-600 mb-1">Status: <span className="capitalize">{order.payment_status}</span></p>
                                    <p className="text-sm text-gray-600 mb-1">Total: Rp {order.total_amount.toLocaleString()}</p>
                                    <div className="text-sm text-gray-700 mt-2">
                                        {order.order_items?.map((item, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span>{item.product?.name}</span>
                                                <span>x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default RiwayatPage;
