import React, { useState, useMemo } from 'react';
import { LedgerState, StoreSales } from '../types';
import { CombinedInventoryRow } from '../utils/inventory';
import { Plus, Trash2, TrendingUp, HelpCircle, Check, Download } from 'lucide-react';

interface SalesLogTabProps {
  state: LedgerState;
  skuInventory: CombinedInventoryRow[];
  onAddSale: (sale: StoreSales) => void;
  onDeleteSale: (salesId: string) => void;
}

export default function SalesLogTab({ state, skuInventory, onAddSale, onDeleteSale }: SalesLogTabProps) {
  // Form State
  const [date, setDate] = useState('2026-07-01');
  const [storeName, setStoreName] = useState('');
  const [selectedSkuKey, setSelectedSkuKey] = useState('');
  const [qtyPcs, setQtyPcs] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(45.00);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleExportCSV = () => {
    if (state.sales.length === 0) {
      alert("No sales transactions available to export.");
      return;
    }
    const headers = ["Sales_ID", "Date", "Store_Name", "SKU_Key", "Qty_Pcs", "Unit_Price", "Revenue"];
    const csvRows = [
      headers.join(","),
      ...state.sales.map(row => [
        `"${row.salesId}"`,
        `"${row.date}"`,
        `"${row.storeName}"`,
        `"${row.skuKey}"`,
        row.qtyPcs,
        row.unitPrice,
        row.revenue
      ].join(","))
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tbl_sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter retail stores
  const retailStores = useMemo(() => {
    return state.params.stores.filter(s => s !== "Warehouse");
  }, [state.params.stores]);

  // Set initial store
  React.useEffect(() => {
    if (retailStores.length > 0 && !storeName) {
      setStoreName(retailStores[0]);
    }
  }, [retailStores, storeName]);

  // Set initial SKU
  React.useEffect(() => {
    if (state.products.length > 0 && !selectedSkuKey) {
      setSelectedSkuKey(state.products[0].skuKey);
    }
  }, [state.products, selectedSkuKey]);

  // Fetch current stock on hand at selected store to show in form
  const storeStockOnHand = useMemo(() => {
    if (!storeName || !selectedSkuKey) return 0;
    const matched = skuInventory.find(item => item.skuKey === selectedSkuKey);
    return matched ? matched.storeStocks[storeName] || 0 : 0;
  }, [selectedSkuKey, storeName, skuInventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkuKey) return;
    if (!storeName) {
      alert("Please configure store parameters first.");
      return;
    }

    if (qtyPcs > storeStockOnHand) {
      const proceed = window.confirm(
        `Warning (Section 7.2): ${storeName} has only ${storeStockOnHand} units of ${selectedSkuKey}. This sale will cause a negative inventory level on formulas. Do you want to proceed for logging accuracy?`
      );
      if (!proceed) return;
    }

    const salesId = `SAL-${Date.now().toString().slice(-3)}`;
    const revenue = qtyPcs * unitPrice;

    const newSale: StoreSales = {
      salesId,
      date,
      storeName,
      skuKey: selectedSkuKey,
      qtyPcs,
      unitPrice,
      revenue
    };

    onAddSale(newSale);
    setFormSuccess(true);
    setQtyPcs(1);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Log Retail Transaction */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit text-xs space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Post Retail Sale (tbl_Sales)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Log physical daily product sales. These sales will instantly subtract from the specified store's SKU stock count and record dynamic turnover revenue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Sale Date */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Sale Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="yellow-input w-full font-medium"
                  required
                />
              </div>

              {/* Retail store select */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Retail Store</label>
                <select
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="yellow-input w-full font-semibold"
                  required
                >
                  {retailStores.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKU selection */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Select Item SKU</label>
              <select
                value={selectedSkuKey}
                onChange={(e) => setSelectedSkuKey(e.target.value)}
                className="yellow-input w-full font-mono text-xs font-bold"
                required
              >
                {state.products.map(p => (
                  <option key={p.skuKey} value={p.skuKey}>{p.skuKey}</option>
                ))}
              </select>
            </div>

            {/* Available stock at store preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Stock at Store:</span>
              <span className={`font-bold ${storeStockOnHand === 0 ? 'text-red-500' : 'text-primary'}`}>
                {storeStockOnHand} Pcs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Qty */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Quantity Sold</label>
                <input
                  type="number"
                  value={qtyPcs}
                  onChange={(e) => setQtyPcs(Math.max(1, parseInt(e.target.value) || 0))}
                  className="yellow-input w-full font-mono font-bold"
                  min="1"
                  required
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Retail Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="yellow-input w-full font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* Calculated revenue preview card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal pieces:</span>
                <span className="text-primary font-bold">{qtyPcs} pcs</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Unit Retail Price:</span>
                <span className="text-primary">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-semibold">
                <span className="text-primary font-bold uppercase tracking-wide">Dynamic Revenue:</span>
                <span className="text-accent font-extrabold">${(qtyPcs * unitPrice).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white w-full py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
            >
              <TrendingUp className="w-4 h-4" />
              <span>POST SALES TRANSACTION</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-1 animate-fade-up">
                <Check className="w-4 h-4" /> Sale row posted to ledger!
              </p>
            )}
          </form>
        </div>

        {/* Right Spreadsheet: Sales Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Store Sales Transactions Ledger (tbl_Sales)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span>Export CSV</span>
              </button>
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                <HelpCircle className="w-3.5 h-3.5 text-accent" />
                Formula: Revenue = [@Qty_Pcs] * [@Unit_Price]
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Sales_ID</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Store_Name</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">SKU_Key</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right">Qty_Pcs</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right font-mono">Unit_Price</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right font-mono bg-slate-50">Revenue</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.sales.slice().reverse().map(row => (
                  <tr key={row.salesId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{row.salesId}</td>
                    <td className="p-3 text-slate-500 font-mono">{row.date}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.storeName}</td>
                    <td className="p-3 font-mono font-bold text-primary bg-slate-50/20">{row.skuKey}</td>
                    <td className="p-3 text-right font-mono text-slate-900">{row.qtyPcs}</td>
                    <td className="p-3 text-right font-mono text-slate-500">${row.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-slate-50/30">
                      ${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete sales transaction row ${row.salesId}?`)) {
                            onDeleteSale(row.salesId);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {state.sales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 italic">No retail transactions posted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
