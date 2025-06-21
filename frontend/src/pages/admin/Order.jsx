import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/orders/show", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data pesanan");
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const updateStatus = async (orderID, newStatus) => {
    try {
      await fetch(
        `http://localhost:8081/api/v1/admin/orders/aproval/${orderID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      fetchOrders(); // refresh data
    } catch (err) {
      console.error("Gagal memperbarui status pesanan:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📦 Daftar Pesanan</h1>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nama Pembeli</th>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.user_name}</td>
                    <td className="px-4 py-2">{order.product_name}</td>
                    <td className="px-4 py-2">{order.quantity}</td>
                    <td className="px-4 py-2">Rp {order.total_price}</td>
                    <td className="px-4 py-2">{order.status}</td>
                    <td className="px-4 py-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border text-sm px-2 py-1 rounded"
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada pesanan ditemukan.
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

export default Orders;
