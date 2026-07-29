import { generateId } from '../utils/id.js';
import { normalizeRecipe } from './stations.js';

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
  normalizeRecipe(station).every(
    item => getInventoryCount(item.productId, inventory) >= item.quantity,
  );

export const consumeIngredients = (station, inventory) => {
  const nextInventory = [...inventory];

  normalizeRecipe(station).forEach(recipeItem => {
    let unitsToConsume = recipeItem.quantity;
    while (unitsToConsume > 0) {
      const index = nextInventory.findIndex(
        item =>
          item.productId === recipeItem.productId && (item.qty || 1) > 0,
      );
      if (index === -1) break;

      const item = nextInventory[index];
      const available = item.qty || 1;
      const consumed = Math.min(available, unitsToConsume);
      const remaining = available - consumed;
      unitsToConsume -= consumed;
      if (remaining <= 0) {
        nextInventory.splice(index, 1);
      } else {
        nextInventory[index] = { ...item, qty: remaining };
      }
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
  const outputQuantity = Math.max(1, Number(station.outputQuantity) || 1);
  const index = inventory.findIndex(item => item.productId === productId);

  if (index !== -1) {
    const nextInventory = [...inventory];
    const item = nextInventory[index];
    nextInventory[index] = {
      ...item,
      qty: (item.qty || 1) + outputQuantity,
    };
    return nextInventory;
  }

  return [
    ...inventory,
    {
      uniqueId: `${productId}-${generateId()}`,
      productId,
      name: station.finalProductName,
      color: station.finalProductColor || `hsl(${Math.random() * 360}, 70%, 80%)`,
      qty: outputQuantity,
    },
  ];
};
