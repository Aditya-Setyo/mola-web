// Import js-cookie
import Cookies from "js-cookie";

export const useAuthUser = () => {
  // Mengambil data user dari cookie
  const user = Cookies.get("user");

  // Jika ada data user, parse JSON dan kembalikan
  // Jika tidak ada, kembalikan null
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Gagal parse user dari cookie:", error);
    return null;
  }
};
