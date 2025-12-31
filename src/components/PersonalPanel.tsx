import React from 'react';
import { Package, TrendingUp, TrendingDown, X, ChevronRight, Bell, Check, XCircle } from 'lucide-react';

interface Item {
  uniqueId: string;
  productId: string;
  name: string;
  color: string;
  qty?: number;
}

interface BalanceEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  timestamp: string;
}

interface DailyBalance {
  date: string;
  income: number;
  expenses: number;
  entries: BalanceEntry[];
}

interface ProductRequest {
  id: string;
  from: string;
  products: Array<{
    productId: string;
    name: string;
    color: string;
    quantity: number;
    price?: number;
  }>;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

interface GlobalBalance {
  income: number;
  expenses: number;
  entries: BalanceEntry[];
}

interface PublicSaleProduct {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: number;
}

const PersonalPanel = ({
  personalInventory,
  addToPersonalInventory,
  removeFromPersonalInventory,
  handleDragOver,
  handleDragLeave,
  dailyBalance,
  isVisible,
  setIsVisible,
  currentUser,
  productRequests,
  acceptProductRequest,
  rejectProductRequest,
  globalBalance,
  publicSaleProducts,
  removePublicSaleProduct,
  
}: {
  personalInventory: Item[];
  addToPersonalInventory: (item: Item) => void;
  removeFromPersonalInventory: (uniqueId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  dailyBalance: DailyBalance;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  currentUser?: string;
  productRequests?: ProductRequest[];
  acceptProductRequest?: (requestId: string) => void;
  rejectProductRequest?: (requestId: string) => void;
  globalBalance?: GlobalBalance;
  publicSaleProducts?: PublicSaleProduct[];
  removePublicSaleProduct?: (productId: string) => void;
}) => {
  const balance = dailyBalance.income - dailyBalance.expenses;
  const pendingRequests = productRequests?.filter(r => r.status === 'pending' && r.from === 'main') || [];

  const userPublicSaleProducts = publicSaleProducts?.filter(p => p.from === currentUser) || [];

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-xl z-40 overflow-y-auto p-4 border-l border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Panel Personal</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Ocultar panel"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Ventas Personales - Solo visible para usuario Main */}
      {currentUser === 'main' && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <TrendingUp size={18} className="mr-2 text-indigo-600" /> 
            Mi Venta Personal
          </h3>
          {userPublicSaleProducts.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userPublicSaleProducts.map(product => (
                <div key={product.productId} className="p-2 bg-white rounded border border-indigo-200 shadow-sm flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: product.color }}
                      />
                      <span className="text-sm font-semibold text-gray-700">{product.name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span>Qty: {product.quantity}</span>
                      <span className="ml-3 font-bold text-indigo-600">${product.price.toFixed(2)} c/u</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removePublicSaleProduct?.(product.productId)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Remover de venta"
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600">No tienes productos en venta personal.</p>
          )}
        </div>
      )}

      {/* Balance Global - Solo visible para usuario Main */}
      {currentUser === 'main' && globalBalance && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-300">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Balance Global</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp size={18} className="text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Ingreso Total</span>
              </div>
              <span className="font-bold text-green-600">${globalBalance.income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingDown size={18} className="text-red-600 mr-2" />
                <span className="text-sm text-gray-700">Gastos Totales</span>
              </div>
              <span className="font-bold text-red-600">${globalBalance.expenses.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Neto</span>
              <span className={`font-bold text-lg ${(globalBalance.income - globalBalance.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(globalBalance.income - globalBalance.expenses).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Solicitudes Pendientes - Solo visible para usuario Tienda */}
      {currentUser === 'store' && pendingRequests.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <Bell size={18} className="mr-2 text-yellow-600" /> 
            Solicitudes Pendientes ({pendingRequests.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700">De: {request.from === 'main' ? 'Principal' : 'Tienda'}</p>
                  <p className="text-xs text-gray-500">{new Date(request.date).toLocaleDateString()}</p>
                </div>
                <div className="mb-2 space-y-1">
                  {request.products.map((product, idx) => (

                    <div key={idx} className="flex items-center gap-2 text-xs">

                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }}></div>
                      <span className="text-gray-700">{product.name}</span>
                      <span className="text-gray-500">x{product.quantity}</span>
                      <span className="text-gray-500">${product.price.toFixed(2)}</span>
                      <span className="text-gray-500">${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700">Total</p>
                  <p className="text-xs text-gray-500">{request.products.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2)}</p>
                </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptProductRequest?.(request.id)}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    <span>Aceptar</span>
                  </button>
                  <button
                    onClick={() => rejectProductRequest?.(request.id)}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventario Personal */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
          <Package size={18} className="mr-2 text-indigo-600" /> Inventario (4 slots)
        </h3>
        <div
          className="grid grid-cols-2 gap-2"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {Array.from({ length: 4 }).map((_, i) => {
            const item = personalInventory[i];
            return (
              <div
                key={i}
                className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg bg-white"
              >
                {item ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: item.color || '#888' }}
                    >
                      {item.qty || 1}
                    </div>
                    <p className="text-xs text-gray-700 mt-1 text-center truncate">{item.name}</p>
                    <button
                      onClick={() => removeFromPersonalInventory(item.uniqueId)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Vacío</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-2">Arrastra items aquí desde el organizador.</p>
      </div>


      {/* Balance Diario */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Balance Diario ({dailyBalance.date})</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingUp size={18} className="text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Ingresos</span>
            </div>
            <span className="font-bold text-green-600">${dailyBalance.income.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingDown size={18} className="text-red-600 mr-2" />
              <span className="text-sm text-gray-700">Gastos</span>
            </div>
            <span className="font-bold text-red-600">${dailyBalance.expenses.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">Balance</span>
            <span className={`font-bold text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Últimas transacciones */}
        <div className="border-t pt-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Últimas transacciones</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {dailyBalance.entries && dailyBalance.entries.length > 0 ? (
              dailyBalance.entries.slice(-5).reverse().map(entry => (
                <div key={entry.id} className="text-xs text-gray-700 flex justify-between">
                  <span>{entry.description.substring(0, 20)}…</span>
                  <span className={entry.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                    {entry.type === 'expense' ? '-' : '+'} ${entry.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">Sin movimientos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPanel;
