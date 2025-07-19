import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { backendURL } from "../api";

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results = [], keyword = "" } = location.state || {};

    const handleProductClick = (productId) => {
        navigate(`/productdetails/${productId}`);
    };

    return (
        <>
            <Navbar />
            <main className="px-4 sm:px-8 py-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                     Hasil Pencarian untuk: <span className="text-blue-600">{keyword}</span>
                </h1>

                {results.length === 0 ? (
                    <div className="text-center text-gray-500 mt-24 text-lg">
                        Tidak ada produk ditemukan.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((prod) => {
                            // console.log(" Produk hasil pencarian:", results);
                            // console.log(" Variants:", prod.variants);
                            // console.log(" Data produk:", prod);
                            const price = prod.price || prod.product?.price || 0;
                            return (
                                <div
                                    key={prod.id}
                                    onClick={() => handleProductClick(prod.id)}
                                    className="cursor-pointer rounded-xl shadow bg-white hover:shadow-xl transition duration-300 flex flex-col overflow-hidden"
                                >
                                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100">
                                        <img
                                            src={prod.image_url ? `${backendURL}${prod.image_url}` : "https://via.placeholder.com/300x300"}
                                            alt={prod.name}
                                            className="object-contain w-full h-full p-2 transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-3 flex flex-col justify-between flex-1">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">{prod.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium">
                                            {prod.price > 0
                                                ? `Rp ${parseInt(prod.price).toLocaleString()}`
                                                : prod.variants?.length > 0 && prod.variants[0]?.price
                                                    ? `Rp ${parseInt(prod.variants[0].price).toLocaleString()}`
                                                    : "Harga tidak tersedia"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default SearchPage;
