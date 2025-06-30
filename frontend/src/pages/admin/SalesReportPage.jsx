import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet } from "../../api";

const SalesReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getEndpoint = () => {
    switch (filter) {
      case "today":
        return "/admin/sales-report?today=true";
      case "date":
        return `/admin/sales-report?date=${date}`;
      case "month":
        return `/admin/sales-report?month=${month}`;
      case "range":
        return `/admin/sales-report?start=${startDate}&end=${endDate}`;
      default:
        return "/admin/sales-report";
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await apiGet(getEndpoint());
      const reportList = res?.data?.reports || [];

      const total = reportList.reduce(
        (sum, item) => sum + (item.total_sales || 0),
        0
      );

      setReports(reportList);
      setTotalRevenue(total);
    } catch (err) {
      console.error("Gagal mengambil data penjualan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [filter]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📈 Laporan Penjualan</h1>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-60"
            >
              <option value="all">Semua</option>
              <option value="today">Hari Ini</option>
              <option value="date">Per Tanggal</option>
              <option value="month">Per Bulan</option>
              <option value="range">Rentang Waktu</option>
            </select>

            {filter === "date" && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-60"
              />
            )}

            {filter === "month" && (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-60"
              />
            )}

            {filter === "range" && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full sm:w-60"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full sm:w-60"
                />
              </>
            )}

            <button
              onClick={fetchSalesData}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Terapkan
            </button>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Total Pendapatan</h2>
          <p className="text-2xl text-green-600 font-bold">
            Rp {totalRevenue.toLocaleString()}
          </p>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Total Pesanan</th>
                <th className="px-4 py-3 text-left">Total Penjualan</th>
              </tr>
            </thead>
            <tbody>
              {!loading && reports.length > 0 ? (
                reports.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(item.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2">{item.total_orders}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">
                      Rp {item.total_sales.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
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
