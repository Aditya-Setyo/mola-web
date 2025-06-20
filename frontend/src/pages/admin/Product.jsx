import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Serum Wajah", price: 120000, stock: 30, category: "Skincare" },
    { id: 2, name: "Kalung Silver", price: 75000, stock: 15, category: "Aksesoris" },
    { id: 3, name: "Kaos Oversize", price: 95000, stock: 25, category: "Pakaian" },
  ]);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", category: "" });
  const [editId, setEditId] = useState(null);

  const handleAddEdit = () => {
    const { name, price, stock, category } = formData;
    if (!name || !price || !stock || !category) {
      alert("Lengkapi semua data produk!");
      return;
    }

    if (isEditing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...formData, price: +price, stock: +stock } : p))
      );
      alert("Produk berhasil diubah.");
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        price: +price,
        stock: +stock,
        category,
      };
      setProducts((prev) => [...prev, newProduct]);
      alert("Produk berhasil ditambahkan.");
    }

    setShowModal(false);
    setFormData({ name: "", price: "", stock: "", category: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Hapus produk ini?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products
    .filter((p) => (filter === "Semua" ? true : p.category === filter))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

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
            <option value="Skincare">Skincare</option>
            <option value="Aksesoris">Aksesoris</option>
            <option value="Pakaian">Pakaian</option>
          </select>
          <button
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
              setFormData({ name: "", price: "", stock: "", category: "" });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Nama Produk</th>
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
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">Rp {item.price.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.stock}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Produk" : "Tambah Produk"}
            </h2>
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
                <option value="">Pilih Kategori</option>
                <option value="Skincare">Skincare</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Pakaian">Pakaian</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleAddEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {isEditing ? "Simpan Perubahan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

    </div>
  );
};

export default Products;
