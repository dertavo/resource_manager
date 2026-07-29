import { generateId } from '../utils/id.js';

export const DEFAULT_SECONDS_PER_INPUT_UNIT = 10;

export const normalizeRecipe = station => {
  if (Array.isArray(station?.recipe) && station.recipe.length > 0) {
    return station.recipe
      .map(item => ({
        productId: item.productId,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter(item => item.productId);
  }

  return (station?.inputProductIds || []).map(productId => ({
    productId,
    quantity: 1,
  }));
};

export const calculateDefaultProcessingTime = recipe =>
  Math.max(
    DEFAULT_SECONDS_PER_INPUT_UNIT,
    normalizeRecipe({ recipe }).reduce((sum, item) => sum + item.quantity, 0)
      * DEFAULT_SECONDS_PER_INPUT_UNIT,
  );

export const getEffectiveProcessingTime = station => {
  const customTime = Number(station?.customProcessingTime);
  if (customTime > 0) return customTime;

  if (station?.recipe?.length) {
    return calculateDefaultProcessingTime(station.recipe);
  }

  return Number(station?.processingTime)
    || calculateDefaultProcessingTime(normalizeRecipe(station));
};

export const normalizeBlueprint = station => {
  const recipe = normalizeRecipe(station);
  return {
    id: station.blueprintId || station.id || generateId(),
    name: station.name,
    finalProductName: station.finalProductName,
    finalProductId: station.finalProductId,
    finalProductColor: station.finalProductColor,
    recipe,
    inputProductIds: recipe.map(item => item.productId),
    outputQuantity: Math.max(1, Number(station.outputQuantity) || 1),
    requiresWorker: Boolean(station.requiresWorker),
    requiresMachine: Boolean(station.requiresMachine),
    constructionCost: Math.max(
      0,
      Number(station.constructionCost ?? station.cost) || 0,
    ),
    customProcessingTime:
      Number(station.customProcessingTime) > 0
        ? Number(station.customProcessingTime)
        : null,
    processingTime: getEffectiveProcessingTime(station),
  };
};

export const buildStationInstance = blueprint => {
  const normalized = normalizeBlueprint(blueprint);
  return {
    ...normalized,
    id: generateId(),
    blueprintId: normalized.id,
    status: 'idle',
    processingMode: 'once',
    remainingTime: normalized.processingTime,
    assignedWorkerIds: [],
    assignedMachineIds: [],
    cyclesCompleted: 0,
  };
};
