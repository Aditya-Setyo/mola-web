import React, { useState } from "react";
import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i; // regex standar ✔

const ResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  /* ────────────────── HANDLE SUBMIT ────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Validasi kosong & format
    if (!email.trim()) {
      setError("Email tidak boleh kosong.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    setError(""); // clear

    try {
      await apiPost("/forgot-password", { email }, false);
      alert("Token reset password telah dikirim ke email kamu.");
      navigate("/forgetpage");
    } catch (err) {
      console.error("Gagal kirim token:", err.message);
      alert("Terjadi kesalahan: " + err.message);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${ilustrasibg})` }}
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white to-slate-100 font-sans px-4 py-8 gap-8 justify-between items-center"
    >
      {/* Kiri */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 text-center lg:text-left">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-7xl font-semibold text-gray-800 mb-2">
            Login
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Untuk Kemudahan Belanja!
          </h2>
          <p className="text-sm text-gray-600">
            Jika belum memiliki akun <br />
            Anda bisa{" "}
            <Link to="/registerpage" className="text-blue-600 font-medium">
              Daftar di sini!
            </Link>
          </p>
        </div>
        <img
          src={ilustrasilogin}
          alt="Character"
          className="w-2/3 max-w-[250px] lg:max-w-[300px] mt-6 lg:mt-0"
        />
      </div>

      {/* Kanan */}
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
            className="text-gray-500 hover:text-blue-600 font-bold"
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan Email"
            className={`w-full px-4 py-3 rounded-lg text-sm outline-none ${
              error ? "bg-red-50 border border-red-400" : "bg-gray-100"
            }`}
            required /* HTML5 fallback */
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            disabled={!!error || !email.trim()}
          >
            Kirim Token
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPage;
