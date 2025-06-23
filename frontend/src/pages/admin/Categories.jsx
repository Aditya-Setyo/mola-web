import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const finalData = data?.data?.categories || data || [];
      setCategories(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      console.error("Gagal ambil kategori:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (!token) {
      alert("Sesi berakhir, silakan login kembali.");
      return;
    }
    fetchCategories();
  }, []);

  const addCategory = () => {
    if (!newCategory.trim()) {
      alert("Nama kategori tidak boleh kosong.");
      return;
    }
    fetch("http://localhost:8081/api/v1/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewCategory("");
        setShowModal(false);
        fetchCategories();
      })
      .catch((err) => {
        console.error("Gagal tambah kategori:", err);
        alert("Gagal tambah kategori.");
      });
  };

  const updateCategory = (id) => {
    const newName = editValues[id];
    if (!newName?.trim()) {
      alert("Nama tidak boleh kosong.");
      return;
    }
    fetch(`http://localhost:8081/api/v1/admin/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    })
      .then((res) => res.json())
      .then(() => {
        setEditCategoryId(null);
        setEditValues((prev) => ({ ...prev, [id]: "" }));
        fetchCategories();
      })
      .catch((err) => {
        console.error("Gagal update kategori:", err);
        alert("Gagal update kategori.");
      });
  };

  const deleteCategory = (id) => {
    if (!window.confirm("Yakin hapus kategori ini?")) return;
    fetch(`http://localhost:8081/api/v1/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(() => fetchCategories())
      .catch((err) => {
        console.error("Gagal hapus kategori:", err);
        alert("Gagal hapus kategori.");
      });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold">📂 Kelola Kategori</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              + Tambah
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium border-b w-[10%]">ID</th>
                <th className="px-4 py-3 text-center font-medium border-b w-[50%]">Nama</th>
                <th className="px-4 py-3 text-right font-medium border-b w-[40%]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const id = category._id || category.id;
                  return (
                    <tr key={id} className="border-b hover:bg-gray-50 transition duration-200">
                      <td className="px-4 py-3">{id}</td>
                      <td className="px-4 py-3 text-center">
                        {editCategoryId === id ? (
                          <input
                            type="text"
                            value={editValues[id] ?? category.name}
                            onChange={(e) =>
                              setEditValues({ ...editValues, [id]: e.target.value })
                            }
                            className="border px-3 py-1 rounded w-full text-center"
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {editCategoryId === id ? (
                          <button
                            onClick={() => updateCategory(id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Simpan
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditCategoryId(id);
                              setEditValues({ ...editValues, [id]: category.name });
                            }}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteCategory(id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500 font-medium">
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h2 className="text-lg font-semibold mb-4">Tambah Kategori</h2>
              <input
                type="text"
                placeholder="Nama kategori"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Categories;
