import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";

const MasterData = () => {
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editSizeId, setEditSizeId] = useState(null);
  const [editColorId, setEditColorId] = useState(null);

  const [editCategoryValues, setEditCategoryValues] = useState({});
  const [editSizeValues, setEditSizeValues] = useState({});
  const [editColorValues, setEditColorValues] = useState({});

  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data?.data?.categories || []);
    } catch (err) {
      console.error("Gagal ambil kategori:", err);
      setCategories([]);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/sizes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSizes(data?.data?.sizes || []);
    } catch (err) {
      console.error("Gagal ambil ukuran:", err);
      setSizes([]);
    }
  };

  const fetchColors = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/colors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setColors(data?.data?.colors || []);
    } catch (err) {
      console.error("Gagal ambil warna:", err);
      setColors([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchColors();
  }, []);

  const addData = async (type, value) => {
    if (!value.trim()) return alert(`${type} tidak boleh kosong.`);
    const url = `http://localhost:8081/api/v1/admin/${type}s`;
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: value }),
      });
      if (type === "category") {
        setNewCategory("");
        fetchCategories();
      } else if (type === "size") {
        setNewSize("");
        fetchSizes();
      } else if (type === "color") {
        setNewColor("");
        fetchColors();
      }
    } catch (err) {
      alert(`Gagal menambah ${type}.`);
    }
  };

  const updateData = async (type, id, value) => {
    if (!value.trim()) return alert(`${type} tidak boleh kosong.`);
    const url = `http://localhost:8081/api/v1/admin/${type}s/${id}`;
    try {
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: value }),
      });
      if (type === "category") {
        setEditCategoryId(null);
        fetchCategories();
      } else if (type === "size") {
        setEditSizeId(null);
        fetchSizes();
      } else if (type === "color") {
        setEditColorId(null);
        fetchColors();
      }
    } catch (err) {
      alert(`Gagal update ${type}.`);
    }
  };

  const deleteData = async (type, id) => {
    if (!window.confirm(`Hapus ${type} ini?`)) return;
    const url = `http://localhost:8081/api/v1/admin/${type}s/${id}`;
    try {
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (type === "category") fetchCategories();
      if (type === "size") fetchSizes();
      if (type === "color") fetchColors();
    } catch (err) {
      alert(`Gagal hapus ${type}.`);
    }
  };

  const renderSection = (title, type, items, newValue, setNewValue, editId, setEditId, editValues, setEditValues) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Tambah ${title.toLowerCase()}`}
            className="border px-3 py-1 rounded"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            onClick={() => addData(type, newValue)}
            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
          >
            Tambah
          </button>
        </div>
      </div>
      <ul className="bg-white shadow rounded divide-y">
        {items.map((item) => (
          <li key={item.id} className="p-3 flex justify-between items-center">
            <div className="w-1/3 font-mono text-sm text-gray-500">ID: {item.id}</div>
            <div className="w-1/3">
              {editId === item.id ? (
                <input
                  value={editValues[item.id] ?? item.name}
                  onChange={(e) => setEditValues({ ...editValues, [item.id]: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <span>{item.name}</span>
              )}
            </div>
            <div className="space-x-2 w-1/3 text-right">
              {editId === item.id ? (
                <button
                  onClick={() => updateData(type, item.id, editValues[item.id])}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Simpan
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditId(item.id);
                    setEditValues({ ...editValues, [item.id]: item.name });
                  }}
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteData(type, item.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📦 Master Kategori, Ukuran & Warna</h1>
        {renderSection("Kategori", "category", categories, newCategory, setNewCategory, editCategoryId, setEditCategoryId, editCategoryValues, setEditCategoryValues)}
        {renderSection("Ukuran", "size", sizes, newSize, setNewSize, editSizeId, setEditSizeId, editSizeValues, setEditSizeValues)}
        {renderSection("Warna", "color", colors, newColor, setNewColor, editColorId, setEditColorId, editColorValues, setEditColorValues)}
      </main>
    </div>
  );
};

export default MasterData;