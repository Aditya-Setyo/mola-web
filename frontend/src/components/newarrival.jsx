import React from "react";
import ProductCard from "./product";
import { Link } from "react-router-dom";

const newProducts = [
  { name: "T-shirt with Tape Details", image: "https://via.placeholder.com/200x200", price: 120 },
  { name: "Skinny Fit Jeans", image: "https://via.placeholder.com/200x200", price: 240, oldPrice: 260 },
  { name: "Checkered Shirt", image: "https://via.placeholder.com/200x200", price: 180 },
  { name: "Sleeve Striped T-shirt", image: "https://via.placeholder.com/200x200", price: 130, oldPrice: 160 },
];

const NewArrival = ({ id }) => {
  return (
    <Link to={"/detailproduct"}>
      <section id={id} className="px-10 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">PRODUK TERBARU</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {newProducts.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </section>
    </Link>
  );
};

export default NewArrival;