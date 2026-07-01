import React, { useState, useMemo } from 'react';
import { LedgerState, ModelConfig } from '../types';
import { SkuInventoryRow, StoreFinancialRow } from '../utils/inventory';
import { Sliders, Activity, TrendingUp, AlertTriangle, HelpCircle, Eye } from 'lucide-react';

interface DashboardTabProps {
  state: LedgerState;
  skuRows: SkuInventoryRow[];
  storePerformance: StoreFinancialRow[];
}

export default function DashboardTab({ state, skuRows, storePerformance }: DashboardTabProps) {
  // Slicers State
  const [selectedStore, setSelectedStore] = useState<string>('All Locations');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('All Models');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Interactive Sizing Matrix (Exposure Matrix) selection
  const [matrixModelId, setMatrixModelId] = useState<string>(state.models[0]?.id || 'M01');
  const [matrixStore, setMatrixStore] = useState<string>('Central Warehouse');

  // Categories list helper
  const categories = useMemo(() => {
    const cats = new Set(state.models.map(m => m.category));
    return ['All Categories', ...Array.from(cats)];
  }, [state.models]);

  // Compute filtered metrics for KPIs
  const filteredMetrics = useMemo(() => {
    // Filter sales logs
    const salesFiltered = state.sales.filter(sale => {
      const matchStore = selectedStore === 'All Locations' || sale.store === selectedStore;
      const matchModel = selectedModelFilter === 'All Models' || sale.modelId === selectedModelFilter;
      const modelDetail = state.models.find(m => m.id === sale.modelId);
      const matchCat = selectedCategory === 'All Categories' || (modelDetail && modelDetail.category === selectedCategory);
      return matchStore && matchModel && matchCat;
    });

    const totalSalesRev = salesFiltered.reduce((sum, s) => sum + s.totalAmount, 0);
    
    // Compute total cost for sold units to find margin
    const totalSalesCost = salesFiltered.reduce((sum, s) => {
      const model = state.models.find(m => m.id === s.modelId);
      const unitCost = model ? model.unitCost : 0;
      return sum + s.quantity * unitCost;
    }, 0);
    const profit = totalSalesRev - totalSalesCost;
    const salesMargin = totalSalesRev > 0 ? (profit / totalSalesRev) * 100 : 0;

    // Filter stock
    let totalStockPcs = 0;
    skuRows.forEach(row => {
      const matchModel = selectedModelFilter === 'All Models' || row.modelId === selectedModelFilter;
      const matchCat = selectedCategory === 'All Categories' || row.category === selectedCategory;
      if (!matchModel || !matchCat) return;

      if (selectedStore === 'All Locations') {
        totalStockPcs += row.totalStock;
      } else {
        totalStockPcs += row.stockByStore[selectedStore] || 0;
      }
    });

    // Merma stats (independent of store unless all, filterable by model)
    const filteredMaquila = state.maquilaBatches.filter(batch => {
      const matchModel = selectedModelFilter === 'All Models' || batch.modelId === selectedModelFilter;
      const modelDetail = state.models.find(m => m.id === batch.modelId);
      const matchCat = selectedCategory === 'All Categories' || (modelDetail && modelDetail.category === selectedCategory);
      return matchModel && matchCat;
    });

    const totalBulkPcs = filteredMaquila.reduce((sum, b) => sum + b.bulkPieces, 0);
    const totalMermaPcs = filteredMaquila.reduce((sum, b) => sum + b.mermaPieces, 0);
    const averageMermaRate = totalBulkPcs > 0 ? (totalMermaPcs / totalBulkPcs) * 100 : 0;

    return {
      totalStockPcs,
      totalSalesRev,
      salesMargin,
      totalMermaPcs,
      averageMermaRate
    };
  }, [state, skuRows, selectedStore, selectedModelFilter, selectedCategory]);

  // Dynamic Rule-Based Executive Insights Generator
  const insights = useMemo(() => {
    const list: { type: 'alert' | 'insight'; message: string; action?: string }[] = [];

    // Rule 1: High Merma Alert
    if (filteredMetrics.averageMermaRate > 3.0) {
      list.push({
        type: 'alert',
        message: `High average processing loss (Merma) detected at ${filteredMetrics.averageMermaRate.toFixed(1)}%, exceeding the SLA safety benchmark of 3.0%.`,
        action: "Audit Maquila batch output logs immediately to identify sub-standard processing batches."
      });
    }

    // Rule 2: Low Stock Alert
    const lowStockSkus = skuRows.filter(row => row.totalStock < row.safetyStock);
    if (lowStockSkus.length > 0) {
      const topLow = lowStockSkus[0];
      list.push({
        type: 'insight',
        message: `Stock level of popular model '${topLow.modelName}' is below safety threshold (${topLow.totalStock} left, safety limit: ${topLow.safetyStock}).`,
        action: `Review 'Stock Ledger' tab to prepare a processing replenishment order.`
      });
    }

    // Rule 3: Direct distribution recommendation
    // Find a SKU that is low in a retail store but high in the warehouse
    let foundTransferRec = false;
    for (const row of skuRows) {
      if (row.stockByStore['Central Warehouse'] > 15) {
        for (const store of state.stores) {
          if (store === 'Central Warehouse') continue;
          const storeStock = row.stockByStore[store] || 0;
          if (storeStock === 0) {
            list.push({
              type: 'insight',
              message: `Potential stockout detected: '${row.modelName}' (${row.color}, size ${row.size}) has 0 stock at ${store}, while Central Warehouse holds ${row.stockByStore['Central Warehouse']} units.`,
              action: `Initiate a Transfer order of 10 units from Central Warehouse to ${store}.`
            });
            foundTransferRec = true;
            break;
          }
        }
      }
      if (foundTransferRec) break;
    }

    // Add default if empty
    if (list.length === 0) {
      list.push({
        type: 'insight',
        message: "All warehouse and retail channels are operating at optimal safety stock levels with zero anomalies detected.",
        action: "Continue monitoring retail store daily sales volume."
      });
    }

    return list;
  }, [filteredMetrics, skuRows, state.stores]);

  // Sizing Matrix calculations for selected model & store
  const matrixData = useMemo(() => {
    const model = state.models.find(m => m.id === matrixModelId);
    if (!model) return null;

    const colors = Object.keys(model.colorDistribution);
    const sizes = Object.keys(model.sizeDistribution);

    const rowsData = colors.map(color => {
      const sizesData = sizes.map(size => {
        const skuKey = `${model.id}-${color}-${size}`;
        const row = skuRows.find(r => r.skuKey === skuKey);
        const qty = row ? row.stockByStore[matrixStore] || 0 : 0;
        const isBelowSafety = qty < model.safetyStock;
        return { size, qty, isBelowSafety };
      });
      return { color, sizesData };
    });

    return { model, sizes, rowsData };
  }, [matrixModelId, matrixStore, skuRows, state.models]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Slicers Card */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-[rgba(5,28,44,0.06)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <span className="text-uppercase-label text-xs">EXECUTIVE CONTROL SLICERS</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Store Slicer */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Channel:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            >
              <option value="All Locations">All Channels</option>
              {state.stores.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Model Slicer */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Model:</span>
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            >
              <option value="All Models">All Models</option>
              {state.models.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
              ))}
            </select>
          </div>

          {/* Category Slicer */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="yellow-input py-1 px-2 text-xs"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-t-2 border-primary min-h-[120px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[#888888] text-[11px] font-medium tracking-wider uppercase">Active Stock Pcs</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-semibold tracking-tight text-primary">
              {filteredMetrics.totalStockPcs.toLocaleString()}
            </span>
            <span className="text-xs text-[#888888]">units</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1">In selected filter channels</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-t-2 border-accent min-h-[120px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[#888888] text-[11px] font-medium tracking-wider uppercase">Total Sales Revenue</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-semibold tracking-tight text-accent">
              ${filteredMetrics.totalSalesRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1">Post-discount sales total</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-t-2 border-primary min-h-[120px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[#888888] text-[11px] font-medium tracking-wider uppercase">Gross Margin</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-semibold tracking-tight text-primary">
              {filteredMetrics.salesMargin.toFixed(1)}%
            </span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1">Estimated profit yield</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-t-2 border-negative min-h-[120px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="text-[#888888] text-[11px] font-medium tracking-wider uppercase">Maquila Loss (Merma)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-semibold tracking-tight text-primary">
              {filteredMetrics.averageMermaRate.toFixed(1)}%
            </span>
            <span className="text-xs text-[#888888]">avg</span>
          </div>
          <span className="text-[11px] text-[#888888] mt-1">
            {filteredMetrics.totalMermaPcs} pcs waste recorded
          </span>
        </div>
      </div>

      {/* Executive Insights & Anomaly Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold font-section text-primary uppercase tracking-wider">
          OPERATIONAL INSIGHTS & RECOMMENDATIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className={ins.type === 'alert' ? 'anomaly-block flex gap-3' : 'insight-block flex gap-3'}
            >
              {ins.type === 'alert' ? (
                <AlertTriangle className="w-5 h-5 text-negative shrink-0 mt-0.5" />
              ) : (
                <Activity className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-[13px] leading-relaxed text-primary font-medium">
                  {ins.message}
                </p>
                {ins.action && (
                  <p className="text-xs text-primary/75 italic">
                    <span className="font-semibold">Recommended Action: </span> {ins.action}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Analysis Zone: Performance Matrix & Exposure Sizing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Store Performance Table */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm uppercase-label">CHANNEL PROFITABILITY BENCHMARK</h4>
            <span className="text-xs text-[#888888]">Live Calculations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(5,28,44,0.12)]">
                  <th className="py-2.5 uppercase text-[#051C2C] font-semibold text-[11px] tracking-wider">Location</th>
                  <th className="py-2.5 text-right uppercase text-[#051C2C] font-semibold text-[11px] tracking-wider">Pcs Sold</th>
                  <th className="py-2.5 text-right uppercase text-[#051C2C] font-semibold text-[11px] tracking-wider">Revenue</th>
                  <th className="py-2.5 text-right uppercase text-[#051C2C] font-semibold text-[11px] tracking-wider">Gross Profit</th>
                  <th className="py-2.5 text-right uppercase text-[#051C2C] font-semibold text-[11px] tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.04)]">
                {storePerformance.map((row) => (
                  <tr key={row.storeName} className="hover:bg-[rgba(5,28,44,0.02)] transition-colors">
                    <td className="py-3 font-medium text-primary">{row.storeName}</td>
                    <td className="py-3 text-right font-mono text-[#888888]">{row.unitsSold}</td>
                    <td className="py-3 text-right font-mono text-primary">${row.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right font-mono text-primary">${row.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs font-semibold text-accent">
                          {row.profitMargin.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1.5 bg-accent/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full" 
                            style={{ width: `${Math.min(100, row.profitMargin)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Exposure Sizing Matrix */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h4 className="text-sm uppercase-label">COLOR-SIZE EXPOSURE MATRIX</h4>
            <div className="flex items-center gap-2">
              {/* Matrix selectors */}
              <select
                value={matrixModelId}
                onChange={(e) => setMatrixModelId(e.target.value)}
                className="yellow-input py-0.5 px-1.5 text-[11px]"
              >
                {state.models.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
              <select
                value={matrixStore}
                onChange={(e) => setMatrixStore(e.target.value)}
                className="yellow-input py-0.5 px-1.5 text-[11px]"
              >
                {state.stores.map(s => (
                  <option key={s} value={s}>{s === 'Central Warehouse' ? 'Warehouse' : s}</option>
                ))}
              </select>
            </div>
          </div>

          {matrixData ? (
            <div className="space-y-4">
              <div className="text-xs text-primary/80 font-medium">
                Showing inventory details for <span className="text-accent font-semibold">{matrixData.model.name}</span> in <span className="text-primary font-semibold">{matrixStore}</span>.
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border-b border-[rgba(5,28,44,0.12)] bg-[rgba(5,28,44,0.03)] text-left text-[11px] uppercase tracking-wider font-semibold text-primary">
                        Color \ Size
                      </th>
                      {matrixData.sizes.map(size => (
                        <th
                          key={size}
                          className="p-2 border-b border-[rgba(5,28,44,0.12)] bg-[rgba(5,28,44,0.03)] text-center text-[11px] uppercase tracking-wider font-semibold text-primary"
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.rowsData.map(row => (
                      <tr key={row.color} className="border-b border-[rgba(5,28,44,0.04)]">
                        <td className="p-2.5 font-medium text-xs text-primary bg-[rgba(5,28,44,0.01)] w-28">
                          {row.color}
                        </td>
                        {row.sizesData.map(cell => (
                          <td key={cell.size} className="p-1 text-center">
                            <div
                              className={`p-2.5 rounded-lg font-mono text-xs clickable-cell ${
                                cell.qty === 0
                                  ? 'bg-[rgba(5,28,44,0.02)] text-[#888888]'
                                  : cell.isBelowSafety
                                  ? 'bg-red-50 text-negative font-semibold border border-red-200'
                                  : 'bg-blue-50 text-accent font-semibold'
                              }`}
                            >
                              <div>{cell.qty}</div>
                              {cell.isBelowSafety && cell.qty > 0 && (
                                <div className="text-[9px] uppercase tracking-tight text-negative/70">
                                  Low ({matrixData.model.safetyStock})
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix Legend */}
              <div className="flex items-center justify-between text-[11px] text-[#888888] pt-2 border-t border-[rgba(5,28,44,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-50 rounded border border-blue-200 inline-block"></span>
                    <span>Healthy Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-50 rounded border border-red-200 inline-block"></span>
                    <span>Below Safety Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[rgba(5,28,44,0.02)] rounded inline-block"></span>
                    <span>Zero Stock</span>
                  </div>
                </div>
                <div>* Hover grid cells for magnification and feedback.</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-[#888888] text-xs">No model configuration selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
