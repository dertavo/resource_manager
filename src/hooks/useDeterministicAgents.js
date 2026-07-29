import { useEffect, useRef } from 'react';
import usePersistentState from './usePersistentState';
import { generateId } from '../utils/id';
import { getInventoryCount } from '../domain/inventory';

const defaultConfig = {
  production: {
    enabled: false,
    mode: 'shift',
    autoStartWorkday: true,
  },
  procurement: {
    enabled: false,
    reorderPoint: 2,
    targetStock: 10,
    dailyBudget: 500,
  },
  supplier: {
    enabled: false,
    restockThreshold: 5,
    targetStock: 25,
  },
  sales: {
    enabled: false,
    reserveStock: 1,
    unitsPerRun: 1,
    markupPercent: 20,
  },
};

const useDeterministicAgents = state => {
  const [automationConfig, setAutomationConfig] = usePersistentState(
    'automationConfig',
    defaultConfig,
  );
  const [automationLog, setAutomationLog] = usePersistentState(
    'automationLog',
    [],
  );
  const latest = useRef({ state, automationConfig });

  useEffect(() => {
    latest.current = { state, automationConfig };
  }, [automationConfig, state]);

  useEffect(() => {
    const addLog = (agent, message) => {
      setAutomationLog(previous => [
        {
          id: generateId(),
          agent,
          message,
          timestamp: latest.current.state.currentTimestamp,
        },
        ...previous,
      ].slice(0, 100));
    };

    const interval = setInterval(() => {
      const { state: current, automationConfig: config } = latest.current;
      if (!current.company) return;

      if (config.supplier.enabled) {
        const restocked = current.products.reduce(
          (sum, product) =>
            sum + (
              (product.stock || 0) <= config.supplier.restockThreshold
                ? Math.max(0, config.supplier.targetStock - (product.stock || 0))
                : 0
            ),
          0,
        );
        if (restocked > 0) {
          current.setProducts(previous => previous.map(product =>
            (product.stock || 0) <= config.supplier.restockThreshold
              ? {
                  ...product,
                  stock: Math.max(
                    product.stock || 0,
                    config.supplier.targetStock,
                  ),
                }
              : product
          ));
        }
        if (restocked > 0) addLog('Proveedor', `Surtió ${restocked} unidades a la tienda.`);
      }

      if (config.procurement.enabled) {
        const product = current.products.find(item =>
          getInventoryCount(item.id, current.inventory) < config.procurement.reorderPoint
          && (item.stock || 0) > 0
        );
        if (product) {
          const owned = getInventoryCount(product.id, current.inventory);
          const requested = Math.max(0, config.procurement.targetStock - owned);
          const unitPrice = Number(product.displayPrice || product.price) || 0;
          const affordable = unitPrice > 0
            ? Math.floor(Math.min(
                config.procurement.dailyBudget,
                current.company.capital || 0,
              ) / unitPrice)
            : requested;
          const quantity = Math.min(requested, product.stock || 0, affordable);
          if (quantity > 0) {
            const total = quantity * unitPrice;
            current.setProducts(previous => previous.map(item =>
              item.id === product.id ? { ...item, stock: item.stock - quantity } : item
            ));
            current.setInventory(previous => {
              const existing = previous.find(item => item.productId === product.id);
              return existing
                ? previous.map(item => item.productId === product.id
                    ? { ...item, qty: (item.qty || 1) + quantity }
                    : item)
                : [...previous, {
                    uniqueId: `${product.id}-${generateId()}`,
                    productId: product.id,
                    name: product.name,
                    color: product.color,
                    qty: quantity,
                  }];
            });
            current.setCompany(previous => ({
              ...previous,
              capital: (previous.capital || 0) - total,
              ledger: [...(previous.ledger || []), {
                id: generateId(),
                type: 'expense',
                amount: total,
                description: `Compra automática: ${quantity} × ${product.name}`,
                date: current.currentTimestamp,
              }],
            }));
            current.setDailyBalance(previous => ({
              ...previous,
              expenses: previous.expenses + total,
              entries: [...previous.entries, {
                id: generateId(),
                type: 'expense',
                amount: total,
                description: `Compra automática: ${product.name}`,
                timestamp: current.currentTimestamp,
              }],
            }));
            addLog('Compras', `Compró ${quantity} × ${product.name} por $${total.toFixed(2)}.`);
          }
        }
      }

      if (config.production.enabled) {
        const target = current.warehouses.flatMap(warehouse =>
          warehouse.stations.map((station, stationIndex) => ({
            station,
            stationIndex,
            warehouseId: warehouse.id,
          }))
        ).find(item =>
          item.station
          && ['idle', 'waiting-shift'].includes(item.station.status)
        );
        if (target) {
          if (
            config.production.mode === 'shift'
            && config.production.autoStartWorkday
            && !current.isClockRunning
          ) {
            current.setIsClockRunning(true);
          }
          current.startStation(
            target.warehouseId,
            target.stationIndex,
            'processing',
            config.production.mode,
            { autoStartWorkday: config.production.autoStartWorkday },
          );
          addLog('Producción', `Intentó iniciar ${target.station.name} en modo ${config.production.mode}.`);
        }
      }

      if (config.sales.enabled) {
        const shelfTarget = current.shelves
          .flatMap(shelf => (shelf.items || []).map(item => ({ shelf, item })))
          .find(({ item }) =>
            getInventoryCount(item.productId, current.inventory)
            > config.sales.reserveStock
          );
        if (shelfTarget) {
          const catalogProduct = current.products.find(
            product => product.id === shelfTarget.item.productId,
          );
          const available = getInventoryCount(
            shelfTarget.item.productId,
            current.inventory,
          ) - config.sales.reserveStock;
          const quantity = Math.min(config.sales.unitsPerRun, available);
          const basePrice = Number(
            catalogProduct?.displayPrice || catalogProduct?.price,
          ) || 0;
          const total = quantity * basePrice
            * (1 + config.sales.markupPercent / 100);
          if (quantity > 0 && total >= 0) {
            current.setInventory(previous => {
              let remainingToSell = quantity;
              return previous.flatMap(item => {
                if (
                  item.productId !== shelfTarget.item.productId
                  || remainingToSell <= 0
                ) return [item];
                const availableUnits = item.qty || 1;
                const soldUnits = Math.min(availableUnits, remainingToSell);
                remainingToSell -= soldUnits;
                const remainingUnits = availableUnits - soldUnits;
                return remainingUnits > 0
                  ? [{ ...item, qty: remainingUnits }]
                  : [];
              });
            });
            current.setShelves(previous => previous.map(shelf =>
              shelf.id === shelfTarget.shelf.id
                ? {
                    ...shelf,
                    items: shelf.items.flatMap(item => {
                      if (item.uniqueId !== shelfTarget.item.uniqueId) return [item];
                      const remaining = (item.qty || 1) - quantity;
                      return remaining > 0 ? [{ ...item, qty: remaining }] : [];
                    }),
                  }
                : shelf
            ));
            current.setCompany(previous => ({
              ...previous,
              capital: (previous.capital || 0) + total,
              ledger: [...(previous.ledger || []), {
                id: generateId(),
                type: 'income',
                amount: total,
                description: `Venta automática: ${quantity} × ${shelfTarget.item.name}`,
                date: current.currentTimestamp,
              }],
            }));
            current.setDailyBalance(previous => ({
              ...previous,
              income: previous.income + total,
              entries: [...previous.entries, {
                id: generateId(),
                type: 'income',
                amount: total,
                description: `Venta automática: ${shelfTarget.item.name}`,
                timestamp: current.currentTimestamp,
              }],
            }));
            addLog('Ventas', `Vendió ${quantity} × ${shelfTarget.item.name} por $${total.toFixed(2)}.`);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [setAutomationLog]);

  return {
    automationConfig,
    setAutomationConfig,
    automationLog,
    clearAutomationLog: () => setAutomationLog([]),
  };
};

export default useDeterministicAgents;
