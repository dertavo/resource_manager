import React, { useState } from 'react';
import { Building2, Wallet, FileText, PlusCircle } from 'lucide-react';

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

const CompanyView = ({ company, createCompany }: { company: Company | null; createCompany: (p: { name: string; startWithDebt: boolean; amount: number }) => void; }) => {
  const [name, setName] = useState('');
  const [startWithDebt, setStartWithDebt] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCompany({ name: name.trim(), startWithDebt, amount: Math.max(0, amount) });
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
          <Building2 className="mr-2 text-indigo-600" /> Empresa
        </h2>
        {company ? (
          <div className="space-y-2 text-gray-700">
            <p><strong>Nombre:</strong> {company.name}</p>
            <p><strong>Capital:</strong> ${company.capital.toFixed(2)}</p>
            <p><strong>Deuda:</strong> ${company.debt.toFixed(2)}</p>
          </div>
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
        <div className="space-y-2">
          {company && company.ledger && company.ledger.length > 0 ? (
            company.ledger.slice().reverse().map(entry => (
              <div key={entry.id} className="flex justify-between text-sm border-b py-2">
                <span className="capitalize">{entry.type}</span>
                <span>${entry.amount.toFixed(2)}</span>
                <span className="flex-1 ml-2 text-gray-600">{entry.description}</span>
                <span className="ml-2 text-gray-500">{new Date(entry.date).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm">Sin movimientos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyView;
