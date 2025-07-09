import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet, apiDelete, apiPost, apiPut } from "../../api"; // impor fungsi fetch dari api.js
import { backendURL } from "../../api"; // untuk akses gambar dari backend

const Products = () => {
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
    has_variant: true,
    variants: [{ color_id: "", size_id: "", stock: "" }],
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

      setProducts(dataProd?.data?.products || []);
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
      has_variant: true,
      variants: [{ color_id: "", size_id: "", stock: "" }],
    });
    setEditId(null);
    setEditMode(false);
    setUploadType("file");
  };


  const handleSubmit = async () => {
    if (formData.has_variant && formData.variants.length === 0) {
      alert("Tambahkan minimal satu varian!");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category_id", formData.category);
    data.append("description", formData.description);
    data.append("has_variant", formData.has_variant ? "true" : "false");

    // Upload file atau URL
    if (uploadType === "file" && formData.image) {
      data.append("image", formData.image);
    }
    if (uploadType === "url" && formData.image_url) {
      data.append("image_url", formData.image_url);
    }

    if (formData.has_variant) {
    formData.variants.forEach((variant, index) => {
      data.append(`variants[${index}].color_id`, variant.color_id);
      data.append(`variants[${index}].size_id`, variant.size_id);
      data.append(`variants[${index}].stock`, variant.stock);
    });
    } else {
      data.append("stock", formData.stock);
    }

    // Tentukan endpoint
    const endpoint = editId
      ? `https://molla.my.id/api/v1/admin/products/${editId}`
      : `https://molla.my.id/api/v1/admin/products`;

    try {
      const res = await fetch(endpoint, {
        method: editId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN set "Content-Type" untuk FormData!
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
      alert("Gagal simpan produk. Cek konsol.");
    }
  };



  const handleEdit = async (prod) => {
    setEditId(prod.id);
    setEditMode(true);
    setShowModal(true);
    setUploadType("url");

    // Ambil ulang detail lengkap produk dari backend (harus ada endpoint /products/:id)
    const response = await apiGet(`/products/${prod.id}`);
    const fullProd = response?.data?.product;

    setFormData({
      name: fullProd.name,
      price: fullProd.price,
      stock: fullProd.stock || "",
      category: fullProd.category_id,
      image: null,
      image_url: fullProd.image_url || "",
      description: fullProd.description || "",
      has_variant: fullProd.has_variant,
      variants:
        fullProd.variants?.map((v) => ({
        color_id: v.color_id,
        size_id: v.size_id,
          stock: v.stock,
        })) || [],
    });
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await apiDelete(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Gagal hapus produk:", err);
    }
  };




  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold">🧬 Produk</h1>
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Cari Nama Produk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-64"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-48"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full md:w-auto"
          >
            + Tambah Produk Varian
          </button>
        </div>

        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-left">Ukuran</th>
                <th className="px-4 py-2 text-left">Warna</th>
                <th className="px-4 py-2 text-left">Deskripsi</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((prod) =>
                  prod.name.toLowerCase().includes(search.toLowerCase()) &&
                  (filter === "Semua" || prod.category_id === Number(filter))
                )
                .map((prod) => (
                  <tr key={prod.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">{prod.name}</td>
                    <td className="px-4 py-2">{categories.find(c => c.id === prod.category_id)?.name || "-"}</td>
                    <td className="px-4 py-2">
                      {prod.variants?.map((v, i) => (
                        <div key={i} className="text-sm">• {sizes.find(s => s.id === v.size_id)?.name || "-"}</div>
                      ))}
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
                    <td className="px-4 py-2 text-sm max-w-xs truncate" title={prod.description}>{prod.description}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(prod)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs">Edit</button>
                      <button onClick={() => handleDelete(prod.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] space-y-4">
              <h2 className="text-xl font-bold mb-4">Form Produk</h2>

              <div className="space-y-3">
                <input placeholder="Nama Produk" className="w-full border px-3 py-2 rounded" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input placeholder="Harga" type="number" className="w-full border px-3 py-2 rounded" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                <textarea placeholder="Deskripsi" className="w-full border px-3 py-2 rounded" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <select className="w-full border px-3 py-2 rounded" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>

                {/* Upload Type */}
                <div className="flex gap-3 text-sm">
                  <label><input type="radio" name="uploadType" checked={uploadType === "file"} onChange={() => setUploadType("file")} /> Upload</label>
                  <label><input type="radio" name="uploadType" checked={uploadType === "url"} onChange={() => setUploadType("url")} /> URL</label>
                </div>
                {uploadType === "file" ? (
                  <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="w-full" />
                ) : (
                  <input type="text" placeholder="URL Gambar" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full border px-3 py-2 rounded" />
                )}

                {/* Pilihan Varian atau Tidak */}
                <div className="flex gap-4 items-center text-sm">
                  <label><input type="radio" name="variantType" checked={!formData.has_variant} onChange={() => setFormData({ ...formData, has_variant: false, variants: [] })} /> Produk Biasa</label>
                  <label><input type="radio" name="variantType" checked={formData.has_variant} onChange={() => setFormData({ ...formData, has_variant: true, stock: "" })} /> Produk dengan Varian</label>
                </div>

                {/* Jika Produk Biasa → Input stok langsung */}
                {!formData.has_variant && (
                  <input type="number" placeholder="Stok" value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full border px-3 py-2 rounded" />
                )}

                {/* Jika Produk Varian → List Varian */}
                {formData.has_variant && (
                  <div className="space-y-2">
                    <p className="font-semibold">Varian</p>
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex gap-2 flex-wrap">
                        <select value={v.color_id} onChange={(e) => handleVariantChange(i, "color_id", e.target.value)} className="flex-1 border px-2 py-1 rounded">
                          <option value="">Warna</option>
                          {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={v.size_id} onChange={(e) => handleVariantChange(i, "size_id", e.target.value)} className="flex-1 border px-2 py-1 rounded">
                          <option value="">Ukuran</option>
                          {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <input type="number" placeholder="Stok" value={v.stock} onChange={(e) => handleVariantChange(i, "stock", e.target.value)} className="w-24 border px-2 py-1 rounded" />
                        <button onClick={() => handleRemoveVariant(i)} className="text-red-500 font-bold">×</button>
                      </div>
                    ))}
                    <button onClick={handleAddVariant} className="text-sm text-indigo-600">+ Tambah Varian</button>
                  </div>
                )}

                {/* Tombol Aksi */}
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

export default Products;