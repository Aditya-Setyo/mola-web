import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import LogoAccount from "../assets/logoaccount.png";
import Logo1 from "../assets/logo1.png";
import LogoKeranjang from "../assets/logokeranjang.png";
import { HashLink } from "react-router-hash-link";
import Logo from "../assets/logomola.png";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setIsLoggedIn(true);
          setUserName(decoded.full_name || "User");
        }
      }
    } catch (err) {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCategories = () => setShowCategories(!showCategories);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/loginpage");
  };

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
          <HashLink smooth to="/dashboard#newarrival" className="hover:text-blue-500">Shop</HashLink>

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
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-xl px-4 py-1 text-sm bg-gray-100 w-64 mr-10"
          />
          <button onClick={() => navigate("/chartpage")}> {/* keranjang */}
            <img src={LogoKeranjang} alt="Cart" className="w-6 h-6" />
          </button>
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-600">Halo, {userName}</span>
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

          <div className="flex items-center mt-2 space-x-3">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-xl px-3 py-1 text-sm bg-gray-100 flex-1"
            />
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate("/userprofile")}>
                  <img src={LogoAccount} alt="Profile" className="w-6 h-6" />
                </button>
                <button onClick={() => navigate("/chartpage")} className="ml-10"> {/* Keranjang */}
                  <img src={Logo1} alt="Chart" className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/loginpage")}> {/* Akun */}
                  <img src={LogoAccount} alt="Account" className="w-6 h-6" />
                </button>
                <button onClick={() => navigate("/chartpage")} className="ml-10"> {/* Keranjang */}
                  <img src={Logo1} alt="Chart" className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar ;
