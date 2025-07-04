import React, { useState, useEffect } from "react";
import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api";

const ForgetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Ambil token dari query param, jika ada
    const params = new URLSearchParams(location.search);
    const t = params.get("token") || "";
    setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDASI ⬇️
    if (!token.trim()) {
      setError("⚠️ Token reset tidak ditemukan. Silakan masukkan token.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError("⚠️ Pastikan semua kolom password terisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("⚠️ Password dan konfirmasi tidak cocok.");
      return;
    }

    try {
      await apiPost("/reset-password", {
        token: token.trim(),
        new_password: password,
      }, false);

      alert("✅ Password berhasil di-reset!");
      navigate("/loginpage");
    } catch (err) {
      console.error("Reset gagal:", err.message);
      setError("❌ Reset gagal: " + err.message);
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
            Reset Password
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Masukkan Password Baru
          </h2>
          <p className="text-sm text-gray-600">
            Silakan isi form ini<br />
            atau kembali ke{" "}
            <Link to="/loginpage" className="text-blue-600 font-medium">
              halaman login
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
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Masukkan Token Reset"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            required
          />

          <input
            type="password"
            placeholder="Masukkan Password Baru"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            required
          />

          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="text-right text-xs text-gray-500 mb-4">
            <Link to="/resetpage" className="hover:underline">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPage;
