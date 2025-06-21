// src/pages/admin/Wishlist.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("token");

  const fetchWishlist = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil wishlist:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus item ini dari wishlist?")) return;
    try {
      await fetch(`http://localhost:8081/api/v1/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWishlist();
    } catch (err) {
      console.error("Gagal hapus wishlist:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">💖 Daftar Wishlist</h1>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Nama Produk</th>
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.length > 0 ? (
                wishlist.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.product_name}</td>
                    <td className="px-4 py-2">{item.user_name}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    Tidak ada item dalam wishlist.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Wishlist;
