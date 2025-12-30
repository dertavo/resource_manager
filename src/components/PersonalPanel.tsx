import React from 'react';
import { Package, TrendingUp, TrendingDown, X, ChevronRight } from 'lucide-react';

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

const PersonalPanel = ({
  personalInventory,
  addToPersonalInventory,
  removeFromPersonalInventory,
  handleDragOver,
  handleDragLeave,
  dailyBalance,
  isVisible,
  setIsVisible,
}: {
  personalInventory: Item[];
  addToPersonalInventory: (item: Item) => void;
  removeFromPersonalInventory: (uniqueId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  dailyBalance: DailyBalance;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}) => {
  const balance = dailyBalance.income - dailyBalance.expenses;

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
