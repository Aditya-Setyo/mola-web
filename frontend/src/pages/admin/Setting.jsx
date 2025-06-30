import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import { FaSave, FaSignOutAlt, FaEdit, FaTimes } from "react-icons/fa";
import { apiGet, apiPost, apiPut } from "../../api"; // gunakan helper

const Settings = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await apiGet("/users/profile");
      const user = data?.data?.user || data;
      setProfile({
        full_name: user.full_name || user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      await apiPost("/users/profile", profile);
      if (password) {
        await apiPut("/users/password", { id: profile.id || 1, password });
        setPassword("");
      }
      alert("🎉 Pengaturan berhasil disimpan!");
      setIsEditing(false);
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-500 animate-pulse">🔄 Memuat pengaturan...</div>
      </div>
    );

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl p-6 md:p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-200">
          <h2 className="text-2xl font-bold mb-6 text-indigo-800 flex items-center gap-2 text-center justify-center">
            👤 Info Profil
          </h2>
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full border border-indigo-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              readOnly={!isEditing}
            />
            <input
              type="text"
              placeholder="Email"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-100 text-gray-500 shadow-sm"
              value={profile.email}
              readOnly
            />
            <input
              type="text"
              placeholder="Nomor Telepon"
              className="w-full border border-indigo-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              readOnly={!isEditing}
            />
            {isEditing && (
              <input
                type="password"
                placeholder="Ubah Password (opsional)"
                className="w-full border border-indigo-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <div className="flex gap-2 mt-4 justify-center">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveAll}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
                  >
                    <FaSave /> Simpan
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
                  >
                    <FaTimes /> Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
                >
                  <FaEdit /> Edit Profil
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

};

export default Settings;
