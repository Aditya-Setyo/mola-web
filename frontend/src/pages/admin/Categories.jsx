import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const token = localStorage.getItem("token");

  const getCategories = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gagal fetch kategori: ${res.status} - ${text}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn("Data kategori bukan array:", data);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  const addCategory = async () => {
    try {
      await fetch("http://localhost:8081/api/v1/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });
      setNewCategory("");
      getCategories();
    } catch (err) {
      console.error("Gagal menambah kategori:", err);
    }
  };

  const updateCategory = async () => {
    try {
      await fetch(
        `http://localhost:8081/api/v1/admin/categories/${editCategoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editCategoryName }),
        }
      );
      setEditCategoryId(null);
      setEditCategoryName("");
      getCategories();
    } catch (err) {
      console.error("Gagal mengupdate kategori:", err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await fetch(`http://localhost:8081/api/v1/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      getCategories();
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">📂 Kelola Kategori</h1>

        {/* Form tambah kategori */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nama kategori baru"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-1/3"
          />
          <button
            onClick={addCategory}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Tambah
          </button>
        </div>

        {/* Tabel kategori */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{category.id}</td>
                    <td className="px-4 py-2">
                      {editCategoryId === category.id ? (
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="border px-2 py-1 rounded"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {editCategoryId === category.id ? (
                        <button
                          onClick={updateCategory}
                          className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Simpan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditCategoryId(category.id);
                            setEditCategoryName(category.name);
                          }}
                          className="text-sm bg-yellow-400 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    Tidak ada kategori tersedia.
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

export default Categories;
