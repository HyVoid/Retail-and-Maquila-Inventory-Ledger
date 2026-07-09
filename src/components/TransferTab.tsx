import React, { useState, useMemo } from 'react';
import { LedgerState, WarehouseTransfer } from '../types';
import { CombinedInventoryRow } from '../utils/inventory';
import { Plus, Trash2, ArrowLeftRight, HelpCircle, Check, Download } from 'lucide-react';

interface TransferTabProps {
  state: LedgerState;
  skuInventory: CombinedInventoryRow[];
  onAddTransfer: (transfer: WarehouseTransfer) => void;
  onDeleteTransfer: (transferId: string) => void;
}

export default function TransferTab({ state, skuInventory, onAddTransfer, onDeleteTransfer }: TransferTabProps) {
  // Form State
  const [date, setDate] = useState('2026-07-01');
  const [destStore, setDestStore] = useState('');
  const [selectedSkuKey, setSelectedSkuKey] = useState('');
  const [qtyPcs, setQtyPcs] = useState<number>(10);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleExportCSV = () => {
    if (state.transfers.length === 0) {
      alert("No transfers available to export.");
      return;
    }
    const headers = ["Transfer_ID", "Date", "Source_Loc", "Dest_Store", "SKU_Key", "Qty_Pcs"];
    const csvRows = [
      headers.join(","),
      ...state.transfers.map(row => [
        `"${row.transferId}"`,
        `"${row.date}"`,
        `"${row.sourceLoc}"`,
        `"${row.destStore}"`,
        `"${row.skuKey}"`,
        row.qtyPcs
      ].join(","))
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tbl_transfers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter retail stores for destination
  const retailStores = useMemo(() => {
    return state.params.stores.filter(s => s !== "Warehouse");
  }, [state.params.stores]);

  // Set initial store
  React.useEffect(() => {
    if (retailStores.length > 0 && !destStore) {
      setDestStore(retailStores[0]);
    }
  }, [retailStores, destStore]);

  // Set initial SKU
  React.useEffect(() => {
    if (state.products.length > 0 && !selectedSkuKey) {
      setSelectedSkuKey(state.products[0].skuKey);
    }
  }, [state.products, selectedSkuKey]);

  // Fetch current stock on hand at source Warehouse to show in form
  const warehouseStockOnHand = useMemo(() => {
    const matched = skuInventory.find(item => item.skuKey === selectedSkuKey);
    return matched ? matched.whStock : 0;
  }, [selectedSkuKey, skuInventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkuKey) return;
    if (!destStore) {
      alert("Please configure a retail destination store first.");
      return;
    }

    if (qtyPcs > warehouseStockOnHand) {
      const proceed = window.confirm(
        `Warning (Section 7.2): Warehouse stock has only ${warehouseStockOnHand} units of ${selectedSkuKey}. Posting this will result in a negative stock count on calculations. Do you want to proceed for ledger consistency?`
      );
      if (!proceed) return;
    }

    const transferId = `TR-${Date.now().toString().slice(-3)}`;
    const newTransfer: WarehouseTransfer = {
      transferId,
      date,
      sourceLoc: "Warehouse",
      destStore,
      skuKey: selectedSkuKey,
      qtyPcs
    };

    onAddTransfer(newTransfer);
    setFormSuccess(true);
    setQtyPcs(10);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register Transfer Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit text-xs space-y-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Post Transfer (tbl_Transfers)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Log cargo transportations dispatching from Warehouse to other stores. Under the Law of Conservation of Stock, quantities will be subtracted from Warehouse and added to the selected retail destination.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transfer Date */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Transfer Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="yellow-input w-full font-medium"
                required
              />
            </div>

            {/* Source Store */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Source Store (Fixed)</label>
              <input
                type="text"
                value="Warehouse"
                className="yellow-input w-full font-bold bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed text-center"
                disabled
              />
            </div>

            {/* Retail store destination */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Destination Retail Store</label>
              <select
                value={destStore}
                onChange={(e) => setDestStore(e.target.value)}
                className="yellow-input w-full font-semibold"
                required
              >
                {retailStores.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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

            {/* Available stock at source preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Stock at Warehouse:</span>
              <span className={`font-bold ${warehouseStockOnHand === 0 ? 'text-red-500' : 'text-primary'}`}>
                {warehouseStockOnHand} Pcs
              </span>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Quantity to Transfer</label>
              <input
                type="number"
                value={qtyPcs}
                onChange={(e) => setQtyPcs(Math.max(1, parseInt(e.target.value) || 0))}
                className="yellow-input w-full font-mono font-bold"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white w-full py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>LOG LOGISTICS TRANSFER</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-1 animate-fade-up">
                <Check className="w-4 h-4" /> Transfer posted to ledger!
              </p>
            )}
          </form>
        </div>

        {/* Right Spreadsheet: Transfers Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Warehouse Transfers Registry (tbl_Transfers)
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
                Rule: Warehouse subtracts, Dest_Store adds
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Transfer_ID</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Source_Loc</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Dest_Store</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">SKU_Key</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right">Qty_Pcs</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.transfers.slice().reverse().map(row => (
                  <tr key={row.transferId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{row.transferId}</td>
                    <td className="p-3 text-slate-500 font-mono">{row.date}</td>
                    <td className="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 text-center">{row.sourceLoc}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.destStore}</td>
                    <td className="p-3 font-mono font-bold text-primary bg-slate-50/20">{row.skuKey}</td>
                    <td className="p-3 text-right font-mono font-bold text-accent">{row.qtyPcs}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete transfer log ${row.transferId}?`)) {
                            onDeleteTransfer(row.transferId);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {state.transfers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 italic">No transfers registered in the ledger yet.</td>
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
