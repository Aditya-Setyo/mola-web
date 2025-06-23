// IMPORT & SETUP
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";

const colorNameToHex = {
  merah: "#FF0000",
  biru: "#0000FF",
  "biru langit": "#00BFFF",
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
  const [discounts, setDiscounts] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");
  const [newDiscount, setNewDiscount] = useState("");

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editSizeId, setEditSizeId] = useState(null);
  const [editColorId, setEditColorId] = useState(null);
  const [editDiscountId, setEditDiscountId] = useState(null);


  const [editCategoryValues, setEditCategoryValues] = useState({});
  const [editSizeValues, setEditSizeValues] = useState({});
  const [editColorValues, setEditColorValues] = useState({});
  const [editDiscountValues, setEditDiscountValues] = useState({});

  useEffect(() => {
    const hex = colorNameToHex[newColor.trim().toLowerCase()];
    if (hex) setNewColorCode(hex);
  }, [newColor]);

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8081/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data?.data?.categories || []);
  };

  const fetchSizes = async () => {
    const res = await fetch("http://localhost:8081/api/v1/sizes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSizes(data?.data?.sizes || []);
  };

  const fetchColors = async () => {
    const res = await fetch("http://localhost:8081/api/v1/colors", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setColors(data?.data?.colors || []);
  };

  const fetchDiscounts = async () => {
    const res = await fetch("http://localhost:8081/api/v1/discounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDiscounts(data?.data?.discounts || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchColors();
    fetchDiscounts();
  }, []);

  // ACTIONS
  const addData = async (type, value) => {
    if (!value.trim()) return alert(`${type} tidak boleh kosong.`);
    const url = `http://localhost:8081/api/v1/admin/${type}s`;

    let payload = type === "color"
      ? { name: value, code: newColorCode }
      : { name: value };

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (type === "category") {
      setNewCategory(""); fetchCategories();
    } else if (type === "size") {
      setNewSize(""); fetchSizes();
    } else if (type === "color") {
      setNewColor(""); setNewColorCode("#000000"); fetchColors();
    } else if (type === "discount") {
      setNewDiscount(""); fetchDiscounts();
    } 
  };

  const updateData = async (type, id, value) => {
    if (!value.trim()) return;
    const url = `http://localhost:8081/api/v1/admin/${type}s/${id}`;
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: value }),
    });

    if (type === "category") { setEditCategoryId(null); fetchCategories(); }
    if (type === "size") { setEditSizeId(null); fetchSizes(); }
    if (type === "color") { setEditColorId(null); fetchColors(); }
    if (type === "discount") { setEditDiscountId(null); fetchDiscounts(); }
    if (type === "shipment") { setEditShipmentId(null); fetchShipments(); }
  };

  const deleteData = async (type, id) => {
    if (!window.confirm(`Hapus ${type}?`)) return;
    const url = `http://localhost:8081/api/v1/admin/${type}s/${id}`;
    await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (type === "category") fetchCategories();
    if (type === "size") fetchSizes();
    if (type === "color") fetchColors();
    if (type === "discount") fetchDiscounts();
    if (type === "shipment") fetchShipments();
  };


  const renderSection = (title, type, items, newValue, setNewValue, editId, setEditId, editValues, setEditValues) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={`Tambah ${title.toLowerCase()}`}
            className="border px-3 py-1 rounded"
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
          <li key={item.id} className="p-3 flex justify-between items-center">
            <div className="w-1/3 font-mono text-sm text-gray-500">ID: {item.id}</div>
            <div className="w-1/3 flex items-center gap-2">
              {editId === item.id ? (
                <input
                  value={editValues[item.id] ?? item.name}
                  onChange={(e) => setEditValues({ ...editValues, [item.id]: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                />
              ) : (
                <>
                  <span>{item.name}</span>
                  {item.code && (
                    <span className="ml-2 w-5 h-5 inline-block border rounded" style={{ backgroundColor: item.code }} />
                  )}
                </>
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
        <h1 className="text-2xl font-bold mb-6">📦 Master Data</h1>
        {renderSection("Kategori", "category", categories, newCategory, setNewCategory, editCategoryId, setEditCategoryId, editCategoryValues, setEditCategoryValues)}
        {renderSection("Ukuran", "size", sizes, newSize, setNewSize, editSizeId, setEditSizeId, editSizeValues, setEditSizeValues)}
        {renderSection("Warna", "color", colors, newColor, setNewColor, editColorId, setEditColorId, editColorValues, setEditColorValues)}
        {renderSection("Diskon", "discount", discounts, newDiscount, setNewDiscount, editDiscountId, setEditDiscountId, editDiscountValues, setEditDiscountValues)}
      </main>
    </div>
  );
};

export default MasterData;
