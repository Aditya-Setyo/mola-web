// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";

const Settings = () => {
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await fetch("http://localhost:8081/api/v1/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      alert("Profil berhasil diperbarui");
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">⚙️ Pengaturan Akun</h1>
        <div className="bg-white p-6 rounded shadow max-w-xl">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full border px-3 py-2 rounded"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nomor Telepon"
              className="w-full border px-3 py-2 rounded"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <textarea
              placeholder="Alamat Lengkap"
              className="w-full border px-3 py-2 rounded"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
          <button
            onClick={handleUpdate}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Simpan Perubahan
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
