import React, { useState, useMemo } from 'react';
import { LedgerState, BreakdownProduction, ProductMaster } from '../types';
import { RefreshCw, Play, Trash2, HelpCircle, Check, AlertTriangle, Download } from 'lucide-react';

interface BreakMaqTabProps {
  state: LedgerState;
  onAddBreakdownRows: (rows: BreakdownProduction[]) => void;
  onDeleteBreakdownRow: (index: number) => void;
}

export default function BreakMaqTab({ state, onAddBreakdownRows, onDeleteBreakdownRow }: BreakMaqTabProps) {
  // Breakdown Form States
  const [date, setDate] = useState('2026-07-01');
  const [selectedBatchNo, setSelectedBatchNo] = useState('');
  const [maquilaQtys, setMaquilaQtys] = useState<{ [skuKey: string]: number }>({});
  const [formSuccess, setFormSuccess] = useState(false);

  const handleExportCSV = () => {
    if (state.breakdown.length === 0) {
      alert("No breakdown logs available to export.");
      return;
    }
    const headers = ["Date", "Source_Batch", "Model", "Color", "Size", "SKU_Key", "Qty_Pcs", "Cost_Price", "Total_Asset_Value"];
    const csvRows = [
      headers.join(","),
      ...state.breakdown.map(row => [
        `"${row.date}"`,
        `"${row.sourceBatch}"`,
        `"${row.model.replace(/"/g, '""')}"`,
        `"${row.color}"`,
        `"${row.size}"`,
        `"${row.skuKey}"`,
        row.qtyPcs,
        row.costPrice,
        row.qtyPcs * row.costPrice
      ].join(","))
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tbl_breakdown_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter batches that have been logged in receiving but not fully processed
  const availableBatches = useMemo(() => {
    return state.receiving.map(r => ({
      batchNo: r.batchNo,
      supplier: r.supplier,
      totalPcsEst: r.totalPcsEst
    }));
  }, [state.receiving]);

  // Set initial batch
  React.useEffect(() => {
    if (availableBatches.length > 0 && !selectedBatchNo) {
      setSelectedBatchNo(availableBatches[0].batchNo);
    }
  }, [availableBatches, selectedBatchNo]);

  // Selected batch info
  const selectedBatchInfo = useMemo(() => {
    return availableBatches.find(b => b.batchNo === selectedBatchNo);
  }, [selectedBatchNo, availableBatches]);

  // Load SKUs when selected batch is changed (or just display all available products)
  const availableProducts = useMemo(() => {
    return state.products;
  }, [state.products]);

  // Total pieces entered in form
  const totalQualifiedCount = useMemo(() => {
    return Object.values(maquilaQtys).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);
  }, [maquilaQtys]);

  // Compute estimate merma rate
  const estMermaPcs = selectedBatchInfo ? Math.max(0, selectedBatchInfo.totalPcsEst - totalQualifiedCount) : 0;
  const estMermaRate = selectedBatchInfo && selectedBatchInfo.totalPcsEst > 0 
    ? (estMermaPcs / selectedBatchInfo.totalPcsEst) * 100 
    : 0;

  // Single SKU value change
  const handleQtyChange = (skuKey: string, val: string) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setMaquilaQtys(prev => ({
      ...prev,
      [skuKey]: qty
    }));
  };

  // Auto split from standard ratios
  const handleAutoRatioSplit = () => {
    if (!selectedBatchInfo) return;
    const totalPcs = selectedBatchInfo.totalPcsEst;
    
    // Simple distribution among all registered products in master
    const productsCount = availableProducts.length;
    if (productsCount === 0) return;

    const baseShare = Math.floor(totalPcs / productsCount);
    const newQtys: { [key: string]: number } = {};
    
    availableProducts.forEach((p, idx) => {
      // distribute evenly, adding remainder to first product
      newQtys[p.skuKey] = baseShare + (idx === 0 ? (totalPcs - baseShare * productsCount) : 0);
    });

    setMaquilaQtys(newQtys);
  };

  const handlePostBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchNo) return;

    const rowsToPost: BreakdownProduction[] = [];
    
    Object.entries(maquilaQtys).forEach(([skuKey, qty]) => {
      const numQty = Number(qty) || 0;
      if (numQty <= 0) return; // skip empty rows

      const prod = state.products.find(p => p.skuKey === skuKey);
      if (!prod) return;

      rowsToPost.push({
        date,
        sourceBatch: selectedBatchNo,
        model: prod.model,
        color: prod.color,
        size: prod.size,
        skuKey,
        qtyPcs: numQty,
        costPrice: prod.costPrice
      });
    });

    if (rowsToPost.length === 0) {
      alert("Please enter actual pieces for at least one SKU.");
      return;
    }

    onAddBreakdownRows(rowsToPost);
    setMaquilaQtys({});
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Form: Unpacking & Maquila production */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Process Breakdown (tbl_Breakdown)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Unpack supplier bulk cartons and convert them to SKU pieces. Qualified pieces will enter Warehouse active stock. Any remainder between carton capacity and actual qualified items represents Merma.
          </p>

          <form onSubmit={handlePostBreakdown} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Production Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="yellow-input w-full font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Source Batch</label>
                <select
                  value={selectedBatchNo}
                  onChange={(e) => {
                    setSelectedBatchNo(e.target.value);
                    setMaquilaQtys({});
                  }}
                  className="yellow-input w-full font-mono font-bold"
                  required
                >
                  {availableBatches.map(b => (
                    <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedBatchInfo && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-[11px] font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Carton Capacity (A):</span>
                  <span className="font-bold text-primary">{selectedBatchInfo.totalPcsEst} Pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualified Packed (B):</span>
                  <span className="font-bold text-accent">{totalQualifiedCount} Pcs</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-xs">
                  <span className="font-semibold">SLA Yield (Merma):</span>
                  <span className={`font-bold ${estMermaRate > 3.0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {estMermaPcs} pcs ({estMermaRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* SLA Anomaly Alert */}
            {estMermaRate > 3.0 && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 animate-bounce" />
                <span>Yield loss exceeds 3.0% SLA limit. Processing flagged for operational audit.</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Unpacked Pieces per SKU</span>
              <button
                type="button"
                onClick={handleAutoRatioSplit}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-1 px-2.5 rounded flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Auto-Spread
              </button>
            </div>

            {/* List of active SKUs */}
            <div className="border border-slate-200 rounded-lg max-h-[260px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {availableProducts.map(prod => (
                <div key={prod.skuKey} className="p-2.5 flex items-center justify-between gap-2 hover:bg-white transition-colors">
                  <div className="font-mono">
                    <span className="font-bold text-primary text-[11px] block">{prod.skuKey}</span>
                    <span className="text-[10px] text-slate-400">Unit Cost: ${prod.costPrice.toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    value={maquilaQtys[prod.skuKey] || ''}
                    onChange={(e) => handleQtyChange(prod.skuKey, e.target.value)}
                    className="yellow-input w-20 py-1 text-center font-mono font-bold"
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white w-full py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
            >
              <Check className="w-4 h-4" />
              <span>POST BREAKDOWN ROWS</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-1 animate-fade-up">
                <Check className="w-4 h-4" /> Posted breakdown rows to ledger!
              </p>
            )}
          </form>
        </div>

        {/* Right Spreadsheet: tbl_Breakdown historical register */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Breakdown & Production Ledger (tbl_Breakdown)
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
                Formula: Cost_Price = XLOOKUP(SKU_Key, Products)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Source_Batch</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Model</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">SKU_Key</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right">Qty_Pcs</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right font-mono">Cost_Price</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right font-mono bg-slate-50">Total_Asset_Value</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.breakdown.slice().reverse().map((row, idx) => {
                  const absoluteIndex = state.breakdown.length - 1 - idx;
                  return (
                    <tr key={absoluteIndex} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{row.date}</td>
                      <td className="p-3 font-mono font-semibold text-slate-800">{row.sourceBatch}</td>
                      <td className="p-3 text-slate-700">{row.model}</td>
                      <td className="p-3 font-mono font-bold text-primary bg-slate-50/20">{row.skuKey}</td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900">{row.qtyPcs}</td>
                      <td className="p-3 text-right font-mono text-slate-500">${row.costPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-slate-50/30">
                        ${(row.qtyPcs * row.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete breakdown transaction row?`)) {
                              onDeleteBreakdownRow(absoluteIndex);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {state.breakdown.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 italic">Unpacking & Production ledger is empty.</td>
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
