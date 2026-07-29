import { useEffect, useRef } from 'react';
import { generateId } from '../utils/id';

const useStationTimers = ({
  warehouses,
  inventory,
  products,
  company,
  workforce,
  setCompany,
  setDailyBalance,
  setWarehouses,
  setWorkforce,
  onCycleComplete,
  currentTimestamp,
  isClockRunning,
  speedMultiplier,
}) => {
  const timers = useRef({});
  const cycleCompleteHandler = useRef(onCycleComplete);
  const timestamp = useRef(currentTimestamp);

  useEffect(() => {
    cycleCompleteHandler.current = onCycleComplete;
  }, [onCycleComplete]);

  useEffect(() => {
    timestamp.current = currentTimestamp;
  }, [currentTimestamp]);

  useEffect(() => {
    warehouses.forEach(warehouse => {
      warehouse.stations.forEach((station, stationIndex) => {
        const isRunning =
          station?.status === 'processing' || station?.status === 'stopping';
        if (!isRunning || timers.current[station.id]) return;

        timers.current[station.id] = setInterval(() => {
          if (station.processingMode === 'shift' && !isClockRunning) return;

          if (company) {
            const workerIds = station.assignedWorkerIds || [];
            const machineIds = station.assignedMachineIds || [];
            const actors = workforce.filter(
              actor => workerIds.includes(actor.id) || machineIds.includes(actor.id),
            );
            const workedHours = Math.max(1, Number(speedMultiplier) || 60) / 3600;
            const hasShiftCapacity = actors.every(
              actor =>
                (actor.hoursWorkedToday || 0) + workedHours
                <= (actor.hoursPerDay || 0),
            );
            if (station.processingMode === 'shift' && !hasShiftCapacity) {
              clearInterval(timers.current[station.id]);
              delete timers.current[station.id];
              setWarehouses(previous => previous.map(item => ({
                ...item,
                stations: item.stations.map(entry =>
                  entry?.id === station.id
                    ? { ...entry, status: 'waiting-shift' }
                    : entry
                ),
              })));
              return;
            }

            const hourlyCost = actors.reduce(
              (sum, actor) => sum + (actor.hourlyCost || 0),
              0,
            ) * workedHours;

            if (hourlyCost > 0) {
              setCompany(previous => {
                if (!previous) return previous;
                const entry = {
                  id: generateId(),
                  type: 'expense',
                  amount: hourlyCost,
                  description: `Labor ${station.name}`,
                  date: timestamp.current,
                };
                return {
                  ...previous,
                  capital: (previous.capital || 0) - hourlyCost,
                  ledger: [...(previous.ledger || []), entry],
                };
              });
              setDailyBalance(previous => ({
                ...previous,
                expenses: previous.expenses + hourlyCost,
                entries: [
                  ...previous.entries,
                  {
                    id: generateId(),
                    type: 'expense',
                    amount: hourlyCost,
                    description: `Labor: ${station.name}`,
                    timestamp: timestamp.current,
                  },
                ],
              }));
            }

            if (actors.length > 0) {
              setWorkforce(previous => previous.map(actor => {
                if (workerIds.includes(actor.id)) {
                  return {
                    ...actor,
                    fatigue: Math.min(100, (actor.fatigue || 0) + workedHours * 5),
                    hoursWorkedToday: (actor.hoursWorkedToday || 0) + workedHours,
                    status: 'working',
                  };
                }
                if (machineIds.includes(actor.id)) {
                  return {
                    ...actor,
                    maintenanceNeed: Math.min(100, (actor.maintenanceNeed || 0) + workedHours * 3),
                    status: 'working',
                  };
                }
                return actor;
              }));
            }
          }

          setWarehouses(previous => {
            let completed = false;
            const nextWarehouses = previous.map(item => {
              if (item.id !== warehouse.id) return item;

              const target = item.stations[stationIndex];
              if (!target) return item;
              const remainingTime = target.remainingTime - 1;
              if (remainingTime <= 0) {
                clearInterval(timers.current[station.id]);
                delete timers.current[station.id];
                completed = true;
              }

              return {
                ...item,
                stations: item.stations.map((entry, index) =>
                  index === stationIndex
                    ? {
                        ...entry,
                        status: remainingTime <= 0
                          ? (entry.stopRequested ? 'stoped' : 'completed')
                          : entry.status,
                        stopRequested: remainingTime <= 0 ? false : entry.stopRequested,
                        cycleInProgress: remainingTime <= 0
                          ? false
                          : entry.cycleInProgress,
                        remainingTime: Math.max(0, remainingTime),
                      }
                    : entry
                ),
              };
            });

            if (completed) {
              cycleCompleteHandler.current(
                warehouse.id,
                stationIndex,
                station.processingMode || 'once',
              );
            }
            return nextWarehouses;
          });
        }, 1000);
      });
    });

    return () => {
      Object.values(timers.current).forEach(clearInterval);
      timers.current = {};
    };
  }, [
    company,
    inventory,
    isClockRunning,
    products,
    speedMultiplier,
    setCompany,
    setDailyBalance,
    setWarehouses,
    setWorkforce,
    warehouses,
    workforce,
  ]);
};

export default useStationTimers;
