import React, { useState } from "react";
import ilustrasilogin from "../assets/loginlogo.png";
import ilustrasibg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { auth, googleProvider } from "../firebase";

const ConfirmToken = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fungsi untuk menangani login dengan Google
    const handleGoogleLogin = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                const user = result.user;
                console.log("Login Google berhasil:", user.displayName);
                alert(`Selamat datang, ${user.displayName}`);
                navigate("/dashboard"); // atau ke dashboard kamu
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
                    <h1 className="text-2xl sm:text-3xl lg:text-7xl font-semibold text-gray-800 mb-2">Verifikasi</h1>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Token Reset Password</h2>
                    <p className="text-sm text-gray-600">
                        Masukkan token yang telah dikirimkan ke email kamu
                    </p>
                </div>
                <img
                    src={ilustrasilogin}
                    alt="Character"
                    className="w-2/3 max-w-[250px] lg:max-w-[300px] mt-6 lg:mt-0"
                />
            </div>

            {/* Kanan - Form Token */}
            <div className="w-full max-w-md mx-auto flex flex-col justify-center px-4 sm:px-8">
                <div className="flex justify-center gap-4 text-sm mb-8">
                    <button onClick={() => navigate("/loginpage")} className="text-blue-600 border-b-2 border-blue-600 font-bold">Masuk</button>
                    <button onClick={() => navigate("/registerpage")} className="text-gray-500 hover:text-blue-600 font-bold">Daftar</button>
                </div>
                <div className="text-right text-xs text-gray-500 mb-4">
                    <Link to="/resetpage" className="hover:underline">
                        Lupa Password?
                    </Link>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Masukkan Token"
                        className="w-full px-4 py-3 rounded-lg bg-gray-100 text-sm outline-none"
                        required
                    />
                    {/* Pesan error */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                    >
                        Verifikasi Token
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

export default ConfirmToken;
