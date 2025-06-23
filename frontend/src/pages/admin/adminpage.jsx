// src/pages/admin/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import DashboardCard from "../../components/dashboardCard";
import DataTable from "../../components/dataTable";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdminPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [summary, setSummary] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [resProducts, resUsers, resOrders, resSummary] = await Promise.all([
        fetch("http://localhost:8081/api/v1/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8081/api/v1/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8081/api/v1/orders/show", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8081/api/v1/sales-report", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataProducts = await resProducts.json();
      const dataUsers = await resUsers.json();
      const dataOrders = await resOrders.json();
      const dataSummary = await resSummary.json();

      setProducts(dataProducts.data?.products || []);
      setUsers(dataUsers.data?.users || []);
      setOrders(dataOrders.data?.orders || []);
      setSummary({
        products: dataProducts.data?.products?.length || 0,
        users: dataUsers.data?.users?.length || 0,
        orders: dataOrders.data?.orders?.length || 0,
        revenue: dataSummary.total_revenue || 0,
      });
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
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
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <DashboardCard label="Products" value={summary.products} color="bg-indigo-500" />
          <DashboardCard label="Users" value={summary.users} color="bg-green-500" />
          <DashboardCard label="Orders" value={summary.orders} color="bg-yellow-500" />
          <DashboardCard label="Revenue" value={`Rp ${parseInt(summary.revenue).toLocaleString()}`} color="bg-purple-500" />
        </div>

        {/* Grafik Penjualan */}
        <div className="bg-white p-4 mb-10 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📈 Grafik Penjualan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orders.slice(0, 10)}>
              <XAxis dataKey="id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tables */}
        <DataTable title="🛒 Produk Terbaru" data={products.slice(0, 5)} columns={["id", "name", "price", "stock"]} />
        <DataTable title="👥 Pengguna Terbaru" data={users.slice(0, 5)} columns={["user_id", "name", "email", "phone"]}/>

        <DataTable title="📦 Order Terakhir" data={orders.slice(0, 5)} columns={["id", "user", "total", "status"]} />
      </main>
    </div>
  );
};

export default AdminPage;
