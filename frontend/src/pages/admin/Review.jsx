import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ product_id: "", user_id: "", rating: 0, comment: "" });
  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil ulasan:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (filter === "Semua") setFilteredReviews(reviews);
    else setFilteredReviews(reviews.filter((r) => r.rating === parseInt(filter)));
  }, [filter, reviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus ulasan ini?")) return;
    try {
      await fetch(`http://localhost:8081/api/v1/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      console.error("Gagal hapus:", err);
    }
  };

  const handleAddOrEdit = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `http://localhost:8081/api/v1/reviews/${editId}` : "http://localhost:8081/api/v1/reviews";
    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ product_id: "", user_id: "", rating: 0, comment: "" });
      setEditMode(false);
      setEditId(null);
      fetchReviews();
    } catch (err) {
      console.error("Gagal simpan ulasan:", err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      product_id: item.product_id,
      user_id: item.user_id,
      rating: item.rating,
      comment: item.comment,
    });
    setEditMode(true);
    setEditId(item.id);
    setShowModal(true);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">⭐ Kelola Ulasan</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            >
              <option value="Semua">Semua Rating</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r} ⭐</option>
              ))}
            </select>
            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setFormData({ product_id: "", user_id: "", rating: 0, comment: "" });
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              + Tambah Ulasan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Komentar</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{r.product_name}</td>
                    <td className="px-4 py-2">{r.user_name}</td>
                    <td className="px-4 py-2">{r.rating} ⭐</td>
                    <td className="px-4 py-2">{r.comment}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline text-sm">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada ulasan ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editMode ? "Edit Ulasan" : "Tambah Ulasan"}
              </h2>
              <div className="space-y-3">
                <input type="text" placeholder="ID Produk" className="w-full border px-3 py-2 rounded"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} />
                <input type="text" placeholder="ID Pengguna" className="w-full border px-3 py-2 rounded"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} />
                <input type="number" placeholder="Rating (1-5)" min={1} max={5} className="w-full border px-3 py-2 rounded"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
                <textarea placeholder="Komentar" className="w-full border px-3 py-2 rounded"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border border-gray-300">Batal</button>
                <button onClick={handleAddOrEdit} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  {editMode ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reviews;
