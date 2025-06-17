import React from "react";
import categoripakaian from "../assets/pakaian.png";
import categoriskincare from "../assets/skincare.jpg";
import categoriasesoris from "../assets/aksesoris.jpg";
import { Link } from "react-router-dom";

const categories = [
    { label: "Accessories", image: "https://via.placeholder.com/300x150" },
    { label: "Skincare", image: "https://via.placeholder.com/300x150" },
    { label: "Clothes", image: "https://via.placeholder.com/300x150" },
];

const Categori = () => {
    return (
        <section className="px-4 py-12 md:px-10 md:py-16 bg-gray-550">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800 uppercase tracking-wide">
                CARI BERDASARKAN KATEGORI
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
                    <Link to="/shopclothes">
                        <img
                            src={categoripakaian}
                            alt="Pakaian"
                            className="w-full h-48 object-cover"
                        />
                    </Link>
                    <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Pakaian</h3>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
                    <Link to="/shopskincare">
                        <img
                            src={categoriskincare}
                            alt="Skincare"
                            className="w-full h-48 object-cover"
                        />
                    </Link>
                    <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Skincare</h3>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
                    <Link to="/shopasesoris">
                        <img
                            src={categoriasesoris}
                            alt="Aksesoris"
                            className="w-full h-48 object-cover"
                        />
                    </Link>
                    <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Asesoris</h3>
                    </div>
                </div>
            </div>
        </section>

    );
};
export default Categori;