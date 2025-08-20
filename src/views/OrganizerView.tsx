import React, { useState , useEffect, useRef} from 'react';
import {Archive, PlusSquare, MinusSquare, Trash2} from 'lucide-react';


const OrganizerView = ({
  shelves,
  inventorySummary,
  inventory,
  setShelves,
  setInventory,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDropToInventory,
  handleDropToTrash,
  setMessage,
  draggedItem,
  isDraggable


}) => {
  const [shelvesToCreate, setShelvesToCreate] = useState(0);
  const [shelfCapacity, setShelfCapacity] = useState(3);



  const generateId = () => Math.random().toString(36).substring(2, 9);

  const generateInitialLayout = (draggedItem) => {
   setShelvesToCreate(prevShelvesToCreate => {
    const newShelvesToCreate = prevShelvesToCreate
    console.log(newShelvesToCreate); // Aquí se muestra el valor correcto

    // Luego, generamos el layout con este nuevo valor
    const newShelves = Array.from({ length: 1 }, (_, i) => ({
      id: `shelf-${i}`,
      items: [],
      capacity: draggedItem.capacity,
      color : draggedItem.color,
      name : draggedItem.name,
      productId : draggedItem.productId,
      qty : draggedItem.qty,
      uniqueId: `${draggedItem.productId}-${generateId()}`,
      draggable : true,

      
    }));
    
    // Y actualizamos el estado de shelves
    setShelves(newShelves);
    
    return newShelvesToCreate; // Retornamos el nuevo valor para setShelvesToCreate
  });
  };

  const handleStationDropOnLayout = (e)=>{
    e.preventDefault();


  if (draggedItem && draggedItem.capacity) {
     
      generateInitialLayout(draggedItem);
      //si lo muevo al contenedor, entonces tengo que hacer que se "quite" del inventario.

      const itemToMoveIndex = inventory.findIndex(item=> item.productId === draggedItem.productId);

      const itemToMove = inventory[itemToMoveIndex];

      const newInventory = [...inventory];

      newInventory.splice(itemToMoveIndex,1);
      setInventory(newInventory);

      //Actualizar el shelve con los datos pertenecientes a un producto.


      


    }else{
      console.log("norack")
    }

    // 

    };






  return (
    <>
      <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
          <Archive className="mr-2 text-indigo-600" />
          Configuración de Estantes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-600 mb-1">Número de Estantes</label>
            <div className="flex items-center">
              <button
                onClick={() => setShelvesToCreate(prev => Math.max(1, prev - 1))}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md transition-colors"
              >
                <MinusSquare size={16} />
              </button>
              <input
                type="number"
                value={shelvesToCreate}
                onChange={(e) => setShelvesToCreate(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => setShelvesToCreate(prev => prev + 1)}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md transition-colors"
              >
                <PlusSquare size={16} />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-600 mb-1">Capacidad de Estantes</label>
            <div className="flex items-center">
              <button
                onClick={() => setShelfCapacity(prev => Math.max(1, prev - 1))}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md transition-colors"
              >
                <MinusSquare size={16} />
              </button>
              <input
                type="number"
                value={shelfCapacity}
                onChange={(e) => setShelfCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => setShelfCapacity(prev => prev + 1)}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md transition-colors"
              >
                <PlusSquare size={16} />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={generateInitialLayout}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors transform hover:bg-indigo-700"
        >
          Generar Estantes
        </button>
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div
            className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300 flex-grow"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToInventory}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventario (Arrastra para organizar)</h2>
            <div className="flex flex-wrap gap-4">
              {inventorySummary.length > 0 ? (
                inventorySummary
                .filter(item => item.qty >0)
                .map(item => (
                  <div
                    key={item.productId}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item, 'grouped-inventory')}
                    className="cursor-grab p-4 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
                    style={{ backgroundColor: item.color }}
                  >
                    <p>{item.name}</p>
                    <p className="mt-1 font-bold">({item.qty})</p>
                  </div>
                  
                ))
              ) : (
                <p className="text-gray-500">No hay elementos disponibles. ¡Ve a la tienda y compra algunos!</p>
              )}
            </div>
          </div>
          <div
            className="bg-red-100 p-6 rounded-xl shadow-lg border-2 border-dashed border-red-300 flex items-center justify-center min-h-[8rem] transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToTrash}
          >
            <div className="flex flex-col items-center justify-center text-red-500">
              <Trash2 size={48} />
              <p className="mt-2 text-lg font-semibold">Basurero</p>
              <p className="text-sm">Arrastra y suelta aquí para eliminar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleStationDropOnLayout(e)}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Estantes</h2>
          <div className="flex flex-col gap-4">
            {shelves.map((shelf, shelfIndex) => (
              <div
                key={shelf.id}
                data-type="shelf"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, shelf.id, shelf.capacity)}
                
                draggable={shelf.draggable}
                onDragStart={(e) => handleDragStart(e, shelf, 'shelf', shelf.uniqueId)}

                className="bg-gray-50 border border-gray-200 p-4 rounded-lg transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-gray-700">Estante {shelfIndex + 1}</span>
                  <span className="text-sm text-gray-500 font-semibold">
                    ({shelf.items.length}/{shelf.capacity})
                  </span>
                </div>
                
                <div className="min-h-[4rem] flex flex-wrap gap-2">
                  {shelf.items.map((item) => (
                    <div
                      key={item.uniqueId}
                      draggable="true"
                      onDragStart={(e) =>{
                         e.stopPropagation();
                         handleDragStart(e, item, 'shelf', item.uniqueId)}
                      }
                      className="cursor-grab p-2 rounded-lg shadow-sm text-xs font-medium text-white transition-transform transform hover:scale-105 active:cursor-grabbing"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerView;