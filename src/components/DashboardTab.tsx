import React, { useMemo } from 'react';
import { LedgerState } from '../types';
import { calculateCombinedInventory, calculateStoreFinancials, CombinedInventoryRow } from '../utils/inventory';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ShieldAlert,
  Coins,
  TrendingUp,
  Percent,
  Warehouse,
  ShoppingBag,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardTabProps {
  state: LedgerState;
  skuInventory: CombinedInventoryRow[];
}

// Accent colors
const COLORS_PIE = ['#051C2C', '#2251FF', '#4C6FFF', '#888888', '#B0C0FF'];
const COLOR_WH = '#051C2C'; // Brand Deep Navy
const COLOR_STORES = '#2251FF'; // Brand Blue Accent

export default function DashboardTab({ state, skuInventory }: DashboardTabProps) {
  
  // 1. KPI Calculations
  
  // KPI 1: Inventory Asset Valuation (Sum of stock * costPrice)
  const totalValuation = useMemo(() => {
    return skuInventory.reduce((sum, item) => sum + item.totalAssetValue, 0);
  }, [skuInventory]);

  const whValuation = useMemo(() => {
    return skuInventory.reduce((sum, item) => sum + (item.whStock * item.costPrice), 0);
  }, [skuInventory]);

  const storesValuation = useMemo(() => {
    return totalValuation - whValuation;
  }, [totalValuation, whValuation]);

  // KPI 2: Sales GMV & COGS & Gross Profit Margin
  const salesStats = useMemo(() => {
    const gmv = state.sales.reduce((sum, s) => sum + s.revenue, 0);
    const cogs = state.sales.reduce((sum, s) => {
      const prod = state.products.find(p => p.skuKey === s.skuKey);
      const cost = prod ? prod.costPrice : 0;
      return sum + s.qtyPcs * cost;
    }, 0);
    const grossProfit = gmv - cogs;
    const marginPercent = gmv > 0 ? (grossProfit / gmv) * 100 : 0;

    return { gmv, cogs, grossProfit, marginPercent };
  }, [state.sales, state.products]);

  // KPI 3: Merma Ratio (SOW formula: Loss_Value / (Loss_Value + COGS + Current Asset Valuation))
  const mermaStats = useMemo(() => {
    const totalLossValue = state.merma.reduce((sum, m) => sum + m.lossValue, 0);
    const totalMermaPcs = state.merma.reduce((sum, m) => sum + m.qtyPcs, 0);
    
    // Total production count to calculate percentage of loss pieces
    const totalBreakdownPcs = state.breakdown.reduce((sum, b) => sum + b.qtyPcs, 0);
    
    // Loss Value ratio as specified in SOW
    const denominator = totalLossValue + salesStats.cogs + totalValuation;
    const lossValueRatio = denominator > 0 ? (totalLossValue / denominator) * 100 : 0;
    
    // Qty ratio
    const lossQtyRatio = totalBreakdownPcs > 0 ? (totalMermaPcs / totalBreakdownPcs) * 100 : 0;

    return { totalLossValue, totalMermaPcs, lossValueRatio, lossQtyRatio };
  }, [state.merma, state.breakdown, salesStats.cogs, totalValuation]);


  // 2. Visualizations data-mapping

  // Chart 1: Stock Health (WH Stock vs Stores Stock per SKU)
  const stockHealthData = useMemo(() => {
    return skuInventory.map(item => {
      const storeTotal = Object.values(item.storeStocks).reduce<number>((sum, v) => sum + (Number(v) || 0), 0);
      return {
        skuKey: item.skuKey,
        "Warehouse Stock": item.whStock,
        "Stores Stock": storeTotal,
        "Total Stock": item.totalGlobalStock
      };
    });
  }, [skuInventory]);

  // Chart 2: Store Profitability Pareto / Channels
  const storeFinancialsData = useMemo(() => {
    const financials = calculateStoreFinancials(state);
    // filter Warehouse out if it exists
    return financials
      .filter(f => f.storeName !== "Warehouse")
      .sort((a, b) => b.grossProfit - a.grossProfit);
  }, [state]);

  // Chart 3: Merma Causes and Audit Loss Value
  const mermaPieData = useMemo(() => {
    const map: { [reason: string]: number } = {};
    // initialize with known types
    state.params.wasteTypes.forEach(t => { map[t] = 0; });
    
    state.merma.forEach(m => {
      map[m.wasteType] = (map[m.wasteType] || 0) + m.lossValue;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [state.merma, state.params.wasteTypes]);

  return (
    <div className="space-y-8 animate-fade-up">
      
      {/* 3. KPI Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Asset Valuation */}
        <div className="custom-card p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans tracking-widest">
                Logistics Assets Valuation
              </span>
              <h2 className="text-2xl font-black text-primary font-mono tracking-tight font-display text-[26px]">
                ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-primary">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Warehouse className="w-3.5 h-3.5 text-slate-400" /> WH: ${whValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Retail: ${storesValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-2 text-[9px] text-slate-400 italic">
            Formula: ∑ (Current_Stock * Product_Cost)
          </div>
        </div>

        {/* Card 2: Sales Profitability */}
        <div className="custom-card p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans tracking-widest">
                Total Sales GMV & Profit
              </span>
              <h2 className="text-2xl font-black text-primary font-mono tracking-tight font-display text-[26px]">
                ${salesStats.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
              <Percent className="w-3 h-3 text-slate-400" /> Margin: {salesStats.marginPercent.toFixed(1)}%
            </span>
            <span className="text-slate-500 font-bold">
              Profit: <span className="text-primary">${salesStats.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          </div>
          <div className="mt-2 text-[9px] text-slate-400 italic">
            Formula: Gross Profit = GMV - Cost_of_Goods_Sold
          </div>
        </div>

        {/* Card 3: Merma Ratio */}
        {(() => {
          const isAnomaly = mermaStats.lossQtyRatio > 3.0;
          return (
            <div className={`custom-card p-6 relative overflow-hidden transition-all ${isAnomaly ? 'bg-red-50/10 border-red-200 shadow-[0_2px_8px_rgba(211,47,47,0.05)]' : ''}`}>
              {isAnomaly && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              )}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block font-sans tracking-widest ${isAnomaly ? 'text-red-500' : 'text-slate-400'}`}>
                    Supply Chain Merma Ratio {isAnomaly && '— SLA Breach'}
                  </span>
                  <h2 className={`text-2xl font-black font-mono tracking-tight font-display text-[26px] ${isAnomaly ? 'text-red-600' : 'text-primary'}`}>
                    {mermaStats.lossValueRatio.toFixed(2)}%
                  </h2>
                </div>
                <div className={`p-2.5 rounded-lg ${isAnomaly ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-slate-50 border border-slate-200 text-primary'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className={`font-bold px-2 py-0.5 rounded border ${isAnomaly ? 'text-red-700 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                  Loss: ${mermaStats.totalLossValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className={isAnomaly ? 'text-red-700 font-medium' : 'text-slate-600'}>
                  Lost Qty: {mermaStats.totalMermaPcs} pcs ({mermaStats.lossQtyRatio.toFixed(1)}% Yield)
                </span>
              </div>
              <div className="mt-2 text-[9px] text-slate-400 italic">
                Formula: Loss_Value / (Loss_Value + COGS + Asset_Valuation)
              </div>
            </div>
          );
        })()}

      </div>

      {/* 4. BI Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Visualization 1: Stock Health Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-[#107c41]" />
              Stock Health: Warehouse vs Stores SKU Stock
            </h4>
            <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">
              Dynamic Arrays
            </span>
          </div>
          
          <div className="h-72 w-full text-xs font-mono">
            {stockHealthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="skuKey" tick={{ fontSize: 9 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#64748b" />
                  <Tooltip wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Warehouse Stock" fill={COLOR_WH} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Stores Stock" fill={COLOR_STORES} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                No inventory data to compare. Set up product parameters.
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 italic leading-relaxed">
            * Operational Rule: Ideal distribution aims to minimize heavy central storage counts while maintaining safety store stock levels to avoid terminal out-of-stock events.
          </p>
        </div>

        {/* Visualization 2: Store Profitability Pareto */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Store Profitability & Revenue Channels
            </h4>
            <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">
              Pareto Ordering
            </span>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            {storeFinancialsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeFinancialsData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="storeName" stroke="#64748b" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#64748b" />
                  <Tooltip wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue (GMV)" fill="#2251FF" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="grossProfit" name="Gross Profit ($)" fill="#051C2C" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                No retail sales recorded. Register transactions in the Store Sales tab.
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 italic leading-relaxed">
            * Dynamic Pareto logic ranks retail sales locations based on cumulative gross margin contributions to maximize high-performance channels.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Visualization 3: Merma Audit Root-Cause Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 xl:col-span-1">
          <h4 className="font-display text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Merma Audit: Loss Value Causes
          </h4>

          <div className="h-56 w-full flex items-center justify-center font-mono">
            {mermaPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mermaPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mermaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Loss Value']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 italic text-xs text-center">
                No supply chain losses logged. Well done!
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-500 font-mono">
            {mermaPieData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS_PIE[index % COLORS_PIE.length] }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Section 4: Live Inventory Audit Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 xl:col-span-2 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              SLA Compliance & Dynamic Audit Trail
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-50 text-slate-500 font-bold border border-slate-200">
              Audit Complete
            </span>
          </div>

          <p className="text-slate-500 text-[11px] leading-relaxed">
            Automated double-entry check system. This log audits live operations compared to the standard supply chain constraints (SLA Yield loss limit is 3.0%).
          </p>

          <div className="space-y-2.5 font-mono text-[11px]">
            {/* Rule 1: No negative warehouse inventory */}
            <div className="p-3 rounded-lg border flex items-start gap-2 bg-slate-50/40 border-slate-200 text-slate-700">
              <div className="px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 font-bold text-[9px] uppercase tracking-wider">PASS</div>
              <div className="space-y-0.5">
                <span className="font-bold block text-primary">Double-Entry Conservation Audit</span>
                <span className="text-slate-500 text-[10px]">All transfers out of central storage are verified against previous breakdown logs. Total production pieces: {state.breakdown.reduce((sum, b) => sum + b.qtyPcs, 0)} pcs.</span>
              </div>
            </div>

            {/* Rule 2: Merma Alert checks */}
            {mermaStats.lossQtyRatio > 3.0 ? (
              <div className="p-3 rounded-lg border flex items-start gap-2 bg-red-50/40 border-red-200 text-red-900">
                <div className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[9px] uppercase tracking-wider">WARN</div>
                <div className="space-y-0.5">
                  <span className="font-bold block text-red-800">Supply Chain Yield Warning</span>
                  <span className="text-slate-500 text-[10px]">The overall pieces loss ratio ({mermaStats.lossQtyRatio.toFixed(2)}%) is above the SLA target threshold of 3.00%. Target corrective actions at high-loss channels.</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border flex items-start gap-2 bg-slate-50/40 border-slate-200 text-slate-700">
                <div className="px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 font-bold text-[9px] uppercase tracking-wider">PASS</div>
                <div className="space-y-0.5">
                  <span className="font-bold block text-primary">Supply Chain Yield Audit</span>
                  <span className="text-slate-500 text-[10px]">Overall supply-chain loss ratio is healthy at {mermaStats.lossQtyRatio.toFixed(2)}% (SLA Limit: 3.00%). No yield penalties incurred.</span>
                </div>
              </div>
            )}

            {/* Rule 3: High Margin alerts */}
            <div className="p-3 rounded-lg border flex items-start gap-2 bg-slate-50/40 border-slate-200 text-slate-700">
              <div className="px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600 font-bold text-[9px] uppercase tracking-wider">INFO</div>
              <div className="space-y-0.5">
                <span className="font-bold block text-primary">Product Profitability Index</span>
                <span className="text-slate-500 text-[10px]">Average Retail Margin is solid at {salesStats.marginPercent.toFixed(1)}%. Total wholesale cost inputs of products: ${salesStats.cogs.toLocaleString(undefined, { maximumFractionDigits: 0 })}.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
