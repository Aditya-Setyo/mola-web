// IMPORT & SETUP
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

const colorNameToHex = {
  merah: "#FF0000",
  biru: "#0000FF",
  hijau: "#008000",
  kuning: "#FFFF00",
  putih: "#FFFFFF",
  hitam: "#000000",
  ungu: "#800080",
  pink: "#FFC0CB",
  abu: "#808080",
  coklat: "#8B4513",
  orange: "#FFA500",
};

const MasterData = () => {
  const token = localStorage.getItem("token");

  // STATE
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editSizeId, setEditSizeId] = useState(null);
  const [editColorId, setEditColorId] = useState(null);


  const [editCategoryValues, setEditCategoryValues] = useState({});
  const [editSizeValues, setEditSizeValues] = useState({});
  const [editColorValues, setEditColorValues] = useState({});

  const getEndpoint = (type) => {
    switch (type) {
      case "category": return "categories";
      case "size": return "sizes";
      case "color": return "colors";
      default: return "";
    }
  };


  useEffect(() => {
    const hex = colorNameToHex[newColor.trim().toLowerCase()];
    if (hex) setNewColorCode(hex);
  }, [newColor]);

  const fetchCategories = async () => {
    const res = await apiGet("/categories");
    setCategories(res?.data?.categories || []);
  };

  const fetchSizes = async () => {
    const res = await apiGet("/sizes");
    setSizes(res?.data?.sizes || []);
  };

  const fetchColors = async () => {
    const res = await apiGet("/colors");
    setColors(res?.data?.colors || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchColors();
  }, []);

  // ACTIONS
  const addData = async (type, value) => {
    if (!value.trim()) return alert(`${type} tidak boleh kosong.`);
    const endpoint = `/admin/${getEndpoint(type)}`;

    const payload = type === "color"
      ? { name: value, code: newColorCode }
      : { name: value };

    await apiPost(endpoint, payload);

    if (type === "category") {
      setNewCategory(""); fetchCategories();
    } else if (type === "size") {
      setNewSize(""); fetchSizes();
    } else if (type === "color") {
      setNewColor(""); setNewColorCode("#000000"); fetchColors();
    }
  };


  const updateData = async (type, id, value) => {
    if (!value.trim()) return;
    const endpoint = `/admin/${getEndpoint(type)}/${id}`;
    await apiPut(endpoint, { name: value });

    if (type === "category") { setEditCategoryId(null); fetchCategories(); }
    if (type === "size") { setEditSizeId(null); fetchSizes(); }
    if (type === "color") { setEditColorId(null); fetchColors(); }
  };


  const deleteData = async (type, id) => {
    if (!window.confirm(`Hapus ${type}?`)) return;
    const endpoint = `/admin/${getEndpoint(type)}/${id}`;
    await apiDelete(endpoint);

    if (type === "category") fetchCategories();
    if (type === "size") fetchSizes();
    if (type === "color") fetchColors();
  };

  const renderSection = (title, type, items, newValue, setNewValue, editId, setEditId, editValues, setEditValues) => (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={`Tambah ${title.toLowerCase()}`}
            className="border px-3 py-1 rounded w-full sm:w-auto"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          {type === "color" && (
            <>
              <input
                type="text"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value)}
                className="border px-2 py-1 rounded w-24"
              />
              <input
                type="color"
                value={newColorCode}
                onChange={(e) => setNewColorCode(e.target.value)}
                className="border w-8 h-8 p-1 rounded"
              />
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: newColorCode }}
                title={newColorCode}
              />
            </>
          )}
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
          <li
            key={item.id}
            className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            <div className="font-mono text-sm text-gray-500">ID: {item.id}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {editId === item.id ? (
                <input
                  value={editValues[item.id] ?? item.name}
                  onChange={(e) =>
                    setEditValues({ ...editValues, [item.id]: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full sm:w-auto"
                />
              ) : (
                <>
                  <span>{item.name}</span>
                  {item.code && (
                    <span
                      className="ml-2 w-5 h-5 inline-block border rounded"
                      style={{ backgroundColor: item.code }}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 sm:justify-end">
              {editId === item.id ? (
                <button
                  onClick={() => updateData(type, item.id, editValues[item.id])}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                >
                  Simpan
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditId(item.id);
                    setEditValues({ ...editValues, [item.id]: item.name });
                  }}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteData(type, item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs"
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
        <h1 className="text-2xl font-bold mb-6">📦 Master Data</h1>
        {renderSection("Kategori", "category", categories, newCategory, setNewCategory, editCategoryId, setEditCategoryId, editCategoryValues, setEditCategoryValues)}
        {renderSection("Ukuran", "size", sizes, newSize, setNewSize, editSizeId, setEditSizeId, editSizeValues, setEditSizeValues)}
        {renderSection("Warna", "color", colors, newColor, setNewColor, editColorId, setEditColorId, editColorValues, setEditColorValues)}
      </main>
    </div>
  );
};

export default MasterData;
