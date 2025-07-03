import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { apiGet, apiPost, apiDelete } from "../../api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    user_name: "",
    rating: 0,
    review: "",
  });

  const fetchReviews = async () => {
    try {
      const productsRes = await apiGet("/products");
      const products = productsRes?.data?.products || [];

      const allReviews = [];

      for (const product of products) {
        try {
          const res = await apiGet(`/products/review/${product.id}`);
          const productReviews = Array.isArray(res?.data?.reviews)
            ? res.data.reviews
            : [];

          const reviewsWithProductName = productReviews.map((r) => ({
            ...r,
            product_name: product.name || product.product_name || "Tanpa Nama",
          }));


          allReviews.push(...reviewsWithProductName);
        } catch (err) {
          console.warn(` Gagal ambil ulasan untuk produk ${product.id}:`, err);
        }
      }

      setReviews(allReviews);
    } catch (err) {
      console.error(" Gagal ambil produk atau ulasan:", err);
      setReviews([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiGet("/products");
      const productList = response?.data?.products;
      if (Array.isArray(productList)) {
        setProducts(productList);
      } else {
        console.warn("Format produk tidak dikenali:", response);
      }
    } catch (err) {
      console.error("Gagal ambil produk:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (filter === "Semua") setFilteredReviews(reviews);
    else setFilteredReviews(reviews.filter((r) => r.rating === parseInt(filter)));
  }, [filter, reviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus ulasan ini?")) return;
    try {
      await apiDelete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error("Gagal hapus:", err);
    }
  };

  const handleAdd = async () => {
    if (!formData.product_id || !formData.user_name || formData.rating < 1 || formData.rating > 5) {
      alert("Mohon lengkapi semua isian dengan benar.");
      return;
    }

    const url = `http://molla.my.id/api/v1/admin/review/${formData.product_id}`;
    const token = localStorage.getItem("token");

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: formData.user_name,
          rating: formData.rating,
          review  : formData.review ,
        }),
      });

      setShowModal(false);
      setFormData({ product_id: "", user_name: "", rating: 0, review  : "" });
      fetchReviews();
    } catch (err) {
      console.error("Gagal simpan ulasan:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">⭐ Kelola Ulasan</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            >
              <option value="Semua">Semua Rating</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setShowModal(true);
                setFormData({ product_id: "", user_name: "", rating: 0, review  : "" });
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              + Tambah Ulasan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Komentar</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{r.product_name}</td>
                    <td className="px-4 py-2">{r.user_name}</td>
                    <td className="px-4 py-2">{r.rating} ⭐</td>
                    <td className="px-4 py-2">{r.review }</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(r.id)}
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
                    Tidak ada ulasan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Tambah Ulasan</h2>
              <div className="space-y-3">
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value })
                  }
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name || product.product_name || "Produk Tanpa Nama"}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nama Pengguna"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  min={1}
                  max={5}
                  className="w-full border px-3 py-2 rounded"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                />
                <textarea
                  placeholder="Komentar"
                  className="w-full border px-3 py-2 rounded"
                  value={formData.review  }
                  onChange={(e) =>
                    setFormData({ ...formData, review : e.target.value })
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border border-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleAdd}
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

export default Reviews;
