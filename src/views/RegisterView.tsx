import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';


interface Product {
  name: string;
  description: string;
  price: string | number;
  stock: number;
  capacity?: number;
}

const RegisterView = ({ handleProductFormSubmit }) => {
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    price: '',
    stock: 1,

  });

  const [isRack, setIsRack] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleProductFormSubmit(newProduct);
    setNewProduct({ name: '', description: '', price: '', stock: 1 });
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white custom-card mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
        <Box className="mr-2 text-indigo-600" />
        Registrar Nuevo Producto
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio</label>
          <input
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cantidad Inicial (Stock)</label>
          <input
            type="number"
            min="1"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: Math.max(1, parseInt(e.target.value) || 1) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">¿Estante?</label>
           <input
          type="checkbox"
          checked={isRack}
          onChange={(e) => setIsRack(e.target.checked)}
          />
       
        </div> 
        {isRack && (
          <div>
          <label className="block text-sm font-medium text-gray-700">Capacidad del estante</label>
          <input
            type="number"
            value={newProduct.capacity}
            onChange={(e) => setNewProduct({ ...newProduct, capacity: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
        >
          Registrar Producto
        </button>
      </form>
    </div>
  );
};

export default RegisterView;