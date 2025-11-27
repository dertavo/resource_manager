import React, { useState } from 'react';
import { PlusSquare, MinusSquare, Package } from 'lucide-react';

interface Product {
  id: string | number;
  name: string;
  stock: number;
  color?: string;
}

interface ProductCardWithSelectorProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRestockUpdate?: (productId: string | number, newStock: number) => void;
}

const ProductCardWithSelector: React.FC<ProductCardWithSelectorProps> = ({
  product,
  quantity,
  onQuantityChange,
  onRestockUpdate,
}) => {
  const isOutOfStock = product.stock === 0;
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockAmount, setRestockAmount] = useState(0);

  const handleIncrease = () => {
    if (!isOutOfStock && quantity < product.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(0, Math.min(value, product.stock));
    onQuantityChange(clampedValue);
  };

  const handleRestockIncrease = () => {
    setRestockAmount(prev => prev + 1);
  };

  const handleRestockDecrease = () => {
    setRestockAmount(prev => Math.max(0, prev - 1));
  };

  const handleRestockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setRestockAmount(Math.max(0, value));
  };

  const handleRestockSubmit = () => {
    if (onRestockUpdate && restockAmount > 0) {
      const newStock = product.stock + restockAmount;
      onRestockUpdate(product.id, newStock);
      setRestockAmount(0);
      setShowRestockModal(false);
    }
  };

  const handleRestockCancel = () => {
    setRestockAmount(0);
    setShowRestockModal(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
        {/* Botón de surtir en la esquina superior derecha */}
        <button
          onClick={() => setShowRestockModal(true)}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          title="Surtir producto"
          type="button"
        >
          <Package size={18} />
        </button>

        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 pr-8">{product.name}</h3>
          
          {/* Indicador de stock */}
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                Sin stock
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                Disponible: <span className="font-medium text-green-600">{product.stock}</span>
              </span>
            )}
          </div>

          {/* Controles de cantidad */}
          <div className="mt-auto">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={handleDecrease}
                disabled={isOutOfStock || quantity === 0}
                className={`p-2 rounded-md transition-colors ${
                  isOutOfStock || quantity === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                type="button"
              >
                <MinusSquare size={20} />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                disabled={isOutOfStock}
                min="0"
                max={product.stock}
                className={`w-16 text-center p-2 border rounded-md focus:outline-none focus:ring-2 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />

              <button
                onClick={handleIncrease}
                disabled={isOutOfStock || quantity >= product.stock}
                className={`p-2 rounded-md transition-colors ${
                  isOutOfStock || quantity >= product.stock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                type="button"
              >
                <PlusSquare size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de surtir */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Package className="mr-2 text-blue-600" size={24} />
                Surtir Producto
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">{product.name}</p>
              <p className="text-sm text-gray-600">
                Stock actual: <span className="font-semibold text-indigo-600">{product.stock}</span>
              </p>
              {restockAmount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Nuevo stock: <span className="font-semibold">{product.stock + restockAmount}</span>
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a agregar
              </label>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleRestockDecrease}
                  disabled={restockAmount === 0}
                  className={`p-2 rounded-md transition-colors ${
                    restockAmount === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  type="button"
                >
                  <MinusSquare size={24} />
                </button>

                <input
                  type="number"
                  value={restockAmount}
                  onChange={handleRestockInputChange}
                  min="0"
                  className="w-24 text-center p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleRestockIncrease}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                  type="button"
                >
                  <PlusSquare size={24} />
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestockCancel}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestockSubmit}
                disabled={restockAmount === 0}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  restockAmount === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                type="button"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCardWithSelector;