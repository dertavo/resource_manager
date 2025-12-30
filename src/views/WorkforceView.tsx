import React, { useState } from 'react';
import { Users, Cog, PlusCircle } from 'lucide-react';

interface Actor {
  id: string;
  type: 'human' | 'machine';
  name: string;
  hourlyCost: number;
  hoursPerDay: number;
  fatigue?: number;
  maintenanceNeed?: number;
  status?: string;
  hoursWorkedToday?: number;
}

const WorkforceView = ({ workforce, addActor }: { workforce: Actor[]; addActor: (p: { type: 'human' | 'machine'; name: string; hourlyCost: number; hoursPerDay: number }) => void; }) => {
  const [type, setType] = useState<'human' | 'machine'>('human');
  const [name, setName] = useState('');
  const [hourlyCost, setHourlyCost] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addActor({ type, name: name.trim(), hourlyCost: Math.max(0, hourlyCost), hoursPerDay: Math.max(1, hoursPerDay) });
    setName('');
    setHourlyCost(0);
    setHoursPerDay(8);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
          <Users className="mr-2 text-indigo-600" /> Registrar humano/máquina
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Tipo</label>
            <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value as 'human' | 'machine')}>
              <option value="human">Humano</option>
              <option value="machine">Máquina</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Costo por hora</label>
            <input type="number" min={0} className="w-full border p-2 rounded" value={hourlyCost} onChange={e => setHourlyCost(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Horas por día</label>
            <input type="number" min={1} className="w-full border p-2 rounded" value={hoursPerDay} onChange={e => setHoursPerDay(parseInt(e.target.value) || 8)} />
          </div>
          <button className="w-full bg-indigo-600 text-white rounded p-2 flex items-center justify-center">
            <PlusCircle size={18} className="mr-2" /> Registrar
          </button>
        </form>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-800">
          <Cog className="mr-2 text-indigo-600" /> Humanos y máquinas
        </h2>
        <div className="space-y-2">
          {workforce.length > 0 ? (
            workforce.map(actor => (
              <div key={actor.id} className="flex justify-between items-center text-sm border-b py-2">
                <span className="capitalize">{actor.type}</span>
                <span className="font-semibold">{actor.name}</span>
                <span>${actor.hourlyCost.toFixed(2)}/h</span>
                <span>{actor.hoursPerDay} h/día</span>
                <span className="text-gray-600">{actor.status || 'idle'}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm">Sin registros.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkforceView;
