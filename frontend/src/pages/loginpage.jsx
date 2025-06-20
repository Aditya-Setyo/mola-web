import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";


const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Cek token saat component dimuat
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token dari localStorage:", token);

    // Tambahkan pengecekan apakah token valid
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const role = decoded.role;

        if (role === "admin") {
          navigate("/admin/adminpage");
        } else if (role === "user") {
          navigate("/dashboard");
        } else {
          navigate("/loginpage");
        }
      } catch (error) {
        console.error("Token tidak valid:", error);
        navigate("/loginpage");
      }
    } else {
      console.warn("Token kosong atau tidak valid formatnya");
      navigate("/loginpage");
    }
  }, [navigate]);



  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const raw = await response.text();

      if (!response.ok) {
        const errorData = JSON.parse(raw);
        throw new Error(errorData.meta?.message || "Login gagal");
      }

      const data = JSON.parse(raw);
      const token = data.data?.token;

      // Validasi token sebelum dipakai
      if (!token || typeof token !== "string" || token.split(".").length !== 3) {
        throw new Error("Token dari server tidak valid");
      }

      // Simpan token yang valid
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === "admin") {
        navigate("/adminpage");
      } else if (role === "user") {
        navigate("/dashboard");
      } else {
        navigate("/loginpage");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Login gagal: " + err.message);
    }

    console.log("Email:", email);
    console.log("Password:", password);
  };


  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        console.log("Login Google berhasil:", user.displayName);
        alert(`Selamat datang, ${user.displayName}`);
        navigate("/dashboaruser"); // atau ke dashboard kamu
      })
      .catch((error) => {
        console.error("Login Google gagal:", error.message);
        alert("Login gagal: " + error.message);
      });
  };


  return (
    <div style={{ backgroundImage: `url(${ilustrasibg})` }} className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white to-slate-100 font-sans px-4 py-8 gap-8 justify-between items-center">
      {/* Kiri - gambar dan teks */}
      <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 text-center lg:text-left">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-7xl font-semibold text-gray-800 mb-2">Login</h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Untuk Kemudahan Belanja!</h2>
          <p className="text-sm text-gray-600">
            Jika belum memiliki akun <br />
            Anda bisa{" "}
            <Link to="/registerpage" className="text-blue-600 font-medium">
              Daftar di sini!</Link>
          </p>
        </div>
        <img
          src={ilustrasilogin}
          alt="Character"
          className="w-2/3 max-w-[250px] lg:max-w-[300px] mt-6 lg:mt-0"
        />
      </div>

      {/* Kanan - Form login */}
      <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 sm:px-8">
        <div className="flex justify-center gap-4 text-sm mb-8">
          <button onClick={() => navigate("/loginpage")} className="text-blue-600 border-b-2 border-blue-600 font-bold">Masuk</button>
          <button onClick={() => navigate("/registerpage")} className="text-gray-500 hover:text-blue-600 font-bold">Daftar</button>
        </div>

        <form className="space-y-6">
          <input
            type="email"
            placeholder="Masukkan Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-right text-xs text-gray-500">
            <Link to="/resetpage" className="hover:underline">
              Lupa Password?
            </Link>
          </div>
          <button onClick={handleLogin}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Masuk
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-400 text-sm">Atau</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={handleGoogleLogin} className="flex items-center justify-center w-100 py-3 bg-white rounded-lg shadow-md hover:shadow-md border-black">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

};

export default LoginPage;