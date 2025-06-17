import React from "react";

const Products = ({ image, name, price, oldPrice }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <img src={image} alt={name} className="w-full h-40 object-cover mb-4" />
      <h3 className="text-sm font-medium mb-1">{name}</h3>
      <div className="text-sm">
        <span className="text-black font-semibold mr-2">${price}</span>
        {oldPrice && <span className="line-through text-gray-400">${oldPrice}</span>}
      </div>
    </div>
  );
};

export default Products;
