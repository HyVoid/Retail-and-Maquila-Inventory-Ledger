import React, { useState, useMemo } from 'react';
import { LedgerState, TransferLog } from '../types';
import { SkuInventoryRow } from '../utils/inventory';
import { Plus, Check, ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface TransferTabProps {
  state: LedgerState;
  skuRows: SkuInventoryRow[];
  onAddTransfer: (transfer: TransferLog) => void;
}

export default function TransferTab({ state, skuRows, onAddTransfer }: TransferTabProps) {
  // Transfer Form State
  const [date, setDate] = useState('2026-07-01');
  const [selectedSkuKey, setSelectedSkuKey] = useState('');
  const [sourceStore, setSourceStore] = useState('Central Warehouse');
  const [destStore, setDestStore] = useState('Store Alpha');
  const [quantity, setQuantity] = useState<number>(10);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Available SKUs based on models list
  const availableSkus = useMemo(() => {
    return skuRows.map(r => ({
      key: r.skuKey,
      name: `${r.skuKey} (${r.modelName} - ${r.color}, size ${r.size})`
    }));
  }, [skuRows]);

  // Set initial SKU when SKUs load
  React.useEffect(() => {
    if (availableSkus.length > 0 && !selectedSkuKey) {
      setSelectedSkuKey(availableSkus[0].key);
    }
  }, [availableSkus, selectedSkuKey]);

  // Get current stock at source for selected SKU to show in form
  const sourceStockOnHand = useMemo(() => {
    if (!selectedSkuKey) return 0;
    const matched = skuRows.find(r => r.skuKey === selectedSkuKey);
    return matched ? matched.stockByStore[sourceStore] || 0 : 0;
  }, [selectedSkuKey, sourceStore, skuRows]);

  // Handle Submit
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!selectedSkuKey) {
      setFormError('Please select a SKU to transfer.');
      return;
    }

    if (sourceStore === destStore) {
      setFormError('Source location and Destination location must be different.');
      return;
    }

    if (quantity <= 0) {
      setFormError('Transfer quantity must be greater than zero.');
      return;
    }

    // Verify stock availability
    if (quantity > sourceStockOnHand) {
      setFormError(`Insufficient stock! ${sourceStore} only has ${sourceStockOnHand} units of ${selectedSkuKey} available.`);
      return;
    }

    const matchedSku = skuRows.find(r => r.skuKey === selectedSkuKey);
    if (!matchedSku) return;

    const newTransfer: TransferLog = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      date,
      skuKey: selectedSkuKey,
      modelId: matchedSku.modelId,
      color: matchedSku.color,
      size: matchedSku.size,
      source: sourceStore,
      destination: destStore,
      quantity
    };

    onAddTransfer(newTransfer);
    setFormSuccess(true);
    setQuantity(10);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Log Transfer Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)] h-fit">
          <h4 className="text-sm uppercase-label mb-4">DISPATCH STOCK TRANSFER</h4>

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Transfer Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="yellow-input w-full"
                required
              />
            </div>

            {/* Source Location */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">From (Source Store)</label>
              <select
                value={sourceStore}
                onChange={(e) => setSourceStore(e.target.value)}
                className="yellow-input w-full"
                required
              >
                {state.stores.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Destination Location */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">To (Destination Store)</label>
              <select
                value={destStore}
                onChange={(e) => setDestStore(e.target.value)}
                className="yellow-input w-full"
                required
              >
                {state.stores.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* SKU selection */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Select Item SKU</label>
              <select
                value={selectedSkuKey}
                onChange={(e) => setSelectedSkuKey(e.target.value)}
                className="yellow-input w-full font-mono text-xs"
                required
              >
                {availableSkus.map(item => (
                  <option key={item.key} value={item.key}>{item.name}</option>
                ))}
              </select>
            </div>

            {/* Stock on hand helper preview */}
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
              <span className="text-[#888888] font-medium">STOCK ON HAND AT SOURCE:</span>
              <span className={`font-mono font-bold text-sm ${sourceStockOnHand === 0 ? 'text-negative' : 'text-primary'}`}>
                {sourceStockOnHand} pcs
              </span>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Quantity to Transfer</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="yellow-input w-full font-mono font-bold"
                min="1"
                required
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-50 rounded text-xs text-negative flex gap-1.5 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={sourceStockOnHand === 0}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                sourceStockOnHand === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/95 text-white'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>POST STOCK TRANSFER</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-2 animate-fade-up">
                <Check className="w-4 h-4" /> Transfer posted successfully.
              </p>
            )}

          </form>
        </div>

        {/* Right Column: Historical Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <h4 className="text-sm uppercase-label mb-4">STOCK TRANSFER LEDGER</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#051C2C]">
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-20">Log ID</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Date</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">SKU Key</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Source Dispatch</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Destination Inbound</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.06)]">
                {state.transfers.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-[rgba(5,28,44,0.01)] transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{log.id}</td>
                    <td className="py-3 text-[#888888] font-mono">{log.date}</td>
                    <td className="py-3">
                      <div className="font-semibold text-primary font-mono">{log.skuKey}</div>
                      <div className="text-[11px] text-[#888888]">Size {log.size} | {log.color}</div>
                    </td>
                    <td className="py-3 text-primary/80 font-medium">{log.source}</td>
                    <td className="py-3 text-primary/80 font-medium">{log.destination}</td>
                    <td className="py-3 text-right font-mono font-bold text-accent">{log.quantity} pcs</td>
                  </tr>
                ))}
                {state.transfers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#888888] italic">No transfers registered yet.</td>
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
