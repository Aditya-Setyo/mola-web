import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet, apiDelete, apiPost, apiPut } from "../../api"; // impor fungsi fetch dari api.js
import { backendURL } from "../../api"; // untuk akses gambar dari backend

const ProductsVariant = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploadType, setUploadType] = useState("file");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [expandedDesc, setExpandedDesc] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: null,
    image_url: "",
    size: "",
    color: "",
    description: "",
    variants: [{ color_id: "", size_id: "", stock: "" }]
  });

  const token = localStorage.getItem("token")?.trim();

  const fetchProducts = async () => {
    try {
      const dataProd = await apiGet("/products");
      setProducts(dataProd?.data?.products || []);
    } catch (err) {
      console.error("Gagal ambil produk:", err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const catData = await apiGet("/categories", { headers: { Authorization: `Bearer ${token}` } });
      const sizeData = await apiGet("/sizes", { headers: { Authorization: `Bearer ${token}` } });
      const colorData = await apiGet("/colors", { headers: { Authorization: `Bearer ${token}` } });

      setCategories(catData?.data?.categories || []);
      setSizes(sizeData?.data?.sizes || []);
      setColors(colorData?.data?.colors || []);
    } catch (err) {
      console.error("Gagal mengambil data master:", err);
    }
  };



  useEffect(() => {
    fetchProducts();
    fetchMasterData();
  }, []);


  const fetchData = async () => {
    try {
      const dataProd = await apiGet("/products");
      const dataCat = await apiGet("/categories");
      const dataSize = await apiGet("/sizes");
      const dataColor = await apiGet("/colors");

      setProducts(dataProd?.data?.products?.filter(p => p.has_variant) || []);
      setCategories(dataCat?.data?.categories || []);
      setSizes(dataSize?.data?.sizes || []);
      setColors(dataColor?.data?.colors || []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };



  const handleAddVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { color_id: "", size_id: "", stock: "" }] });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData({ ...formData, variants: updated });
  };

  const handleRemoveVariant = (index) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      image: null,
      image_url: "",
      size: "",
      color: "",
      description: "",
      variants: [{ color_id: "", size_id: "", stock: "" }],
    });
    setEditId(null);
    setEditMode(false);
    setUploadType("file");
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category_id", formData.category);
    data.append("description", formData.description);
    data.append("has_variant", formData.has_variant); // hanya satu kali dan benar

    // Upload file atau URL
    if (uploadType === "file" && formData.image) {
      data.append("image", formData.image);
    }
    if (uploadType === "url" && formData.image_url) {
      data.append("image_url", formData.image_url);
    }

    // Kondisi produk biasa (tanpa varian)
    if (!formData.has_variant) {
      data.append("stock", formData.stock); //penting untuk produk tanpa varian
    }

    // Kondisi produk varian
    if (formData.has_variant) {
      formData.variants.forEach((variant, index) => {
        data.append(`variants[${index}].color_id`, variant.color_id);
        data.append(`variants[${index}].size_id`, variant.size_id);
        data.append(`variants[${index}].stock`, variant.stock);
      });
    }

    // Endpoint
    const endpoint = editId
      ? `https://molla.my.id/api/v1/admin/products/${editId}`
      : `https://molla.my.id/api/v1/admin/products`;

    try {
      const res = await fetch(endpoint, {
        method: editId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type, FormData akan set otomatis
        },
        body: data,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error ${res.status}: ${errText}`);
      }

      resetForm();
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Gagal simpan produk:", err);
      alert("Gagal simpan produk. Cek konsol untuk detail.");
    }
  };


  const handleEdit = (prod) => {
    setEditId(prod.id);
    setEditMode(true);
    setShowModal(true);
    setUploadType("url"); // diasumsikan ambil image_url saat edit

    setFormData({
      name: prod.name,
      price: prod.price,
      category: prod.category_id,
      image: null,
      image_url: prod.image_url || "",
      description: prod.description || "",
      has_variant: prod.has_variant || false, 
      stock: prod.stock || "",
      variants: prod.variants?.map(v => ({
        color_id: v.color_id,
        size_id: v.size_id,
        stock: v.stock
      })) || [{ color_id: "", size_id: "", stock: "" }]
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">🎨 Produk Varian</h1>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex flex-col w-full md:w-64">
              <input
                type="text"
                placeholder="Cari Nama Produk"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div className="flex flex-col w-full md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="Semua">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-left">Ukuran</th>
                <th className="px-4 py-2 text-left">Warna</th>
                <th className="px-4 py-2 text-left">Stok</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((prod) =>
                  prod.name.toLowerCase().includes(search.toLowerCase()) &&
                  filter === "Semua" || prod.category_id === Number(filter)
                )
                .map((prod) => (
                  <tr key={prod.id} className="border-t">
                    <td className="px-4 py-2">{prod.name}</td>
                    <td className="px-4 py-2">{categories.find(c => c.id === prod.category_id)?.name}</td>
                    <td className="px-4 py-2">
                      {prod.variants?.map((v, i) => {
                        const size = sizes.find(s => s.id === v.size_id)?.name || "-";
                        return <div key={i} className="text-sm">• {size}</div>;
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {prod.variants?.map((v, i) => {
                        const color = colors.find(c => String(c.id) === String(v.color_id));
                        const colorHex = color?.name || "#CCCCCC";
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm mb-1">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: colorHex }}
                              title={colorHex}
                            ></div>
                          </div>
                        );
                      })}
                    </td>
                    <td>
                      {prod.variants && prod.variants.length > 0 ? (
                        prod.variants.map((v, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm mb-1">
                            <span>{v.stock} pcs</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <span>{prod.stock} pcs</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(prod)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs mb-4">Edit</button>
                      <button onClick={() => handleDelete(prod.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-4">Form Produk Varian</h2>
              <div className="space-y-3">
                {/* Pilihan jenis produk */}
                <div className="flex gap-4 text-sm font-medium mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="varian"
                      checked={!formData.has_variant}
                      onChange={() => setFormData({ ...formData, has_variant: false })}
                    />
                    Produk Biasa
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="varian"
                      checked={formData.has_variant}
                      onChange={() => setFormData({ ...formData, has_variant: true })}
                    />
                    Produk Varian
                  </label>
                </div>

                {/* Field untuk Produk Biasa */}
                {!formData.has_variant && (
                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-1">Stok Produk</label>
                    <input
                      type="number"
                      placeholder="Masukkan stok produk"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                )}

                {/* Field untuk Produk Varian */}
                {formData.has_variant && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Daftar Varian</p>
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-2">
                        <select
                          value={v.color_id}
                          onChange={(e) => handleVariantChange(i, "color_id", e.target.value)}
                          className="flex-1 border px-2 py-1 rounded"
                        >
                          <option value="">Pilih Warna</option>
                          {colors.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <select
                          value={v.size_id}
                          onChange={(e) => handleVariantChange(i, "size_id", e.target.value)}
                          className="flex-1 border px-2 py-1 rounded"
                        >
                          <option value="">Pilih Ukuran</option>
                          {sizes.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Stok"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                          className="w-24 border px-2 py-1 rounded"
                        />
                        <button
                          onClick={() => handleRemoveVariant(i)}
                          className="text-red-500 font-bold px-2"
                          title="Hapus varian"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddVariant}
                      className="text-sm text-indigo-600"
                    >
                      + Tambah Varian
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">Simpan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsVariant;
