import React from "react";
import ilustrasidashboard from "../assets/iklan1.png";
import { HashLink } from "react-router-hash-link";

const Hero = () => {


  return (
    <section
      className="bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-12 min-h-[665px]"
      style={{ backgroundImage: `url(${ilustrasidashboard})` }}
    >
      <div className=" backdrop-blur-sm p-6 sm:p-10 w-[500px] md:w-1/2 rounded-lg">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
          TEMUKAN PRODUK PILIHAN GAYA HIDUP ANDA
        </h1>
        <p className="text-gray-700 mt-4 text-base sm:text-lg">
          Jelajahi koleksi kami yang lengkap, mulai dari fashion, aksesori, hingga perawatan kulit. Setiap produk dirancang dengan detail dan kualitas terbaik untuk mendukung penampilan Anda yang penuh percaya diri.
        </p>
        <HashLink smooth to="/dashboard#newarrival">
          <button
            className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition"
          >
            Beli Sekarang
          </button>
        </HashLink>
        <div className="flex flex-wrap sm:flex-nowrap space-y-4 sm:space-y-0 sm:space-x-8 mt-8 text-center">
          <div className="flex-1">
            <span className="block font-bold text-2xl text-gray-900">2,000+</span>
            <span className="text-sm text-gray-600">Produk</span>
          </div>
          <div className="flex-1">
            <span className="block font-bold text-2xl text-gray-900">30,000+</span>
            <span className="text-sm text-gray-600">Pelanggan</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
