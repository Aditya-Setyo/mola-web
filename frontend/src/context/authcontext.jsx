import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

// Membuat AuthContext
export const AuthContext = createContext(undefined);

// Komponen Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get("token"));
  const [user, setUser] = useState(null);

  const syncAuthState = () => {
    const token = Cookies.get("token");
    const storedRole = localStorage.getItem("role");

    const validRoles = ["admin", "user"];
    if (token && storedRole && validRoles.includes(storedRole)) {
      setIsAuthenticated(true);
      setUser({ role: storedRole });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        syncAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

//Custom hook: useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan dalam AuthProvider");
  return context;
};
