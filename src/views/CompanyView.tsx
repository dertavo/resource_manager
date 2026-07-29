import React, { useState } from 'react';
import { Building2, FileText, PlusCircle, Clock, Play, Pause, Moon, Settings, Pencil, Save, Trash2, X } from 'lucide-react';

interface LedgerEntry {
  id: string;
  type: 'income' | 'expense' | 'debt' | 'repayment';
  amount: number;
  description: string;
  date: string;
}

interface Company {
  name: string;
  capital: number;
  debt: number;
  ledger: LedgerEntry[];
}

interface DayConfig {
  startHour: number;
  endHour: number;
  canSleepFromHour: number;
  speedMultiplier: number;
}

interface Balance {
  income: number;
  expenses: number;
  entries: any[];
}

const CompanyView = ({ 
  company, 
  createCompany,
  dayConfig,
  setDayConfig,
  currentDayTime,
  isClockRunning,
  setIsClockRunning,
  currentDay,
  currentDate,
  canSleep,
  finishDay,
  dailyBalance,
  globalBalance,
  updateCompany,
  deleteCompany,
}: { 
  company: Company | null; 
  createCompany: (p: { name: string; startWithDebt: boolean; amount: number }) => void;
  dayConfig: DayConfig;
  setDayConfig: (config: DayConfig) => void;
  currentDayTime: number;
  isClockRunning: boolean;
  setIsClockRunning: (running: boolean) => void;
  currentDay: number;
  currentDate: string;
  canSleep: boolean;
  finishDay: () => void;
  dailyBalance: Balance;
  globalBalance: Balance;
  updateCompany: (p: { name: string; capital: number; debt: number }) => void;
  deleteCompany: () => void;
}) => {
  const [name, setName] = useState('');
  const [startWithDebt, setStartWithDebt] = useState(false);
  const [amount, setAmount] = useState(0);
  const [showClockConfig, setShowClockConfig] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCapital, setEditCapital] = useState(0);
  const [editDebt, setEditDebt] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCompany({ name: name.trim(), startWithDebt, amount: Math.max(0, amount) });
  };

  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  const beginEditing = () => {
    if (!company) return;
    setEditName(company.name);
    setEditCapital(company.capital);
    setEditDebt(company.debt);
    setIsEditing(true);
  };

  const saveCompany = () => {
    if (!editName.trim()) return;
    updateCompany({
      name: editName,
      capital: editCapital,
      debt: editDebt,
    });
    setIsEditing(false);
  };

  const toggleDate = (date: string) => {
    setOpenDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  


  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const groupedLedger = company?.ledger?.reduce((acc: Record<string, LedgerEntry[]>, entry) => {
  const dateKey = new Date(entry.date).toISOString().split("T")[0]; // 2025-01-30



    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(entry);
    return acc;
  }, {});

  const groupedEntries = groupedLedger
  ? Object.entries(groupedLedger).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    )
  : [];



  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Sistema de Reloj */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Clock size={32} />
            <div>
              <h2 className="text-3xl font-bold">Día {currentDay}</h2>
              <p className="text-lg">
                {new Date(`${currentDate}T12:00:00`).toLocaleDateString()} · {formatTime(currentDayTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {isClockRunning ? <><Pause size={18} /> Pausar</> : <><Play size={18} /> Iniciar</>}
            </button>
            <button
              onClick={() => setShowClockConfig(!showClockConfig)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={finishDay}
              className={`px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg ${
                canSleep 
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 animate-pulse' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
              title={canSleep ? 'Puedes dormir ahora' : 'Terminar día manualmente'}
            >
              <Moon size={18} /> Terminar Día {canSleep && '💤'}
            </button>
          </div>
        </div>

        {/* Configuración del Reloj */}
        {showClockConfig && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg mb-2">Configuración del Día</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Hora de Inicio (0-23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={dayConfig.startHour}
                  onChange={(e) => setDayConfig({ ...dayConfig, startHour: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Hora de Fin (0-23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={dayConfig.endHour}
                  onChange={(e) => setDayConfig({ ...dayConfig, endHour: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Puede Dormir Desde (0-23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={dayConfig.canSleepFromHour}
                  onChange={(e) => setDayConfig({ ...dayConfig, canSleepFromHour: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Velocidad (1-3600x)</label>
                <input
                  type="number"
                  min={1}
                  max={3600}
                  value={dayConfig.speedMultiplier}
                  onChange={(e) => setDayConfig({ ...dayConfig, speedMultiplier: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 rounded bg-white text-gray-800"
                />
              </div>
            </div>
            <p className="text-xs mt-2 opacity-90">Velocidad: 1 minuto in-game cada {(60 / dayConfig.speedMultiplier).toFixed(1)} segundos reales</p>
          </div>
        )}

        {/* Balance Diario vs Global */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <p className="text-sm opacity-90 mb-1">Balance Diario</p>
            <p className="text-2xl font-bold">${(dailyBalance.income - dailyBalance.expenses).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <p className="text-sm opacity-90 mb-1">Balance Global</p>
            <p className="text-2xl font-bold">${(globalBalance.income - globalBalance.expenses).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
          <Building2 className="mr-2 text-indigo-600" /> Empresa
        </h2>
        {company ? (
          isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                <input className="w-full border p-2 rounded" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Capital</label>
                  <input type="number" min={0} className="w-full border p-2 rounded" value={editCapital} onChange={e => setEditCapital(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Deuda</label>
                  <input type="number" min={0} className="w-full border p-2 rounded" value={editDebt} onChange={e => setEditDebt(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-800 rounded p-2 flex items-center justify-center gap-2">
                  <X size={17} /> Cancelar
                </button>
                <button onClick={saveCompany} className="flex-1 bg-indigo-600 text-white rounded p-2 flex items-center justify-center gap-2">
                  <Save size={17} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-gray-700">
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {company.name}</p>
                <p><strong>Capital:</strong> ${company.capital.toFixed(2)}</p>
                <p><strong>Deuda:</strong> ${company.debt.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={beginEditing} className="flex-1 bg-indigo-100 text-indigo-700 rounded p-2 flex items-center justify-center gap-2 hover:bg-indigo-200">
                  <Pencil size={17} /> Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la empresa "${company.name}" y su ledger?`)) {
                      deleteCompany();
                    }
                  }}
                  className="flex-1 bg-red-100 text-red-700 rounded p-2 flex items-center justify-center gap-2 hover:bg-red-200"
                >
                  <Trash2 size={17} /> Eliminar
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Para crear otra empresa primero debes eliminar la actual.
              </p>
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre de la empresa</label>
              <input className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={startWithDebt} onChange={e => setStartWithDebt(e.target.checked)} />
              <span className="text-sm text-gray-700">Iniciar con aportación (deuda bancaria)</span>
            </div>
            {startWithDebt && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Monto de aportación</label>
                <input type="number" min={0} className="w-full border p-2 rounded" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
              </div>
            )}
            <button className="w-full bg-indigo-600 text-white rounded p-2 flex items-center justify-center">
              <PlusCircle size={18} className="mr-2" /> Crear empresa
            </button>
          </form>
        )}
      </div>

      

      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
          <FileText className="mr-2 text-indigo-600" /> Ledger
        </h2>
<div className="space-y-3 max-h-96 overflow-y-auto">
  {groupedEntries.length > 0 ? (
    groupedEntries.map(([date, entries]) => (
      <div key={date} className="border rounded-md">
        
        {/* Header fecha */}
        <button
          onClick={() => toggleDate(date)}
          className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold"
        >
          <span>
            {new Date(`${date}T12:00:00`).toLocaleDateString()}
          </span>
          <span>
            {openDates[date] ? "−" : "+"}
          </span>
        </button>

        {/* Contenido colapsable */}
        {openDates[date] && (
          <div className="divide-y">
           {entries
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(entry => (
              <div
                key={entry.id}
                className="flex justify-between text-sm px-3 py-2"
              >
                <span className="capitalize">{entry.type}</span>
                <span>${entry.amount.toFixed(2)}</span>
                <span className="flex-1 ml-2 text-gray-600">
                  {entry.description}
                </span>
                <span className="ml-2 text-gray-500">
                  {new Date(entry.date).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    <p className="text-gray-600 text-sm">Sin movimientos.</p>
  )}
</div>

      </div>
      </div>
    </div>
  );
};

export default CompanyView;
