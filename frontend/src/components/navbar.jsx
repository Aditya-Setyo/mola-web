import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import LogoAccount from "../assets/logoaccount.png";
import LogoRiwayat from "../assets/LogoRiwayat.png";
import LogoKeranjang from "../assets/logokeranjang.png";
import { HashLink } from "react-router-hash-link";
import Logo from "../assets/logomola.png";
import { jwtDecode } from "jwt-decode";
import { apiGet } from "../api"; // tambahkan di atas


const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await apiGet(`/products/name/${searchQuery.trim()}`, false);
      const products = res?.data?.products || [];

      if (products.length > 0) {
        // Kirim hasil pencarian ke halaman hasil
        navigate("/searchpage", { state: { results: products, keyword: searchQuery.trim() } });
      } else {
        alert("Produk tidak ditemukan");
      }
    } catch (err) {
      console.error("Gagal mencari produk:", err);
      // alert("Terjadi kesalahan saat pencarian.");
      alert("Produk tidak ditemukan");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Checking token on Navbar mount:", token);
    try {
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setIsLoggedIn(true);
          setUserName(decoded.full_name || "User");
        } else {
          localStorage.removeItem("token"); // auto hapus kalau expired
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Token decoding failed", err);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }
  }, []);


  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCategories = () => setShowCategories(!showCategories);

  return (
    <nav className="bg-white shadow-md px-6 md:px-10">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800 grid grid-cols-2 items-center">
          <img src={Logo} alt="logomola" className="w-20 h-20" />
          <span className="ml-2 font-bold text-lg">MOLLA</span>
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-2xl text-gray-700 focus:outline-none">
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        <div className="hidden md:flex space-x-6 text-sm items-center">
          <Link to="/dashboard" className="hover:text-blue-500">Beranda</Link>
          <HashLink smooth to="/dashboard#newarrival" className="hover:text-blue-500">Produk</HashLink>

          <div className="relative">
            <button onClick={toggleCategories} className="hover:text-blue-500 focus:outline-none">
              Kategori
            </button>
            {showCategories && (
              <div className="absolute left-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 px-4 z-50">
                <Link to="/shopasesoris" className="block py-1 hover:text-blue-500">Asesoris</Link>
                <Link to="/shopclothes" className="block py-1 hover:text-blue-500">Pakaian</Link>
                <Link to="/shopskincare" className="block py-1 hover:text-blue-500">Skincare</Link>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center border rounded-xl bg-gray-100 px-2 w-64 mr-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Produk..."
              className="bg-transparent flex-1 py-1 px-2 text-sm outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button onClick={handleSearch} className="text-gray-600 text-sm px-2">🔍</button>
          </div>

          <button onClick={() => navigate("/chartpage")}> {/* keranjang */}
            <img src={LogoKeranjang} alt="Cart" className="w-6 h-6" />
          </button>
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate("/riwayatpage")}>
                <img src={LogoRiwayat} alt="Riwayat" className="w-6 h-6" />
              </button>
              <button onClick={() => navigate("/userprofile")}>
                <img src={LogoAccount} alt="Account" className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/loginpage")}>
              <img src={LogoAccount} alt="Account" className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      {/* HP */}
      {isOpen && (
        <div className="md:hidden mt-2 space-y-3 text-sm">
          <Link to="/dashboard" className="block hover:text-blue-500">Beranda</Link>
          <Link to="/shopclothes" className="block hover:text-blue-500">Toko</Link>
          <button onClick={toggleCategories} className="block w-full text-left hover:text-blue-500">Kategori</button>
          {showCategories && (
            <div className="pl-4 space-y-1">
              <Link to="/shopasesoris" className="block hover:text-blue-500">Asesoris</Link>
              <Link to="/shopclothes" className="block hover:text-blue-500">Pakaian</Link>
              <Link to="/shopskincare" className="block hover:text-blue-500">Skincare</Link>
            </div>
          )}

          <div className="flex items-center mt-2 space-x-3 ounded-xl">
            <div className="flex items-center  mt-2 space-x-3 border rounded-xl px-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 text-sm flex-1 "
                placeholder="Cari Nama Produk..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button onClick={handleSearch} className="text-gray-600 text-sm px-2">🔍</button>
            </div>
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate("/chartpage")} className="ml-10"> {/* Keranjang */}
                  <img src={LogoKeranjang} alt="Chart" className="w-6 h-6" />
                </button>
                <button onClick={() => navigate("/riwayatpage")} className="ml-10"> {/* Riwayat */}
                  <img src={LogoRiwayat} alt="Riwayat" className="w-6 h-6" />
                </button>
                <button onClick={() => navigate("/userprofile")}> {/*User Profile*/}
                  <img src={LogoAccount} alt="Profile" className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/loginpage")}> {/* Akun */}
                  <img src={LogoAccount} alt="Account" className="w-6 h-6" />
                </button>
                <button onClick={() => navigate("/chartpage")}> {/* Keranjang */}
                  <img src={LogoKeranjang} alt="Chart" className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
