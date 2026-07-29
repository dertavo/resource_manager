import { useEffect } from 'react';
import usePersistentState from './usePersistentState';
import { generateId } from '../utils/id';

const useOrganization = ({
  setGlobalBalance,
  setInventory,
  setMessage,
  setWarehouses,
  currentTimestamp,
  currentDay,
  warehouses,
}) => {
  const [company, setCompany] = usePersistentState('company', null);
  const [workforce, setWorkforce] = usePersistentState('workforce', []);
  const [personalInventory, setPersonalInventory] = usePersistentState(
    'personalInventory',
    [],
  );
  const [, setActorTasks] = usePersistentState('actorTasks', {});

  const createCompany = ({ name, startWithDebt, amount }) => {
    if (company) {
      setMessage('Elimina la empresa actual antes de crear una nueva.');
      return;
    }
    const baseCompany = { name, capital: 0, debt: 0, ledger: [] };
    let nextCompany = baseCompany;

    if (startWithDebt && amount > 0) {
      nextCompany = {
        ...baseCompany,
        debt: amount,
        capital: amount,
        ledger: [{
          id: generateId(),
          type: 'debt',
          amount,
          description: 'Aportación inicial (deuda bancaria)',
          date: currentTimestamp,
        }],
      };
      setGlobalBalance(previous => ({
        ...previous,
        income: previous.income + amount,
        entries: [
          ...previous.entries,
          {
            id: generateId(),
            type: 'income',
            amount,
            description: `Ingreso a la empresa "${name}" (deuda bancaria)`,
            timestamp: currentTimestamp,
          },
        ],
      }));
    }

    setCompany(nextCompany);
    setMessage('Empresa creada correctamente.');
  };

  const updateCompany = ({ name, capital, debt }) => {
    if (!company || !name.trim()) return;
    const nextCapital = Math.max(0, Number(capital) || 0);
    const nextDebt = Math.max(0, Number(debt) || 0);
    const capitalDifference = nextCapital - company.capital;
    const debtDifference = nextDebt - company.debt;
    const adjustmentEntries = [];

    if (capitalDifference !== 0) {
      adjustmentEntries.push({
        id: generateId(),
        type: capitalDifference > 0 ? 'income' : 'expense',
        amount: Math.abs(capitalDifference),
        description: 'Ajuste manual de capital',
        date: currentTimestamp,
      });
    }
    if (debtDifference !== 0) {
      adjustmentEntries.push({
        id: generateId(),
        type: debtDifference > 0 ? 'debt' : 'repayment',
        amount: Math.abs(debtDifference),
        description: 'Ajuste manual de deuda',
        date: currentTimestamp,
      });
    }

    setCompany(previous => ({
      ...previous,
      name: name.trim(),
      capital: nextCapital,
      debt: nextDebt,
      ledger: [...(previous.ledger || []), ...adjustmentEntries],
    }));
    setMessage('Empresa actualizada correctamente.');
  };

  const deleteCompany = () => {
    if (!company) return;
    setCompany(null);
    setMessage(`Empresa "${company.name}" eliminada. Ya puedes crear una nueva.`);
  };

  const addActor = ({ type, name, hourlyCost, hoursPerDay }) => {
    setWorkforce(previous => [
      ...previous,
      {
        id: generateId(),
        type,
        name,
        hourlyCost,
        hoursPerDay,
        fatigue: 0,
        maintenanceNeed: 0,
        status: 'idle',
        hoursWorkedToday: 0,
      },
    ]);
    setMessage(`${type === 'human' ? 'Humano' : 'Máquina'} "${name}" registrado.`);
  };

  const updateStationActors = (actorId, warehouseId, stationIndex, remove = false) => {
    const actor = workforce.find(item => item.id === actorId);
    if (!actor && !remove) return;
    const assignedElsewhere = warehouses?.some(warehouse =>
      warehouse.stations.some((station, index) =>
        station
        && !(warehouse.id === warehouseId && index === stationIndex)
        && [
          ...(station.assignedWorkerIds || []),
          ...(station.assignedMachineIds || []),
        ].includes(actorId)
      )
    );
    if (assignedElsewhere && !remove) {
      setMessage(`${actor.name} ya está asignado a otra estación.`);
      return;
    }

    setWarehouses(previous => previous.map(warehouse => {
      if (warehouse.id !== warehouseId) return warehouse;
      const stations = [...warehouse.stations];
      const station = stations[stationIndex];
      if (!station) return warehouse;

      const workerIds = station.assignedWorkerIds || [];
      const machineIds = station.assignedMachineIds || [];
      stations[stationIndex] = remove
        ? {
            ...station,
            assignedWorkerIds: workerIds.filter(id => id !== actorId),
            assignedMachineIds: machineIds.filter(id => id !== actorId),
          }
        : {
            ...station,
            assignedWorkerIds: actor.type === 'human'
              ? Array.from(new Set([...workerIds, actor.id]))
              : workerIds,
            assignedMachineIds: actor.type !== 'human'
              ? Array.from(new Set([...machineIds, actor.id]))
              : machineIds,
          };
      return { ...warehouse, stations };
    }));
  };

  useEffect(() => {
    setWorkforce(previous => previous.map(actor => ({
      ...actor,
      hoursWorkedToday: 0,
      status: 'idle',
    })));
  }, [currentDay, setWorkforce]);

  const addToPersonalInventory = item => {
    if (personalInventory.length >= 4) {
      setMessage('Tu inventario personal está lleno (máx 4 items).');
      return;
    }
    setPersonalInventory(previous => [...previous, item]);
    setMessage(`"${item.name}" añadido a tu inventario personal.`);
  };

  const removeFromPersonalInventory = uniqueId => {
    const item = personalInventory.find(entry => entry.uniqueId === uniqueId);
    setPersonalInventory(previous =>
      previous.filter(entry => entry.uniqueId !== uniqueId)
    );
    if (item) {
      setInventory(previous => [...previous, item]);
      setMessage(`"${item.name}" devuelto al inventario general.`);
    }
  };

  const assignTaskToActor = (actorId, warehouseId, stationIndex, durationHours) => {
    const actor = workforce.find(item => item.id === actorId);
    if (!actor) return;

    setActorTasks(previous => ({
      ...previous,
      [actorId]: {
        actorId,
        warehouseId,
        stationIndex,
        durationHours,
        hoursWorked: 0,
        status: 'idle',
      },
    }));
    setMessage(`Tarea asignada a ${actor.name}: estación (${durationHours} horas).`);
  };

  return {
    company,
    setCompany,
    workforce,
    setWorkforce,
    personalInventory,
    createCompany,
    updateCompany,
    deleteCompany,
    addActor,
    assignActorToStation: (actorId, warehouseId, stationIndex) =>
      updateStationActors(actorId, warehouseId, stationIndex),
    unassignActorFromStation: (actorId, warehouseId, stationIndex) =>
      updateStationActors(actorId, warehouseId, stationIndex, true),
    addToPersonalInventory,
    removeFromPersonalInventory,
    assignTaskToActor,
  };
};

export default useOrganization;
