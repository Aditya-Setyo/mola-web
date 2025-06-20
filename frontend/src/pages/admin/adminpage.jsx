import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import DashboardCard from "../../components/dashboardCard";
import DataTable from "../../components/dataTable";

const AdminPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Dummy Data
    setSummary({ products: 120, users: 85, orders: 42, revenue: "Rp 25.000.000" });
    setProducts([{ id: 1, name: "Serum", price: "Rp 120.000", stock: 20 }]);
    setUsers([{ id: 1, name: "Alisha", email: "alisha@mail.com" }]);
    setOrders([{ id: 1, user: "Alisha", total: "Rp 240.000", status: "Pending" }]);
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
          <DashboardCard label="Revenue" value={summary.revenue} color="bg-purple-500" />
        </div>

        {/* Tables */}
        <DataTable title="🛒 Products" data={products} columns={["id", "name", "price", "stock"]} />
        <DataTable title="👥 Users" data={users} columns={["id", "name", "email"]} />
        <DataTable title="📦 Orders" data={orders} columns={["id", "user", "total", "status"]} />
      </main>
    </div>
  );
};

export default AdminPage;
