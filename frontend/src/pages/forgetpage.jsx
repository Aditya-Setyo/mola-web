import React, { useState, useEffect } from "react";
import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { apiPost } from "../api";

const ForgetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  // Fungsi untuk menangani pengiriman form reset password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      alert("Token tidak tersedia di URL.");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Harap lengkapi semua isian!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    try {
      await apiPost("/reset-password", {
        token: token,
        new_password: password,
      }, false);

      alert("Berhasil reset password!");
      navigate("/loginpage");
    } catch (err) {
      console.error("Reset gagal:", err.message);
      alert("Reset gagal: " + err.message);
    }
  };


  // Fungsi untuk menangani login dengan Google
  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        alert(`Selamat datang, ${user.displayName}`);
        navigate("/");
      })
      .catch((error) => {
        alert("Login Google gagal: " + error.message);
      });
  };

  return (
    <div style={{ backgroundImage: `url(${ilustrasibg})` }} className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white to-slate-100 font-sans px-4 py-8 gap-8 justify-between items-center">
      {/* Kiri - gambar dan teks */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 text-center lg:text-left">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-7xl font-semibold text-gray-800 mb-2">Reset Password</h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Masukkan Password Baru</h2>
          <p className="text-sm text-gray-600">
            Jika sudah reset token, silakan isi form ini <br />
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

      {/* Kanan - Form reset */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 sm:px-8">
        <div className="flex justify-center gap-4 text-sm mb-8">
          <button onClick={() => navigate("/loginpage")} className="text-gray-500 hover:text-blue-600 font-bold">Masuk</button>
          <button onClick={() => navigate("/registerpage")} className="text-gray-500 hover:text-blue-600 font-bold">Daftar</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)} // <- ini penting!
            placeholder="Masukan Token Reset"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            required
          />
          {/* Pesan error */}
          {error && <p className="text-red-500 text-sm items-center">{error}</p>}
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
          <div className="text-right text-xs text-gray-500 mb-4">
            <Link to="/resetpage" className="hover:underline">
              Lupa Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Simpan
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">Atau</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={handleGoogleLogin} className="flex items-center justify-center w-100 py-3 bg-white rounded-lg shadow-md hover:shadow-md">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgetPage;
