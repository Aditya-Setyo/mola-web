import React from "react";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import NewArrivals from "../components/newarrival";
import TopSelling from "../components/topsell";
import CategoryBrowse from "../components/categori";  
import Footer from "../components/footer";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <NewArrivals id="newarrival"/>
      <TopSelling />
      <CategoryBrowse />
      <Footer />
    </div>
  );
};

export default Dashboard;