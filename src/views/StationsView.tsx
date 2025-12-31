// StationsView.jsx
import React, { useState } from "react";
import { Factory, Clock, Trash2 } from "lucide-react"; // O el paquete de iconos que uses


interface Station {
  name: string;
  finalProductName: string;
  inputProductIds: number[]; // o string[] según tu caso
  cost : string | number;
}


const StationsView = ({ inventory, stations, handleStationFormSubmit, handleDeleteStation }) => {
  const [newStation, setNewStation] = useState<Station>({
    name: '',
    finalProductName: '',
    inputProductIds: [],
    cost : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleStationFormSubmit(newStation);
    setNewStation({ name: '', finalProductName: '', inputProductIds: [] , cost : ''});
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
        <Factory className="mr-2 text-indigo-600" />
        Crear y Gestionar Estaciones
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de nueva estación */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Nueva Estación</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
              <input
                type="text"
                value={newStation.name}
                onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Producto Final</label>
              <input
                type="text"
                value={newStation.finalProductName}
                onChange={(e) => setNewStation({ ...newStation, finalProductName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Productos de Entrada</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-md border border-gray-300 bg-white">
                {inventory.length > 0 ? (
                  inventory.map(product => (
                    <label key={product.productId} className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        value={product.productId}
                        checked={newStation.inputProductIds.includes(product.productId)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewStation(prevState => ({
                            ...prevState,
                            inputProductIds: checked
                              ? [...prevState.inputProductIds, product.productId]
                              : prevState.inputProductIds.filter(id => id !== product.productId),
                          }));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{product.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="col-span-2 text-gray-500 text-center">No hay productos en el inventario.</p>
                )}
              </div>
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700">Costo</label>
              <input
                type="text"
                value={newStation.cost}
                onChange={(e) => setNewStation({ ...newStation, cost: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
            >
              Crear Estación
            </button>
          </form>
        </div>

        {/* Lista de estaciones */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Estaciones Existentes</h3>
          <div className="space-y-4">
            {stations.length > 0 ? (
              stations.map(station => (
                <div key={station.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">{station.name}</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Produce:</span> {station.finalProductName}
                    </p>
                     <p className="text-sm text-gray-600">
                      <span className="font-medium">Costo: $</span>{station.cost}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="mr-1 text-gray-500" size={14}/>
                      <span className="font-medium">Tiempo:</span> {station.processingTime} segundos
                    </p>
                  </div>
                  <button onClick={() => handleDeleteStation(station.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No hay estaciones. ¡Crea una!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsView;
