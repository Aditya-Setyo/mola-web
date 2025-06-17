import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { HashLink } from "react-router-hash-link";

const ProductDetailPage = () => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");

    const increment = () => setQuantity(quantity + 1);
    const decrement = () => quantity > 1 && setQuantity(quantity - 1);

    const colors = ["#000000", "#1D4ED8", "#047857", "#6B7280"];
    const sizes = ["S", "M", "L", "XL", "XXL"];

    return (
        <div>
            <Navbar />
            <section className="px-4 py-8 md:px-20 md:py-10">

                <div className="grid md:grid-cols-2 gap-10">
                    {/*Gambar Produk */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-row md:flex-col gap-2">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="thumb"
                                className="w-16 h-16 object-cover rounded border"
                            />
                            <img
                                src="https://via.placeholder.com/80"
                                alt="thumb"
                                className="w-16 h-16 object-cover rounded border"
                            />
                            <img
                                src="https://via.placeholder.com/80"
                                alt="thumb"
                                className="w-16 h-16 object-cover rounded border"
                            />
                        </div>
                        <img
                            src="https://via.placeholder.com/400x500"
                            alt="main"
                            className="w-full h-auto object-contain rounded-lg"
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold mb-2">ONE LIFE GRAPHIC T-SHIRT</h1>

                        {/* Rating */}
                        <div className="flex items-center text-yellow-500 space-x-1 mb-4">
                            {[1, 2, 3, 4].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                            <FaStarHalfAlt />
                            <span className="text-gray-600 text-sm ml-2">4.5/5 (1.2k Reviews)</span>
                        </div>

                        <div className="flex items-center space-x-3 mb-6">
                            <span className="text-2xl font-semibold text-gray-900">$260</span>
                            <span className="text-lg line-through text-gray-500">$300</span>
                        </div>

                        {/* Colors */}
                        <div className="mb-4">
                            <p className="font-semibold text-sm text-gray-700 mb-2">Color</p>
                            <div className="flex space-x-2">
                                {colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="mb-4">
                            <p className="font-semibold text-sm text-gray-700 mb-2">Size</p>
                            <div className="flex space-x-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        className="border rounded px-4 py-1 text-sm hover:bg-gray-100"
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center border rounded overflow-hidden">
                                <button onClick={decrement} className="px-3 py-1 hover:bg-gray-100">
                                    <FaMinus />
                                </button>
                                <span className="px-4 py-1">{quantity}</span>
                                <button onClick={increment} className="px-3 py-1 hover:bg-gray-100">
                                    <FaPlus />
                                </button>
                            </div>
                            <HashLink smooth to="/chartpage">
                                <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                                    Keranjang
                                </button>
                            </HashLink>
                            <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                                Beli Sekarang
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6">
                    {/* Tabs */}
                    <div className="tabs flex space-x-6 font-semibold text-gray-600 mb-4 justify-center">
                        <button
                            onClick={() => setActiveTab("description")}
                            className={`pb-2 border-b-2 ${activeTab === "description" ? "border-black text-black" : "border-transparent"
                                }`}
                        >
                            Deskripsi Produk
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`pb-2 border-b-2 ${activeTab === "reviews" ? "border-black text-black" : "border-transparent"
                                }`}
                        >
                            Ratings & Reviews
                        </button>
                    </div>

                    {/* Content Area */}
                    {activeTab === "description" && (
                        <div className="text-gray-700 leading-relaxed px-4 sm:px-0 max-w-3xl mx-auto">
                            <h4 className="text-xl font-semibold mb-2">Detail Produk</h4>
                            <p>
                                Kaos eksklusif edisi terbatas dengan desain premium dan bahan katun berkualitas tinggi.
                                Nyaman digunakan sehari-hari dengan jahitan rapi dan tahan lama.
                            </p>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="border p-4 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-bold text-gray-800">User {i + 1}</h4>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, j) => (
                                                <FaStar key={j} className="text-sm" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm">
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat
                                        tempora iure voluptates.
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* You Might Also Like */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-4 text-center hover:shadow-lg transition"
                            >
                                <img
                                    src="https://via.placeholder.com/150"
                                    alt="item"
                                    className="w-full h-32 object-cover mb-2"
                                />
                                <p className="text-sm font-medium text-gray-800">Item {i}</p>
                                <div className="text-sm text-gray-500">
                                    $220 <span className="line-through ml-2">$300</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default ProductDetailPage;
