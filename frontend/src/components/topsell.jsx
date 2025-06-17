import React from "react";
import ProductCard from "./product";

const topProducts = [
  { name: "Striped Long Sleeve", image: "https://via.placeholder.com/200x200", price: 124 },
  { name: "Orange Summer Tee", image: "https://via.placeholder.com/200x200", price: 90 },
  { name: "Ripped Denim Shorts", image: "https://via.placeholder.com/200x200", price: 80 },
  { name: "Slim Black Jeans", image: "https://via.placeholder.com/200x200", price: 270 },
];

const TopSell = () => {
  return (
    <section className="px-10 py-16">
      <h2 className="text-2xl font-bold mb-6 text-center">PENJUALAN TERATAS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {topProducts.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </section>
  );
};

export default TopSell;

