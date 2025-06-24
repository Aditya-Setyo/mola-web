import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Shipment = () => {
  const [shipments, setShipments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const token = localStorage.getItem("token");

  const fetchShipments = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/orders/paid", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShipments(Array.isArray(data?.data?.shipments) ? data.data.shipments : []);
    } catch (err) {
      console.error("Gagal mengambil data pengiriman:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data pengiriman ini?")) return;
    try {
      await fetch(`http://localhost:8081/api/v1/admin/shipments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchShipments();
    } catch (err) {
      console.error("Gagal menghapus pengiriman:", err);
    }
  };

  const handleUpdate = async (id) => {
    const newResi = editValues[id]?.resi;
    if (!newResi || newResi.trim() === "") return alert("Resi tidak boleh kosong.");
    try {
      await fetch(`http://localhost:8081/api/v1/admin/shipments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resi: newResi }),
      });
      setEditId(null);
      fetchShipments();
    } catch (err) {
      console.error("Gagal update resi:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">🚚 Data Pengiriman</h1>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Pesanan</th>
                <th className="px-4 py-3 text-left">Resi</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length > 0 ? (
                shipments.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.id}</td>
                    <td className="px-4 py-2">{item.user_name}</td>
                    <td className="px-4 py-2">{item.order_name}</td>
                    <td className="px-4 py-2">
                      {editId === item.id ? (
                        <input
                          type="text"
                          value={editValues[item.id]?.resi || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [item.id]: { ...editValues[item.id], resi: e.target.value },
                            })
                          }
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        item.resi || "-"
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {editId === item.id ? (
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Simpan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditId(item.id);
                            setEditValues({
                              ...editValues,
                              [item.id]: { resi: item.resi || "" },
                            });
                          }}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Tidak ada data pengiriman.
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

export default Shipment;
