import { X } from 'lucide-react';

const CartView = ({ cartItems, onPurchase, onClose, onUpdateCart }) => {
  const total = cartItems
    .reduce((sum, item) => sum + ((item.displayPrice || item.price) * item.quantity), 0)
    .toFixed(2);

  const removeItem = itemId => {
    onUpdateCart(cartItems.filter(item => item.id !== itemId));
  };

  const changeQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    onUpdateCart(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Carrito de Compras</h2>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">El carrito está vacío.</p>
        ) : (
          <>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                      <h4 className="font-semibold">{item.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Precio: ${(item.displayPrice || item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold">
                      ${((item.displayPrice || item.price) * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={event => changeQuantity(item.id, parseInt(event.target.value) || 1)}
                        className="w-10 text-center border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => changeQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center font-bold text-2xl mb-4">
                <span>Total:</span>
                <span>${total}</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Seguir Comprando
                </button>
                <button
                  onClick={onPurchase}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Confirmar Compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartView;
