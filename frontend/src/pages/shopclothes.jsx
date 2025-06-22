import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Pagination from "../components/pagination";

const ShopClothes = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:8081/api/v1/products");
                const json = await res.json();

                const allProducts = Array.isArray(json?.data?.products)
                    ? json.data.products
                    : [];

                console.log("🔥 Semua Produk:", allProducts);

                // Filter kategori "Pakaian"
                const clothesOnly = allProducts.filter(
                    (product) =>
                        product.category_name &&
                        product.category_name.toLowerCase().includes("pakaian")
                );

                console.log("👕 Produk Pakaian:", clothesOnly);

                const total = clothesOnly.length;
                const pages = Math.ceil(total / itemsPerPage);
                setTotalPages(pages);

                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;

                setProducts(clothesOnly.slice(start, end));
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
            }
        };

        fetchProducts();
    }, [currentPage]);

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

                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="w-full max-w-xs bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between transition-transform hover:scale-105"
                            >
                                <img
                                    src={`http://localhost:8081${product.image_url}`}
                                    alt={product.name}
                                    className="w-full h-48 object-contain bg-white"
                                />
                                <div className="p-4 text-center">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Rp {product.price?.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center col-span-3 text-gray-500">
                            Produk tidak ditemukan.
                        </p>
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
