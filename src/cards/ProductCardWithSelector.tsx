import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';


const ProductCardWithSelector = ({ product, quantity, onQuantityChange }) => {
  const handleDecrease = () => {
    onQuantityChange(Math.max(0, quantity - 1));
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full mr-3" style={{ backgroundColor: product.color }}></div>
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-2">{product.description || 'Sin descripción.'}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-md font-bold text-indigo-600">
          ${product.price ? product.price.toFixed(2) : '0.00'}
        </span>
        <span className="text-sm font-semibold text-gray-500">
          Disponible: {product.stock}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecrease}
            className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
          >
            <MinusSquare size={16} />
          </button>
          <input
            type="number"
            value={quantity || 0}
            onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
            className="w-12 text-center border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
            min="0"
          />
          <button
            onClick={handleIncrease}
            className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
          >
            <PlusSquare size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardWithSelector;