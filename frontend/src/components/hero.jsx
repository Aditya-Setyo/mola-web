import React from "react";
import ilustrasidashboard from "../assets/iklan1.png";
import { HashLink } from "react-router-hash-link";

const Hero = () => {
  return (
    <section
      className="relative w-full h-[100vh] md:min-h-[665px] bg-no-repeat bg-center bg-cover flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-16"
      style={{
        backgroundImage: `url(${ilustrasidashboard})`,
        backgroundPosition: "top center",
        backgroundSize: "cover",
      }}
    >
      <div className="backdrop-blur-sm bg-white/70 p-6 sm:p-10 rounded-lg max-w-xl w-full text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900">
          TEMUKAN PRODUK PILIHAN GAYA HIDUP ANDA
        </h1>
        <p className="text-gray-700 mt-4 text-base sm:text-lg">
          Jelajahi koleksi kami yang lengkap, mulai dari fashion, aksesori,
          hingga perawatan kulit. Setiap produk dirancang dengan detail dan
          kualitas terbaik untuk mendukung penampilan Anda yang penuh percaya
          diri.
        </p>
        <HashLink smooth to="/dashboard#newarrival">
          <button className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition duration-300">
            Beli Sekarang
          </button>
        </HashLink>
      </div>
    </section>
  );
};

export default Hero;
