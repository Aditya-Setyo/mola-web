// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import { FaSave, FaSignOutAlt, FaMoon, FaBell, FaLanguage, FaTable } from "react-icons/fa";

const Settings = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", email: "" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState(true);
  const [language, setLanguage] = useState("id");
  const [perPage, setPerPage] = useState(10);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/v1/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        email: data.email || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      await fetch("http://localhost:8081/api/v1/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (password) {
        await fetch("http://localhost:8081/api/v1/users/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: profile.id || 1, password }),
        });
        setPassword("");
      }
      alert("Pengaturan berhasil disimpan");
    } catch (err) {
      console.error("Gagal menyimpan pengaturan:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginpage");
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 animate-pulse text-gray-500">Loading pengaturan...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-8 bg-gradient-to-br from-indigo-100 via-white to-purple-100 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700">⚙️ Admin Settings</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
            >
              <FaSave /> Save ALL
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profil */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-md border border-indigo-100">
            <h2 className="text-xl font-bold mb-4 text-indigo-800 border-b pb-2">👤 Info Profil</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Nama Lengkap" className="w-full border border-indigo-200 px-4 py-2 rounded shadow-sm" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              <input type="text" placeholder="Email" className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-500 shadow-sm" value={profile.email} readOnly />
              <input type="text" placeholder="Nomor Telepon" className="w-full border border-indigo-200 px-4 py-2 rounded shadow-sm" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <textarea placeholder="Alamat Lengkap" className="w-full border border-indigo-200 px-4 py-2 rounded shadow-sm" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>
          </div>

          {/* Password */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-md border border-indigo-100">
            <h2 className="text-xl font-bold mb-4 text-indigo-800 border-b pb-2">🔐 Keamanan</h2>
            <input type="password" placeholder="Password Baru" className="w-full border border-indigo-200 px-4 py-2 rounded shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* Preferensi */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-md border border-indigo-100 md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-indigo-800 border-b pb-2">🧩 Preferensi Tampilan</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="accent-indigo-600" />
                <FaMoon className="text-indigo-600" /> Mode Gelap
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={notification} onChange={() => setNotification(!notification)} className="accent-indigo-600" />
                <FaBell className="text-indigo-600" /> Notifikasi Email
              </label>
              <label className="flex items-center gap-3 text-sm">
                <FaLanguage className="text-indigo-600" /> Bahasa:
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border border-indigo-200 px-2 py-1 rounded">
                  <option value="id">🇮🇩 Indonesia</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <FaTable className="text-indigo-600" /> Data per halaman:
                <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border border-indigo-200 px-2 py-1 rounded">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
