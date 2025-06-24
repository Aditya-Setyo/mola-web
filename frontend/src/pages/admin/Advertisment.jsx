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
    if (!token) {
      console.warn("⚠️ Token tidak ditemukan!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/api/v1/ads/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const adsData = Array.isArray(data?.data) ? data.data : [];
      console.log("✅ Ads fetched:", adsData);
      setAds(adsData);
    } catch (err) {
      console.error("❌ Gagal mengambil iklan:", err.message || err);
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
      console.log("🚀 Upload result:", result);

      if (result.meta?.code === 200) {
        alert("✅ Iklan berhasil ditambahkan.");
        setShowModal(false);
        setImage(null);
        fetchAds();
      } else {
        alert(result.meta?.message || "❌ Gagal menambahkan iklan.");
      }
    } catch (err) {
      console.error("❌ Error saat upload:", err.message || err);
      alert("Terjadi kesalahan saat upload.");
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm("Yakin ingin menghapus iklan ini?")) return;

    try {
      const res = await fetch(`http://localhost:8081/api/v1/admin/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log("🗑️ Delete result:", result);

      if (result.meta?.code === 200) {
        alert("✅ Iklan berhasil dihapus.");
        fetchAds();
      } else {
        alert(result.meta?.message || "❌ Gagal menghapus iklan.");
      }
    } catch (err) {
      console.error("❌ Gagal hapus iklan:", err.message || err);
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

        <table className="min-w-full text-sm mb-6">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Gambar</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAds.length > 0 ? (
              filteredAds.map((ad, idx) => (
                <tr key={ad.id || idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img
                      src={
                        ad.image_url?.startsWith("http")
                          ? ad.image_url
                          : `http://localhost:8081${ad.image_url}`
                      }
                      alt={`Ad ${idx}`}
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) =>
                        (e.target.src = "/fallback-image.jpg")
                      }
                    />
                  </td>
                  <td className="px-4 py-2 capitalize">{ad.category}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Tidak ada iklan ditampilkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal Tambah Iklan */}
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
                  Tambah
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
