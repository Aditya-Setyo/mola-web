import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import RegisterPage from "./pages/registerpage";
import Dashboard from "./pages/dashboard";
import ShopClothes from "./pages/shopclothes";
import ShopAsesoris from "./pages/shopasesoris";
import ShopSkincare from "./pages/shopskincare";
import ProfilePage from "./pages/profilepage";
import ChartPage from "./pages/chartpage";
import DetailProduct from "./pages/detailproduct";
import UserProfile from "./pages/userprofile";
import ResetPage from "./pages/resetpage";
import ForgetPage from "./pages/forgetpage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/loginpage" element={<LoginPage />} />
      <Route path="/registerpage" element={<RegisterPage />} />
      <Route path="/shopclothes" element={<ShopClothes />} />
      <Route path="/shopasesoris" element={<ShopAsesoris />} />
      <Route path="/shopskincare" element={<ShopSkincare />} />
      <Route path="/profilepage" element={<ProfilePage />} />
      <Route path="/chartpage" element={<ChartPage />} />
      <Route path="/detailproduct" element={<DetailProduct />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/resetpage" element={<ResetPage />} />
      <Route path="/forgetpage" element={<ForgetPage />} />
    </Routes>
  );
};

export default App;
