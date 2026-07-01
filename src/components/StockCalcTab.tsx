import React, { useState, useMemo } from 'react';
import { LedgerState } from '../types';
import { SkuInventoryRow } from '../utils/inventory';
import { Package, Sliders, AlertTriangle } from 'lucide-react';

interface StockCalcTabProps {
  state: LedgerState;
  skuRows: SkuInventoryRow[];
}

export default function StockCalcTab({ state, skuRows }: StockCalcTabProps) {
  const [selectedStore, setSelectedStore] = useState<string>('All Locations');
  const [selectedModel, setSelectedModel] = useState<string>('All Models');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Maximum stock count for drawing relative percentage data-bars
  const maxStockForBar = useMemo(() => {
    let maxVal = 20; // fallback floor
    skuRows.forEach(row => {
      const val = selectedStore === 'All Locations' ? row.totalStock : row.stockByStore[selectedStore] || 0;
      if (val > maxVal) {
        maxVal = val;
      }
    });
    return maxVal;
  }, [skuRows, selectedStore]);

  // Filters the SKU rows based on selected store, model, and search query
  const filteredRows = useMemo(() => {
    return skuRows.filter(row => {
      // 1. Model filter
      if (selectedModel !== 'All Models' && row.modelId !== selectedModel) {
        return false;
      }

      // 2. Search query filter
      const searchLower = searchQuery.toLowerCase().trim();
      if (searchLower) {
        const matchSku = row.skuKey.toLowerCase().includes(searchLower);
        const matchName = row.modelName.toLowerCase().includes(searchLower);
        const matchColor = row.color.toLowerCase().includes(searchLower);
        if (!matchSku && !matchName && !matchColor) {
          return false;
        }
      }

      return true;
    });
  }, [skuRows, selectedModel, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Slicers Card */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-[rgba(5,28,44,0.06)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <span className="text-uppercase-label text-xs">LEDGER VIEW FILTERS</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Store location filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Inventory Location:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            >
              <option value="All Locations">All Channels Total</option>
              {state.stores.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Model ID filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Model Code:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            >
              <option value="All Models">All Models</option>
              {state.models.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Search:</span>
            <input
              type="text"
              placeholder="e.g. Crimson, M01..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h4 className="text-sm uppercase-label">REAL-TIME INVENTORY LEDGER</h4>
          </div>
          <span className="text-[11px] text-[#888888] italic">
            Showing {filteredRows.length} SKU combinations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-[#051C2C]">
                <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">SKU Code</th>
                <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Model Description</th>
                <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Color</th>
                <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-16 text-center">Size</th>
                <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-24">Safety Stock</th>
                <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-32">Available Count</th>
                <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-40 pl-6">Relative Density</th>
                <th className="py-2.5 text-center uppercase font-semibold text-[11px] text-primary w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(5,28,44,0.06)] font-sans">
              {filteredRows.map((row) => {
                const stockVal = selectedStore === 'All Locations' ? row.totalStock : row.stockByStore[selectedStore] || 0;
                const isLow = stockVal < row.safetyStock;

                return (
                  <tr key={row.skuKey} className={`hover:bg-[rgba(5,28,44,0.01)] transition-colors ${isLow && stockVal > 0 ? 'bg-amber-50/20' : ''}`}>
                    {/* SKU Key */}
                    <td className="py-3.5 font-mono font-bold text-primary">{row.skuKey}</td>
                    
                    {/* Model Name */}
                    <td className="py-3.5 font-medium text-primary">
                      {row.modelName}
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-sans uppercase font-semibold ml-2 inline-block">
                        {row.category}
                      </span>
                    </td>

                    {/* Color */}
                    <td className="py-3.5 text-primary/80 font-medium">{row.color}</td>

                    {/* Size */}
                    <td className="py-3.5 text-center font-mono font-bold text-[#888888]">{row.size}</td>

                    {/* Safety Stock */}
                    <td className="py-3.5 text-right font-mono text-[#888888]">{row.safetyStock} pcs</td>

                    {/* Available Count */}
                    <td className={`py-3.5 text-right font-mono font-bold text-sm ${stockVal === 0 ? 'text-[#888888]' : isLow ? 'text-negative' : 'text-primary'}`}>
                      {stockVal.toLocaleString()} pcs
                    </td>

                    {/* Inline Data Bar */}
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center h-full w-full">
                        <div className="w-full h-2 bg-[rgba(5,28,44,0.1)] rounded overflow-hidden relative">
                          <div 
                            className="h-full bg-accent rounded transition-all duration-300"
                            style={{ width: `${Math.min(100, (stockVal / maxStockForBar) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 text-center">
                      {stockVal === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase bg-[rgba(5,28,44,0.06)] text-[#888888] border">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase bg-red-100 text-negative border border-red-200 flex items-center gap-1 justify-center max-w-[84px] mx-auto">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span>LOW</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#888888] italic">No SKU inventory matches found for selected query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
