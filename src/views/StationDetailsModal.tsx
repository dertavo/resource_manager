import React, { useState } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';

type Product = { id: string; name: string; color?: string };
type InventoryItem = { productId: string; qty?: number; uniqueId?: string };
type Actor = { id: string; type: 'human' | 'machine'; name: string; hourlyCost?: number };


type Station = {
  id: string;
  name: string;
  finalProductName: string;
  inputProductIds: string[];
  status: string;
  remainingTime?: number;
  processingTime: number;
  warehouseId: string;
  stationIndex: number;
  assignedWorkerIds?: string[];
  assignedMachineIds?: string[];
  stopedRequest : boolean;
};

interface Props {
  station: Station | null;
  onClose: () => void;
  updateStationStatus: (warehouseId: string, stationIndex: number, status: string, processingMode?: 'once' | 'shift' | 'stock') => void;
  handleMoveFinalProductToInventory: (warehouseId: string, stationIndex: number) => void;
  products: Product[];
  inventory: InventoryItem[];
  company: any;
  workforce: Actor[];
  assignActorToStation: (actorId: string, warehouseId: string, stationIndex: number) => void;
  unassignActorFromStation: (actorId: string, warehouseId: string, stationIndex: number) => void;
  assignTaskToActor?: (actorId: string, warehouseId: string, stationIndex: number, durationHours: number) => void;
}

const StationDetailsModal: React.FC<Props> = ({ station, onClose, updateStationStatus, handleMoveFinalProductToInventory, products, inventory, company, workforce, assignActorToStation, unassignActorFromStation, assignTaskToActor }) => {
  const [taskHours, setTaskHours] = useState(8);
  const [processingMode, setProcessingMode] = useState<'once' | 'shift' | 'stock'>('once');
  if (!station) return null;

  const inputProductNames = station.inputProductIds
    .map((id: string) => products.find((p: Product) => p.id === id)?.name)
    .filter((name: string | undefined) => name) as string[];

  const inventoryCounts = inventory.reduce((acc: Record<string, number>, item: InventoryItem) => {
    acc[item.productId] = (acc[item.productId] || 0) + (item.qty || 1);
    return acc;
  }, {});
  const hasAssignedActors = ((station.assignedWorkerIds && station.assignedWorkerIds.length > 0) || (station.assignedMachineIds && station.assignedMachineIds.length > 0));
  const canStartProcessing = station.inputProductIds.every((inputProductId: string) =>
    (inventoryCounts[inputProductId] || 0) >= 1
  );
  const canStart = canStartProcessing && hasAssignedActors;

  const assignedWorkers = workforce.filter((a: Actor) => station.assignedWorkerIds?.includes(a.id));
  const assignedMachines = workforce.filter((a: Actor) => station.assignedMachineIds?.includes(a.id));
  const unassignedActors = workforce.filter((a: Actor) => !station.assignedWorkerIds?.includes(a.id) && !station.assignedMachineIds?.includes(a.id));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{station.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p className="flex items-center text-lg"><Factory className="mr-2 text-indigo-600" /> **Producto Final:** {station.finalProductName}</p>
          <div className="flex flex-col">
            <p className="flex items-center mb-2"><Box className="mr-2 text-green-600" /> **Ingredientes:**</p>
            <ul className="list-disc list-inside ml-4 text-sm">
              {inputProductNames.map((name: string, index: number) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Asignaciones</p>
              <div className="text-sm text-gray-700">
                <p className="mb-1">Humanos: {assignedWorkers.length > 0 ? assignedWorkers.map((a: Actor) => a.name).join(', ') : '—'}</p>
                <p>Máquinas: {assignedMachines.length > 0 ? assignedMachines.map((a: Actor) => a.name).join(', ') : '—'}</p>
              </div>
              {unassignedActors.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <select className="border p-2 rounded text-sm" onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    assignActorToStation(id, station.warehouseId, station.stationIndex);
                  }}>
                    <option value="">Asignar actor…</option>
                    {unassignedActors.map((a: Actor) => (
                      <option key={a.id} value={a.id}>{a.type === 'human' ? 'Humano' : 'Máquina'}: {a.name}</option>
                    ))}
                  </select>
                  {assignTaskToActor && (assignedWorkers.length > 0 || assignedMachines.length > 0) && (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 block mb-1">Horas de tarea</label>
                        <input type="number" min={1} max={24} value={taskHours} onChange={e => setTaskHours(parseInt(e.target.value))} className="w-full border p-1 rounded text-sm" />
                      </div>
                      <button onClick={() => {
                        const selectedId = (assignedWorkers[0] || assignedMachines[0])?.id;
                        if (selectedId) assignTaskToActor(selectedId, station.warehouseId, station.stationIndex, taskHours);
                      }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                        Asignar Tarea
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {station.status === 'completed'  ? (
            <div className="flex flex-col items-start gap-2">
              <p className="flex items-center text-green-700">
                <CheckCircle className="mr-2"/> Proceso completado. Producto listo para mover.
              </p>
              <p className="text-md font-semibold text-gray-800">Producto final: {station.finalProductName}</p>
              <button
                onClick={() => handleMoveFinalProductToInventory(station.warehouseId, station.stationIndex)}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
              >
                <Package size={18} className="mr-2"/>
                Mover a Inventario
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700">Modo de procesamiento</label>
                <select
                  className="border p-2 rounded text-sm"
                  value={processingMode}
                  onChange={e => setProcessingMode(e.target.value as 'once' | 'shift' | 'stock')}
                >
                  <option value="once">Una sola corrida</option>
                  <option value="shift">Mientras dure la jornada</option>
                  <option value="stock">Mientras haya insumos</option>
                </select>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 text-blue-600" />
                <p className="font-semibold">Tiempo restante:</p>
                <span className="ml-2 font-bold text-xl">{station.remainingTime !== undefined ? station.remainingTime : station.processingTime}s</span>
              </div>
              <button
                onClick={() => updateStationStatus(station.warehouseId, station.stationIndex, 'processing', processingMode)}
                disabled={station.status === 'stopping' ||  station.status === 'completed' || !canStart}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                  station.status === 'processing'
                ? 'bg-yellow-500 cursor-not-allowed'
                : station.status === 'completed'
                  ? 'bg-green-500 cursor-not-allowed'
                  : station.status === 'stopping'
                    ? 'bg-orange-500 cursor-not-allowed'
                    : !canStart
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                            }`}
              >
                <Play size={18} className="mr-2"/>
                {station.status === 'processing' ? 'Procesando...' :  station.status === 'completed'  ? 'Completado' : station.status === 'stopping' ? 'Deteniendo...' : 'Iniciar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationDetailsModal;