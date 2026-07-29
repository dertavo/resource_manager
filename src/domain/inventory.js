import { generateId } from '../utils/id';

export const getAvailableItems = (inventory, shelves) => {
  const shelvedItemIds = shelves.flatMap(shelf =>
    shelf.items.map(item => item.uniqueId)
  );
  return inventory.filter(item => !shelvedItemIds.includes(item.uniqueId));
};

export const getInventoryCount = (productId, inventory) =>
  inventory.reduce(
    (sum, item) =>
      sum + (item.productId === productId ? (item.qty || 1) : 0),
    0,
  );

export const hasEnoughIngredients = (station, inventory) =>
  (station?.inputProductIds || []).every(
    productId => getInventoryCount(productId, inventory) > 0,
  );

export const consumeIngredients = (station, inventory) => {
  const nextInventory = [...inventory];

  (station?.inputProductIds || []).forEach(productId => {
    const index = nextInventory.findIndex(
      item => item.productId === productId && (item.qty || 1) > 0,
    );
    if (index === -1) return;

    const item = nextInventory[index];
    const remaining = (item.qty || 1) - 1;
    if (remaining <= 0) {
      nextInventory.splice(index, 1);
    } else {
      nextInventory[index] = { ...item, qty: remaining };
    }
  });

  return nextInventory;
};

const getAssignedActors = (station, workforce) => {
  const workerIds = station.assignedWorkerIds || [];
  const machineIds = station.assignedMachineIds || [];
  return workforce.filter(
    actor => workerIds.includes(actor.id) || machineIds.includes(actor.id),
  );
};

export const actorsHaveHoursLeft = (station, workforce) => {
  const assignedActors = getAssignedActors(station, workforce);
  return assignedActors.length > 0 && assignedActors.every(
    actor => (actor.hoursPerDay || 0) - (actor.hoursWorkedToday || 0) > 0,
  );
};

export const canAutoContinue = (station, inventory, workforce) => {
  if (!station) return false;

  const assignedActors = getAssignedActors(station, workforce);
  if (assignedActors.length === 0 || !hasEnoughIngredients(station, inventory)) {
    return false;
  }

  if (station.processingMode === 'shift') {
    return actorsHaveHoursLeft(station, workforce);
  }

  return station.processingMode === 'stock';
};

export const addFinalProduct = (station, inventory) => {
  const productId = station.finalProductId || station.id;
  const index = inventory.findIndex(item => item.productId === productId);

  if (index !== -1) {
    const nextInventory = [...inventory];
    const item = nextInventory[index];
    nextInventory[index] = { ...item, qty: (item.qty || 1) + 1 };
    return nextInventory;
  }

  return [
    ...inventory,
    {
      uniqueId: `${productId}-${generateId()}`,
      productId,
      name: station.finalProductName,
      color: station.finalProductColor || `hsl(${Math.random() * 360}, 70%, 80%)`,
      qty: 1,
    },
  ];
};
