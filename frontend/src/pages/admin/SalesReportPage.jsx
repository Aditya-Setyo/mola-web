import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet } from "../../api";

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const res = await apiGet("/admin/orders"); // Ambil semua pesanan
        const orders = Array.isArray(res) ? res : [];

        // Hitung total pendapatan
        const total = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        setTotalRevenue(total);
        setSales(orders);
      } catch (err) {
        console.error("Gagal mengambil data penjualan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📈 Laporan Penjualan</h1>

        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Total Pendapatan</h2>
          <p className="text-2xl text-green-600 font-bold">
            Rp {totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Nama Pembeli</th>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && sales.length > 0 ? (
                sales.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2">{order.user_name}</td>
                    <td className="px-4 py-2">{order.product_name}</td>
                    <td className="px-4 py-2">{order.quantity}</td>
                    <td className="px-4 py-2">
                      Rp {order.total_price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{order.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    {loading ? "Memuat data..." : "Tidak ada data penjualan."}
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

export default SalesReport;
