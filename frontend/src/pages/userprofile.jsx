import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../api";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [emailError, setEmailError] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/loginpage");
      return;
    }

    apiGet("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        const user = data?.data?.user || {};
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      })
      .catch((err) => {
        console.error("Gagal mengambil profil:", err);
        alert("Gagal mengambil data profil. Silakan login ulang.");
        navigate("/loginpage");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginpage");
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!emailRegex.test(profile.email)) {
      setEmailError("Masukkan email yang valid.");
      return;
    } else {
      setEmailError("");
    }

    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await apiPut("/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res || res.meta?.code !== 200) throw new Error("Gagal menyimpan data profil");
      alert("Profil berhasil diperbarui.");
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      alert("Terjadi kesalahan saat menyimpan data profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Memuat profil...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <section className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
        </div>
        <div className="flex flex-col md:flex-row md:space-x-10">
          <div className="flex flex-col items-center text-center mb-6 md:mb-0">
            <img
              src="https://via.placeholder.com/150"
              alt="User Profile"
              className="w-32 h-32 rounded-full border border-gray-300"
            />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-white"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className={`w-full border px-4 py-2 rounded bg-white ${emailError ? "border-red-500" : "border-gray-300"
                  }`}
                readOnly={!isEditing}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">No. Telepon</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-white"
                readOnly={!isEditing}
              />
            </div>
            <div className="flex gap-2 mb-10">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Profil
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default UserProfile;
