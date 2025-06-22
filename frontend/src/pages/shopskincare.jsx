import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import IlustrasiSkincare from "../assets/bgskincare.png";
import IlustrasiSkincare1 from "../assets/bgskincare1.png";
import IlustrasiSkincare2 from "../assets/bgskincare2.png";
import Pagination from "../components/pagination";

const ShopSkincare = () => {
    const productRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 4;

    const handleScrollToProducts = () => {
        productRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:8081/api/v1/products");
                const json = await res.json();

                console.log("Full JSON dari /products:", json);

                const produkMentah = json?.data?.products ?? json?.data ?? [];

                if (!Array.isArray(produkMentah)) {
                    console.warn("❌ produkMentah bukan array, struktur salah:", produkMentah);
                    return;
                }

                const skincareOnly = produkMentah.filter((product) => {
                    console.log("Cek kategori:", product.category);
                    return (
                        product.category &&
                        product.category.name &&
                        product.category.name.toLowerCase().includes("skincare")
                    );
                });

                console.log("Produk skincare:", skincareOnly);
                setProducts(skincareOnly);
            } catch (error) {
                console.error("Gagal ambil produk:", error);
            }
        };

        fetchProducts();
    }, []);




    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <Navbar />

            {/* Hero Section */}
            <section
                className="bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-12 min-h-[665px]"
                style={{ backgroundImage: `url(${IlustrasiSkincare})` }}
            >
                <div className="backdrop-blur-sm p-6 sm:p-10 w-full md:w-1/2 max-w-xl rounded-lg">
                    <h1 className="text-7xl font-bold leading-snug text-gray-900">
                        Enhance <br /> your Natural Radiance
                    </h1>
                    <button
                        onClick={handleScrollToProducts}
                        className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition"
                    >
                        Beli Sekarang
                    </button>
                </div>
            </section>

            {/* Produk Skincare */}
            <section
                ref={productRef}
                className="px-4 py-12 md:px-20 md:py-10 mb-10"
            >
                <h2 className="md:text-3xl font-bold mb-8 text-center text-gray-800 mt-10">
                    Produk Skincare Unggulan
                </h2>

                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 md:gap-20 justify-items-center">
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

                <div className="flex justify-center mt-20">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </section>

            {/* Penawaran Diskon */}
            <section
                className="bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-12 min-h-[730px]"
                style={{ backgroundImage: `url(${IlustrasiSkincare1})` }}
            >
                <div className="backdrop-blur-sm p-6 sm:p-10 w-full md:w-1/2 max-w-xl rounded-lg">
                    <h1 className="text-7xl font-bold leading-snug text-gray-900">
                        Penawaran Khusus <br /> Diskon 30%
                    </h1>
                    <button
                        onClick={handleScrollToProducts}
                        className="bg-black text-white px-6 py-2 rounded mt-6 hover:bg-gray-800 transition"
                    >
                        Beli Sekarang
                    </button>
                </div>
            </section>

            {/* Detail Produk */}
            <section className="px-4 py-12 md:px-20 md:py-16 bg-white">
                <div className="max-w-10xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">
                    <div className="p-4 rounded-md flex justify-center">
                        <img
                            src={IlustrasiSkincare2}
                            alt="Anti-Aging Cream"
                            className="max-h-[500px] w-full object-contain"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Anti-Aging Cream</h2>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            It is a long established fact that a reader will be distracted by the readable content...
                        </p>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            It is a long established fact that a reader will be distracted by the readable content...
                        </p>
                        <button className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition flex items-center space-x-2">
                            <span>Read more</span>
                            <span className="ml-2">→</span>
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ShopSkincare;
