import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';


import ProductCardWithSelector from '../cards/ProductCardWithSelector';
import ProductShop from '../components/ProductShop';
import StationShop from '../components/StationShop';

const BuyView = ({ products, handleAddToCartAll, stations }) => {
  const [productQuantities, setProductQuantities] = useState({});

  const [currentShop, setCurrentShop] = useState('products');


  const handleAddAll = () => {
    handleAddToCartAll(productQuantities);
    setProductQuantities({});
  };

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
    </div>
  );

    
};

export default BuyView;