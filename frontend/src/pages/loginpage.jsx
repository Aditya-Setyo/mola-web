import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import { apiPost } from "../api"; // gunakan helper dari api.js

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Saat pertama kali halaman dimuat, periksa apakah token sudah ada
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.warn("Token expired.");
          localStorage.removeItem("token");
          return;
        }

        if (decoded.role === "admin") {
          navigate("/adminpage");
        } else if (decoded.role === "user") {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Token invalid:", err);
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!emailRegex.test(email)) {
      setEmailError("Masukkan email yang valid");
      hasError = true;
    } else if (!email) {
      setEmailError("Email tidak boleh kosong");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password tidak boleh kosong");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    try {
      // Kirim login melalui helper apiPost
      const data = await apiPost("/login", { email, password }, false);
      const token = data.data?.token;

      if (!token || token.split(".").length !== 3) {
        throw new Error("Token dari server tidak valid.");
      }

      localStorage.setItem("token", token);
      // console.log("Token disimpan ke localStorage:", token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === "admin") {
        navigate("/adminpage");
      } else if (role === "user") {
        navigate("/dashboard");
      } else {
        alert("Role tidak dikenali.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login gagal: " + err.message);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${ilustrasibg})` }}
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white to-slate-100 font-sans px-4 py-8 gap-8 justify-between items-center"
    >
      {/* Kiri - Ilustrasi dan Info */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 text-center lg:text-left">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-7xl font-semibold text-gray-800 mb-2">Login</h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Untuk Kemudahan Belanja!</h2>
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

      {/* Kanan - Form Login */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 sm:px-8">
        <div className="flex justify-center gap-4 text-sm mb-8">
          <button
            onClick={() => navigate("/loginpage")}
            className="text-blue-600 border-b-2 border-blue-600 font-bold"
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

        <form className="space-y-6" onSubmit={handleLogin} noValidate>
          <div>
            <input
              type="email"
              placeholder="Masukkan Email"
              className={`w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none ${emailError ? 'border border-red-500' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none ${passwordError ? 'border border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <div className="text-right text-xs text-gray-500">
            <Link to="/resetpage" className="hover:underline">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
