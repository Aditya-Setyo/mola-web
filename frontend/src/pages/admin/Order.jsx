import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet, apiPut } from "../../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await apiGet("/admin/orders"); // panggil endpoint
      console.log(" Full response:", res); // Lihat seluruh respons

      const orderList = res?.data?.orders || [];
      console.log(" Orders loaded:", orderList); // Debug hasil final

      setOrders(orderList);
    } catch (err) {
      console.error(" Gagal mengambil pesanan:", err.message);
    }
  };



  const updateStatus = async (orderID, newStatus) => {
    try {
      await apiPut(`/admin/orders/aproval/${orderID}`, { status: newStatus });
      fetchOrders(); // refresh
    } catch (err) {
      console.error("Gagal mengubah status pesanan:", err);
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
                <th className="px-4 py-3 text-left">Order Code</th>
                <th className="px-4 py-3 text-left">Pembeli</th>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Total Harga</th>
                <th className="px-4 py-3 text-left">Total Bayar (30%)</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{order.order_code}</td>
                    <td className="px-4 py-2">{order.user_name}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        {order.order_items.map((item, index) => (
                          <span key={index}>{item.product.name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        {order.order_items.map((item, index) => (
                          <span key={index}>{item.quantity}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">Rp {order.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-2">Rp {order.total_paid.toLocaleString()}</td>
                    <td className="px-4 py-2">{order.payment_status}</td>
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
