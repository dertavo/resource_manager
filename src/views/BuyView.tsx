import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';


import ProductCardWithSelector from '../cards/ProductCardWithSelector';
import ProductShop from '../components/ProductShop';
import StationShop from '../components/StationShop';

const BuyView = ({ products, setProducts, handleAddToCartAll, stations, productsForSale, currentUser, removeItemFromSale }) => {
  const [productQuantities, setProductQuantities] = useState({});
  const [myProductQuantities, setMyProductQuantities] = useState({});

  const [currentShop, setCurrentShop] = useState('products');


  const handleAddAll = () => {
    handleAddToCartAll(productQuantities);
    setProductQuantities({});
  };

  const handleAddMyProductsAll = () => {
    handleAddToCartAll(myProductQuantities);
    setMyProductQuantities({});
  };

  // Get user's products for sale
  const userKey = currentUser === 'store' ? 'store' : 'main';
  const myProductsForSale = productsForSale ? (productsForSale[userKey] || []) : [];

    const NavButton = ({ view, icon: Icon, label }) => (
    <button
      onClick={() => {
        setCurrentShop(view);
        //setMessage('');
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        currentShop === view ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );

  const renderShop = ()=>{
    switch(currentShop){
        case  'products':
            return (
                <ProductShop
                products={products}
                setProducts={setProducts}
                handleAddToCartAll={handleAddToCartAll}
                
                />
            );
        case  'stations':
            return (
                <StationShop
                stations={stations}
                handleAddToCartAll={handleAddToCartAll}
                
                />
            );
        default:
        return null;
    }
  }

  return (
    <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
       <div className="flex justify-left space-x-2 mb-4">
        <NavButton view="products" icon={Box} label="Productos" />
        <NavButton view="stations" icon={Factory} label="Estaciones" />
        <NavButton view="warehouses" icon={Archive} label="Almacenes" /> 
      </div>
      
    {renderShop()}

    {/* Mis Productos en Venta Section */}
    {myProductsForSale && myProductsForSale.length > 0 && (
      <div className="mt-8 pt-8 border-t-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Mis Productos en Venta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProductsForSale.map((item) => (
            <div key={item.productId} className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  <p className="text-sm text-green-600 font-semibold">Precio: ${item.sellingPrice}</p>
                </div>
                <button
                  onClick={() => removeItemFromSale && removeItemFromSale(item.productId)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                  title="Quitar de la venta"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  defaultValue="1"
                  onChange={(e) => setMyProductQuantities(prev => ({
                    ...prev,
                    [item.productId]: parseInt(e.target.value) || 0
                  }))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Qty"
                />
                <button
                  onClick={() => {
                    const qty = myProductQuantities[item.productId] || 1;
                    if (qty > 0) {
                      handleAddToCartAll({ [item.productId]: qty });
                      setMyProductQuantities(prev => {
                        const newQuantities = { ...prev };
                        delete newQuantities[item.productId];
                        return newQuantities;
                      });
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <ShoppingCart size={14} />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );

    
};

export default BuyView;