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
  parentId?: string | null; // nuevo: permite anidar estantes
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
  setDraggedItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
    const value = Math.max(1, Number(e.target.value));
    setter(value);
  };
  const [shelvesToCreate, setShelvesToCreate] = useState<number>(0);
  const [shelfCapacity, setShelfCapacity] = useState<number>(3);
  const [touchDraggedItem, setTouchDraggedItem] = useState<DraggedItem | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState<boolean>(false);
  const [ghostElement, setGhostElement] = useState<HTMLDivElement | null>(null);
  const [dropZones, setDropZones] = useState<Element[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<Element | null>(null);
  const dragElementRef = useRef<HTMLDivElement>(null);

  // Estado local para mostrar el resumen del inventario y mantener sincronía visual
  const [displayInventorySummary, setDisplayInventorySummary] = useState<InventoryItem[]>(inventorySummary);
  useEffect(() => {
    setDisplayInventorySummary(inventorySummary);
  }, [inventorySummary]);

  // Sincronizar visual con el estado real 'inventory' si cambia
  useEffect(() => {
    setDisplayInventorySummary(inventory);
  }, [inventory]);

  const [touchStartPos, setTouchStartPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [dragSourceElement, setDragSourceElement] = useState<HTMLElement | null>(null);
  const touchElementsRef = useRef<Map<HTMLElement, () => void>>(new Map());

  // Detección mejorada - no necesitamos detectar dispositivo, manejamos ambos eventos
  const isTouchSupported = typeof window !== 'undefined' && 
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

  // generateInitialLayout ahora añade (append) y acepta parentId (null => raíz)
  const generateInitialLayout = (draggedItem: DraggedItem, parentId: string | null = null): void => {
    const newShelf: Shelf = {
      id: `shelf-${generateId()}`,
      items: [],
      capacity: draggedItem.capacity || 3,
      color: draggedItem.color,
      name: draggedItem.name,
      productId: draggedItem.productId,
      qty: 1, // Al crear un shelf desde inventario, siempre qty: 1
      uniqueId: `${draggedItem.productId}-${generateId()}`,
      draggable: true,
      parentId,
    };
    setShelves(prev => [...prev, newShelf]);
    // resta 1 del inventario (si corresponde)
    changeInventoryQty(draggedItem.productId, -1, draggedItem);
  };

  const handleStationDropOnLayout = (
    e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent
  ): void => {
    e.preventDefault();
    const itemToCheck = draggedItem || touchDraggedItem;
    if (!itemToCheck) return;

    // Si es un shelf existente y lo sueltan en layout -> moverlo a raíz (parentId = null)
    if ((itemToCheck as any).type === 'shelf') {
      const moving = itemToCheck as any;
      const current = shelves.find(s => s.uniqueId === moving.uniqueId);
      // Si ya está en raíz, ignorar (evita duplicar/mover innecesario)
      if (current && !current.parentId) {
        setMessage('El estante ya está en la zona de estantes');
        return;
      }
      setShelves(prev => prev.map(s => (s.uniqueId === moving.uniqueId ? { ...s, parentId: null } : s)));
      setMessage('Estante movido a la zona de estantes');
      return;
    }

    // Si es producto que representa estante (capacity) -> crear estante raíz
    if (itemToCheck.capacity) {
      generateInitialLayout(itemToCheck, null);
      return;
    }
  };

  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [initialTouch, setInitialTouch] = useState<TouchPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const LONG_PRESS_MS = 300;
  const [pointerLongPressTimeout, setPointerLongPressTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);

  // Global pointer listeners during drag
  useEffect(() => {
    if (!isPointerDragging) return;

    const onMove = (ev: PointerEvent) => {
      if (!isPointerDragging || !ghostElement || !touchDraggedItem) return;
      
      ev.preventDefault();
      ev.stopPropagation();
      
      const left = Math.min(window.innerWidth - 80, Math.max(10, ev.clientX + 10));
      const top = Math.min(window.innerHeight - 80, Math.max(10, ev.clientY + 10));
      ghostElement.style.left = `${left}px`;
      ghostElement.style.top = `${top}px`;

      ghostElement.style.pointerEvents = 'none';
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      ghostElement.style.pointerEvents = '';

      if (!el) return;
      const dropZone = el.closest('[data-drop-zone="true"]');

      dropZones.forEach(zone => {
        if (zone instanceof HTMLElement) {
          zone.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50');
        }
      });

      if (dropZone && dropZones.includes(dropZone)) {
        (dropZone as HTMLElement).classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50');
        if (activeDropZone !== dropZone && 'vibrate' in navigator) {
          try { (navigator as any).vibrate(10); } catch {}
        }
        setActiveDropZone(dropZone);
      } else {
        setActiveDropZone(null);
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (activePointerId !== null && ev.pointerId !== activePointerId) return;
      
      ev.preventDefault();
      ev.stopPropagation();

      if (!touchDraggedItem) {
        resetPointerState();
        return;
      }

      if ('vibrate' in navigator) {
        try { (navigator as any).vibrate(25); } catch {}
      }

      if (activeDropZone) {
        const dropType = activeDropZone.getAttribute('data-drop-type');
        const syntheticEvent = {
          preventDefault: () => {},
          dataTransfer: { getData: () => JSON.stringify(touchDraggedItem) }
        };

        try {
          switch (dropType) {
            case 'shelf': {
              const shelfId = activeDropZone.getAttribute('data-shelf-id');
              const cap = activeDropZone.getAttribute('data-capacity');
              if (shelfId && cap) handleDropToShelfInternal(syntheticEvent as any, shelfId, parseInt(cap));
              break;
            }
            case 'inventory':
              if (touchDraggedItem.type === 'item-in-shelf') handleDropItemToInventory(syntheticEvent as any);
              else if (touchDraggedItem.type === 'shelf') handleDropShelfToInventory(syntheticEvent as any);
              break;
            case 'trash':
              handleDropToTrashInternal(syntheticEvent as any);
              break;
            case 'layout':
              handleStationDropOnLayout(syntheticEvent);
              break;
          }
        } catch (err) {
          console.error('Drop error:', err);
          setMessage('Error al soltar el elemento');
        }
      }

      resetPointerState();
    };

    const onCancel = () => {
      resetPointerState();
    };

    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp, { passive: false });
    document.addEventListener('pointercancel', onCancel, { passive: false });

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
    };
  }, [isPointerDragging, ghostElement, touchDraggedItem, dropZones, activeDropZone, activePointerId]);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLElement>,
    item: InventoryItem | Shelf,
    type: string,
    uniqueId?: string
  ) => {
    if (!isDraggable) return;

    // Only handle touch/pen
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

    e.stopPropagation();
    const pointX = e.clientX;
    const pointY = e.clientY;
    setTouchStartPos({ x: pointX, y: pointY });
    setActivePointerId(e.pointerId);

    const startDrag = () => {
      if (type === 'shelf') {
        const s = item as Shelf;
        const hasItems = (s.items?.length || 0) > 0;
        const hasNested = shelves.some(ns => ns.parentId === s.id);
        if (hasItems || hasNested) {
          setMessage('Debes vaciar el estante antes de poder arrastrarlo.');
          setActivePointerId(null);
          return;
        }
      }

      setDragSourceElement(e.currentTarget);

      // Capture pointer
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        console.log('Pointer capture failed:', err);
      }

      const syntheticTouch = { clientX: pointX, clientY: pointY } as any;
      const ghost = createGhostElement({ ...item, type, uniqueId }, syntheticTouch);
      setGhostElement(ghost);
      setTouchDraggedItem({ ...item, type, uniqueId });
      setIsDraggingTouch(true);
      setIsPointerDragging(true);
      setDraggedItem({ ...item, type, uniqueId });
      e.currentTarget.style.opacity = '0.5';

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';

      if ('vibrate' in navigator) {
        try { (navigator as any).vibrate(40); } catch {}
      }
    };

    const timeout = setTimeout(startDrag, LONG_PRESS_MS);
    setPointerLongPressTimeout(timeout);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;

    if (pointerLongPressTimeout && !isDraggingTouch) {
      const dx = Math.abs(e.clientX - touchStartPos.x);
      const dy = Math.abs(e.clientY - touchStartPos.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(pointerLongPressTimeout);
        setPointerLongPressTimeout(null);
        setActivePointerId(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (pointerLongPressTimeout) {
      clearTimeout(pointerLongPressTimeout);
      setPointerLongPressTimeout(null);
      setActivePointerId(null);
    }

    // Release capture
    if (activePointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const resetPointerState = () => {
    if (ghostElement && ghostElement.parentNode) {
      ghostElement.remove();
      setGhostElement(null);
    }
    if (dragSourceElement) {
      dragSourceElement.style.opacity = '1';
      setDragSourceElement(null);
    }
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
    
    setIsDraggingTouch(false);
    setIsPointerDragging(false);
    setTouchDraggedItem(null);
    setDraggedItem(null);
    setActiveDropZone(null);
    setActivePointerId(null);
    
    const zones = document.querySelectorAll('[data-drop-zone="true"]');
    zones.forEach(z => {
      if (z instanceof HTMLElement) {
        z.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50');
      }
    });
  };

  const cleanup = () => {
    if (ghostElement) {
      ghostElement.remove();
      setGhostElement(null);
    }
    if (dragSourceElement) {
      dragSourceElement.style.opacity = '1';
      setDragSourceElement(null);
    }
    setTouchDraggedItem(null);
    setDraggedItem(null);
    setIsDraggingTouch(false);
    setActiveDropZone(null);
  };

  // Utilidad para obtener el item arrastrado desde el evento
  const getDraggedItemFromEvent = (e: any): DraggedItem | null => {
    try {
      if (e.dataTransfer && typeof e.dataTransfer.getData === 'function') {
        return JSON.parse(e.dataTransfer.getData('text/plain'));
      }
    } catch {}
    return draggedItem || touchDraggedItem || null;
  };

  // Helper para cambiar qty en inventory y en el resumen visual (delta puede ser positivo o negativo)
  const changeInventoryQty = (productId: string, delta: number, meta?: Partial<InventoryItem>) => {
    if (delta === 0) return;

    setInventory(prev => {
      const idx = prev.findIndex(i => i.productId === productId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + delta };
        if (updated[idx].qty <= 0) {
          updated.splice(idx, 1);
        }
        return updated;
      } else if (delta > 0) {
        return [...prev, { productId, name: meta?.name || '', color: meta?.color || '#999', capacity: meta?.capacity, qty: delta }];
      }
      return prev;
    });

    setDisplayInventorySummary(prev => {
      const idx = prev.findIndex(i => i.productId === productId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + delta };
        if (updated[idx].qty <= 0) {
          updated.splice(idx, 1);
        }
        return updated;
      } else if (delta > 0) {
        return [...prev, { productId, name: meta?.name || '', color: meta?.color || '#999', capacity: meta?.capacity, qty: delta }];
      }
      return prev;
    });
  };

  // Drop en estante (de inventario a estante) — maneja items, crear shelfnuevo anidado o mover shelf existente
  const handleDropToShelfInternal = (
    e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent,
    shelfId: string,
    capacity: number
  ) => {
    e.preventDefault();
    const item = getDraggedItemFromEvent(e);
    if (!item) return;

    if (shelves.length === 0) {
      setMessage('Primero coloca un estante');
      cleanup();
      return;
    }

    const targetShelf = shelves.find(s => s.id === shelfId);
    if (!targetShelf) {
      setMessage('Estante destino no encontrado');
      cleanup();
      return;
    }

    // calcular ocupación: items + estantes anidados directos
    const nestedCount = shelves.filter(s => s.parentId === targetShelf.id).length;
    const occupied = targetShelf.items.length + nestedCount;
    if (occupied >= targetShelf.capacity) {
      setMessage('No hay espacio en el estante');
      cleanup();
      return;
    }

    // 1) Si el item arrastrado desde inventario es UN "producto-estante" (tiene capacity) -> crear estante dentro del target
    if (item.type === 'grouped-inventory' && item.capacity) {
      const newShelf: Shelf = {
        id: `shelf-${generateId()}`,
        items: [],
        capacity: item.capacity || 3,
        color: item.color,
        name: item.name,
        productId: item.productId,
        qty: 1, // Siempre qty: 1 al crear estante desde inventario
        uniqueId: `${item.productId}-${generateId()}`,
        draggable: true,
        parentId: targetShelf.id,
      };
      setShelves(prev => [...prev, newShelf]);
      changeInventoryQty(item.productId, -1, item);
      setMessage('Estante creado dentro del estante destino');
      cleanup();
      return;
    }

    // 2) Si se está moviendo un SHELF existente (tipo 'shelf') -> actualizar parentId para anidarlo
    if (item.type === 'shelf') {
      const moving = item as any;
      // Evitar mover dentro de sí mismo o dentro de su propio hijo
      if (moving.uniqueId === targetShelf.uniqueId) {
        setMessage('Acción inválida');
        cleanup();
        return;
      }
      // Evitar crear bucles: si target es hijo del moving, impedir
      const isTargetDescendant = (function checkDescendant(parentId: string | null | undefined, candidateId: string): boolean {
        if (!parentId) return false;
        if (parentId === candidateId) return true;
        const parent = shelves.find(s => s.id === parentId);
        return parent ? checkDescendant(parent.parentId, candidateId) : false;
      })(targetShelf.parentId, moving.uniqueId);
      if (isTargetDescendant) {
        setMessage('No puedes mover un estante dentro de su descendiente');
        cleanup();
        return;
      }

      setShelves(prev => prev.map(s => (s.uniqueId === moving.uniqueId ? { ...s, parentId: targetShelf.id } : s)));
      setMessage('Estante movido dentro del estante destino');
      cleanup();
      return;
    }

    // 3) Si es un item que viene de otro estante -> mover unidad entre estantes
    if (item.type === 'item-in-shelf') {
      const movingItem = item as ShelfItem;
      // Si el origen y destino son el mismo, no hacer nada
      const originShelfIdx = shelves.findIndex(s => s.items.some(i => i.uniqueId === movingItem.uniqueId));
      if (originShelfIdx === -1) {
        // origen no encontrado (por si acaso), tratar como nuevo
      } else {
        const originShelf = shelves[originShelfIdx];
        if (originShelf.id === targetShelf.id) {
          cleanup();
          return;
        }
        // Remover del estante origen
        setShelves(prev =>
          prev.map(s =>
            s.id === originShelf.id ? { ...s, items: s.items.filter(i => i.uniqueId !== movingItem.uniqueId) } : s
          )
        );
      }
      // Agregar al estante destino
      setShelves(prev =>
        prev.map(s =>
          s.id === targetShelf.id
            ? { ...s, items: [...s.items, { ...movingItem, uniqueId: `${movingItem.productId}-${Date.now()}` }] }
            : s
        )
      );
      setMessage('Elemento movido entre estantes');
      cleanup();
      return;
    }

    // 4) Si es producto normal (grouped-inventory sin capacity) -> agregar 1 unidad al estante
    if (item.type === 'grouped-inventory') {
      changeInventoryQty(item.productId, -1, item);
      setShelves(prev =>
        prev.map(s =>
          s.id === targetShelf.id
            ? {
                ...s,
                items: [
                  ...s.items,
                  {
                    ...item,
                    uniqueId: `${item.productId}-${Date.now()}`,
                    qty: 1
                  }
                ]
              }
            : s
        )
      );
      setMessage('Elemento movido al estante');
      cleanup();
      return;
    }

    cleanup();
  };

  // Drop en inventario para estantes (solo si vacío)
  const handleDropShelfToInventory = (
    e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent
  ) => {
    e.preventDefault();
    const item = getDraggedItemFromEvent(e);
    if (!item) return;

    if (item.type === 'shelf') {
      // Solo si el estante está vacío (sin items y sin nested shelves)
      const shelf = shelves.find(s => s.uniqueId === item.uniqueId);
      const hasNested = shelves.some(s => s.parentId === shelf?.id);
      if (shelf && (shelf.items.length === 0) && !hasNested) {
        // Quitar estante
        setShelves(prev => prev.filter(s => s.uniqueId !== item.uniqueId));
        // Sumar qty del estante al inventario (helper)
        changeInventoryQty(shelf.productId, shelf.qty, shelf);
        setMessage('Estante devuelto al inventario');
      } else {
        setMessage('Solo puedes devolver estantes vacíos');
      }
    }
    cleanup();
  };

  // Mover del inventario al estante (resta 1 del inventario, suma 1 al estante)
const handleDropToShelf = (
  e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent,
  shelfId: string,
  capacity: number
) => {
  e.preventDefault();
  const item = getDraggedItemFromEvent(e);
  if (!item) return;

  if (shelves.length === 0) {
    setMessage('Primero coloca un estante');
    cleanup();
    return;
  }

  const shelf = shelves.find(s => s.id === shelfId);
  if (!shelf || shelf.items.length >= shelf.capacity) {
    setMessage('No hay espacio en el estante');
    cleanup();
    return;
  }

  if (item.type === 'grouped-inventory') {
    // Quitar 1 del inventario
    setInventory(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId);
      if (idx !== -1 && prev[idx].qty > 0) {
        const updated = [...prev];
        updated[idx].qty -= 1;
        if (updated[idx].qty === 0) {
          updated.splice(idx, 1);
        }
        return updated;
      }
      return prev;
    });
    // Quitar 1 del resumen visual
    // ...actualiza inventorySummary si tienes setInventorySummary...
    // Agregar 1 al estante
    setShelves(prev =>
      prev.map(shelf =>
        shelf.id === shelfId
          ? {
              ...shelf,
              items: [
                ...shelf.items,
                {
                  ...item,
                  uniqueId: `${item.productId}-${Date.now()}`,
                  qty: 1
                }
              ]
            }
          : shelf
      )
    );
    setMessage('Elemento movido al estante');
  }
  cleanup();
};

// Mover del estante al inventario (suma 1 al inventario, elimina solo la unidad del estante)
const handleDropItemToInventory = (e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent) => {
  e.preventDefault();
  const item = getDraggedItemFromEvent(e);
  if (!item) return;

  if (item.type === 'item-in-shelf') {
    setShelves(prev =>
      prev.map(shelf => ({ ...shelf, items: shelf.items.filter(i => i.uniqueId !== item.uniqueId) }))
    );
    // Sumar 1 al inventario (helper)
    changeInventoryQty(item.productId, 1, item);
    setMessage('Elemento devuelto al inventario');
  }
  cleanup();
};

// Basurero interno: resta 1 del inventario o elimina item del estante (1 unidad)
const handleDropToTrashInternal = (e: React.DragEvent<HTMLDivElement> | SyntheticDropEvent) => {
  e.preventDefault();
  const item = getDraggedItemFromEvent(e);
  if (!item) return;

  if (item.type === 'grouped-inventory') {
    changeInventoryQty(item.productId, -1, item);
    setMessage('Elemento eliminado del inventario');
    } else if (item.type === 'item-in-shelf') {
      setShelves(prev => prev.map(shelf => ({ ...shelf, items: shelf.items.filter(i => i.uniqueId !== item.uniqueId) })));
      setMessage('Elemento eliminado del estante');
    } else if (item.type === 'shelf') {
      const shelf = shelves.find(s => s.uniqueId === item.uniqueId);
      const hasNested = shelves.some(s => s.parentId === shelf?.id);
      if (shelf && (shelf.items.length === 0) && !hasNested) {
        setShelves(prev => prev.filter(s => s.uniqueId !== item.uniqueId));
        setMessage('Estante eliminado');
      } else {
        setMessage('Solo puedes eliminar estantes vacíos');
      }
    }
    cleanup();
  };


  function renderShelf(shelf: Shelf, i: number): React.ReactNode {
    const nestedShelves = shelves.filter((s) => s.parentId === shelf.id);
    const isEmpty = shelf.items.length === 0 && nestedShelves.length === 0;
    const isNested = !!shelf.parentId;

    if (isNested) {
      return (
        <div
          key={shelf.uniqueId}
          className="relative bg-indigo-100 border-2 border-indigo-400 rounded-lg p-3 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing"
          style={{ 
            backgroundColor: shelf.color, 
            opacity: 0.8, 
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          draggable={isEmpty}
          onDragStart={isEmpty ? (e) => handleDragStart(e, shelf, 'shelf', shelf.uniqueId) : undefined}
          onPointerDown={isEmpty ? (e) => handlePointerDown(e, shelf, 'shelf', shelf.uniqueId) : undefined}
          onPointerMove={isEmpty ? handlePointerMove : undefined}
          onPointerUp={isEmpty ? handlePointerUp : undefined}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">{shelf.name}</span>
            <span className="text-xs text-white bg-indigo-600 px-1 py-0.5 rounded">
              {shelf.capacity}
            </span>
          </div>
          <p className="text-xs text-gray-200 italic">Elemento anidado</p>
        </div>
      );
    }

    return (
      <div
        key={shelf.uniqueId}
        className="relative bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 shadow-md flex flex-col gap-2 transition-all duration-200"
        style={{ 
          backgroundColor: shelf.color, 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        data-drop-zone="true"
        data-drop-type="shelf"
        data-shelf-id={shelf.id}
        data-capacity={shelf.capacity}
        draggable={isEmpty}
        onDragStart={isEmpty ? (e) => handleDragStart(e, shelf, 'shelf', shelf.uniqueId) : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropToShelfInternal(e, shelf.id, shelf.capacity)}
        onPointerDown={isEmpty ? (e) => handlePointerDown(e, shelf, 'shelf', shelf.uniqueId) : undefined}
        onPointerMove={isEmpty ? handlePointerMove : undefined}
        onPointerUp={isEmpty ? handlePointerUp : undefined}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg text-white">{shelf.name}</span>
          <span className="text-xs text-white bg-indigo-600 px-2 py-1 rounded">
            Capacidad: {shelf.capacity}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {shelf.items.length > 0 ? (
            shelf.items.map((item) => (
              <div
                key={item.uniqueId}
                className="px-3 py-2 rounded-md shadow text-xs font-medium text-white cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-105"
                style={{ 
                  backgroundColor: item.color, 
                  touchAction: 'none', 
                  WebkitUserSelect: 'none', 
                  userSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}
                draggable
                onDragStart={(e) => handleDragStart(e, item, 'item-in-shelf', item.uniqueId)}
                onPointerDown={(e) => handlePointerDown(e, item, 'item-in-shelf', item.uniqueId)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {item.name}
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-xs">Vacío</span>
          )}
        </div>
        <div className="mt-2 pl-4 border-l-2 border-indigo-200">
          {shelves
            .filter((s) => s.parentId === shelf.id)
            .map((nestedShelf, idx) => renderShelf(nestedShelf, idx))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col-reverse sm:flex-col gap-8">
          <div
            className="bg-red-100 p-6 rounded-xl shadow-lg border-2 border-dashed border-red-300 flex items-center justify-center min-h-[8rem] transition-all duration-200"
            data-drop-zone="true"
            data-drop-type="trash"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropToTrashInternal}
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <div className="flex flex-col items-center text-red-500 pointer-events-none">
              <Trash2 size={40} />
              <p className="mt-2 text-lg font-semibold">Basurero</p>
              <p className="text-sm">Mantén presionado y arrastra aquí</p>
            </div>
          </div>
          <div
            className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-300 flex-grow transition-all duration-200"
            data-drop-zone="true"
            data-drop-type="inventory"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              handleDropItemToInventory(e);
              handleDropShelfToInventory(e);
            }}
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Inventario</h2>
            <p className="text-xs text-gray-500 mb-3">
              <strong>Móvil:</strong> Mantén presionado 300ms | <strong>PC:</strong> Arrastra normalmente
            </p>
            <div className="flex flex-wrap gap-4">
              {displayInventorySummary.length > 0 ? (
                displayInventorySummary
                  .filter((it) => it.qty > 0)
                  .map((item) => (
                    <div
                      key={item.productId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, 'grouped-inventory')}
                      onPointerDown={(e) => handlePointerDown(e, item, 'grouped-inventory')}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="cursor-grab active:cursor-grabbing px-4 py-3 rounded-lg shadow-md text-center text-sm font-medium text-white transition-transform hover:scale-105 select-none"
                      style={{ 
                        backgroundColor: item.color, 
                        touchAction: 'none', 
                        WebkitUserSelect: 'none', 
                        userSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitUserDrag: 'element'
                      } as React.CSSProperties}
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
          className="bg-white p-6 rounded-xl shadow-lg transition-all duration-200"
          data-drop-zone="true"
          data-drop-type="layout"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleStationDropOnLayout(e)}
          style={{ 
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Estantes</h2>
          <div className="flex flex-col gap-4">
            {shelves.filter(s => !s.parentId).length > 0 ? (
              shelves.filter(s => !s.parentId).map((shelf, i) => renderShelf(shelf, i))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No hay estantes.</p>
                <p className="text-sm mt-2">Mantén presionado un elemento y arrástralo aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay mejorado para indicar modo de arrastre */}
      {isDraggingTouch && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 pointer-events-none z-40"
          style={{ touchAction: 'none' }}
        >
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-pulse">
            <p className="text-sm font-bold flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
              Arrastrando elemento...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizerView;