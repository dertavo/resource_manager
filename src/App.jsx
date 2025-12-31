import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Factory, Box, ShoppingCart, Archive, PlusSquare, MinusSquare, Trash2, Clock, Play, CheckCircle, Package, X } from 'lucide-react';

import OrganizerView from './views/OrganizerView';
import RegisterView from './views/RegisterView';
import BuyView from './views/BuyView';
import StationsView from './views/StationsView';

import WarehousesView from './views/WarehousesView';

import StationDetailsModal from './views/StationDetailsModal';
import CompanyView from './views/CompanyView';
import WorkforceView from './views/WorkforceView';
import PersonalPanel from './components/PersonalPanel';

// Genera un ID único para cada elemento
const generateId = () => Math.random().toString(36).substring(2, 9);

// Componente de vista del Organizador
// const OrganizerView = ({
//   shelves,
//   inventorySummary,
//   inventory,
//   setShelves,
//   setInventory,
//   handleDragStart,
//   handleDragOver,
//   handleDragLeave,
//   handleDrop,
//   handleDropToInventory,
//   handleDropToTrash,
//   setMessage,
//   draggedItem
// }) => {
//   const [shelvesToCreate, setShelvesToCreate] = useState(3);
//   const [shelfCapacity, setShelfCapacity] = useState(3);

//   const generateInitialLayout = () => {
//     const newShelves = Array.from({ length: shelvesToCreate }, (_, i) => ({
//       id: `shelf-${i}`,
//       items: [],
//       capacity: shelfCapacity,
//     }));
//     setShelves(newShelves);
//   };

//   return (
//     <>
//       <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
//         <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
//           <Archive className="mr-2 text-indigo-600" />
//           Configuración de Estantes
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col">
//             <label className="block text-sm font-medium text-gray-600 mb-1">Número de Estantes</label>
//             <div className="flex items-center">
//               <button
//                 onClick={() => setShelvesToCreate(prev => Math.max(1, prev - 1))}
//                 className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md transition-colors"
//               >
//                 <MinusSquare size={16} />
//               </button>
//               <input
//                 type="number"
//                 value={shelvesToCreate}
//                 onChange={(e) => setShelvesToCreate(Math.max(1, parseInt(e.target.value) || 1))}
//                 className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
//               />
//               <button
//                 onClick={() => setShelvesToCreate(prev => prev + 1)}
//                 className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md transition-colors"
//               >
//                 <PlusSquare size={16} />
//               </button>
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <label className="block text-sm font-medium text-gray-600 mb-1">Capacidad de Estantes</label>
//             <div className="flex items-center">
//               <button
//                 onClick={() => setShelfCapacity(prev => Math.max(1, prev - 1))}
//                 className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md transition-colors"
//               >
//                 <MinusSquare size={16} />
//               </button>
//               <input
//                 type="number"
//                 value={shelfCapacity}
//                 onChange={(e) => setShelfCapacity(Math.max(1, parseInt(e.target.value) || 1))}
//                 className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
//               />
//               <button
//                 onClick={() => setShelfCapacity(prev => prev + 1)}
//                 className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md transition-colors"
//               >
//                 <PlusSquare size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//         <button
//           onClick={generateInitialLayout}
//           className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
//         >
//           Generar Estantes
//         </button>
//       </div>
//       <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="flex flex-col gap-8">
//           <div
//             className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300 flex-grow"
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDropToInventory}
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventario (Arrastra para organizar)</h2>
//             <div className="flex flex-wrap gap-4">
//               {inventorySummary.length > 0 ? (
//                 inventorySummary.map(item => (
//                   <div
//                     key={item.productId}
//                     draggable="true"
//                     onDragStart={(e) => handleDragStart(e, item, 'grouped-inventory')}
//                     className="cursor-grab p-4 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
//                     style={{ backgroundColor: item.color }}
//                   >
//                     <p>{item.name}</p>
//                     <p className="mt-1 font-bold">({item.count})</p>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500">No hay elementos disponibles. ¡Ve a la tienda y compra algunos!</p>
//               )}
//             </div>
//           </div>
//           <div
//             className="bg-red-100 p-6 rounded-xl shadow-lg border-2 border-dashed border-red-300 flex items-center justify-center min-h-[8rem] transition-colors"
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDropToTrash}
//           >
//             <div className="flex flex-col items-center justify-center text-red-500">
//               <Trash2 size={48} />
//               <p className="mt-2 text-lg font-semibold">Basurero</p>
//               <p className="text-sm">Arrastra y suelta aquí para eliminar</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-lg">
//           <h2 className="text-2xl font-semibold mb-4 text-gray-700">Estantes</h2>
//           <div className="flex flex-col gap-4">
//             {shelves.map((shelf, shelfIndex) => (
//               <div
//                 key={shelf.id}
//                 data-type="shelf"
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, shelf.id, shelf.capacity)}
//                 className="bg-gray-50 border border-gray-200 p-4 rounded-lg transition-all duration-200"
//               >
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-lg font-medium text-gray-700">Estante {shelfIndex + 1}</span>
//                   <span className="text-sm text-gray-500 font-semibold">
//                     ({shelf.items.length}/{shelf.capacity})
//                   </span>
//                 </div>
//                 <div className="min-h-[4rem] flex flex-wrap gap-2">
//                   {shelf.items.map((item) => (
//                     <div
//                       key={item.uniqueId}
//                       draggable="true"
//                       onDragStart={(e) => handleDragStart(e, item, 'shelf', item.uniqueId)}
//                       className="cursor-grab p-2 rounded-lg shadow-sm text-xs font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
//                       style={{ backgroundColor: item.color }}
//                     >
//                       {item.name}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// Componente de vista de Registro de Productos
// const RegisterView = ({ handleProductFormSubmit }) => {
//   const [newProduct, setNewProduct] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: 1,
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     handleProductFormSubmit(newProduct);
//     setNewProduct({ name: '', description: '', price: '', stock: 1 });
//   };

//   return (
//     <div className="w-full max-w-2xl p-6 bg-white custom-card mb-8">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
//         <Box className="mr-2 text-indigo-600" />
//         Registrar Nuevo Producto
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Nombre</label>
//           <input
//             type="text"
//             value={newProduct.name}
//             onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Descripción</label>
//           <textarea
//             value={newProduct.description}
//             onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
//             rows="3"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           ></textarea>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Precio</label>
//           <input
//             type="number"
//             step="0.01"
//             value={newProduct.price}
//             onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Cantidad Inicial (Stock)</label>
//           <input
//             type="number"
//             min="1"
//             value={newProduct.stock}
//             onChange={(e) => setNewProduct({ ...newProduct, stock: Math.max(1, parseInt(e.target.value) || 1) })}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
//         >
//           Registrar Producto
//         </button>
//       </form>
//     </div>
//   );
// };

// Componente de vista de la Tienda
// const ProductCardWithSelector = ({ product, quantity, onQuantityChange }) => {
//   const handleDecrease = () => {
//     onQuantityChange(Math.max(0, quantity - 1));
//   };

//   const handleIncrease = () => {
//     onQuantityChange(quantity + 1);
//   };

//   return (
//     <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
//       <div className="flex items-center mb-2">
//         <div className="w-8 h-8 rounded-full mr-3" style={{ backgroundColor: product.color }}></div>
//         <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
//       </div>
//       <p className="text-sm text-gray-600 mb-2">{product.description || 'Sin descripción.'}</p>
//       <div className="flex justify-between items-center mb-2">
//         <span className="text-md font-bold text-indigo-600">
//           ${product.price ? product.price.toFixed(2) : '0.00'}
//         </span>
//         <span className="text-sm font-semibold text-gray-500">
//           Disponible: {product.stock}
//         </span>
//       </div>
//       <div className="flex items-center justify-between mt-4">
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={handleDecrease}
//             className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
//           >
//             <MinusSquare size={16} />
//           </button>
//           <input
//             type="number"
//             value={quantity || 0}
//             onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
//             className="w-12 text-center border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
//             min="0"
//           />
//           <button
//             onClick={handleIncrease}
//             className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
//           >
//             <PlusSquare size={16} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };




// const BuyView = ({ products, handleAddToCartAll }) => {
//   const [productQuantities, setProductQuantities] = useState({});

//   const handleAddAll = () => {
//     handleAddToCartAll(productQuantities);
//     setProductQuantities({});
//   };

//   return (
//     <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
//         <ShoppingCart className="mr-2 text-indigo-600" />
//         Tienda de Productos
//       </h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {products.length > 0 ? (
//           products.map(product => (
//             <ProductCardWithSelector
//               key={product.id}
//               product={product}
//               quantity={productQuantities[product.id] || 0}
//               onQuantityChange={(newQuantity) =>
//                 setProductQuantities(prev => ({
//                   ...prev,
//                   [product.id]: newQuantity,
//                 }))
//               }
//             />
//           ))
//         ) : (
//           <p className="col-span-3 text-center text-gray-500">No hay productos registrados. ¡Regístralos primero!</p>
//         )}
//       </div>
//       {products.length > 0 && (
//         <div className="mt-8 pt-4 border-t-2 border-gray-200">
//           <button
//             onClick={handleAddAll}
//             className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-green-600"
//           >
//             <ShoppingCart size={20} />
//             <span>Agregar todos los productos seleccionados</span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// Componente de vista de Estaciones
// const StationsView = ({ products, stations, handleStationFormSubmit, handleDeleteStation }) => {
//   const [newStation, setNewStation] = useState({
//     name: '',
//     finalProductName: '',
//     inputProductIds: [],
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     handleStationFormSubmit(newStation);
//     setNewStation({ name: '', finalProductName: '', inputProductIds: [] });
//   };

//   return (
//     <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
//         <Factory className="mr-2 text-indigo-600" />
//         Crear y Gestionar Estaciones
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">Nueva Estación</h3>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
//               <input
//                 type="text"
//                 value={newStation.name}
//                 onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Producto Final</label>
//               <input
//                 type="text"
//                 value={newStation.finalProductName}
//                 onChange={(e) => setNewStation({ ...newStation, finalProductName: e.target.value })}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Productos de Entrada</label>
//               <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-md border border-gray-300 bg-white">
//                 {products.length > 0 ? (
//                   products.map(product => (
//                     <label key={product.id} className="flex items-center space-x-2 text-sm text-gray-700">
//                       <input
//                         type="checkbox"
//                         value={product.id}
//                         checked={newStation.inputProductIds.includes(product.id)}
//                         onChange={(e) => {
//                           const checked = e.target.checked;
//                           setNewStation(prevState => ({
//                             ...prevState,
//                             inputProductIds: checked
//                               ? [...prevState.inputProductIds, product.id]
//                               : prevState.inputProductIds.filter(id => id !== product.id),
//                           }));
//                         }}
//                         className="rounded text-indigo-600 focus:ring-indigo-500"
//                       />
//                       <span>{product.name}</span>
//                     </label>
//                   ))
//                 ) : (
//                   <p className="col-span-2 text-gray-500 text-center">No hay productos. Regístralos primero.</p>
//                 )}
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
//             >
//               Crear Estación
//             </button>
//           </form>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-lg">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">Estaciones Existentes</h3>
//           <div className="space-y-4">
//             {stations.length > 0 ? (
//               stations.map(station => (
//                 <div key={station.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
//                   <div>
//                     <h4 className="font-semibold text-lg text-gray-800">{station.name}</h4>
//                     <p className="text-sm text-gray-600">
//                       <span className="font-medium">Produce:</span> {station.finalProductName}
//                     </p>
//                     <p className="text-sm text-gray-600 flex items-center">
//                       <Clock className="mr-1 text-gray-500" size={14}/>
//                       <span className="font-medium">Tiempo:</span> {station.processingTime} segundos
//                     </p>
//                   </div>
//                   <button onClick={() => handleDeleteStation(station.id)} className="text-gray-400 hover:text-red-500 transition-colors">
//                     <Trash2 size={20} />
//                   </button>
//                 </div>
//               ))
//             : (
//               <p className="text-gray-500 text-center">No hay estaciones. ¡Crea una!</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };



// Componente de vista de Almacenes
// const WarehousesView = ({
//   warehouses,
//   stations,
//   setStations,
//   handleWarehouseFormSubmit,
//   handleDragStart,
//   handleDragOver,
//   handleDragLeave,
//   handleStationDrop,
//   handleDropToAvailableStations,
//   openStationDetailsModal,
//   draggedItem,
//   setMessage
// }) => {
//   const [newWarehouse, setNewWarehouse] = useState({
//     name: '',
//     gridSize: 3,
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     handleWarehouseFormSubmit(newWarehouse);
//     setNewWarehouse({ name: '', gridSize: 3 });
//   };

//   return (
//     <div className="w-full max-w-5xl p-6 bg-white custom-card mb-8">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
//         <Archive className="mr-2 text-indigo-600" />
//         Almacenes
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Almacén</h3>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Nombre del Almacén</label>
//               <input
//                 type="text"
//                 value={newWarehouse.name}
//                 onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Tamaño de la Cuadrícula</label>
//               <input
//                 type="number"
//                 value={newWarehouse.gridSize}
//                 onChange={(e) => setNewWarehouse({ ...newWarehouse, gridSize: Math.max(1, parseInt(e.target.value) || 1) })}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
//             >
//               Crear Almacén
//             </button>
//           </form>
//         </div>
//         <div
//           className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300"
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDropToAvailableStations}
//         >
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">Estaciones Disponibles</h3>
//           <p className="text-sm text-gray-500 mb-4">Arrastra una estación de vuelta aquí para quitarla de un almacén.</p>
//           <div className="flex flex-wrap gap-2">
//             {stations.length > 0 ? (
//               stations.map(station => (
//                 <div
//                   key={station.id}
//                   draggable="true"
//                   onDragStart={(e) => handleDragStart(e, station, 'station')}
//                   className="cursor-grab p-3 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
//                   style={{ backgroundColor: `hsl(${Math.random() * 360}, 50%, 60%)` }}
//                 >
//                   {station.name}
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500">No hay estaciones. Crea una en la pestaña "Estaciones".</p>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="mt-8 space-y-8">
//         {warehouses.map(warehouse => (
//           <div key={warehouse.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800">{warehouse.name}</h3>
//             <div
//               className="grid gap-2 p-4 bg-gray-100 rounded-lg"
//               style={{
//                 gridTemplateColumns: `repeat(${warehouse.gridSize}, minmax(0, 1fr))`,
//               }}
//             >
//               {warehouse.stations.map((station, index) => (
//                 <div
//                   key={station ? `${station.id}-${index}` : `empty-${index}`}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={(e) => handleStationDrop(e, warehouse.id, index)}
//                   onClick={() => station && openStationDetailsModal(station, warehouse.id, index)}
//                   className={`h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-2 transition-colors ${station ? 'cursor-pointer' : 'hover:bg-gray-200'}`}
//                   style={{
//                     backgroundColor: station ? (station.status === 'processing' ? 'rgb(254 243 199)' : station.status === 'completed' ? 'rgb(198 246 213)' : 'rgb(219 234 254)') : 'transparent',
//                   }}
//                 >
//                   {station && (
//                     <div
//                       draggable="true"
//                       onDragStart={(e) => handleDragStart(e, station, 'station')}
//                       className="w-full h-full flex flex-col items-center justify-center rounded-md text-center text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing p-2"
//                     >
//                       <span className="text-gray-800">{station.name}</span>
//                       {station.status === 'processing' && (
//                         <span className="text-xs text-gray-600 mt-1 flex items-center">
//                           <Clock size={12} className="mr-1"/>
//                           {station.remainingTime}s
//                         </span>
//                       )}
//                       {station.status === 'completed' && (
//                         <span className="text-xs text-green-700 mt-1 flex items-center">
//                           <CheckCircle size={12} className="mr-1"/>
//                           Completado
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// Componente modal de detalles de la estación
// const StationDetailsModal = ({ station, onClose, updateStationStatus, handleMoveFinalProductToInventory, products, inventory }) => {
//   if (!station) return null;

//   const inputProductNames = station.inputProductIds
//     .map(id => products.find(p => p.id === id)?.name)
//     .filter(name => name);

//   const inventoryCounts = inventory.reduce((acc, item) => {
//     acc[item.productId] = (acc[item.productId] || 0) + 1;
//     return acc;
//   }, {});
//   const canStartProcessing = station.inputProductIds.every(inputProductId =>
//     (inventoryCounts[inputProductId] || 0) >= 1
//   );

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-transform duration-300 scale-100">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-2xl font-bold text-gray-800">{station.name}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
//             <X size={24} />
//           </button>
//         </div>
//         <div className="space-y-4 text-gray-700">
//           <p className="flex items-center text-lg"><Factory className="mr-2 text-indigo-600" /> **Producto Final:** {station.finalProductName}</p>
//           <div className="flex flex-col">
//             <p className="flex items-center mb-2"><Box className="mr-2 text-green-600" /> **Ingredientes:**</p>
//             <ul className="list-disc list-inside ml-4 text-sm">
//               {inputProductNames.map((name, index) => (
//                 <li key={index}>{name}</li>
//               ))}
//             </ul>
//           </div>
//           {station.status === 'completed' && station.finalProduct ? (
//             <div className="flex flex-col items-start gap-2">
//               <p className="flex items-center text-green-700">
//                 <CheckCircle className="mr-2"/> Proceso completado. Producto listo para mover.
//               </p>
//               <p className="text-md font-semibold text-gray-800">Producto final: {station.finalProduct.name}</p>
//               <button
//                 onClick={() => handleMoveFinalProductToInventory(station.warehouseId, station.stationIndex)}
//                 className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
//               >
//                 <Package size={18} className="mr-2"/>
//                 Mover a Inventario
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <Clock className="mr-2 text-blue-600" />
//                 <p className="font-semibold">Tiempo restante:</p>
//                 <span className="ml-2 font-bold text-xl">{station.remainingTime !== undefined ? station.remainingTime : station.processingTime}s</span>
//               </div>
//               <button
//                 onClick={() => updateStationStatus(station.warehouseId, station.stationIndex, 'processing')}
//                 disabled={station.status === 'processing' || station.status === 'completed' || !canStartProcessing}
//                 className={`flex items-center px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
//                   station.status === 'processing'
//                     ? 'bg-yellow-500 cursor-not-allowed'
//                     : station.status === 'completed'
//                       ? 'bg-green-500 cursor-not-allowed'
//                       : !canStartProcessing
//                         ? 'bg-gray-400 cursor-not-allowed'
//                         : 'bg-green-500 hover:bg-green-600'
//                 }`}
//               >
//                 <Play size={18} className="mr-2"/>
//                 {station.status === 'processing' ? 'Procesando...' : station.status === 'completed' ? 'Completado' : 'Iniciar'}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// Componente modal del carrito
const CartView = ({ cartItems, onPurchase, onClose, onUpdateCart }) => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + ((item.displayPrice || item.price) * item.quantity), 0).toFixed(2);
  };

  const handleRemoveItem = (itemId) => {
    onUpdateCart(cartItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      const updatedCart = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      onUpdateCart(updatedCart);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Carrito de Compras</h2>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">El carrito está vacío.</p>
        ) : (
          <>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <h4 className="font-semibold">{item.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">Precio: ${(item.displayPrice || item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold">${((item.displayPrice || item.price) * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center font-bold text-2xl mb-4">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Seguir Comprando
                </button>
                <button
                  onClick={onPurchase}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Confirmar Compra
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App = () => {
  // Primero declaramos currentUser porque se necesita para otras inicializaciones
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? stored : 'store';
    } catch {
      return 'store';
    }
  });

  // Ahora podemos usar currentUser para inicializar currentView
  const [currentView, setCurrentView] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored === 'store' ? 'register' : 'organizer';
  });

    const [isDraggable, setIsDraggable] =useState(true);

  // Efecto para validar que el usuario tienda no acceda a vistas restringidas
  useEffect(() => {
    const restrictedViews = ['organizer', 'stations', 'warehouses', 'company', 'workforce'];
    if (currentUser === 'store' && restrictedViews.includes(currentView)) {
      setCurrentView('register'); // Redirigir a una vista permitida
    }
  }, [currentUser]);

  // Estados para la persistencia de datos
  const [products, setProducts] = useState(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      return storedProducts ? JSON.parse(storedProducts) : [];
    } catch (error) {
      console.error("Error al cargar productos de localStorage:", error);
      return [];
    }
  });
  const [shelves, setShelves] = useState(() => {
    try {
      const storedShelves = localStorage.getItem('shelves');
      return storedShelves ? JSON.parse(storedShelves) : [];
    } catch (error) {
      console.error("Error al cargar estantes de localStorage:", error);
      return [];
    }
  });
  const [stations, setStations] = useState(() => {
    try {
      const storedStations = localStorage.getItem('stations');
      return storedStations ? JSON.parse(storedStations) : [];
    } catch (error) {
      console.error("Error al cargar estaciones de localStorage:", error);
      return [];
    }
  });
  const [warehouses, setWarehouses] = useState(() => {
    try {
      const storedWarehouses = localStorage.getItem('warehouses');
      return storedWarehouses ? JSON.parse(storedWarehouses) : [];
    } catch (error) {
      console.error("Error al cargar almacenes de localStorage:", error);
      return [];
    }
  });

  // Estado para el inventario global (lista plana de items)
  const [inventory, setInventory] = useState(() => {
    try {
      const storedInventory = localStorage.getItem('inventory');
      return storedInventory ? JSON.parse(storedInventory) : [];
    } catch (error) {
      console.error("Error al cargar inventario de localStorage:", error);
      return [];
    }
  });

  // Inventario independiente para usuario "store"
  const [storeInventory, setStoreInventory] = useState(() => {
    try {
      const stored = localStorage.getItem('storeInventory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Estados para el carrito
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [message, setMessage] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  // Nueva empresa y fuerza laboral
  const [company, setCompany] = useState(() => {
    try {
      const stored = localStorage.getItem('company');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [workforce, setWorkforce] = useState(() => {
    try {
      const stored = localStorage.getItem('workforce');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [personalInventory, setPersonalInventory] = useState(() => {
    try {
      const stored = localStorage.getItem('personalInventory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [actorTasks, setActorTasks] = useState(() => {
    try {
      const stored = localStorage.getItem('actorTasks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [dailyBalance, setDailyBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('dailyBalance');
      return stored ? JSON.parse(stored) : { date: new Date().toISOString().split('T')[0], income: 0, expenses: 0, entries: [] };
    } catch {
      return { date: new Date().toISOString().split('T')[0], income: 0, expenses: 0, entries: [] };
    }
  });

  // Balance global (todas las fuentes: ventas, compras, etc.)
  const [globalBalance, setGlobalBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('globalBalance');
      return stored ? JSON.parse(stored) : { income: 0, expenses: 0, entries: [] };
    } catch {
      return { income: 0, expenses: 0, entries: [] };
    }
  });

  // Configuración del día
  const [dayConfig, setDayConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('dayConfig');
      return stored ? JSON.parse(stored) : { startHour: 6, endHour: 4, canSleepFromHour: 22, speedMultiplier: 60 };
    } catch {
      return { startHour: 6, endHour: 4, canSleepFromHour: 22, speedMultiplier: 60 };
    }
  });

  // Tiempo actual del día (en horas decimales, ej: 6.5 = 6:30am)
  const [currentDayTime, setCurrentDayTime] = useState(() => {
    try {
      const stored = localStorage.getItem('currentDayTime');
      return stored ? parseFloat(stored) : dayConfig.startHour;
    } catch {
      return dayConfig.startHour;
    }
  });

  // Estado del reloj (corriendo o pausado)
  const [isClockRunning, setIsClockRunning] = useState(() => {
    try {
      const stored = localStorage.getItem('isClockRunning');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Número de día actual
  const [currentDay, setCurrentDay] = useState(() => {
    try {
      const stored = localStorage.getItem('currentDay');
      return stored ? parseInt(stored) : 1;
    } catch {
      return 1;
    }
  });

  const [productsForSale, setProductsForSale] = useState(() => {
    try {
      const stored = localStorage.getItem('productsForSale');
      return stored ? JSON.parse(stored) : { store: [], main: [] };
    } catch {
      return { store: [], main: [] };
    }
  });
  // Helpers para escoger inventario según usuario actual
  const getActiveInventory = () => currentUser === 'store' ? storeInventory : inventory;
  const updateActiveInventory = (updater) => {
    if (currentUser === 'store') {
      if (typeof updater === 'function') {
        setStoreInventory(prev => updater(prev));
      } else {
        setStoreInventory(updater);
      }
    } else {
      if (typeof updater === 'function') {
        setInventory(prev => updater(prev));
      } else {
        setInventory(updater);
      }
    }
  };

  // Avance automático del tiempo
  useEffect(() => {
    if (!isClockRunning) return;

    const interval = setInterval(() => {
      setCurrentDayTime(prev => {
        // Avanza 1 minuto in-game cada segundo real (multiplicado por speedMultiplier)
        const increment = (1 / 60) * (dayConfig.speedMultiplier / 60);
        let newTime = prev + increment;

        // Si el tiempo actual supera las 24 horas, reinicia desde 0
        if (newTime >= 24) {
          newTime = newTime - 24;
        }

        // Verificar si se alcanzó la hora de fin del día
        const { startHour, endHour } = dayConfig;
        const reachedEndHour = endHour < startHour 
          ? (prev < endHour && newTime >= endHour) || (prev >= startHour && newTime >= 24)
          : (prev < endHour && newTime >= endHour);
        
        if (reachedEndHour) {
          // Terminar el día automáticamente
          setTimeout(() => {
            finishDay();
          }, 100);
        }

        return newTime;
      });
    }, 1000); // Cada segundo real

    return () => clearInterval(interval);
  }, [isClockRunning, dayConfig.speedMultiplier, dayConfig.startHour, dayConfig.endHour]);

  // Función para terminar el día manualmente
  const finishDay = () => {
    // Transferir balance diario al global
    const netBalance = dailyBalance.income - dailyBalance.expenses;
    
    setGlobalBalance(prev => ({
      income: prev.income + dailyBalance.income,
      expenses: prev.expenses + dailyBalance.expenses,
      entries: [
        ...prev.entries,
        {
          id: `day-${currentDay}-transfer-${Date.now()}`,
          type: netBalance >= 0 ? 'income' : 'expense',
          amount: Math.abs(netBalance),
          description: `Balance del Día ${currentDay}`,
          timestamp: new Date().toISOString()
        }
      ]
    }));

    // Resetear balance diario
    setDailyBalance({
      date: new Date().toISOString().split('T')[0],
      income: 0,
      expenses: 0,
      entries: []
    });

    // Avanzar al siguiente día
    setCurrentDay(prev => prev + 1);
    setCurrentDayTime(dayConfig.startHour);
    setIsClockRunning(false);
    
    setMessage(`Día ${currentDay} finalizado. Balance transferido al global: $${netBalance.toFixed(2)}`);
  };

  // Verificar si se puede dormir (basado en la hora actual)
  const canSleep = () => {
    const { canSleepFromHour, startHour, endHour } = dayConfig;
    
    // Si endHour < startHour, significa que el día termina al día siguiente (ej: 6am - 4am)
    if (endHour < startHour) {
      // Puede dormir si la hora actual está entre canSleepFromHour y 24, o entre 0 y endHour
      return currentDayTime >= canSleepFromHour || currentDayTime <= endHour;
    } else {
      // Día normal: puede dormir si está entre canSleepFromHour y endHour
      return currentDayTime >= canSleepFromHour && currentDayTime <= endHour;
    }
  };
  const [isPersonalPanelVisible, setIsPersonalPanelVisible] = useState(() => {
    try {
      const stored = localStorage.getItem('isPersonalPanelVisible');
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [priceModalItem, setPriceModalItem] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  // Estados para el sistema de solicitudes de productos
  const [productRequests, setProductRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('productRequests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [requestDestination, setRequestDestination] = useState('tienda'); // 'tienda' o 'publico'
  const [publicSaleProducts, setPublicSaleProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('publicSaleProducts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Referencia para almacenar los temporizadores de las estaciones
  const stationTimersRef = useRef({});

  // Guarda los datos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shelves', JSON.stringify(shelves));
  }, [shelves]);

  useEffect(() => {
    localStorage.setItem('stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('company', JSON.stringify(company));
  }, [company]);
  useEffect(() => {
    localStorage.setItem('workforce', JSON.stringify(workforce));
  }, [workforce]);
  useEffect(() => {
    localStorage.setItem('personalInventory', JSON.stringify(personalInventory));
  }, [personalInventory]);
  useEffect(() => {
    localStorage.setItem('actorTasks', JSON.stringify(actorTasks));
  }, [actorTasks]);
  useEffect(() => {
    localStorage.setItem('dailyBalance', JSON.stringify(dailyBalance));
  }, [dailyBalance]);
  useEffect(() => {
    localStorage.setItem('currentUser', currentUser);
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('productsForSale', JSON.stringify(productsForSale));
  }, [productsForSale]);
  useEffect(() => {
    localStorage.setItem('isPersonalPanelVisible', JSON.stringify(isPersonalPanelVisible));
  }, [isPersonalPanelVisible]);
  useEffect(() => {
    localStorage.setItem('productRequests', JSON.stringify(productRequests));
  }, [productRequests]);
  useEffect(() => {
    localStorage.setItem('publicSaleProducts', JSON.stringify(publicSaleProducts));
  }, [publicSaleProducts]);

  useEffect(() => {
    localStorage.setItem('dayConfig', JSON.stringify(dayConfig));
  }, [dayConfig]);

  useEffect(() => {
    localStorage.setItem('currentDayTime', currentDayTime.toString());
  }, [currentDayTime]);

  useEffect(() => {
    localStorage.setItem('isClockRunning', JSON.stringify(isClockRunning));
  }, [isClockRunning]);

  useEffect(() => {
    localStorage.setItem('currentDay', currentDay.toString());
  }, [currentDay]);
  useEffect(() => {
    localStorage.setItem('globalBalance', JSON.stringify(globalBalance));
  }, [globalBalance]);

  // Genera los estantes iniciales si no existen
  useEffect(() => {
    // if (shelves.length === 0) {
    //   // Usar una capacidad predeterminada de 3 y 3 estantes
    //   const defaultShelves = Array.from({ length: 3 }, (_, i) => ({
    //     id: `shelf-${i}`,
    //     items: [],
    //     capacity: 3,
    //   }));
    //   setShelves(defaultShelves);
    // }
  }, [shelves]);

  useEffect(() =>{

    
  },[inventory]);

  // Persistencia de storeInventory
  useEffect(() => {
    localStorage.setItem('storeInventory', JSON.stringify(storeInventory));
  }, [storeInventory]);

  // Nuevo useEffect para manejar los temporizadores de manera independiente
  useEffect(() => {
    warehouses.forEach(warehouse => {
      warehouse.stations.forEach((station, stationIndex) => {
        if (station && station.status === 'processing' && !stationTimersRef.current[station.id]) {
          stationTimersRef.current[station.id] = setInterval(() => {
            // Costos de labor y estados de actores (1 segundo = 1 hora simulada)
            if (company) {
              const assignedWorkerIds = station.assignedWorkerIds || [];
              const assignedMachineIds = station.assignedMachineIds || [];
              const actors = workforce.filter(a => assignedWorkerIds.includes(a.id) || assignedMachineIds.includes(a.id));
              const hourlyTotal = actors.reduce((sum, a) => sum + (a.hourlyCost || 0), 0);
              if (hourlyTotal > 0) {
                setCompany(prev => {
                  if (!prev) return prev;
                  const entry = {
                    id: generateId(),
                    type: 'expense',
                    amount: hourlyTotal,
                    description: `Labor ${station.name}`,
                    date: new Date().toISOString(),
                  };
                  return { ...prev, capital: (prev.capital || 0) - hourlyTotal, ledger: [...(prev.ledger || []), entry] };
                });
                // Actualizar balance diario
                setDailyBalance(prev => {
                  const entry = {
                    id: generateId(),
                    type: 'expense',
                    amount: hourlyTotal,
                    description: `Labor: ${station.name}`,
                    timestamp: new Date().toISOString(),
                  };
                  return {
                    ...prev,
                    expenses: prev.expenses + hourlyTotal,
                    entries: [...prev.entries, entry],
                  };
                });
              }
              if (actors.length > 0) {
                setWorkforce(prev => prev.map(a => {
                  if (assignedWorkerIds.includes(a.id)) {
                    const fatigue = Math.min(100, (a.fatigue || 0) + 5);
                    const hoursWorked = (a.hoursWorkedToday || 0) + 1;
                    return { ...a, fatigue, hoursWorkedToday: hoursWorked, status: 'working' };
                  }
                  if (assignedMachineIds.includes(a.id)) {
                    const maintenance = Math.min(100, (a.maintenanceNeed || 0) + 3);
                    return { ...a, maintenanceNeed: maintenance, status: 'working' };
                  }
                  return a;
                }));
              }
            }
            setWarehouses(prevWarehouses => {
              let completed = false;
              const newWarehouses = prevWarehouses.map(w => {
                if (w.id === warehouse.id) {
                  const newStations = [...w.stations];
                  if (newStations[stationIndex]) {
                    const newTime = newStations[stationIndex].remainingTime - 1;
                    if (newTime <= 0) {
                      clearInterval(stationTimersRef.current[station.id]);
                      delete stationTimersRef.current[station.id];
                      completed = true;
                      return {
                        ...w,
                        stations: newStations.map((s, idx) =>
                          idx === stationIndex ? { ...s, status: 'completed', remainingTime: 0 } : s
                        ),
                      };
                    }
                    return {
                      ...w,
                      stations: newStations.map((s, idx) =>
                        idx === stationIndex ? { ...s, remainingTime: newTime } : s
                      ),
                    };
                  }
                }
                return w;
              });
              if (completed) {
                handleProcessingCycleComplete(warehouse.id, stationIndex, station.processingMode || 'once');
              }
              return newWarehouses;
            });
          }, 1000);
        }
      });
    });

    return () => {
      Object.values(stationTimersRef.current).forEach(clearInterval);
      stationTimersRef.current = {};
    };
  }, [warehouses, inventory, products, company, workforce]);

  // Funciones principales de la aplicación
  const getAvailableItems = () => {
    const itemsInShelves = shelves.flatMap(s => s.items.map(item => item.uniqueId));

    return inventory.filter(item => !itemsInShelves.includes(item.uniqueId));
  };

  // Cantidad disponible de un producto en inventario (suma qty)
  const getInventoryCount = (productId, inv = inventory) =>
    inv.reduce((sum, item) => sum + (item.productId === productId ? (item.qty || 1) : 0), 0);

  const hasEnoughIngredientsForStation = (station, inv = inventory) =>
    (station?.inputProductIds || []).every(pid => getInventoryCount(pid, inv) > 0);

  const consumeIngredientsForStation = (station, inv = inventory) => {
    let next = [...inv];
    (station?.inputProductIds || []).forEach(pid => {
      const idx = next.findIndex(item => item.productId === pid && (item.qty || 1) > 0);
      if (idx !== -1) {
        const item = next[idx];
        const remaining = (item.qty || 1) - 1;
        if (remaining <= 0) {
          next.splice(idx, 1);
        } else {
          next[idx] = { ...item, qty: remaining };
        }
      }
    });
    return next;
  };

  const actorsHaveHoursLeft = (station) => {
    const assignedWorkerIds = station.assignedWorkerIds || [];
    const assignedMachineIds = station.assignedMachineIds || [];
    const actors = workforce.filter(a => assignedWorkerIds.includes(a.id) || assignedMachineIds.includes(a.id));
    if (actors.length === 0) return false;
    return actors.every(a => (a.hoursPerDay || 0) - (a.hoursWorkedToday || 0) > 0);
  };

  const canAutoContinue = (station, inv = inventory) => {
    if (!station) return false;
    const hasAssignedActors = ((station.assignedWorkerIds && station.assignedWorkerIds.length > 0) || (station.assignedMachineIds && station.assignedMachineIds.length > 0));
    if (!hasAssignedActors) return false;
    if (!hasEnoughIngredientsForStation(station, inv)) return false;
    if (station.processingMode === 'shift') {
      return actorsHaveHoursLeft(station);
    }
    if (station.processingMode === 'stock') {
      return true;
    }
    return false;
  };

  const addFinalProductToInventory = (station, baseInventory = inventory) => {
    const productId = station.finalProductId || station.id; // fallback stable id per station
    const color = station.finalProductColor || `hsl(${Math.random() * 360}, 70%, 80%)`;
    const next = [...baseInventory];
    const idx = next.findIndex(item => item.productId === productId);
    if (idx !== -1) {
      const item = next[idx];
      next[idx] = { ...item, qty: (item.qty || 1) + 1 };
      return next;
    }
    return [...next, {
      uniqueId: `${productId}-${generateId()}`,
      productId,
      name: station.finalProductName,
      color,
      qty: 1,
    }];
  };

  const getInventorySummary = () => {
    const availableItems = getAvailableItems();

    return availableItems;
   
    const summary = availableItems.reduce((acc, item) => {
      //console.log(item)
      const existing = acc.find(s => s.productId === item.productId);
      if (existing) {
        //existing.count += 1;
      } else {
        acc.push({
          productId: item.productId,
          name: item.name,
          color: item.color,
          capacity : item.capacity,
          qty : item.quantity
        });
      }
      return acc;
    }, []);
    
    return summary;
  
  };

  const handleDragStart = (e, item, type, uniqueId = null) => {

    console.log(item)


if (item.items && item.items.length > 0) {
  console.log("No puedes moverme");
  e.preventDefault();
  return;
}

setDraggedItem({ ...item, type, uniqueId });
//console.log(item);
e.dataTransfer.effectAllowed = 'move';
  };

  // Drag handlers for personal inventory
  const handleDropToPersonalInventory = (e) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'grouped-inventory') return;

    const itemInInventory = inventory.find(i => i.productId === draggedItem.productId);
    if (!itemInInventory) return;

    if (personalInventory.length >= 4) {
      setMessage('Tu inventario personal está lleno (máx 4 items).');
      setDraggedItem(null);
      return;
    }

    // Remove from main inventory
    setInventory(prev => prev.filter(i => i.productId !== draggedItem.productId));
    // Add to personal inventory
    addToPersonalInventory(itemInInventory);
    setDraggedItem(null);
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.add('border-blue-500', 'border-2');
  };

  const handleDragLeave = (e) => {
    const target = e.currentTarget;
    target.classList.remove('border-blue-500', 'border-2');
  };

  const handleDrop = (e, shelfId, shelfCapacity) => {
  e.preventDefault();

  //setIsDraggable(false);

  if(e.currentTarget){
     e.target.classList.remove('border-blue-500', 'border-2');
  }

  if (!draggedItem) return;

  const shelfIndex = shelves.findIndex(s => s.id === shelfId);
  const targetShelf = shelves[shelfIndex];
  if (targetShelf.items.length >= shelfCapacity) {
    setMessage(`¡El estante ${shelfIndex + 1} está lleno!`);
    setDraggedItem(null);
    setIsDraggable(false);
    return;
  }
  if (draggedItem.type === 'grouped-inventory') {
 
    const itemToMoveIndex = inventory.findIndex(item => item.productId === draggedItem.productId);
    if (itemToMoveIndex === -1) {
      setMessage('No hay más unidades de este producto disponibles en el inventario.');
      setDraggedItem(null);
      return;
    }

    const itemToMove = inventory[itemToMoveIndex];
    const newInventory = [...inventory];
    newInventory.splice(itemToMoveIndex, 1);
    setInventory(newInventory);
    const updatedShelves = [...shelves];


    updatedShelves[shelfIndex] = { ...updatedShelves[shelfIndex], 
      items: [...updatedShelves[shelfIndex].items, itemToMove] , draggable:false};
    
    setShelves(updatedShelves);
    setMessage('');
    setDraggedItem(null);
  } else if (draggedItem.type === 'shelf') {

    const oldShelfIndex = shelves.findIndex(s => s.items.some(item => item.uniqueId === draggedItem.uniqueId));

    //Modificación: se comprueba si el estante de origen es el mismo que el de destino.
    if (oldShelfIndex !== -1 && shelves[oldShelfIndex].id !== shelfId) {
      const oldShelf = shelves[oldShelfIndex];
      const itemToMove = oldShelf.items.find(item => item.uniqueId === draggedItem.uniqueId);
      const updatedOldShelf = { ...oldShelf, items: oldShelf.items.filter(item => item.uniqueId !== draggedItem.uniqueId) };
      const updatedNewShelf = { ...targetShelf, items: [...targetShelf.items, itemToMove] };
      const updatedShelves = [...shelves];
      updatedShelves[oldShelfIndex] = updatedOldShelf;
      updatedShelves[shelfIndex] = updatedNewShelf;
      setShelves(updatedShelves);
    }
  }
  };

const handleDropToInventory = (e) => {
    e.preventDefault();

    // ===================================================
    // 1. CORRECCIÓN MÓVIL/ESCRITORIO (TypeError: Cannot read properties of undefined (reading 'classList'))
    // ===================================================
    // Solo accedemos a e.currentTarget (escritorio) si está definido para evitar el error en móvil.
    if (e.currentTarget) {
        // La limpieza visual del drop zone de inventario para escritorio.
        e.currentTarget.classList.remove('border-blue-500', 'border-2');
    }
    if (!draggedItem) return;

    // ===================================================
    // 2. LÓGICA DE ACTUALIZACIÓN DE ESTANTES (Eliminar el ítem o estante)
    // ===================================================
    let itemToReturnToInventory;
    let newShelves = shelves;
    
    // CASO A: Se arrastró un ESTANTE COMPLETO ('shelf')
    if (draggedItem.type === 'shelf') {
        // Si el tipo es 'shelf', asumimos que el estante completo se está moviendo al inventario/basurero,
        // por lo que lo removemos de la lista de estantes.
        newShelves = shelves.filter(s => s.uniqueId !== draggedItem.uniqueId);
        
        // El estante completo (incluyendo sus ítems) se convierte en el ítem a devolver (como una "caja").
        itemToReturnToInventory = {
            productId: draggedItem.productId,
            name: draggedItem.name,
            color: draggedItem.color,
            qty: draggedItem.items.length > 0 ? draggedItem.items.length : 1, // Podrías devolver la cuenta de ítems
            capacity: draggedItem.capacity,
            uniqueId: draggedItem.uniqueId,
            // Si quieres devolver los ítems individuales, necesitarías una lógica diferente
        };
        
    } 
    // CASO B: Se arrastró un ÍTEM INDIVIDUAL dentro de un estante ('item-in-shelf')
    else if (draggedItem.type === 'item-in-shelf') {
        // En este caso, draggedItem es el ShelfItem que se sacó del estante.
        
        // Actualizamos los estantes para remover solo ese ítem.
        newShelves = shelves.map(s => {
            const updatedItems = s.items.filter(item => item.uniqueId !== draggedItem.uniqueId);
            return {
                ...s,
                items: updatedItems,
                // Si la función handleDropToInventory es la de devolver al inventario de items
                // el estante siempre debe ser arrastrable si queda vacío.
                draggable: updatedItems.length === 0, 
            };
        });

        // El ítem individual se convierte en el ítem a devolver.
        itemToReturnToInventory = {
            productId: draggedItem.productId,
            name: draggedItem.name,
            color: draggedItem.color,
            qty: 1,
            capacity: draggedItem.capacity // capacity es opcional
        };
    } else {
        // Si no es un estante ni un ítem-en-estante (e.g., es 'grouped-inventory'), no lo movemos aquí.
        // O podrías tener lógica para mover items agrupados de vuelta a otro inventario.
        return;
    }

    // ===================================================
    // 3. ACTUALIZACIÓN DE ESTADO
    // ===================================================
    
    // A. Actualizar la lista de estantes (con el estante/ítem removido)
    // Aquí usamos 'newShelves', no 'finalShelves', que tenías definido incorrectamente.
    setShelves(newShelves); 

    // B. Devolver el ítem al inventario. Lo consolidamos con el inventario existente.
    if (itemToReturnToInventory) {
      updateActiveInventory(prevInventory => {
        const existingItemIndex = prevInventory.findIndex(
          item => item.productId === itemToReturnToInventory.productId
        );

        if (existingItemIndex !== -1) {
          // Si ya existe, incrementa la cantidad
          const newInventory = [...prevInventory];
          newInventory[existingItemIndex] = {
            ...newInventory[existingItemIndex],
            qty: newInventory[existingItemIndex].qty + itemToReturnToInventory.qty
          };
          return newInventory;
        } else {
          // Si no existe, agrégalo al inventario
          return [...prevInventory, itemToReturnToInventory];
        }
      });
    }

    // C. Limpieza final
    setMessage('Elemento devuelto al inventario.');
    setDraggedItem(null);
};
  const handleDropToTrash = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.type === 'grouped-inventory') {
      const activeInv = getActiveInventory();
      const itemIndexToRemove = activeInv.findIndex(item => item.productId === draggedItem.productId);
      if (itemIndexToRemove !== -1) {
        updateActiveInventory(prevInventory => prevInventory.filter((_, index) => index !== itemIndexToRemove));
        setMessage(`Una unidad de "${draggedItem.name}" ha sido eliminada permanentemente.`);
      }
    } else if (draggedItem.type === 'shelf') {
      const updatedShelves = shelves.map(s => ({ ...s, items: s.items.filter(item => item.uniqueId !== draggedItem.uniqueId) }));
      setShelves(updatedShelves);
      setMessage(`"${draggedItem.name}" ha sido eliminado permanentemente del estante.`);
    }
    setDraggedItem(null);
  };

  const handleStationDrop = (e, warehouseId, index) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('border-blue-500', 'border-2');
    if (!draggedItem || draggedItem.type !== 'station') return;
    const stationId = draggedItem.id;
    const isStationAvailable = stations.some(s => s.id === stationId);
    const targetWarehouse = warehouses.find(w => w.id === warehouseId);
    if (targetWarehouse.stations[index]) {
        setMessage('¡Esa celda ya está ocupada por otra estación!');
        setDraggedItem(null);
        return;
    }
    if (isStationAvailable) {
        setStations(prevStations => prevStations.filter(s => s.id !== stationId));
    }
    setWarehouses(prevWarehouses => {
        let updatedWarehouses = [...prevWarehouses];
        let stationMoved = false;
        updatedWarehouses = updatedWarehouses.map(w => {
            const prevStationIndex = w.stations.findIndex(s => s?.id === stationId);
            if (prevStationIndex !== -1) {
                const newStations = [...w.stations];
                newStations[prevStationIndex] = null;
                stationMoved = true;
                return { ...w, stations: newStations };
            }
            return w;
        });
        updatedWarehouses = updatedWarehouses.map(w => {
            if (w.id === warehouseId) {
                const newStations = [...w.stations];
                newStations[index] = { ...draggedItem, status: 'idle', assignedWorkerIds: [], assignedMachineIds: [] };
                return { ...w, stations: newStations };
            }
            return w;
        });
        return updatedWarehouses;
    });
    setDraggedItem(null);
  };

  const handleDropToAvailableStations = (e) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'station') return;
    let updatedWarehouses = [...warehouses];
    let found = false;
    updatedWarehouses = updatedWarehouses.map(w => {
      const stationIndex = w.stations.findIndex(s => s?.id === draggedItem.id);
      if (stationIndex !== -1) {
        const newStations = [...w.stations];
        newStations[stationIndex] = null;
        found = true;
        return { ...w, stations: newStations };
      }
      return w;
    });
    if (found) {
      setWarehouses(updatedWarehouses);
      setStations(prevStations => [...prevStations, {
        id: draggedItem.id,
        name: draggedItem.name,
        finalProductName: draggedItem.finalProductName,
        inputProductIds: draggedItem.inputProductIds,
        processingTime: draggedItem.processingTime,
      }]);
      setMessage(`"${draggedItem.name}" ha sido movida de vuelta a la lista de estaciones disponibles.`);
    }
    setDraggedItem(null);
  };

  const handleProductFormSubmit = (newProduct) => {
    if (!newProduct.name || !newProduct.price || newProduct.stock < 1) {
      setMessage('Por favor, completa todos los campos del producto y asegúrate de que la cantidad sea mayor a 0.');
      return;
    }
    const newId = generateId();
    const newColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
    const product = { 
      ...newProduct, 
      id: newId, 
      color: newColor, 
      owner: currentUser,
      displayPrice: parseFloat(newProduct.price) || 0
    };
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts, product];
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
    setMessage(`Producto "${product.name}" registrado con éxito con ${product.stock} unidades en stock.`);
  };

 
  const handleAddToCartAll = (productQuantities) => {
    const newCartItems = [...cartItems];
    let itemsAddedCount = 0;
    for (const productId in productQuantities) {
      const quantity = productQuantities[productId];
      if (quantity > 0) {
        const product = products.find(p => p.id === productId);
        const availableStock = product?.stock || 0;
        if (quantity > availableStock) {
          setMessage(`No puedes agregar ${quantity} unidades de "${product.name}". Solo hay ${availableStock} disponibles.`);
          continue;
        }
        const existingItemIndex = newCartItems.findIndex(item => item.id === productId);
        if (existingItemIndex > -1) {
          newCartItems[existingItemIndex].quantity += quantity;
        } else {
          newCartItems.push({ ...product, quantity });
        }
        itemsAddedCount += quantity;
      }
    }
    setCartItems(newCartItems);
    if (itemsAddedCount > 0) {
      setMessage(`Se agregaron ${itemsAddedCount} artículos al carrito.`);
    } else {
      setMessage('Selecciona al menos un artículo para agregar al carrito.');
    }
  };

  const handlePurchaseFromCart = () => {
    if (cartItems.length === 0) {
      setMessage('El carrito está vacío. ¡Agrega productos para comprar!');
      return;
    }
    
    // Validar que el balance sea > 0
    const currentBalance = globalBalance.income - globalBalance.expenses;
    if (currentBalance <= 0) {
      setMessage('No puedes comprar sin balance. Tu balance debe ser mayor a 0.');
      return;
    }
    
    // Calcular costo total
    const totalCost = cartItems.reduce((sum, item) => {
      return sum + ((item.displayPrice || item.price) * item.quantity);
    }, 0);
    
    // Validar que hay suficiente balance
    if (totalCost > currentBalance) {
      setMessage(`No tienes suficiente balance. Necesitas $${totalCost.toFixed(2)} pero solo tienes $${currentBalance.toFixed(2)}`);
      return;
    }
    
    const newInventoryItems = [];
    const updatedProducts = [...products];

    cartItems.forEach(cartItem => {
      const productIndex = updatedProducts.findIndex(p => p.id === cartItem.id);
      if (productIndex !== -1) {
        updatedProducts[productIndex].stock -= cartItem.quantity;
      
        const onInventory = inventory.findIndex(p => p.productId === cartItem.id);
        if(onInventory !==-1){
          setInventory(prevInventory =>
            prevInventory.map((item, index) =>
              index === onInventory
                ? { ...item, qty: item.qty + cartItem.quantity, uniqueId: `${item.id}-${generateId()}` } 
                : item
            )
          );
        }else{
          const newItems = Array.from({ length: 1 }, () => ({
            uniqueId: `${cartItem.id}-${generateId()}`,
            productId: cartItem.id,
            name: cartItem.name,
            color: cartItem.color,
            capacity : cartItem.capacity,
            qty : cartItem.quantity
          }));
          newInventoryItems.push(...newItems);
        }
      }
    });
    
    setProducts(updatedProducts);
    
    // Si es usuario store, envía a storeInventory; si es main, a inventory
    if (currentUser === 'store') {
      setStoreInventory(prevInventory => [...prevInventory, ...newInventoryItems]);
    } else {
      setInventory(prevInventory => [...prevInventory, ...newInventoryItems]);
    }
    
    // Actualizar balance diario (restar gastos)
    setDailyBalance(prev => ({
      ...prev,
      expenses: prev.expenses + totalCost,
      entries: [...prev.entries, {
        id: generateId(),
        type: 'expense',
        amount: totalCost,
        description: `Compra de ${cartItems.length} producto(s)`,
        timestamp: new Date().toISOString()
      }]
    }));
    
    setCartItems([]);
    setIsCartOpen(false);
    setMessage(`¡Compra completada! Se gastaron $${totalCost.toFixed(2)}. Nuevo balance: $${(currentBalance - totalCost).toFixed(2)}`);
  };

  const handleStationFormSubmit = (newStation) => {
    if (!newStation.name || !newStation.finalProductName || newStation.inputProductIds.length === 0) {
      setMessage('Por favor, completa todos los campos de la estación y selecciona al menos un producto.');
      return;
    }
    const processingTime = newStation.inputProductIds.length * 10;
    const existingFinalProduct = products.find(p => p.name === newStation.finalProductName);
    const finalProductId = existingFinalProduct ? existingFinalProduct.id : generateId();
    const finalProductColor = existingFinalProduct ? existingFinalProduct.color : `hsl(${Math.random() * 360}, 70%, 80%)`;
    const station = { id: generateId(), ...newStation, processingTime, processingMode: 'once', finalProductId, finalProductColor };
    setStations(prevStations => [...prevStations, station]);
    setMessage(`Estación "${station.name}" creada con éxito.`);
  };

  const handleDeleteStation = (stationId) => {
    setStations(prevStations => prevStations.filter(s => s.id !== stationId));
    setMessage('Estación eliminada con éxito.');
  };

  const handleWarehouseFormSubmit = (newWarehouse) => {
    if (!newWarehouse.name || newWarehouse.gridSize <= 0) {
      setMessage('Por favor, completa todos los campos del almacén.');
      return;
    }
    const warehouse = {
      id: generateId(),
      name: newWarehouse.name,
      gridSize: newWarehouse.gridSize,
      stations: Array.from({ length: newWarehouse.gridSize * newWarehouse.gridSize }, () => null),
    };
    setWarehouses(prevWarehouses => [...prevWarehouses, warehouse]);
    setMessage(`Almacén "${newWarehouse.name}" creado con éxito.`);
  };

  const openStationDetailsModal = (station, warehouseId, stationIndex) => {
    const updatedWarehouse = warehouses.find(w => w.id === warehouseId);
    const updatedStation = updatedWarehouse?.stations[stationIndex];
    if (updatedStation) {
      setSelectedStation({ warehouseId, stationIndex });
      setIsModalOpen(true);
    }
  };

  const updateStationStatus = (warehouseId, stationIndex, newStatus, processingMode = 'once') => {
    const station = warehouses.find(w => w.id === warehouseId)?.stations[stationIndex];
    if (newStatus === 'processing' && station) {
      const hasAssignedActors = ((station.assignedWorkerIds && station.assignedWorkerIds.length > 0) || (station.assignedMachineIds && station.assignedMachineIds.length > 0));
      if (!hasAssignedActors) {
        setMessage('Asigna personal o máquinas a la estación antes de iniciar.');
        return;
      }
      if (!hasEnoughIngredientsForStation(station)) {
        setMessage('¡Inventario insuficiente! No se puede iniciar la producción.');
        return;
      }
      if (processingMode === 'shift' && !actorsHaveHoursLeft(station)) {
        setMessage('La jornada asignada ya está completa para este equipo.');
        return;
      }
      const consumedInventory = consumeIngredientsForStation(station);
      setInventory(consumedInventory);
      setMessage(`Se consumieron ${station.inputProductIds.length} productos para iniciar la producción de "${station.finalProductName}".`);
    }
    setWarehouses(prevWarehouses =>
      prevWarehouses.map(w => {
        if (w.id === warehouseId) {
          const newStations = [...w.stations];
          if (newStations[stationIndex]) {
            newStations[stationIndex] = {
              ...newStations[stationIndex],
              status: newStatus,
              processingMode: processingMode || newStations[stationIndex].processingMode || 'once',
              remainingTime: newStatus === 'processing' ? newStations[stationIndex].processingTime : newStations[stationIndex].remainingTime,
            };
          }
          return { ...w, stations: newStations };
        }
        return w;
      })
    );
  };

  // Empresa: creación y ledger
  const createCompany = ({ name, startWithDebt, amount }) => {
    const base = { name, capital: 0, debt: 0, ledger: [] };
    let next = base;
    if (startWithDebt && amount > 0) {
      next = {
        ...base,
        debt: amount,
        capital: amount,
        ledger: [{ id: generateId(), type: 'debt', amount, description: 'Aportación inicial (deuda bancaria)', date: new Date().toISOString() }],
      };

          // Agregar dinero al ingreso global del usuario que envió los productos
    setGlobalBalance(prev => ({
      ...prev,
      income: prev.income + amount,
      entries: [...prev.entries, {
        id: generateId(),
        type: 'income',
        amount: amount,
        description: `Ingreso a la empresa "${name}" (deuda bancaria)`,
        timestamp: new Date().toISOString()
      }]
    }));
    }
    setCompany(next);
    setMessage('Empresa creada correctamente.');
  };

  // Fuerza laboral: crear actor humano/máquina
  const addActor = ({ type, name, hourlyCost, hoursPerDay }) => {
    const actor = { id: generateId(), type, name, hourlyCost, hoursPerDay, fatigue: 0, maintenanceNeed: 0, status: 'idle', hoursWorkedToday: 0 };
    setWorkforce(prev => [...prev, actor]);
    setMessage(`${type === 'human' ? 'Humano' : 'Máquina'} "${name}" registrado.`);
  };

  // Asignación a estación
  const assignActorToStation = (actorId, warehouseId, stationIndex) => {
    const actor = workforce.find(a => a.id === actorId);
    if (!actor) return;
    setWarehouses(prev => prev.map(w => {
      if (w.id !== warehouseId) return w;
      const newStations = [...w.stations];
      const st = newStations[stationIndex];
      if (!st) return w;
      const isHuman = actor.type === 'human';
      const workerIds = st.assignedWorkerIds || [];
      const machineIds = st.assignedMachineIds || [];
      const nextStation = {
        ...st,
        assignedWorkerIds: isHuman ? Array.from(new Set([...workerIds, actor.id])) : workerIds,
        assignedMachineIds: !isHuman ? Array.from(new Set([...machineIds, actor.id])) : machineIds,
      };
      newStations[stationIndex] = nextStation;
      return { ...w, stations: newStations };
    }));
  };

  const unassignActorFromStation = (actorId, warehouseId, stationIndex) => {
    setWarehouses(prev => prev.map(w => {
      if (w.id !== warehouseId) return w;
      const newStations = [...w.stations];
      const st = newStations[stationIndex];
      if (!st) return w;
      newStations[stationIndex] = {
        ...st,
        assignedWorkerIds: (st.assignedWorkerIds || []).filter(id => id !== actorId),
        assignedMachineIds: (st.assignedMachineIds || []).filter(id => id !== actorId),
      };
      return { ...w, stations: newStations };
    }));
  };

  // Inventario personal: agregar/remover items (máx 4)
  const addToPersonalInventory = (item) => {
    if (personalInventory.length >= 4) {
      setMessage('Tu inventario personal está lleno (máx 4 items).');
      return;
    }
    setPersonalInventory(prev => [...prev, item]);
    setMessage(`"${item.name}" añadido a tu inventario personal.`);
  };

  const removeFromPersonalInventory = (uniqueId) => {
    const item = personalInventory.find(i => i.uniqueId === uniqueId);
    setPersonalInventory(prev => prev.filter(i => i.uniqueId !== uniqueId));
    if (item) {
      setInventory(prev => [...prev, item]);
      setMessage(`"${item.name}" devuelto al inventario general.`);
    }
  };

  // Asignar tarea a un actor (estación + duración en horas)
  const assignTaskToActor = (actorId, warehouseId, stationIndex, durationHours) => {
    const actor = workforce.find(a => a.id === actorId);
    if (!actor) return;
    const key = actorId;
    setActorTasks(prev => ({
      ...prev,
      [key]: { actorId, warehouseId, stationIndex, durationHours, hoursWorked: 0, status: 'idle' },
    }));
    setMessage(`Tarea asignada a ${actor.name}: estación (${durationHours} horas).`);
  };

  // Remover producto de venta pública y devolverlo al inventario
  const removePublicSaleProduct = (productId) => {
    const product = publicSaleProducts.find(p => p.productId === productId && p.from === currentUser);
    if (!product) return;

    // Remover de publicSaleProducts
    setPublicSaleProducts(prev => prev.filter(p => !(p.productId === productId && p.from === currentUser)));

    // Devolver al inventario correspondiente
    if (currentUser === 'store') {
      setStoreInventory(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item =>
            item.productId === productId
              ? { ...item, qty: item.qty + product.quantity }
              : item
          );
        } else {
          return [...prev, {
            productId: product.productId,
            name: product.name,
            color: product.color,
            qty: product.quantity
          }];
        }
      });
    } else {
      setInventory(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item =>
            item.productId === productId
              ? { ...item, qty: item.qty + product.quantity }
              : item
          );
        } else {
          return [...prev, {
            productId: product.productId,
            name: product.name,
            color: product.color,
            qty: product.quantity
          }];
        }
      });
    }

    setMessage(`"${product.name}" removido de venta y devuelto al inventario.`);
  };

  // Mover items del inventario a venta - abre modal para precio
  const moveItemToSale = (item) => {
    setPriceModalItem(item);
    setPriceInput('');
  };

  // Confirmar movimiento a venta con precio
  const confirmMoveItemToSale = () => {
    if (!priceModalItem) return;
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      setMessage('Por favor ingresa un precio válido.');
      return;
    }

    // Si es usuario store, envía directamente a publicSaleProducts
    if (currentUser === 'store') {
      const existing = publicSaleProducts.find(p => p.productId === priceModalItem.productId);
      
      if (existing) {
        setPublicSaleProducts(prev => prev.map(p =>
          p.productId === priceModalItem.productId
            ? { ...p, quantity: p.quantity + priceModalItem.qty, price }
            : p
        ));
      } else {
        setPublicSaleProducts(prev => [...prev, {
          productId: priceModalItem.productId,
          name: priceModalItem.name,
          color: priceModalItem.color,
          quantity: priceModalItem.qty,
          from: 'store',
          price
        }]);
      }
    } else {
      // Usuario main: envía a productsForSale
      const userKey = 'main';
      const existingSale = productsForSale[userKey].find(p => p.productId === priceModalItem.productId);
      
      if (existingSale) {
        setProductsForSale(prev => ({
          ...prev,
          [userKey]: prev[userKey].map(p => 
            p.productId === priceModalItem.productId 
              ? { ...p, quantity: (p.quantity || 0) + priceModalItem.qty, sellingPrice: price }
              : p
          )
        }));
      } else {
        setProductsForSale(prev => ({
          ...prev,
          [userKey]: [...prev[userKey], { 
            productId: priceModalItem.productId,
            productName: priceModalItem.name,
            color: priceModalItem.color,
            quantity: priceModalItem.qty,
            sellingPrice: price
          }]
        }));
      }
    }
    
    // Remover del inventario correspondiente
    if (currentUser === 'store') {
      setStoreInventory(prev => prev.filter(i => i.productId !== priceModalItem.productId));
    } else {
      setInventory(prev => prev.filter(i => i.productId !== priceModalItem.productId));
    }
    setMessage(`"${priceModalItem.name}" movido a venta por $${price} c/u.`);
    
    // Limpiar modal
    setPriceModalItem(null);
    setPriceInput('');
  };

  const removeItemFromSale = (productId) => {
    const userKey = currentUser === 'store' ? 'store' : 'main';
    const item = productsForSale[userKey].find(p => p.productId === productId);
    
    if (item) {
      setProductsForSale(prev => ({
        ...prev,
        [userKey]: prev[userKey].filter(p => p.productId !== productId)
      }));
      
      // Devolver al inventario
      setInventory(prev => [...prev, { ...item }]);
      setMessage(`"${item.name}" removido de venta.`);
    }
  };

  // Funciones para el sistema de solicitudes de productos
  const openRequestModal = () => {
    setIsRequestModalOpen(true);
    setSelectedProducts({});
    setRequestDestination('tienda');
  };

  const handleProductSelection = (productId, quantity, price = 0) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedProducts };
      delete newSelected[productId];
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: { quantity, price: parseFloat(price) || 0 }
      }));
    }
  };

  const submitProductRequest = () => {
    if (Object.keys(selectedProducts).length === 0) {
      setMessage('Selecciona al menos un producto para enviar.');
      return;
    }

    // Si la tienda envía a tienda, se agrega directo a su catálogo con el precio indicado
    if (currentUser === 'store' && requestDestination === 'tienda') {
      Object.entries(selectedProducts).forEach(([productId, data]) => {
        const product = storeInventory.find(p => p.productId === productId);
        if (!product) return;

        setProducts(prev => {
          const idx = prev.findIndex(p => p.productId === productId || (p.name === product.name && p.owner === 'store'));
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              stock: (next[idx].stock || 0) + data.quantity,
              price: data.price,
              owner: 'store'
            };
            return next;
          }
          return [...prev, {
            id: productId,
            productId,
            name: product.name,
            color: product.color,
            stock: data.quantity,
            price: data.price,
            owner: 'store'
          }];
        });
      });

      // Reducir del inventario de la tienda
      Object.entries(selectedProducts).forEach(([productId, data]) => {
        setStoreInventory(prev => prev.map(item =>
          item.productId === productId
            ? { ...item, qty: Math.max(0, item.qty - data.quantity) }
            : item
        ).filter(item => item.qty > 0));
      });

      setIsRequestModalOpen(false);
      setSelectedProducts({});
      setMessage('Productos agregados a tu tienda con el precio indicado.');
      return;
    }

    if (requestDestination === 'tienda') {
      // Crear solicitud para la tienda
      const request = {
        id: generateId(),
        from: currentUser,
        products: Object.entries(selectedProducts).map(([productId, data]) => {
          const baseInventory = currentUser === 'store' ? storeInventory : inventory;
          const product = baseInventory.find(p => p.productId === productId);
          return {
            productId,
            name: product?.name,
            color: product?.color,
            quantity: data.quantity,
            price: data.price // Precio por unidad
          };
        }),
        status: 'pending',
        date: new Date().toISOString()
      };
      
      setProductRequests(prev => [...prev, request]);
      setMessage('Solicitud enviada a la tienda.');
    } else {
      // Mover directamente a venta pública
      Object.entries(selectedProducts).forEach(([productId, data]) => {
        const baseInventory = currentUser === 'store' ? storeInventory : inventory;
        const product = baseInventory.find(p => p.productId === productId);
        const existing = publicSaleProducts.find(p => p.productId === productId && p.from === currentUser);
        
        if (existing) {
          setPublicSaleProducts(prev => prev.map(p =>
            p.productId === productId && p.from === currentUser
              ? { ...p, quantity: p.quantity + data.quantity, price: data.price }
              : p
          ));
        } else {
          setPublicSaleProducts(prev => [...prev, {
            productId,
            name: product.name,
            color: product.color,
            quantity: data.quantity,
            from: currentUser,
            price: data.price
          }]);
        }
      });
      setMessage('Productos movidos a venta pública.');
    }

    // Reducir del inventario correspondiente
    if (currentUser === 'store') {
      Object.entries(selectedProducts).forEach(([productId, data]) => {
        setStoreInventory(prev => prev.map(item =>
          item.productId === productId
            ? { ...item, qty: Math.max(0, item.qty - data.quantity) }
            : item
        ).filter(item => item.qty > 0));
      });
    } else {
      Object.entries(selectedProducts).forEach(([productId, data]) => {
        setInventory(prev => prev.map(item =>
          item.productId === productId
            ? { ...item, qty: Math.max(0, item.qty - data.quantity) }
            : item
        ).filter(item => item.qty > 0));
      });
    }

    setIsRequestModalOpen(false);
    setSelectedProducts({});
  };

  const acceptProductRequest = (requestId) => {
    const request = productRequests.find(r => r.id === requestId);
    if (!request) return;

    // Calcular total a pagar
    const totalAmount = request.products.reduce((sum, product) => {
      return sum + (product.quantity * (product.price || 0));
    }, 0);


    // Agregar productos al inventario del usuario store
    const newInventoryItems = [];
    request.products.forEach(product => {
      const existing = storeInventory.find(item => item.productId === product.productId);
      
      if (existing) {
        // Si ya existe en el inventario, aumentar cantidad
        setStoreInventory(prev => prev.map(item =>
          item.productId === product.productId
            ? { ...item, qty: item.qty + product.quantity }
            : item
        ));
      } else {
        // Si no existe, crear nuevo item de inventario
        newInventoryItems.push({
          uniqueId: `${product.productId}-${generateId()}`,
          productId: product.productId,
          name: product.name,
          color: product.color,
          qty: product.quantity
        });
      }
    });

    // Agregar los nuevos items si los hay
    if (newInventoryItems.length > 0) {
      setStoreInventory(prev => [...prev, ...newInventoryItems]);
    }
    // Agregar dinero al ingreso global del usuario que envió los productos
    setGlobalBalance(prev => ({
      ...prev,
      income: prev.income + totalAmount,
      entries: [...prev.entries, {
        id: generateId(),
        type: 'income',
        amount: totalAmount,
        description: `Venta de ${request.products.length} producto(s) a tienda`,
        timestamp: new Date().toISOString()
      }]
    }));

    // Marcar solicitud como aceptada
    setProductRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'accepted' }
        : r
    ));

    setMessage(`Solicitud aceptada. Ingreso: $${totalAmount.toFixed(2)}. Los productos están en el Organizador de la tienda.`);
  };

  const rejectProductRequest = (requestId) => {
    const request = productRequests.find(r => r.id === requestId);
    if (!request) return;

    // Marcar como rechazada
    setProductRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, status: 'rejected' }
        : r
    ));

    setMessage('Solicitud rechazada.');
  };

  const handleProcessingCycleComplete = (warehouseId, stationIndex, mode = 'once') => {
    const targetWarehouse = warehouses.find(w => w.id === warehouseId);
    const station = targetWarehouse?.stations[stationIndex];
    if (!station) return;

    const effectiveMode = mode || station.processingMode || 'once';

    // Modo manual: dejar producto listo para mover manualmente
    if (effectiveMode === 'once') {
      const finalProductInfo = products.find(p => p.name === station.finalProductName);
      const fallbackColor = station.finalProductColor || `hsl(${Math.random() * 360}, 70%, 80%)`;
      const finalProduct = finalProductInfo ? {
        uniqueId: `${finalProductInfo.id}-${generateId()}`,
        productId: finalProductInfo.id,
        name: finalProductInfo.name,
        color: finalProductInfo.color,
        qty: 1,
      } : {
        uniqueId: `${station.finalProductId || station.id}-${generateId()}`,
        productId: station.finalProductId || station.id,
        name: station.finalProductName,
        color: fallbackColor,
        qty: 1,
      };

      setWarehouses(prev => prev.map(w => {
        if (w.id !== warehouseId) return w;
        const nextStations = [...w.stations];
        nextStations[stationIndex] = {
          ...nextStations[stationIndex],
          status: 'completed',
          remainingTime: 0,
          finalProduct,
        };
        return { ...w, stations: nextStations };
      }));
      setMessage(`Proceso de ${station.name} completado. Mueve el producto al inventario.`);
      return;
    }

    // Modos automáticos: agregar producto final al inventario por ciclo
    let nextInventory = addFinalProductToInventory(station, inventory);

    // ¿Debemos continuar automáticamente?
    const shouldContinue = canAutoContinue({ ...station, processingMode: effectiveMode }, nextInventory);
    if (shouldContinue) {
      // Consumir ingredientes para la siguiente corrida y reiniciar el temporizador
      const updatedInventory = consumeIngredientsForStation(station, nextInventory);
      setInventory(updatedInventory);
      setWarehouses(prev => prev.map(w => {
        if (w.id !== warehouseId) return w;
        const nextStations = [...w.stations];
        nextStations[stationIndex] = {
          ...nextStations[stationIndex],
          status: 'processing',
          processingMode: effectiveMode,
          remainingTime: nextStations[stationIndex].processingTime,
        };
        return { ...w, stations: nextStations };
      }));
      return;
    }

    // Si no continúa, persistir inventario con el producto agregado
    setInventory(nextInventory);

    // Finalizar y dejar estación en idle (producto ya se movió al inventario)
    setWarehouses(prev => prev.map(w => {
      if (w.id !== warehouseId) return w;
      const nextStations = [...w.stations];
      nextStations[stationIndex] = {
        ...nextStations[stationIndex],
        status: 'idle',
        remainingTime: nextStations[stationIndex].processingTime,
        finalProduct: null,
      };
      return { ...w, stations: nextStations };
    }));

    setMessage(`Proceso de ${station.name} completado y movido al inventario.`);
  };

  const handleMoveFinalProductToInventory = (warehouseId, stationIndex) => {
    let productToAdd = null;
    setWarehouses(prevWarehouses => {
      const newWarehouses = prevWarehouses.map(w => {
        if (w.id === warehouseId) {
          const newStations = [...w.stations];
          const station = newStations[stationIndex];
          if (station ) {
            const productId = station.finalProduct?.productId || station.finalProductId || generateId();
            const color = station.finalProduct?.color || station.finalProductColor || `hsl(${Math.random() * 360}, 70%, 80%)`;
            productToAdd = {
              productId,
              name: station.finalProduct?.name || station.finalProductName,
              color,
              qty: station.finalProduct?.qty || 1,
            };
            newStations[stationIndex] = {
              ...station,
              finalProduct: null,
              status: 'idle',
              remainingTime: station.processingTime,
            };
          }
          return { ...w, stations: newStations };
        }
        return w;
      });
      return newWarehouses;
    });
    if (productToAdd) {
      setInventory(prev => {
        const idx = prev.findIndex(item => item.productId === productToAdd.productId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + (productToAdd.qty || 1) };
          return next;
        }
        return [...prev, { ...productToAdd, uniqueId: `${productToAdd.productId}-${generateId()}` }];
      });
    }
    setIsModalOpen(false);
    setMessage('Producto final movido al inventario con éxito.');
  };

  // Componente de navegación
  const NavButton = ({ view, icon: Icon, label }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMessage('');
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        currentView === view ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const renderView = () => {
    switch (currentView) {
      case 'organizer':
        // Mostrar inventario correcto según el usuario
        const currentInventory = currentUser === 'store' ? storeInventory : inventory;
        const setCurrentInventory = currentUser === 'store' ? setStoreInventory : setInventory;
        
        return (
          <OrganizerView
            shelves={shelves}
            inventorySummary={getInventorySummary()}
            inventory={currentInventory}
            setShelves={setShelves}
            setInventory={setCurrentInventory}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDropToInventory={handleDropToInventory}
            handleDropToTrash={handleDropToTrash}
            setMessage={setMessage}
            setDraggedItem={setDraggedItem}
            draggedItem={draggedItem}
            isDraggable = {isDraggable}
            moveItemToSale={moveItemToSale}
            currentUser={currentUser}
            openRequestModal={openRequestModal}
          />
        );
      case 'register':
        return currentUser === 'store' ? <RegisterView handleProductFormSubmit={handleProductFormSubmit} /> : (
          <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-700">Esta función solo está disponible para el Usuario Tienda.</p>
          </div>
        );
      case 'buy':
        // La tienda muestra todos los productos para ambos usuarios
        return (
          <BuyView
            products={products}
            setProducts={setProducts}
            handleAddToCartAll={handleAddToCartAll}
            stations={stations}
            cartItems={cartItems}
            setIsCartOpen={setIsCartOpen}
            productsForSale={productsForSale}
            publicSaleProducts={publicSaleProducts}
            currentUser={currentUser}
            removeItemFromSale={removeItemFromSale}
            warehouses={warehouses}
          />
        );
      case 'stations':
        // Mostrar todos los productos para ambos usuarios
        return (
          <StationsView
            inventory={inventory}
            stations={stations}
            handleStationFormSubmit={handleStationFormSubmit}
            handleDeleteStation={handleDeleteStation}
          />
        );
      case 'warehouses':
        return (
          <WarehousesView
            warehouses={warehouses}
            stations={stations}
            setStations={setStations}
            handleWarehouseFormSubmit={handleWarehouseFormSubmit}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleStationDrop={handleStationDrop}
            handleDropToAvailableStations={handleDropToAvailableStations}
            openStationDetailsModal={openStationDetailsModal}
            draggedItem={draggedItem}
            setMessage={setMessage}
          />
        );
      case 'company':
        const canSleepNow = canSleep();
        return (
          <CompanyView 
            company={company} 
            createCompany={createCompany}
            dayConfig={dayConfig}
            setDayConfig={setDayConfig}
            currentDayTime={currentDayTime}
            isClockRunning={isClockRunning}
            setIsClockRunning={setIsClockRunning}
            currentDay={currentDay}
            canSleep={canSleepNow}
            finishDay={finishDay}
            dailyBalance={dailyBalance}
            globalBalance={globalBalance}
          />
        );
      case 'workforce':
        return (
          <WorkforceView workforce={workforce} addActor={addActor} />
        );
      default:
        return null;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 font-sans antialiased text-gray-800">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        .custom-card {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 0.75rem;
        }
        .custom-card-hover:hover {
            transform: scale(1.05);
        }
        .text-shadow {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }
        `}
      </style>
      <header className="w-full max-w-5xl text-center mb-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Usuario: </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="user"
                value="store"
                checked={currentUser === 'store'}
                onChange={() => setCurrentUser('store')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Tienda</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="user"
                value="main"
                checked={currentUser === 'main'}
                onChange={() => setCurrentUser('main')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Principal</span>
            </label>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 text-shadow">SGI {currentUser === 'store' ? '(Tienda)' : '(Principal)'}</h1>
          <p className="text-lg text-gray-600 mt-2">Organiza tus productos, estaciones y almacenes.</p>
        </div>
      </header>

      <div className="flex justify-center space-x-2 mb-8">
        {currentUser === 'main' && (
          <>
            <NavButton view="organizer" icon={LayoutGrid} label="Organizador" />
            <NavButton view="stations" icon={Factory} label="Estaciones" />
            <NavButton view="warehouses" icon={Archive} label="Almacenes" />
            <NavButton view="company" icon={Archive} label="Empresa" />
            <NavButton view="workforce" icon={Archive} label="Fuerza Laboral" />
          </>
        )}
        {currentUser === 'store' && (
          <NavButton view="organizer" icon={LayoutGrid} label="Organizador" />
        )}
        <NavButton view="register" icon={Box} label="Productos" />
        <NavButton view="buy" icon={ShoppingCart} label="Tienda" />
      </div>

      {message && (
        <div className="w-full max-w-5xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 transition-opacity duration-300" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {renderView()}

      {/* Modal para ingresar precio de venta */}
      {priceModalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Establecer Precio de Venta</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Producto</p>
              <p className="text-lg font-semibold text-gray-800">{priceModalItem.name}</p>
              <p className="text-sm text-gray-600 mt-2">Cantidad disponible</p>
              <p className="text-lg font-bold text-indigo-600">{priceModalItem.qty} unidades</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio por unidad ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPriceModalItem(null);
                  setPriceInput('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmMoveItemToSale}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para solicitud de productos */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Enviar Productos</h3>
            
            {/* Selector de destino - Solo para usuario main */}
            {currentUser === 'main' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Destino</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="destination"
                      value="tienda"
                      checked={requestDestination === 'tienda'}
                      onChange={() => setRequestDestination('tienda')}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Tienda (Solicitud)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="destination"
                      value="publico"
                      checked={requestDestination === 'publico'}
                      onChange={() => setRequestDestination('publico')}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Venta Pública</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {requestDestination === 'tienda' 
                    ? 'Los productos se enviarán como solicitud a la tienda para su aprobación.'
                    : 'Los productos estarán disponibles para venta directa al público.'}
                </p>
              </div>
            )}
            
            {/* Para usuario tienda, solo muestra destino a tienda sin selector */}
            {currentUser === 'store' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">Destino: Tu Tienda</p>
                <p className="text-xs text-blue-600 mt-1">Los productos se agregarán a tu tienda con el precio que especifiques.</p>
              </div>
            )}

            {/* Lista de productos disponibles */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Selecciona productos</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                { (currentUser === 'store' ? storeInventory : inventory).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay productos en el inventario</p>
                ) : (
                  (currentUser === 'store' ? storeInventory : inventory).map(item => (
                    <div 
                      key={item.productId} 
                      className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-lg" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">Disponible: {item.qty}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">Cantidad</label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const current = selectedProducts[item.productId]?.quantity || 0;
                                if (current > 0) {
                                  handleProductSelection(item.productId, current - 1, selectedProducts[item.productId]?.price || 0);
                                }
                              }}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                              disabled={!(selectedProducts[item.productId]?.quantity)}
                            >
                              <MinusSquare size={14} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={item.qty}
                              value={selectedProducts[item.productId]?.quantity || 0}
                              onChange={(e) => {
                                const val = Math.min(item.qty, Math.max(0, parseInt(e.target.value) || 0));
                                handleProductSelection(item.productId, val, selectedProducts[item.productId]?.price || 0);
                              }}
                              className="flex-1 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <button
                              onClick={() => {
                                const current = selectedProducts[item.productId]?.quantity || 0;
                                if (current < item.qty) {
                                  handleProductSelection(item.productId, current + 1, selectedProducts[item.productId]?.price || 0);
                                }
                              }}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                              disabled={(selectedProducts[item.productId]?.quantity || 0) >= item.qty}
                            >
                              <PlusSquare size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {(requestDestination === 'tienda' || requestDestination === 'publico') && (
                          <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">Precio/Unidad</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={selectedProducts[item.productId]?.price || 0}
                              onChange={(e) => {
                                handleProductSelection(item.productId, selectedProducts[item.productId]?.quantity || 0, e.target.value);
                              }}
                              placeholder="0.00"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resumen de selección */}
            {Object.keys(selectedProducts).length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-800 mb-2">Productos seleccionados:</p>
                <div className="space-y-2">
                  {Object.entries(selectedProducts).map(([productId, data]) => {
                    const product = inventory.find(p => p.productId === productId);
                    const total = data.quantity * (data.price || 0);
                    return (
                      <div key={productId} className="flex justify-between text-sm bg-white p-2 rounded">
                        <span className="text-gray-700">{product?.name}</span>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-700">{data.quantity} unidades</p>
                          {requestDestination === 'tienda' && (
                            <p className="text-xs text-indigo-600">${data.price.toFixed(2)} c/u = ${total.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {requestDestination === 'tienda' && (
                    <div className="border-t pt-2 mt-2 font-bold flex justify-between text-indigo-800">
                      <span>Total a recibir:</span>
                      <span>${Object.entries(selectedProducts).reduce((sum, [, data]) => sum + (data.quantity * data.price), 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRequestModalOpen(false);
                  setSelectedProducts({});
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={submitProductRequest}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                disabled={Object.keys(selectedProducts).length === 0}
              >
                {requestDestination === 'tienda' ? 'Enviar Solicitud' : 'Publicar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (() => {
        const w = warehouses.find(w => w.id === selectedStation?.warehouseId);
        const st = selectedStation ? w?.stations[selectedStation.stationIndex] : null;
        const liveStation = st ? { ...st, warehouseId: selectedStation.warehouseId, stationIndex: selectedStation.stationIndex } : null;
        return (
        <StationDetailsModal
          station={liveStation}
          onClose={() => setIsModalOpen(false)}
          updateStationStatus={updateStationStatus}
          handleMoveFinalProductToInventory={handleMoveFinalProductToInventory}
          products={products}
          inventory={inventory}
          company={company}
          workforce={workforce}
          assignActorToStation={assignActorToStation}
          unassignActorFromStation={unassignActorFromStation}
          assignTaskToActor={assignTaskToActor}
        />);
      })()}

      {currentView === 'buy' && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500"
          title="Abrir carrito"
        >
          <div className="flex items-center">
            <ShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </div>
        </button>
      )}

      {isCartOpen && (
        <CartView
          cartItems={cartItems}
          onPurchase={handlePurchaseFromCart}
          onClose={() => setIsCartOpen(false)}
          onUpdateCart={setCartItems}
        />
      )}
    </div>
    {isPersonalPanelVisible && (
    
      <PersonalPanel
        personalInventory={personalInventory}
        addToPersonalInventory={addToPersonalInventory}
        removeFromPersonalInventory={removeFromPersonalInventory}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        dailyBalance={dailyBalance}
        isVisible={isPersonalPanelVisible}
        setIsVisible={setIsPersonalPanelVisible}
        currentUser={currentUser}
        productRequests={productRequests}
        acceptProductRequest={acceptProductRequest}
        rejectProductRequest={rejectProductRequest}
        globalBalance={globalBalance}
        publicSaleProducts={publicSaleProducts}
        removePublicSaleProduct={removePublicSaleProduct}
      />
    )}
    {!isPersonalPanelVisible && (
      <button
        onClick={() => setIsPersonalPanelVisible(true)}
        className="fixed top-6 right-6 p-3 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500"
        title="Mostrar panel personal"
      >
        📦
      </button>
    )}
    </>
  );
};

export default App;
