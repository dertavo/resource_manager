import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';

const StationDetailsModal = ({ station, onClose, updateStationStatus, handleMoveFinalProductToInventory, products, inventory }) => {
  if (!station) return null;

  console.log(station)

  const inputProductNames = station.inputProductIds
    .map(id => products.find(p => p.id === id)?.name)
    .filter(name => name);

  const inventoryCounts = inventory.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + 1;
    return acc;
  }, {});
  const canStartProcessing = station.inputProductIds.every(inputProductId =>
    (inventoryCounts[inputProductId] || 0) >= 1
  );

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
              {inputProductNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 text-blue-600" />
                <p className="font-semibold">Tiempo restante:</p>
                <span className="ml-2 font-bold text-xl">{station.remainingTime !== undefined ? station.remainingTime : station.processingTime}s</span>
              </div>
              <button
                onClick={() => updateStationStatus(station.warehouseId, station.stationIndex, 'processing')}
                disabled={station.status === 'processing' || station.status === 'completed' || !canStartProcessing}
                className={`flex items-center px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                  station.status === 'processing'
                    ? 'bg-yellow-500 cursor-not-allowed'
                    : station.status === 'completed'
                      ? 'bg-green-500 cursor-not-allowed'
                      : !canStartProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <Play size={18} className="mr-2"/>
                {station.status === 'processing' ? 'Procesando...' : station.status === 'completed' ? 'Completado' : 'Iniciar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationDetailsModal;