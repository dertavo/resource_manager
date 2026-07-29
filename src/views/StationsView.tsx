import React, { useMemo, useState } from 'react';
import { Clock, Factory, Hammer, Pencil, Trash2, X } from 'lucide-react';

type RecipeItem = { productId: string; quantity: number };

type Blueprint = {
  id?: string;
  name: string;
  finalProductName: string;
  finalProductId?: string;
  finalProductColor?: string;
  recipe: RecipeItem[];
  constructionCost: number;
  customProcessingTime: number | null;
  outputQuantity: number;
  requiresWorker?: boolean;
  requiresMachine?: boolean;
  processingTime?: number;
};

const emptyBlueprint = (): Blueprint => ({
  name: '',
  finalProductName: '',
  recipe: [],
  constructionCost: 0,
  customProcessingTime: null,
  outputQuantity: 1,
  requiresWorker: true,
  requiresMachine: true,
});

const StationsView = ({
  inventory,
  blueprints,
  stations,
  company,
  handleStationFormSubmit,
  handleDeleteStation,
  handleBuildStation,
}: any) => {
  const [draft, setDraft] = useState<Blueprint>(emptyBlueprint);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useCustomTime, setUseCustomTime] = useState(false);

  const products = useMemo(() => {
    const byId = new Map();
    inventory.forEach((item: any) => {
      if (!byId.has(item.productId)) byId.set(item.productId, item);
    });
    return Array.from(byId.values());
  }, [inventory]);

  const inputUnits = draft.recipe.reduce((sum, item) => sum + item.quantity, 0);
  const automaticTime = Math.max(10, inputUnits * 10);

  const setRecipeQuantity = (productId: string, quantity: number) => {
    setDraft(previous => {
      const recipe = previous.recipe.filter(item => item.productId !== productId);
      if (quantity > 0) recipe.push({ productId, quantity });
      return { ...previous, recipe };
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    handleStationFormSubmit({
      ...draft,
      id: editingId || undefined,
      inputProductIds: draft.recipe.map(item => item.productId),
      customProcessingTime: useCustomTime
        ? Math.max(1, Number(draft.customProcessingTime) || automaticTime)
        : null,
    });
    setDraft(emptyBlueprint());
    setEditingId(null);
    setUseCustomTime(false);
  };

  const edit = (blueprint: Blueprint) => {
    setDraft({
      ...blueprint,
      recipe: blueprint.recipe || [],
      constructionCost: Number(blueprint.constructionCost) || 0,
      outputQuantity: Number(blueprint.outputQuantity) || 1,
    });
    setEditingId(blueprint.id || null);
    setUseCustomTime(Number(blueprint.customProcessingTime) > 0);
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-white custom-card mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-gray-700 flex items-center">
        <Factory className="mr-2 text-indigo-600" /> Planos y construcción de estaciones
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        El plano define la receta. Construir una unidad física descuenta su coste del capital de la empresa.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Editar plano' : 'Nuevo plano'}
            </h3>
            {editingId && (
              <button type="button" onClick={() => {
                setDraft(emptyBlueprint());
                setEditingId(null);
                setUseCustomTime(false);
              }}><X size={20} /></button>
            )}
          </div>

          <label className="block text-sm text-gray-700">
            Nombre
            <input required className="mt-1 w-full border p-2 rounded" value={draft.name}
              onChange={event => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-white">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={Boolean(draft.requiresWorker)}
                onChange={event => setDraft({ ...draft, requiresWorker: event.target.checked })} />
              Requiere trabajador
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={Boolean(draft.requiresMachine)}
                onChange={event => setDraft({ ...draft, requiresMachine: event.target.checked })} />
              Requiere máquina
            </label>
          </div>
          <label className="block text-sm text-gray-700">
            Producto final
            <input required className="mt-1 w-full border p-2 rounded" value={draft.finalProductName}
              onChange={event => setDraft({ ...draft, finalProductName: event.target.value })} />
          </label>
          <label className="block text-sm text-gray-700">
            Unidades producidas por ciclo
            <input type="number" min={1} className="mt-1 w-full border p-2 rounded"
              value={draft.outputQuantity}
              onChange={event => setDraft({ ...draft, outputQuantity: Math.max(1, Number(event.target.value)) })} />
          </label>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Receta de entrada</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {products.map((product: any) => {
                const quantity = draft.recipe.find(item => item.productId === product.productId)?.quantity || 0;
                return (
                  <div key={product.productId} className="grid grid-cols-[1fr_90px] gap-2 items-center">
                    <span className="text-sm text-gray-700">{product.name}</span>
                    <input type="number" min={0} className="border p-1 rounded"
                      value={quantity}
                      onChange={event => setRecipeQuantity(product.productId, Math.max(0, Number(event.target.value)))} />
                  </div>
                );
              })}
              {products.length === 0 && <p className="text-sm text-gray-500">Compra productos para definir recetas.</p>}
            </div>
          </div>

          <label className="block text-sm text-gray-700">
            Coste de construcción
            <input type="number" min={0} step="0.01" className="mt-1 w-full border p-2 rounded"
              value={draft.constructionCost}
              onChange={event => setDraft({ ...draft, constructionCost: Math.max(0, Number(event.target.value)) })} />
          </label>

          <div className="p-3 bg-white border rounded-lg">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={useCustomTime}
                onChange={event => setUseCustomTime(event.target.checked)} />
              Usar tiempo personalizado
            </label>
            {useCustomTime ? (
              <input type="number" min={1} className="mt-2 w-full border p-2 rounded"
                value={draft.customProcessingTime || automaticTime}
                onChange={event => setDraft({ ...draft, customProcessingTime: Number(event.target.value) })} />
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Automático: {automaticTime}s ({inputUnits || 1} unidades × 10s)
              </p>
            )}
          </div>

          <button className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg">
            {editingId ? 'Guardar plano' : 'Crear plano'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-800 text-sm">
            Capital disponible: <strong>${(company?.capital || 0).toFixed(2)}</strong> · Unidades disponibles: <strong>{stations.length}</strong>
          </div>
          {blueprints.map((blueprint: Blueprint) => {
            const builtUnits = stations.filter((station: any) => station.blueprintId === blueprint.id).length;
            return (
              <article key={blueprint.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">{blueprint.name}</h4>
                    <p className="text-sm text-gray-600">Produce {blueprint.outputQuantity || 1} × {blueprint.finalProductName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} /> {blueprint.processingTime}s por ciclo
                    </p>
                    <p className="text-sm text-gray-600">Construcción: ${Number(blueprint.constructionCost || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Unidades construidas disponibles: {builtUnits}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => edit(blueprint)} className="text-indigo-600"><Pencil size={19} /></button>
                    <button onClick={() => handleDeleteStation(blueprint.id)} className="text-red-500"><Trash2 size={19} /></button>
                  </div>
                </div>
                <button
                  onClick={() => handleBuildStation(blueprint.id)}
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded p-2 flex items-center justify-center gap-2"
                >
                  <Hammer size={18} /> Construir unidad
                </button>
              </article>
            );
          })}
          {blueprints.length === 0 && <p className="text-gray-500 text-center">Todavía no hay planos.</p>}
        </div>
      </div>
    </div>
  );
};

export default StationsView;
