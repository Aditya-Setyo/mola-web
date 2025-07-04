import React, { useState } from "react";
import ilustrasi from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { apiPost } from "../api"; // panggil helper API

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

  // Fungsi handle daftar akun
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !phone_number || !email || !password) {
      setFormError("Semua kolom harus diisi.");
      return;
    } else {
      setFormError("");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format email tidak valid.");
      return;
    } else {
      setEmailError("");
    }

    try {
      // Kirim data ke endpoint register pakai helper apiPost
      const data = await apiPost("/register", {
        name,
        phone_number,
        email,
        password,
      }, false); // `false` karena register tidak butuh token

      alert("Registrasi berhasil! Silakan login.");
      navigate("/loginpage");
    } catch (err) {
      console.error("Register error:", err);
      alert("Registrasi gagal: " + err.message);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${ilustrasibg})` }}
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white to-slate-100 font-sans px-4 py-8 gap-8 justify-between items-center"
    >
      {/* Kiri - Ilustrasi dan info */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 text-center lg:text-left">
        <div className="mb-6 lg:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-7">
            Gabung dan Mulai Belanja!
          </h2>
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link to="/loginpage" className="text-blue-600 font-medium">
              Masuk di sini!
            </Link>
          </p>
        </div>
        <img
          src={ilustrasi}
          alt="Ilustrasi"
          className="w-2/3 max-w-[250px] lg:max-w-[300px] mt-6 lg:mt-0"
        />
      </div>

      {/* Kanan - Form registrasi */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 sm:px-8">
        <div className="flex justify-center gap-4 text-sm mb-8">
          <button
            onClick={() => navigate("/loginpage")}
            className="text-gray-500 hover:text-blue-600 font-bold"
          >
            Masuk
          </button>
          <button
            onClick={() => navigate("/registerpage")}
            className="text-blue-600 border-b-2 border-blue-600 font-bold"
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="text"
            placeholder="Masukkan Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
          />
          <input
            type="text"
            placeholder="Masukkan No HP"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
          />
          <div>
            <input
              type="email"
              placeholder="Masukkan Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
          />

          {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}

          <div className="text-right text-xs text-gray-500">
            <Link to="/resetpage" className="hover:underline">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Daftar
          </button>
        </form>

      </div>
    </div>
  );
};

export default RegisterPage;