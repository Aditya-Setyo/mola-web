// import hook react
import { useContext } from "react";

// import js-cookie
import Cookies from "js-cookie";

// import hook useNavigate dari react-router-dom
import { useNavigate } from "react-router-dom";

// import context
import { AuthContext } from "../../context/AuthContext";

// custom hook useLogout
export const useLogout = () => {
  // Ambil setIsAuthenticated dari context
  const authContext = useContext(AuthContext);

  // Pastikan context tersedia
  if (!authContext) {
    throw new Error("useLogout harus digunakan di dalam AuthProvider");
  }

  const { setIsAuthenticated } = authContext;

  // Inisialisasi navigate
  const navigate = useNavigate();

  // Fungsi logout
  const logout = () => {
    // Hapus token dan user dari cookie
    Cookies.remove("token");
    Cookies.remove("user");

    // Ubah status autentikasi menjadi false
    setIsAuthenticated(false);

    // Arahkan ke halaman login
    navigate("/loginpage");
  };

  return logout;
};
