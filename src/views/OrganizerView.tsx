
import React, { useState, useEffect, useRef } from 'react';
import { Archive, PlusSquare, MinusSquare, Trash2 } from 'lucide-react';

interface InventoryItem {
  productId: string;
  name: string;
  color: string;
  capacity?: number;
  qty: number;
}

interface ShelfItem extends InventoryItem {
  uniqueId: string;
}

interface Shelf {
  id: string;
  items: ShelfItem[];
  capacity: number;
  color: string;
  name: string;
  productId: string;
  qty: number;
  uniqueId: string;
  draggable: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

interface DraggedItem extends InventoryItem {
  type: string;
  uniqueId?: string;
}

interface SyntheticDropEvent {
  preventDefault: () => void;
  dataTransfer: {
    getData: (format: string) => string;
  };
}

interface OrganizerViewProps {
  shelves: Shelf[];
  inventorySummary: InventoryItem[];
  inventory: InventoryItem[];
  setShelves: React.Dispatch<React.SetStateAction<Shelf[]>>;
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    item: any,
    type: string,
    uniqueId?: string
  ) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, shelfId: string, capacity: number) => void;
  handleDropToInventory: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDropToTrash: (e: React.DragEvent<HTMLDivElement>) => void;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  draggedItem: DraggedItem | null;
  isDraggable: boolean;
}

const OrganizerView: React.FC<OrganizerViewProps> = ({
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
  isDraggable,
  setDraggedItem,
}) => {
  const [shelvesToCreate, setShelvesToCreate] = useState<number>(0);
  const [shelfCapacity, setShelfCapacity] = useState<number>(3);
  const [touchDraggedItem, setTouchDraggedItem] = useState<DraggedItem | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState<boolean>(false);
  const [ghostElement, setGhostElement] = useState<HTMLDivElement | null>(null);
  const [dropZones, setDropZones] = useState<Element[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<Element | null>(null);
  const dragElementRef = useRef<HTMLDivElement>(null);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (isDraggingTouch) {
      document.body.style.overflow = 'hidden';
      const zones = Array.from(document.querySelectorAll('[data-drop-zone="true"]'));
      setDropZones(zones);
    } else {
      document.body.style.overflow = '';
      setDropZones([]);
      setActiveDropZone(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDraggingTouch]);

  const generateId = (): string => Math.random().toString(36).substring(2, 9);

  const createGhostElement = (item: DraggedItem, touch: React.Touch) => {
    const ghost = document.createElement('div');
    ghost.className =
      'fixed pointer-events-none z-50 rounded-lg shadow-lg px-3 py-2 text-white text-xs font-medium';
    ghost.style.backgroundColor = item.color;
    ghost.style.left = `${Math.min(window.innerWidth - 40, touch.clientX + 20)}px`;
    ghost.style.top = `${Math.min(window.innerHeight - 40, touch.clientY + 20)}px`;
    ghost.style.opacity = '0.85';
    ghost.textContent = item.name;
    document.body.appendChild(ghost);
    return ghost;
  };

  const generateInitialLayout = (draggedItem: DraggedItem): void => {
    setShelvesToCreate((prev) => {
      const newShelves: Shelf[] = [
        {
          id: `shelf-${generateId()}`,
          items: [],
          capacity: draggedItem.capacity || 3,
          color: draggedItem.color,
          name: draggedItem.name,
          productId: draggedItem.productId,
          qty: draggedItem.qty,
          uniqueId: `${draggedItem.productId}-${generateId()}`,
          draggable: true,
        },
      ];
      setShelves(newShelves);
      return prev;
    });
  };

  const handleStationDropOnLayout = (
    e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent
  ): void => {
    console.log("s=")
    // return
    e.preventDefault();
    const itemToCheck = draggedItem || touchDraggedItem;
    if (itemToCheck && itemToCheck.capacity) {
      generateInitialLayout(itemToCheck);
      const idx = inventory.findIndex((i) => i.productId === itemToCheck.productId);
      if (idx !== -1) {
        const newInventory = [...inventory];
        newInventory.splice(idx, 1);
        setInventory(newInventory);
      }
    }
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    item: InventoryItem | Shelf,
    type: string,
    uniqueId?: string
  ): void => {
    // console.log("f=")
    // return
    if (!isDraggable) return;
    console.log(type)
    // e.preventDefault();
    //Si lo que estoy tratando de arrastrar es un estante, verifico que si no tiene elementos.
if (type === 'shelf' && (item as Shelf).items && (item as Shelf).items.length > 0) {
    setMessage("Debes vaciar el estante antes de poder arrastrarlo.");
    e.preventDefault();
    return;
}
    const touch = e.touches[0];
    const ghost = createGhostElement({ ...item, type, uniqueId }, touch);
    setGhostElement(ghost);
    setTouchDraggedItem({ ...item, type, uniqueId });
    setIsDraggingTouch(true);
    e.currentTarget.style.opacity = '0.5';
    setDraggedItem({ ...item, type, uniqueId })
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    console.log("r=")
    // return
    if (!isDraggingTouch || !touchDraggedItem || !ghostElement) return;
    // e.preventDefault();
    const touch = e.touches[0];
    ghostElement.style.left = `${Math.min(window.innerWidth - 40, touch.clientX + 20)}px`;
    ghostElement.style.top = `${Math.min(window.innerHeight - 40, touch.clientY + 20)}px`;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = el?.closest('[data-drop-zone="true"]');
    dropZones.forEach((z) => z.classList.remove('bg-indigo-50', 'border-indigo-300'));
    if (dropZone && dropZones.includes(dropZone)) {
      dropZone.classList.add('bg-indigo-50', 'border-indigo-300');
      setActiveDropZone(dropZone);
    } else {
      setActiveDropZone(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (!isDraggingTouch || !touchDraggedItem) return;
    e.preventDefault();
    if (ghostElement) {
      ghostElement.remove();
      setGhostElement(null);
    }
    e.currentTarget.style.opacity = '1';
    if (activeDropZone) {
      const dropType = activeDropZone.getAttribute('data-drop-type');
      const syntheticEvent = {
        preventDefault: () => {},
        dataTransfer: { getData: () => JSON.stringify(touchDraggedItem) },
      };
      // console.log(dropType)
      // return
      switch (dropType) {
        case 'shelf': {
          const shelfId = activeDropZone.getAttribute('data-shelf-id');
          const cap = activeDropZone.getAttribute('data-capacity');
          if (shelfId && cap) handleDrop(syntheticEvent as any, shelfId, parseInt(cap));
          break;
        }
        case 'inventory':
          handleDropToInventory(syntheticEvent as any);
          break;
        case 'trash':
          handleDropToTrash(syntheticEvent as any);
          break;
        case 'layout':
          handleStationDropOnLayout(syntheticEvent);
          break;
      }
    }
    console.log("aqui acaba el arrastre.")
    setTouchDraggedItem(null);
    setIsDraggingTouch(false);
    setActiveDropZone(null);
    dropZones.forEach((z) => z.classList.remove('bg-indigo-50', 'border-indigo-300'));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    setter(val);
  };

  return (
    <>
      <div className="w-full max-w-4xl p-6 bg-white custom-card mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
          <Archive className="mr-2 text-indigo-600" />
          Configuración de Estantes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Número de Estantes
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setShelvesToCreate((p) => Math.max(1, p - 1))}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md"
                type="button"
              >
                <MinusSquare size={16} />
              </button>
              <input
                type="number"
                value={shelvesToCreate}
                onChange={(e) => handleInputChange(e, setShelvesToCreate)}
                className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => setShelvesToCreate((p) => p + 1)}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md"
                type="button"
              >
                <PlusSquare size={16} />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Capacidad de Estantes
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setShelfCapacity((p) => Math.max(1, p - 1))}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md"
                type="button"
              >
                <MinusSquare size={16} />
              </button>
              <input
                type="number"
                value={shelfCapacity}
                onChange={(e) => handleInputChange(e, setShelfCapacity)}
                className="w-full text-center p-2 border-y border-gray-300 focus:outline-none"
              />
              <button
                onClick={() => setShelfCapacity((p) => p + 1)}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-r-md"
                type="button"
              >
                <PlusSquare size={16} />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => draggedItem && generateInitialLayout(draggedItem)}
          className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700"
          type="button"
        >
          Generar Estantes
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col-reverse sm:flex-col gap-8">
          <div
            className="bg-red-100 p-6 rounded-xl shadow-lg border-2 border-dashed border-red-300 flex items-center justify-center min-h-[8rem]"
            data-drop-zone="true"
            data-drop-type="trash"
            onDragOver={!isTouchDevice ? handleDragOver : undefined}
            onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
            onDrop={!isTouchDevice ? handleDropToTrash : undefined}
          >
            <div className="flex flex-col items-center text-red-500">
              <Trash2 size={40} />
              <p className="mt-2 text-lg font-semibold">Basurero</p>
              <p className="text-sm">Arrastra aquí para eliminar</p>
            </div>
          </div>
          <div
            className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300 flex-grow"
            data-drop-zone="true"
            data-drop-type="inventory"
            onDragOver={!isTouchDevice ? handleDragOver : undefined}
            onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
            onDrop={!isTouchDevice ? handleDropToInventory : undefined}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventario</h2>
            <div className="flex flex-wrap gap-4">
              {inventorySummary.length > 0 ? (
                inventorySummary
                  .filter((it) => it.qty > 0)
                  .map((item) => (
                    <div
                      key={item.productId}
                      ref={touchDraggedItem?.productId === item.productId ? dragElementRef : null}
                      draggable={!isTouchDevice}
                      onDragStart={
                        !isTouchDevice
                          ? (e) => handleDragStart(e, item, 'grouped-inventory')
                          : undefined
                      }
                      onTouchStart={
                        isTouchDevice
                          ? (e) => handleTouchStart(e, item, 'grouped-inventory')
                          : undefined
                      }
                      onTouchMove={isTouchDevice ? handleTouchMove : undefined}
                      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
                      className="cursor-grab px-4 py-3 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform hover:scale-105 select-none"
                      style={{ backgroundColor: item.color, touchAction: 'none' }}
                    >
                      <p>{item.name}</p>
                      <p className="mt-1 font-bold">({item.qty})</p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500">No hay elementos disponibles.</p>
              )}
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl shadow-lg"
          data-drop-zone="true"
          data-drop-type="layout"
          onDragOver={!isTouchDevice ? handleDragOver : undefined}
          onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
          onDrop={!isTouchDevice ? (e) => handleStationDropOnLayout(e) : undefined}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Estantes</h2>
        <div className="flex flex-col gap-4">
            {shelves.map((shelf, i) => {
              // Determinar si el estante es arrastrable: SOLO SI ESTÁ VACÍO
              const isShelfDraggable = !isTouchDevice && shelf.items.length === 0;

              return (
                <div
                  key={shelf.id}
                  data-drop-zone="true"
                  data-drop-type="shelf"
                  data-shelf-id={shelf.id}
                  data-capacity={shelf.capacity.toString()}
                  onDragOver={!isTouchDevice ? handleDragOver : undefined}
                  onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
                  onDrop={
                    !isTouchDevice ? (e) => handleDrop(e, shelf.id, shelf.capacity) : undefined
                  }
                  draggable={isShelfDraggable} // Control de escritorio
                  onDragStart={
                    isShelfDraggable
                      ? (e) => handleDragStart(e, shelf, 'shelf', shelf.uniqueId)
                      : undefined
                  }
                  onTouchStart={
                    isTouchDevice
                      ? (e) => handleTouchStart(e, shelf, 'shelf', shelf.uniqueId) // La lógica de bloqueo está DENTRO de handleTouchStart
                      : undefined
                  }
                  onTouchMove={isTouchDevice ? handleTouchMove : undefined}
                  onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
                  className={`bg-gray-50 border border-gray-200 p-4 rounded-lg transition-all select-none ${isShelfDraggable ? 'cursor-grab' : 'cursor-default'}`}
                  style={{ touchAction: 'none' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-gray-700">Estante {i + 1}</span>
                    <span className={`text-sm font-semibold ${isShelfDraggable ? 'text-green-500' : 'text-gray-500'}`}>
                      {isShelfDraggable ? 'Vacío, Arrastrable' : 'Con Ítems'} ({shelf.items.length}/{shelf.capacity})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {shelf.items.length > 0 ? (
                      shelf.items.map((item) => (
                        <div
                          key={item.uniqueId}
                          draggable={!isTouchDevice} // Los ítems siempre son arrastrables
                          onDragStart={
                            !isTouchDevice
                              ? (e) => handleDragStart(e, item, 'item-in-shelf', item.uniqueId) // Tipo: item-in-shelf
                              : undefined
                          }
                          onTouchStart={
                            isTouchDevice
                              ? (e) => handleTouchStart(e, item, 'item-in-shelf', item.uniqueId) // Tipo: item-in-shelf
                              : undefined
                          }
                          onTouchMove={isTouchDevice ? handleTouchMove : undefined}
                          onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
                          className="cursor-grab px-3 py-2 rounded-md text-xs font-medium text-white shadow-sm select-none transition-transform hover:scale-105 active:scale-95"
                          style={{ backgroundColor: item.color, touchAction: 'none' }}
                        >
                          {item.name}
                        </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Vacío</p>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerView;
