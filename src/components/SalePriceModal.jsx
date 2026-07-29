const SalePriceModal = ({ item, price, onPriceChange, onCancel, onConfirm }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Establecer Precio de Venta</h3>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Producto</p>
          <p className="text-lg font-semibold text-gray-800">{item.name}</p>
          <p className="text-sm text-gray-600 mt-2">Cantidad disponible</p>
          <p className="text-lg font-bold text-indigo-600">{item.qty} unidades</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Precio por unidad ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={event => onPriceChange(event.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalePriceModal;
