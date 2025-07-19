import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import DashboardCard from "../../components/dashboardCard";
import DataTable from "../../components/dataTable";
import { apiGet } from "../../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdminPage = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [resProducts, resUsers, resOrders, resSummary] = await Promise.all([
        apiGet("/products", true),
        apiGet("/users", true),
        apiGet("/admin/orders", true),
        apiGet("/admin/sales-report", true),
      ]);

      setProducts(resProducts.data?.products || []);
      setUsers(resUsers.data?.users || []);
      setOrders(resOrders.data?.orders || []);
      setSummary({
        products: resProducts.data?.products?.length || 0,
        users: resUsers.data?.users?.length || 0,
        orders: resOrders.data?.orders?.length || 0,
        revenue: resSummary.data?.total_revenue || 0,
      });
    } catch (err) {
      console.error("❌ Gagal mengambil data dashboard:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginpage");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <DashboardCard label="Products" value={summary.products} color="bg-indigo-500" />
          <DashboardCard label="Users" value={summary.users} color="bg-green-500" />
          <DashboardCard label="Orders" value={summary.orders} color="bg-yellow-500" />
          <DashboardCard
            label="Revenue"
            value={`Rp ${parseInt(summary.revenue).toLocaleString()}`}
            color="bg-purple-500"
          />
        </div>

        {/* Grafik Penjualan */}
        <div className="bg-white p-4 mb-10 rounded shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">📈 Grafik Penjualan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orders.slice(0, 10)}>
              <XAxis dataKey="user_name" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${parseInt(value).toLocaleString()}`} />
              <Bar dataKey="total_paid" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables */}
        <div className="mb-6 overflow-x-auto">
          <DataTable
            title="🛒 Produk Terbaru"
            data={products.slice(0, 5)}
            columns={["id", "name", "price", "stock"]}
          />
        </div>

        <div className="mb-6 overflow-x-auto">
          <DataTable
            title="👥 Pengguna Terbaru"
            data={users.slice(0, 5)}
            columns={["user_id", "name", "email", "phone"]}
          />
        </div>

        <div className="mb-10 overflow-x-auto">
          <DataTable
            title="📦 Order Terakhir"
            data={orders.slice(0, 5)}
            columns={["id", "user_name", "total_amount", "payment_status"]}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
