// ✅ FINAL FIXED Products.jsx — Filter, Edit, Tambah ✅

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploadType, setUploadType] = useState("file");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

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
  });

  const token = localStorage.getItem("token")?.trim();

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/api/v1/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("🔥 Produk:", data);
      setProducts(Array.isArray(data?.data?.products) ? data.data.products : []);
    } catch (err) {
      console.error("Gagal ambil produk:", err);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/api/v1/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("📂 Kategori:", data);
      if (data.meta?.code === 401) {
        alert("Sesi habis. Silakan login ulang.");
        localStorage.removeItem("token");
        window.location.href = "/loginpage";
        return;
      }
      setCategories(Array.isArray(data?.data?.categories) ? data.data.categories : []);
    } catch (err) {
      console.error("Gagal ambil kategori:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
    });
    setUploadType("file");
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || "",
      price: item.price || "",
      stock: item.stock || "",
      category: item.category_id?.toString() || "",
      image: null,
      image_url: item.image_url || "",
      size: item.size || "",
      color: item.color || "",
      description: item.description || "",
    });
    setEditMode(true);
    setEditId(item.id);
    setUploadType(item.image_url ? "url" : "file");
    setShowModal(true);
  };

  const handleAddOrUpdateProduct = () => {
    const { name, price, stock, category, image, image_url, size, color, description } = formData;
    if (!name || !price || !stock || !category || (uploadType === "file" && !image) || (uploadType === "url" && !image_url)) {
      alert("Lengkapi semua data produk!");
      return;
    }

    const data = new FormData();
    data.append("name", name);
    data.append("price", price);
    data.append("stock", stock);
    data.append("category_id", Number(category));

    const selectedCat = categories.find(c => c.id === Number(category));
    if (selectedCat?.name === "Pakaian") {
      data.append("size_id", size);
      data.append("color_id", color);
      data.append("description", description);
    }

    if (uploadType === "file") data.append("image", image);
    else data.append("image_url", image_url);

    const endpoint = editMode
      ? `http://localhost:8081/api/v1/admin/products/${editId}`
      : "http://localhost:8081/api/v1/admin/products";

    fetch(endpoint, {
      method: editMode ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
      .then((res) => res.json())
      .then(() => {
        fetchProducts();
        alert(editMode ? "Produk diperbarui." : "Produk ditambahkan.");
        setShowModal(false);
        resetForm();
      })
      .catch((err) => {
        console.error("Gagal simpan produk:", err);
        alert("Gagal menyimpan produk.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Yakin hapus produk ini?")) return;
    fetch(`http://localhost:8081/api/v1/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(() => {
        alert("Produk dihapus.");
        fetchProducts();
      })
      .catch(err => {
        console.error("Gagal hapus produk:", err);
        alert("Gagal menghapus produk.");
      });
  };

  const filteredProducts = products
    .filter(p => {
      if (filter === "Semua") return true;
      return p.category_id === Number(filter);
    })
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">🛍️ Kelola Produk</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowModal(true); resetForm(); }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >+ Tambah Produk</button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Harga</th>
                <th className="px-4 py-3 text-left">Stok</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const cat = categories.find(c => c.id === item.category_id);
                        return cat?.name || "(Kategori tidak ditemukan)";
                      })()}
                    </td>
                    <td className="px-4 py-2">Rp {item.price?.toLocaleString()}</td>
                    <td className="px-4 py-2">{item.stock}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(item)} className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded text-xs">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada produk ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* MODAL FORM TAMBAH / EDIT */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white w-full max-w-md p-6 rounded shadow overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold mb-4">{editMode ? "Edit Produk" : "Tambah Produk"}</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama Produk"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Stok"
                    className="w-full border px-3 py-2 rounded"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  {categories.find(c => c.id === Number(formData.category))?.name === "Pakaian" && (
                    <>
                      <input
                        type="text"
                        placeholder="Ukuran"
                        className="w-full border px-3 py-2 rounded"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Warna"
                        className="w-full border px-3 py-2 rounded"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                      <textarea
                        placeholder="Deskripsi"
                        className="w-full border px-3 py-2 rounded"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </>
                  )}

                  <div className="flex gap-3 text-sm">
                    <label>
                      <input
                        type="radio"
                        name="uploadType"
                        value="file"
                        checked={uploadType === "file"}
                        onChange={() => setUploadType("file")}
                      /> Upload
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="uploadType"
                        value="url"
                        checked={uploadType === "url"}
                        onChange={() => setUploadType("url")}
                      /> Link Gambar
                    </label>
                  </div>

                  {uploadType === "file" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="w-full border px-3 py-2 rounded"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border px-3 py-2 rounded"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2 rounded border border-gray-300"
                  >Batal</button>
                  <button
                    onClick={handleAddOrUpdateProduct}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >{editMode ? "Simpan Perubahan" : "Tambah"}</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Products;
