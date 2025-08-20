import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';
import ProductCardWithSelector from '../cards/ProductCardWithSelector';

const ProductShop = ({products,handleAddToCartAll})=>{
    const [productQuantities, setProductQuantities] = useState({});
    
    const handleAddAll = () => {
    handleAddToCartAll(productQuantities);
    setProductQuantities({});
  };


   return(
    <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
    <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
        <ShoppingCart className="mr-2 text-indigo-600" />
        Tienda de Productos
      </h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCardWithSelector
              key={product.id}
              product={product}
              quantity={productQuantities[product.id] || 0}
              onQuantityChange={(newQuantity) =>
                setProductQuantities(prev => ({
                  ...prev,
                  [product.id]: newQuantity,
                }))
              }
            />
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">No hay productos registrados. ¡Regístralos primero!</p>
        )}
      </div>

           {products.length > 0 && (
              <div className="mt-8 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={handleAddAll}
                  className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-green-600"
                >
                  <ShoppingCart size={20} />
                  <span>Agregar todos los productos seleccionados</span>
                </button>
              </div>
            )}
      
      
      
    
    </div>
   );
};


export default ProductShop;