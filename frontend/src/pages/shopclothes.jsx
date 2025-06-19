import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Pagination from "../components/pagination";
import axios from "axios";

const ShopClothes = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async (page) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/products?category=clothes&page=${page}`);
            setProducts(response.data.data);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <Navbar />
            <section className="px-4 py-12 md:px-20 md:py-10 mb-2">
                <h2 className="md:text-3xl font-bold mb-8 text-left mx-6 md:mx-26 text-gray-800">
                    Pakaian
                </h2>

                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-20 justify-items-center">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <img
                                    src={product.image || "https://via.placeholder.com/300x150"}
                                    alt={product.name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                                    <p className="text-sm text-gray-500">Rp {product.price}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center col-span-3 text-gray-500">Produk tidak ditemukan.</p>
                    )}
                </div>
            </section>

            <div className="flex justify-center mt-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <Footer />
        </div>
    );
};

export default ShopClothes;
