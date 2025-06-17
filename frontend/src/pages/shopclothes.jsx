import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Pagination from "../components/pagination";

const ShopClothes = () => {
    return (
        <div>
            <Navbar />
            <section className="px-4 py-12 md:px-20 md:py-10 mb-2">
                <h2 className="md:text-3xl font-bold mb-8 text-left mx-6 md:mx-26 text-gray-800">
                    Pakaian
                </h2>

                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-20 justify-items-center">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <img
                                src="https://via.placeholder.com/300x150"
                                alt={`Shop Item ${item}`}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-700">{`Shop Item ${item}`}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <div className="flex justify-center mt-8">
                <Pagination currentPage={1} totalPages={5} onPageChange={(page) => console.log(page)} />
            </div>
            <Footer />
        </div>
    );
};

export default ShopClothes;
