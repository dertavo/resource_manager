import React, { useState, useEffect } from 'react';
import { Moon, ShoppingCart, Sun } from 'lucide-react';

import StationDetailsModal from './views/StationDetailsModal';
import PersonalPanel from './components/PersonalPanel';
import AppNavigation from './components/AppNavigation';
import AppViewRouter from './components/AppViewRouter';
import CartView from './components/CartView';
import SalePriceModal from './components/SalePriceModal';
import useDayClock from './hooks/useDayClock';
import useOrganization from './hooks/useOrganization';
import useStationTimers from './hooks/useStationTimers';
import useTheme from './hooks/useTheme';
import usePersistentState, { rawStringStorage } from './hooks/usePersistentState';
import {
  actorsHaveHoursLeft as assignedActorsHaveHoursLeft,
  addFinalProduct,
  canAutoContinue as canStationAutoContinue,
  consumeIngredients,
  getAvailableItems as selectAvailableItems,
  hasEnoughIngredients,
} from './domain/inventory';
import { generateId } from './utils/id';



// Componente principal de la aplicación
const App = () => {
  const { isDark, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = usePersistentState(
    'currentUser',
    'store',
    rawStringStorage,
  );
  const [currentView, setCurrentView] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored === 'store' ? 'register' : 'organizer';
  });
  const [isDraggable, setIsDraggable] = useState(true);

  // Efecto para validar que el usuario tienda no acceda a vistas restringidas
  useEffect(() => {
    const restrictedViews = ['organizer', 'stations', 'warehouses', 'company', 'workforce'];
    if (currentUser === 'store' && restrictedViews.includes(currentView)) {
      setCurrentView('register'); // Redirigir a una vista permitida
    }
  }, [currentUser, currentView]);

  const [products, setProducts] = usePersistentState('products', []);
  const [shelves, setShelves] = usePersistentState('shelves', []);
  const [stations, setStations] = usePersistentState('stations', []);
  const [warehouses, setWarehouses] = usePersistentState('warehouses', []);
  const [inventory, setInventory] = usePersistentState('inventory', []);
  const [storeInventory, setStoreInventory] = usePersistentState('storeInventory', []);

  // Estados para el carrito
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [message, setMessage] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const {
    dailyBalance,
    setDailyBalance,
    globalBalance,
    setGlobalBalance,
    dayConfig,
    setDayConfig,
    currentDayTime,
    isClockRunning,
    setIsClockRunning,
    currentDay,
    currentDate,
    currentTimestamp,
    finishDay,
    canSleep,
  } = useDayClock(setMessage);
  const {
    company,
    setCompany,
    workforce,
    setWorkforce,
    personalInventory,
    createCompany,
    updateCompany,
    deleteCompany,
    addActor,
    assignActorToStation,
    unassignActorFromStation,
    addToPersonalInventory,
    removeFromPersonalInventory,
    assignTaskToActor,
  } = useOrganization({
    setGlobalBalance,
    setInventory,
    setMessage,
    setWarehouses,
    currentTimestamp,
  });
  const [productsForSale, setProductsForSale] = usePersistentState('productsForSale', {
    store: [],
    main: [],
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

  const [isPersonalPanelVisible, setIsPersonalPanelVisible] = usePersistentState(
    'isPersonalPanelVisible',
    true,
  );
  const [priceModalItem, setPriceModalItem] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const [productRequests, setProductRequests] = usePersistentState('productRequests', []);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [requestDestination, setRequestDestination] = useState('tienda'); // 'tienda' o 'publico'
  const [publicSaleProducts, setPublicSaleProducts] = usePersistentState(
    'publicSaleProducts',
    [],
  );

  const hasEnoughIngredientsForStation = (station, inv = inventory) =>
    hasEnoughIngredients(station, inv);

  const consumeIngredientsForStation = (station, inv = inventory) =>
    consumeIngredients(station, inv);

  const canAutoContinue = (station, inv = inventory) =>
    canStationAutoContinue(station, inv, workforce);

  const addFinalProductToInventory = (station, baseInventory = inventory) =>
    addFinalProduct(station, baseInventory);

  const getInventorySummary = () => selectAvailableItems(inventory, shelves);

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
        updatedWarehouses = updatedWarehouses.map(w => {
            const prevStationIndex = w.stations.findIndex(s => s?.id === stationId);
            if (prevStationIndex !== -1) {
                const newStations = [...w.stations];
                newStations[prevStationIndex] = null;
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
    let stoping = false;
    if (newStatus === 'processing' && station) {

      //Lógica para dentener el proceso mientras está procesado.
    
 
      const hasAssignedActors = ((station.assignedWorkerIds && station.assignedWorkerIds.length > 0) || (station.assignedMachineIds && station.assignedMachineIds.length > 0));
      if (!hasAssignedActors) {
        setMessage('Asigna personal o máquinas a la estación antes de iniciar.');
        return;
      }
      if (!hasEnoughIngredientsForStation(station)) {
        setMessage('¡Inventario insuficiente! No se puede iniciar la producción.');
        return;
      }
      if (processingMode === 'shift' && !assignedActorsHaveHoursLeft(station, workforce)) {
        setMessage('La jornada asignada ya está completa para este equipo.');
        return;
      }
      if(station.status ==='processing'){
        stoping = true;
        newStatus ='stopping';
      }else{
        const consumedInventory = consumeIngredientsForStation(station);
        setInventory(consumedInventory);
        setMessage(`Se consumieron ${station.inputProductIds.length} productos para iniciar la producción de "${station.finalProductName}".`);
      }
      
    }
    setWarehouses(prevWarehouses =>
      prevWarehouses.map(w => {
        if (w.id === warehouseId) {
          const newStations = [...w.stations];
          if (newStations[stationIndex]) {
            newStations[stationIndex] = {
              ...newStations[stationIndex],
              status: newStatus,
              stopRequested: stoping,
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

    if(!station.stopRequested){
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
  //Obtener estación actual (lectura segura)
  const warehouse = warehouses.find(w => w.id === warehouseId);
  const station = warehouse?.stations?.[stationIndex];
  if (!station) return;

  // Construir producto final
  const productToAdd = {
    productId:
      station.finalProduct?.productId ??
      station.finalProductId ??
      generateId(),
    name:
      station.finalProduct?.name ??
      station.finalProductName,
    color:
      station.finalProduct?.color ??
      station.finalProductColor ??
      `hsl(${Math.random() * 360}, 70%, 80%)`,
    qty: station.finalProduct?.qty ?? 1,
  };

  //Limpiar estación / resetear ciclo (PURO)
  setWarehouses(prev =>
    prev.map(w => {
      if (w.id !== warehouseId) return w;

      const stations = [...w.stations];
      const s = stations[stationIndex];
      if (!s) return w;

      stations[stationIndex] = {
        ...s,
        finalProduct: null,
        status: 'idle',
        remainingTime: s.processingTime,
      };

      return { ...w, stations };
    })
  );

  //Mover producto al inventario (UNA SOLA VEZ)
  setInventory(prev => {
    const idx = prev.findIndex(item => item.productId === productToAdd.productId);

    if (idx !== -1) {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        qty: (next[idx].qty || 0) + productToAdd.qty,
      };
      return next;
    }

    return [...prev, { ...productToAdd }];
  });

  setIsModalOpen(false);
  setMessage('Producto final movido al inventario con éxito.');
};

  useStationTimers({
    warehouses,
    inventory,
    products,
    company,
    workforce,
    setCompany,
    setDailyBalance,
    setWarehouses,
    setWorkforce,
    onCycleComplete: handleProcessingCycleComplete,
    currentTimestamp,
  });

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
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
            title={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
            aria-label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
        {/* <div>
          <h1 className="text-4xl font-bold text-gray-900 text-shadow">SGI {currentUser === 'store' ? '(Tienda)' : '(Principal)'}</h1>
          <p className="text-lg text-gray-600 mt-2">Organiza tus productos, estaciones y almacenes.</p>
        </div> */}
      </header>

      <AppNavigation
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={view => {
          setCurrentView(view);
          setMessage('');
        }}
      />

      {message && (
        <div className="w-full max-w-5xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 transition-opacity duration-300" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <AppViewRouter
        view={currentView}
        currentUser={currentUser}
        inventory={inventory}
        storeInventory={storeInventory}
        setInventory={setInventory}
        setStoreInventory={setStoreInventory}
        shelves={shelves}
        setShelves={setShelves}
        stations={stations}
        setStations={setStations}
        warehouses={warehouses}
        products={products}
        setProducts={setProducts}
        productsForSale={productsForSale}
        publicSaleProducts={publicSaleProducts}
        cartItems={cartItems}
        draggedItem={draggedItem}
        isDraggable={isDraggable}
        company={company}
        workforce={workforce}
        dayConfig={dayConfig}
        setDayConfig={setDayConfig}
        currentDayTime={currentDayTime}
        isClockRunning={isClockRunning}
        setIsClockRunning={setIsClockRunning}
        currentDay={currentDay}
        currentDate={currentDate}
        dailyBalance={dailyBalance}
        globalBalance={globalBalance}
        canSleep={canSleep}
        finishDay={finishDay}
        actions={{
          getInventorySummary,
          handleDragStart,
          handleDragOver,
          handleDragLeave,
          handleDrop,
          handleDropToInventory,
          handleDropToTrash,
          setMessage,
          setDraggedItem,
          moveItemToSale,
          openRequestModal,
          handleProductFormSubmit,
          handleAddToCartAll,
          setIsCartOpen,
          removeItemFromSale,
          handleStationFormSubmit,
          handleDeleteStation,
          handleWarehouseFormSubmit,
          handleStationDrop,
          handleDropToAvailableStations,
          openStationDetailsModal,
          createCompany,
          updateCompany,
          deleteCompany,
          addActor,
        }}
      />

      <SalePriceModal
        item={priceModalItem}
        price={priceInput}
        onPriceChange={setPriceInput}
        onCancel={() => {
          setPriceModalItem(null);
          setPriceInput('');
        }}
        onConfirm={confirmMoveItemToSale}
      />

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
        inventory={inventory}
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
