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
    variants: [{ color_id: "", size_id: "", stock: "" }]
  });

  const token = localStorage.getItem("token")?.trim();

  const fetchProducts = async () => {
    try {
      const dataProd = await apiGet("/products");
      setProducts(dataProd?.data?.products?.filter(p => p.has_variant) || []);
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

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category_id", formData.category);
    data.append("description", formData.description);
    data.append("has_variant", true);

    if (uploadType === "file" && formData.image) {
      data.append("image", formData.image);
    }
    if (uploadType === "url") {
      data.append("image_url", formData.image_url);
    }

    formData.variants.forEach((v, i) => {
      data.append(`variants[${i}].color_id`, v.color_id);
      data.append(`variants[${i}].size_id`, v.size_id);
      data.append(`variants[${i}].stock`, v.stock);
    });

    try {
      if (editId) {
        await apiPut(`/admin/products/${editId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await apiPost("/admin/products", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      resetForm();
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Gagal simpan produk:", err);
    }
  };


  const handleEdit = (prod) => {
    setEditId(prod.id);
    setEditMode(true);
    setShowModal(true);
    setUploadType("url"); // diasumsikan default ambil image_url

    setFormData({
      name: prod.name,
      price: prod.price,
      category: prod.category_id,
      image: null,
      image_url: prod.image_url || "",
      description: prod.description || "",
      variants: prod.variants?.map(v => ({
        color_id: v.color_id,
        size_id: v.size_id,
        stock: v.stock
      })) || [{ color_id: "", size_id: "", stock: "" }]
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🧬 Produk Varian</h1>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">+ Tambah Produk Varian</button>
        </div>

        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm">
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
              {products.map((prod) => (
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
                      const colorHex = color?.name || "#CCCCCC"; // hex dari DB
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm mb-1">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                          ></div>
                          <span>{colorHex}</span>
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-4 py-2">{prod.description}</td>
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
                <input placeholder="Nama Produk" className="w-full border px-3 py-2 rounded" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input placeholder="Harga" type="number" className="w-full border px-3 py-2 rounded" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                <textarea placeholder="Deskripsi" className="w-full border px-3 py-2 rounded" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <select className="w-full border px-3 py-2 rounded" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>

                <div className="flex gap-3 text-sm">
                  <label><input type="radio" name="uploadType" checked={uploadType === "file"} onChange={() => setUploadType("file")} /> Upload</label>
                  <label><input type="radio" name="uploadType" checked={uploadType === "url"} onChange={() => setUploadType("url")} /> URL</label>
                </div>
                {uploadType === "file" ? (
                  <>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) {
                          alert("Silakan pilih file gambar!");
                        }
                        setFormData({ ...formData, image: file });
                      }}
                      className="w-full"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="URL Gambar"
                      value={formData.image_url}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({ ...formData, image_url: url });
                        if (!url.trim()) {
                          alert("Silakan isi URL gambar!");
                        }
                      }}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </>
                )}

                <div className="space-y-2">
                  <p className="font-semibold">Varian</p>
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex gap-2">
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
