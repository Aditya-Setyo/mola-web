// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setProfile({
          name: decoded.name || "",
          email: decoded.email || "",
          phone: decoded.phone || "",
          address: decoded.address || "",
        });
      } catch (err) {
        console.error("Token tidak valid", err);
        navigate("/loginpage");
      }
    } else {
      navigate("/loginpage");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/loginpage");
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Simpan ke database di sini kalau ada
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <section className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-10">
          {/* Foto dan Info Ringkas */}
          <div className="flex flex-col items-center text-center mb-6 md:mb-0">
            <img
              src="https://via.placeholder.com/150"
              alt="User Profile"
              className="w-32 h-32 rounded-full border border-gray-300"
            />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>

          {/* Info Detail */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
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
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">No. Telepon</label>
              <input
                type="tel"
                name="phone"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Alamat</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                rows={3}
                readOnly={!isEditing}
              />
            </div>
            <div className="text-right">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Profil
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Simpan
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserProfile;
