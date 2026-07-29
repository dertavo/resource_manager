import React from 'react';
import { Bot, ShoppingCart, Factory, Store, BadgeDollarSign, Trash2 } from 'lucide-react';

const AgentCard = ({ icon: Icon, title, description, enabled, onToggle, children }: any) => (
  <section className="p-5 bg-white rounded-xl shadow-md border border-gray-200">
    <div className="flex justify-between gap-4 mb-3">
      <div className="flex gap-3">
        <Icon className="text-indigo-600" />
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={event => onToggle(event.target.checked)} />
        {enabled ? 'Activo' : 'Inactivo'}
      </label>
    </div>
    <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>{children}</div>
  </section>
);

const NumberField = ({ label, value, onChange, min = 0 }: any) => (
  <label className="text-sm text-gray-600">
    {label}
    <input type="number" min={min} className="mt-1 w-full border p-2 rounded"
      value={value} onChange={event => onChange(Number(event.target.value))} />
  </label>
);

const AutomationView = ({ config, setConfig, log, clearLog }: any) => {
  const update = (agent: string, patch: any) =>
    setConfig((previous: any) => ({
      ...previous,
      [agent]: { ...previous[agent], ...patch },
    }));

  return (
    <div className="w-full max-w-6xl space-y-6">
      <header className="p-5 bg-indigo-600 text-white rounded-xl">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Bot /> Centro de Automatización</h2>
        <p className="text-sm opacity-90 mt-1">Agentes deterministas locales. Ninguno usa IA ni ejecuta acciones sin estar activado.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AgentCard icon={Factory} title="Agente de producción"
          description="Inicia una estación disponible cada ciclo de automatización."
          enabled={config.production.enabled}
          onToggle={(enabled: boolean) => update('production', { enabled })}>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600">Modo
              <select className="mt-1 w-full border p-2 rounded" value={config.production.mode}
                onChange={event => update('production', { mode: event.target.value })}>
                <option value="once">Una corrida</option>
                <option value="shift">Durante la jornada</option>
                <option value="stock">Hasta agotar insumos</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.production.autoStartWorkday}
                onChange={event => update('production', { autoStartWorkday: event.target.checked })} />
              Iniciar jornada automáticamente
            </label>
          </div>
        </AgentCard>

        <AgentCard icon={ShoppingCart} title="Agente de compras"
          description="Repone el primer insumo bajo mínimos respetando presupuesto."
          enabled={config.procurement.enabled}
          onToggle={(enabled: boolean) => update('procurement', { enabled })}>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Punto de pedido" value={config.procurement.reorderPoint}
              onChange={(value: number) => update('procurement', { reorderPoint: value })} />
            <NumberField label="Stock objetivo" value={config.procurement.targetStock}
              onChange={(value: number) => update('procurement', { targetStock: value })} />
            <NumberField label="Presupuesto/ciclo" value={config.procurement.dailyBudget}
              onChange={(value: number) => update('procurement', { dailyBudget: value })} />
          </div>
        </AgentCard>

        <AgentCard icon={Store} title="Agente proveedor"
          description="Simula el surtido externo del catálogo de la tienda."
          enabled={config.supplier.enabled}
          onToggle={(enabled: boolean) => update('supplier', { enabled })}>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Surtir cuando quede" value={config.supplier.restockThreshold}
              onChange={(value: number) => update('supplier', { restockThreshold: value })} />
            <NumberField label="Stock objetivo" value={config.supplier.targetStock}
              onChange={(value: number) => update('supplier', { targetStock: value })} />
          </div>
        </AgentCard>

        <AgentCard icon={BadgeDollarSign} title="Agente de ventas"
          description="Vende productos colocados en estantes, conservando una reserva."
          enabled={config.sales.enabled}
          onToggle={(enabled: boolean) => update('sales', { enabled })}>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Reserva" value={config.sales.reserveStock}
              onChange={(value: number) => update('sales', { reserveStock: value })} />
            <NumberField label="Unidades/ciclo" value={config.sales.unitsPerRun} min={1}
              onChange={(value: number) => update('sales', { unitsPerRun: Math.max(1, value) })} />
            <NumberField label="Margen %" value={config.sales.markupPercent}
              onChange={(value: number) => update('sales', { markupPercent: value })} />
          </div>
        </AgentCard>
      </div>

      <section className="p-5 bg-white rounded-xl shadow-md">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Registro de decisiones</h3>
          <button onClick={clearLog} className="text-red-500 flex gap-1 text-sm"><Trash2 size={16} /> Limpiar</button>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {log.map((entry: any) => (
            <div key={entry.id} className="text-sm border-b py-2">
              <strong>{entry.agent}:</strong> {entry.message}
              <span className="ml-2 text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
          ))}
          {log.length === 0 && <p className="text-sm text-gray-500">Todavía no hay acciones automáticas.</p>}
        </div>
      </section>
    </div>
  );
};

export default AutomationView;
