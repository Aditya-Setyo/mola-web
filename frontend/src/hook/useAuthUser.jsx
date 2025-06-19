import Cookies from "js-cookie";

export const useAuthUser = () => {
  // Mengambil data user dari cookie
  const user = Cookies.get("user");

  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Gagal parse user dari cookie:", error);
    return null;
  }
};
