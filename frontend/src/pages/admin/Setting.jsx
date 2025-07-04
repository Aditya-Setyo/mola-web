import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useNavigate } from "react-router-dom";
import { FaSave, FaSignOutAlt, FaEdit, FaTimes } from "react-icons/fa";
import { apiGet, apiPost, apiPut } from "../../api";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const Settings = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
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
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validate = () => {
    const errs = {};
    if (!profile.full_name.trim()) errs.full_name = "Nama lengkap wajib diisi.";
    if (!profile.phone.trim()) errs.phone = "Nomor telepon wajib diisi.";
    if (!profile.email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!emailRegex.test(profile.email)) {
      errs.email = "Format email tidak valid.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAll = async () => {
    if (!validate()) return;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-500 animate-pulse">🔄 Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl p-6 md:p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-200">
          <h2 className="text-2xl font-bold mb-6 text-indigo-800 flex items-center gap-2 justify-center">
            👤 Info Profil
          </h2>
          <div className="space-y-3">
            {/* Nama */}
            <div>
              <input
                type="text"
                placeholder="Nama Lengkap"
                className={`w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${
                  errors.full_name ? "border-red-500" : "border-indigo-300"
                }`}
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                readOnly={!isEditing}
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className={`w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${
                  errors.email ? "border-red-500 bg-white text-black" : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                readOnly={!isEditing}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telepon */}
            <div>
              <input
                type="text"
                placeholder="Nomor Telepon"
                className={`w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 ${
                  errors.phone ? "border-red-500" : "border-indigo-300"
                }`}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                readOnly={!isEditing}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
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
                    disabled={!isEditing}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-full text-sm shadow-lg flex items-center gap-2"
                  >
                    <FaSave /> Simpan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      setPassword("");
                      fetchProfile();
                    }}
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
