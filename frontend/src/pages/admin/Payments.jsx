// src/pages/admin/Payments.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data pembayaran:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">💳 Riwayat Pembayaran</h1>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID Transaksi</th>
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.transaction_id}</td>
                    <td className="px-4 py-2">{item.user_name}</td>
                    <td className="px-4 py-2">Rp {item.total?.toLocaleString()}</td>
                    <td className="px-4 py-2">{item.method}</td>
                    <td className="px-4 py-2">{item.status}</td>
                    <td className="px-4 py-2">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Tidak ada transaksi pembayaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Payments;
