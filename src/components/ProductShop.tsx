import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import ProductCardWithSelector from '../cards/ProductCardWithSelector';

interface Product {
  id: string | number;
  name: string;
  stock: number;
  capacity?: number; // para estantes (coherente con registro)
}

interface ProductShopProps {
  products: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  handleAddToCartAll: (quantities: Record<string | number, number>) => void;
}

// Lógica común (registro / restock) para garantizar mínimos y selección inicial
const ensureSelectableQuantity = (
  products: Product[],
  currentQuantities: Record<string | number, number>
): Record<string | number, number> => {
  const updated = { ...currentQuantities };
  products.forEach(p => {
    // Si tiene stock y no está en el carrito aún => preseleccionar 1
    if (p.stock > 0 && (updated[p.id] === undefined || updated[p.id] < 0)) {
      updated[p.id] = 1;
    }
    // Si la cantidad actual > stock (por reducción) => ajustar
    if (p.stock >= 0 && updated[p.id] !== undefined && updated[p.id] > p.stock) {
      updated[p.id] = p.stock;
    }
    // Si stock volvió a 0 => limpiar selección
    if (p.stock === 0 && updated[p.id] !== undefined) {
      updated[p.id] = 0;
    }
  });
  return updated;
};

const PRODUCTS_STORAGE_KEY = 'products'; // Coincide con App.jsx

const ProductShop: React.FC<ProductShopProps> = ({ products, setProducts, handleAddToCartAll }) => {
    const [productQuantities, setProductQuantities] = useState<Record<string | number, number>>({});
    const [localProducts, setLocalProducts] = useState<Product[]>(products);

    // Sincronizar localProducts con products (ya persistidos por el padre)
    useEffect(() => {
     setLocalProducts(products);
     setProductQuantities(q => ensureSelectableQuantity(products, q));
   }, [products]);

    const handleAddAll = () => {
      handleAddToCartAll(productQuantities);
      setProductQuantities({});
    };

    // Actualizar stock (estado + persistencia vía setProducts + localStorage)
    const handleUpdateStock = (productId: string | number, newStock: number) => {
      setLocalProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      
      if (setProducts) {
        setProducts(prev => {
          const updated = prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p));
          // Persistir en localStorage inmediatamente
          try {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
          } catch (error) {
            console.error('Error al guardar en localStorage:', error);
          }
          return updated;
        });
      }

      // Aplicar lógica de registro para ese producto tras restock
      setProductQuantities(prev => {
        const next = { ...prev };
        const currentQty = next[productId] ?? 0;
        if (newStock > 0 && currentQty === 0) {
          next[productId] = 1; // selección inicial mínima
        }
        if (newStock === 0) {
          next[productId] = 0;
        }
        if (newStock > 0 && currentQty > newStock) {
          next[productId] = newStock;
        }
        return next;
      });
    };

   // Filtrar productos sin stock
   const outOfStockProducts = localProducts.filter(p => p.stock === 0);

   return(
    <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
    <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
        <ShoppingCart className="mr-2 text-indigo-600" />
        Tienda de Productos
      </h2>

       {/* Alerta de productos sin stock */}
       {outOfStockProducts.length > 0 && (
         <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <Package className="h-5 w-5 text-red-500" />
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-red-800">
                 Productos sin stock ({outOfStockProducts.length})
               </h3>
               <div className="mt-2 text-sm text-red-700">
                 <ul className="list-disc list-inside space-y-1">
                   {outOfStockProducts.map(p => (
                     <li key={p.id}>{p.name}</li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
         </div>
       )}

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {localProducts.length > 0 ? (
          localProducts.map(product => (
            <ProductCardWithSelector
              key={product.id}
              product={product}
              quantity={productQuantities[product.id] || 0}
              onQuantityChange={(newQuantity: number) =>
                setProductQuantities(prev => ({
                  ...prev,
                  [product.id]: newQuantity,
                }))
              }
              onRestockUpdate={handleUpdateStock}
            />
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">No hay productos registrados. ¡Regístralos primero!</p>
        )}
      </div>

           {localProducts.length > 0 && (
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