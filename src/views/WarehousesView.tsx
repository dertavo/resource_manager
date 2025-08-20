import React, { useState , useEffect} from 'react';
import {Archive, Clock, CheckCircle} from 'lucide-react';

const WarehousesView = ({
  warehouses,
  stations,
  setStations,
  handleWarehouseFormSubmit,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleStationDrop,
  handleDropToAvailableStations,
  openStationDetailsModal,
  draggedItem,
  setMessage
}) => {
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    gridSize: 3,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleWarehouseFormSubmit(newWarehouse);
    setNewWarehouse({ name: '', gridSize: 3 });
  };

  return (
    <div className="w-full max-w-5xl p-6 bg-white custom-card mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
        <Archive className="mr-2 text-indigo-600" />
        Almacenes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Almacén</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Almacén</label>
              <input
                type="text"
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tamaño de la Cuadrícula</label>
              <input
                type="number"
                value={newWarehouse.gridSize}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, gridSize: Math.max(1, parseInt(e.target.value) || 1) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
            >
              Crear Almacén
            </button>
          </form>
        </div>
        <div
          className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropToAvailableStations}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Estaciones Disponibles</h3>
          <p className="text-sm text-gray-500 mb-4">Arrastra una estación de vuelta aquí para quitarla de un almacén.</p>
          <div className="flex flex-wrap gap-2">
            {stations.length > 0 ? (
              stations.map(station => (
                <div
                  key={station.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, station, 'station')}
                  className="cursor-grab p-3 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
                  style={{ backgroundColor: `hsl(${Math.random() * 360}, 50%, 60%)` }}
                >
                  {station.name}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay estaciones. Crea una en la pestaña "Estaciones".</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-8">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{warehouse.name}</h3>
            <div
              className="grid gap-2 p-4 bg-gray-100 rounded-lg"
              style={{
                gridTemplateColumns: `repeat(${warehouse.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {warehouse.stations.map((station, index) => (
                <div
                  key={station ? `${station.id}-${index}` : `empty-${index}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleStationDrop(e, warehouse.id, index)}
                  onClick={() => station && openStationDetailsModal(station, warehouse.id, index)}
                  className={`h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-2 transition-colors ${station ? 'cursor-pointer' : 'hover:bg-gray-200'}`}
                  style={{
                    backgroundColor: station ? (station.status === 'processing' ? 'rgb(254 243 199)' : station.status === 'completed' ? 'rgb(198 246 213)' : 'rgb(219 234 254)') : 'transparent',
                  }}
                >
                  {station && (
                    <div
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, station, 'station')}
                      className="w-full h-full flex flex-col items-center justify-center rounded-md text-center text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing p-2"
                    >
                      <span className="text-gray-800">{station.name}</span>
                      {station.status === 'processing' && (
                        <span className="text-xs text-gray-600 mt-1 flex items-center">
                          <Clock size={12} className="mr-1"/>
                          {station.remainingTime}s
                        </span>
                      )}
                      {station.status === 'completed' && (
                        <span className="text-xs text-green-700 mt-1 flex items-center">
                          <CheckCircle size={12} className="mr-1"/>
                          Completado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default WarehousesView;