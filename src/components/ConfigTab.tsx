import React, { useState } from 'react';
import { LedgerState, ModelConfig } from '../types';
import { Plus, Check, Info } from 'lucide-react';

interface ConfigTabProps {
  state: LedgerState;
  onChangeModels: (newModels: ModelConfig[]) => void;
  onAddStore: (storeName: string) => void;
}

export default function ConfigTab({ state, onChangeModels, onAddStore }: ConfigTabProps) {
  const [newStoreName, setNewStoreName] = useState('');
  const [storeError, setStoreError] = useState('');
  const [storeSuccess, setStoreSuccess] = useState(false);

  // Handle Model Changes
  const handleModelFieldChange = (modelId: string, field: keyof ModelConfig, value: any) => {
    const updatedModels = state.models.map(m => {
      if (m.id === modelId) {
        let parsedValue = value;
        if (field === 'unitCost' || field === 'unitPrice' || field === 'safetyStock') {
          parsedValue = parseFloat(value) || 0;
        }
        return { ...m, [field]: parsedValue };
      }
      return m;
    });
    onChangeModels(updatedModels);
  };

  // Add new store
  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreError('');
    setStoreSuccess(false);

    const trimmed = newStoreName.trim();
    if (!trimmed) {
      setStoreError('Store name cannot be empty.');
      return;
    }
    if (state.stores.includes(trimmed)) {
      setStoreError('A store with this name already exists.');
      return;
    }

    onAddStore(trimmed);
    setNewStoreName('');
    setStoreSuccess(true);
    setTimeout(() => setStoreSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Store Channels Management */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)] h-fit">
          <h4 className="text-sm uppercase-label mb-4">RETAIL & WAREHOUSE CHANNELS</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block">Current Channels</span>
              <div className="divide-y divide-[rgba(5,28,44,0.06)] border border-[rgba(5,28,44,0.06)] rounded-lg overflow-hidden bg-slate-50">
                {state.stores.map((store, i) => (
                  <div key={store} className="px-3 py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-primary">{store}</span>
                    <span className="text-[10px] bg-slate-200 text-primary/70 px-2 py-0.5 rounded-full font-mono">
                      {i === 0 ? 'HQ Warehouse' : `Retail Store ${i}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddStoreSubmit} className="space-y-3 pt-2 border-t border-[rgba(5,28,44,0.06)]">
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block">Add New Retail Store</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Store Delta"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="yellow-input flex-1 py-1.5"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded-md flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              {storeError && <p className="text-xs text-negative font-medium">{storeError}</p>}
              {storeSuccess && <p className="text-xs text-positive font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Store added successfully!</p>}
            </form>
          </div>
        </div>

        {/* Right Side: Models Spreadsheet */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm uppercase-label">MODEL CONFIGURATION SHEET</h4>
            <span className="text-[11px] text-[#888888] flex items-center gap-1">
              <Info className="w-3 h-3" />
              Editable inputs are marked in pale yellow
            </span>
          </div>
          <p className="text-xs text-[#888888] mb-4">
            Changes made here instantly propagate across all margins, sales yields, and safety alerts in real-time.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#051C2C]">
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-14">Code</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Model Name</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Category</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Cost ($)</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Price ($)</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-16">Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.06)]">
                {state.models.map((model) => (
                  <tr key={model.id} className="hover:bg-[rgba(5,28,44,0.01)] transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{model.id}</td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        value={model.name}
                        onChange={(e) => handleModelFieldChange(model.id, 'name', e.target.value)}
                        className="yellow-input w-full py-1 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        value={model.category}
                        onChange={(e) => handleModelFieldChange(model.id, 'category', e.target.value)}
                        className="yellow-input w-full py-1 text-xs"
                      />
                    </td>
                    <td className="py-2 px-1 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-[#888888] mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={model.unitCost}
                          onChange={(e) => handleModelFieldChange(model.id, 'unitCost', e.target.value)}
                          className="yellow-input w-16 py-1 text-right text-xs font-mono"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-[#888888] mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={model.unitPrice}
                          onChange={(e) => handleModelFieldChange(model.id, 'unitPrice', e.target.value)}
                          className="yellow-input w-16 py-1 text-right text-xs font-mono"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right">
                      <input
                        type="number"
                        value={model.safetyStock}
                        onChange={(e) => handleModelFieldChange(model.id, 'safetyStock', e.target.value)}
                        className="yellow-input w-12 py-1 text-center text-xs font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Ratios Summary Cards */}
          <div className="mt-8 pt-6 border-t border-[rgba(5,28,44,0.1)] space-y-4">
            <h5 className="text-xs uppercase-label text-[#888888]">MODEL PACKING RATIO TEMPLATES</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.models.map(m => (
                <div key={m.id} className="p-3.5 bg-slate-50 rounded-lg border border-[rgba(5,28,44,0.06)] space-y-2 text-xs">
                  <div className="flex justify-between items-center font-semibold text-primary">
                    <span>{m.id} - {m.name}</span>
                    <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase">{m.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#888888] tracking-wider block">Sizes Distribution:</span>
                    <div className="flex gap-2 font-mono text-[11px] text-primary/80 mt-1 flex-wrap">
                      {Object.entries(m.sizeDistribution).map(([size, r]) => (
                        <span key={size} className="bg-white border border-[rgba(5,28,44,0.06)] px-1.5 py-0.5 rounded">
                          {size}: {(r * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#888888] tracking-wider block">Colors Distribution:</span>
                    <div className="flex gap-2 font-mono text-[11px] text-primary/80 mt-1 flex-wrap">
                      {Object.entries(m.colorDistribution).map(([color, r]) => (
                        <span key={color} className="bg-white border border-[rgba(5,28,44,0.06)] px-1.5 py-0.5 rounded">
                          {color}: {(r * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
