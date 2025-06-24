import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { v4 as uuidv4 } from "uuid";

const Advertisment = () => {
  const [ads, setAds] = useState([]);
  const [category, setCategory] = useState("homepage");
  const [search, setSearch] = useState("");
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token")?.trim();

  const fetchAds = async () => {
    if (!token || !category) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/ads/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAds(Array.isArray(data?.data?.ads) ? data.data.ads : []);
    } catch (err) {
      console.error("Gagal mengambil iklan:", err);
      setAds([]);
    }
  };

  const uploadAd = async () => {
    if (!image || !category) return alert("Kategori dan gambar wajib diisi.");

    const formData = new FormData();
    formData.append("id", uuidv4());
    formData.append("category", category);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:8081/api/v1/admin/ads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (result.meta?.code === 200) {
        alert("Iklan berhasil ditambahkan.");
        setShowModal(false);
        setImage(null);
        fetchAds();
      } else {
        alert("Gagal menambahkan iklan.");
      }
    } catch (err) {
      console.error("Error saat upload iklan:", err);
      alert("Terjadi kesalahan.");
    }
  };

  useEffect(() => {
    fetchAds();
  }, [category]);

  const filteredAds = ads.filter((ad) =>
    ad.image_url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">📢 Kelola Iklan</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Cari iklan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="homepage">Homepage</option>
              <option value="produk">Produk</option>
              <option value="promo">Promo</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              + Tambah Iklan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAds.map((ad, idx) => (
            <div key={idx} className="border rounded shadow overflow-hidden bg-white">
              <img
                src={ad.image_url}
                alt={`Ad ${idx}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-2 text-sm text-center">{ad.category}</div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-full max-w-md shadow">
              <h2 className="text-lg font-semibold mb-4">Tambah Iklan Baru</h2>
              <div className="space-y-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="homepage">Homepage</option>
                  <option value="produk">Produk</option>
                  <option value="promo">Promo</option>
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="border border-gray-400 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={uploadAd}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Advertisment;