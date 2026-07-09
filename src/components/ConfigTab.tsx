import React, { useState } from 'react';
import { LedgerState, ProductMaster } from '../types';
import { Plus, Trash2, Key, Settings, Layers, HelpCircle } from 'lucide-react';

interface ConfigTabProps {
  state: LedgerState;
  onAddStore: (storeName: string) => void;
  onAddWasteType: (wasteType: string) => void;
  onAddProduct: (product: ProductMaster) => void;
  onDeleteProduct: (skuKey: string) => void;
  onUpdateProductCost: (skuKey: string, newCost: number) => void;
}

export default function ConfigTab({
  state,
  onAddStore,
  onAddWasteType,
  onAddProduct,
  onDeleteProduct,
  onUpdateProductCost
}: ConfigTabProps) {
  // Parameters states
  const [newStore, setNewStore] = useState('');
  const [newWaste, setNewWaste] = useState('');

  // Product Master form states
  const [newModel, setNewModel] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('M');
  const [newUnit, setNewUnit] = useState('Pcs');
  const [newCostPrice, setNewCostPrice] = useState<number>(15.00);

  // Form handlers
  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;
    if (state.params.stores.includes(newStore.trim())) {
      alert("Store already exists!");
      return;
    }
    onAddStore(newStore.trim());
    setNewStore('');
  };

  const handleAddWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaste.trim()) return;
    if (state.params.wasteTypes.includes(newWaste.trim())) {
      alert("Waste type already exists!");
      return;
    }
    onAddWasteType(newWaste.trim());
    setNewWaste('');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const model = newModel.trim().toUpperCase();
    const color = newColor.trim();
    const size = newSize.trim().toUpperCase();
    if (!model || !color || !size) {
      alert("Please fill in all SKU fields.");
      return;
    }

    const skuKey = `${model}-${color}-${size}`;
    if (state.products.some(p => p.skuKey === skuKey)) {
      alert("SKU already exists in Product Master!");
      return;
    }

    const newProd: ProductMaster = {
      model,
      color,
      size,
      skuKey,
      unit: newUnit,
      costPrice: newCostPrice
    };

    onAddProduct(newProd);
    // Reset fields except model and color for faster sequence entry
    setNewSize('M');
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Parameters Layer (tbl_Params) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stores Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Parameters: Store Channels List (tbl_Params)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            These stores are dynamic targets for distribution transfers and terminal retail sales. "Warehouse" is designated as the primary logistics fulfillment center.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {state.params.stores.map(store => (
                <span
                  key={store}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    store === "Warehouse"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {store} {store === "Warehouse" && "⭐"}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddStoreSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Store C"
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                className="yellow-input flex-1 py-1.5 px-3 text-xs"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Store
              </button>
            </form>
          </div>
        </div>

        {/* Waste Types Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Parameters: Waste Reason Codes (tbl_Params)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Used to classify inventory material loss or write-offs (Merma) across the entire supply chain.
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {state.params.wasteTypes.map(type => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100"
                >
                  {type}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddWasteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Water Damage"
                value={newWaste}
                onChange={(e) => setNewWaste(e.target.value)}
                className="yellow-input flex-1 py-1.5 px-3 text-xs"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Reason
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Product Master Configuration (tbl_Products) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Product Master & SKU Database (tbl_Products)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            Auto-Formula: SKU_Key = Model & "-" & Color & "-" & Size
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          This is the single source of truth for standard SKU definitions. Every transaction (Breakdown, Waste, Transfer, Sale) must strictly validate against this SKU Master.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Add SKU Master Form */}
          <div className="xl:col-span-1 border border-slate-200/80 rounded-xl p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-primary">Add SKU to Product Master</h4>
            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Model Code</label>
                <input
                  type="text"
                  placeholder="e.g., MD-01"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="yellow-input w-full px-2.5 py-1.5 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Product Color</label>
                <input
                  type="text"
                  placeholder="e.g., Onyx Black"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="yellow-input w-full px-2.5 py-1.5 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Size</label>
                  <select
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="yellow-input w-full px-2 py-1.5 font-bold"
                    required
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold uppercase tracking-wider block">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="yellow-input w-full px-2 py-1.5 text-center font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Cost Price ($ / Piece)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(parseFloat(e.target.value) || 0)}
                  className="yellow-input w-full px-2.5 py-1.5 font-mono font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Register SKU
              </button>
            </form>
          </div>

          {/* Master SKU List Spreadsheet */}
          <div className="xl:col-span-3">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 shadow-sm border-b border-slate-200 z-10">
                  <tr>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider">Model</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider">Color</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider text-center">Size</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">SKU_Key (Key)</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider text-center">Unit</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider text-right w-36">Cost Price ($)</th>
                    <th className="p-3 text-primary font-bold uppercase tracking-wider text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {state.products.map(prod => (
                    <tr key={prod.skuKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-primary font-mono">{prod.model}</td>
                      <td className="p-3 text-slate-700 font-medium">{prod.color}</td>
                      <td className="p-3 text-center text-slate-500 font-bold font-mono">{prod.size}</td>
                      <td className="p-3 font-mono font-semibold text-slate-900 bg-slate-50/40">{prod.skuKey}</td>
                      <td className="p-3 text-center text-slate-500">{prod.unit}</td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-slate-400 font-semibold mr-1">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={prod.costPrice}
                            onChange={(e) => onUpdateProductCost(prod.skuKey, parseFloat(e.target.value) || 0)}
                            className="yellow-input py-0.5 px-1 w-20 text-right font-mono font-bold"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete SKU ${prod.skuKey} from Product Master?`)) {
                              onDeleteProduct(prod.skuKey);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {state.products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 italic">Product Master database is empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-sans italic text-right">
              * Note: Double-click or select yellow cells to override Cost_Price. Changes will dynamically propagate across all engines and sheets.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
