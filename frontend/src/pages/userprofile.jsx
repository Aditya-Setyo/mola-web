// src/pages/UserProfile.jsx
import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <section className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil Pengguna</h1>

        <div className="flex flex-col md:flex-row md:space-x-10">
          {/* Foto dan Info Ringkas */}
          <div className="flex flex-col items-center text-center mb-6 md:mb-0">
            <img
              src="https://via.placeholder.com/150"
              alt="User Profile"
              className="w-32 h-32 rounded-full border border-gray-300"
            />
            <h2 className="mt-4 text-lg font-semibold text-gray-700">Nama Pengguna</h2>
            <p className="text-sm text-gray-500">user@email.com</p>
          </div>

          {/* Info Detail */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value="Nama Pengguna"
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value="user@email.com"
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">No. Telepon</label>
              <input
                type="tel"
                value="081234567890"
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Alamat</label>
              <textarea
                value="Jl. Contoh No. 123, Yogyakarta"
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
                rows={3}
                readOnly
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserProfile;
