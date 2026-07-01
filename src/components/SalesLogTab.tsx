import React, { useState, useMemo } from 'react';
import { LedgerState, SalesLog } from '../types';
import { SkuInventoryRow } from '../utils/inventory';
import { Plus, Check, TrendingUp, AlertTriangle } from 'lucide-react';

interface SalesLogTabProps {
  state: LedgerState;
  skuRows: SkuInventoryRow[];
  onAddSale: (sale: SalesLog) => void;
}

export default function SalesLogTab({ state, skuRows, onAddSale }: SalesLogTabProps) {
  // Sales Form State
  const [date, setDate] = useState('2026-07-01');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedSkuKey, setSelectedSkuKey] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Initialize store selections
  React.useEffect(() => {
    // Select the first retail store (index 1 or above)
    const retailStores = state.stores.filter(s => s !== "Central Warehouse");
    if (retailStores.length > 0 && !selectedStore) {
      setSelectedStore(retailStores[0]);
    }
  }, [state.stores, selectedStore]);

  // Available SKUs based on selected store
  const skuListForStore = useMemo(() => {
    return skuRows.map(r => ({
      key: r.skuKey,
      name: `${r.skuKey} (${r.modelName} - ${r.color}, size ${r.size})`,
      unitPrice: r.unitPrice,
      modelId: r.modelId,
      color: r.color,
      size: r.size,
      stockAtStore: r.stockByStore[selectedStore] || 0
    }));
  }, [skuRows, selectedStore]);

  // Set initial SKU when store SKUs load
  React.useEffect(() => {
    if (skuListForStore.length > 0 && !selectedSkuKey) {
      setSelectedSkuKey(skuListForStore[0].key);
    }
  }, [skuListForStore, selectedSkuKey]);

  // Selected SKU details
  const selectedSkuDetails = useMemo(() => {
    return skuListForStore.find(item => item.key === selectedSkuKey);
  }, [selectedSkuKey, skuListForStore]);

  // Calculations for preview
  const previewGrossPrice = selectedSkuDetails ? selectedSkuDetails.unitPrice : 0;
  const previewGrossAmount = previewGrossPrice * quantity;
  const previewDiscountAmount = (previewGrossAmount * discount) / 100;
  const previewTotalAmount = previewGrossAmount - previewDiscountAmount;
  const stockOnHand = selectedSkuDetails ? selectedSkuDetails.stockAtStore : 0;

  // Handle sales registration
  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!selectedStore) {
      setFormError('Please select a store.');
      return;
    }
    if (!selectedSkuKey) {
      setFormError('Please select a SKU.');
      return;
    }
    if (quantity <= 0) {
      setFormError('Sales quantity must be greater than zero.');
      return;
    }

    // Verify stock availability
    if (quantity > stockOnHand) {
      setFormError(`Insufficient stock! ${selectedStore} only has ${stockOnHand} units of ${selectedSkuKey} available.`);
      return;
    }

    if (!selectedSkuDetails) return;

    const newSale: SalesLog = {
      id: `SL-${Date.now().toString().slice(-4)}`,
      date,
      store: selectedStore,
      skuKey: selectedSkuKey,
      modelId: selectedSkuDetails.modelId,
      color: selectedSkuDetails.color,
      size: selectedSkuDetails.size,
      quantity,
      unitPrice: previewGrossPrice,
      discount,
      totalAmount: previewTotalAmount
    };

    onAddSale(newSale);
    setFormSuccess(true);
    setQuantity(1);
    setDiscount(0);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register Retail Sale Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)] h-fit">
          <h4 className="text-sm uppercase-label mb-4">POST RETAIL TRANSACTION</h4>

          <form onSubmit={handleSalesSubmit} className="space-y-4">
            
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Sale Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="yellow-input w-full"
                required
              />
            </div>

            {/* Store (excluding central warehouse) */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Store Location</label>
              <select
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  setSelectedSkuKey(''); // Reset selected SKU when store changes
                }}
                className="yellow-input w-full"
                required
              >
                {state.stores.filter(s => s !== "Central Warehouse").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Item SKU selection */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Select Item SKU</label>
              <select
                value={selectedSkuKey}
                onChange={(e) => setSelectedSkuKey(e.target.value)}
                className="yellow-input w-full font-mono text-xs"
                required
              >
                {skuListForStore.map(item => (
                  <option key={item.key} value={item.key}>
                    {item.name} - Stock: {item.stockAtStore}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock count preview */}
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
              <span className="text-[#888888] font-medium">AVAILABLE AT SELECTED STORE:</span>
              <span className={`font-mono font-bold text-sm ${stockOnHand === 0 ? 'text-negative' : 'text-primary'}`}>
                {stockOnHand} pcs
              </span>
            </div>

            {/* Sales parameters: Qty and Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Quantity Sold</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="yellow-input w-full font-mono font-bold"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="yellow-input w-full font-mono"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            {/* Price Calculations Preview Card */}
            <div className="p-4 bg-slate-50 border border-[rgba(5,28,44,0.06)] rounded-lg text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[#888888]">
                <span>Base Retail Price:</span>
                <span className="text-primary font-bold">${previewGrossPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#888888]">
                <span>Gross Subtotal:</span>
                <span className="text-primary">${previewGrossAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#888888]">
                  <span>Discount ({discount}%):</span>
                  <span className="text-negative">-${previewDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-1.5 border-t border-[rgba(5,28,44,0.08)] font-semibold">
                <span className="text-primary">NET SALES TOTAL:</span>
                <span className="text-accent font-bold">${previewTotalAmount.toFixed(2)}</span>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 rounded text-xs text-negative flex gap-1.5 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={stockOnHand === 0}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                stockOnHand === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/95 text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>POST RETAIL SALE</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-2 animate-fade-up">
                <Check className="w-4 h-4" /> Retail sale logged successfully.
              </p>
            )}

          </form>
        </div>

        {/* Right Column: Historical Sales Logs list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <h4 className="text-sm uppercase-label mb-4">RETAIL TRANSACTIONS REGISTER</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#051C2C]">
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-20">Sale ID</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Date</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-28">Retail Store</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">SKU Key</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-16">Qty</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Base Price</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Disc (%)</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-24">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.06)]">
                {state.sales.slice().reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-[rgba(5,28,44,0.01)] transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{sale.id}</td>
                    <td className="py-3 text-[#888888] font-mono">{sale.date}</td>
                    <td className="py-3 text-primary/80 font-medium">{sale.store}</td>
                    <td className="py-3">
                      <div className="font-semibold text-primary font-mono">{sale.skuKey}</div>
                      <div className="text-[11px] text-[#888888]">{sale.color} \ Size {sale.size}</div>
                    </td>
                    <td className="py-3 text-right font-mono text-primary font-semibold">{sale.quantity}</td>
                    <td className="py-3 text-right font-mono text-[#888888]">${sale.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono">
                      {sale.discount > 0 ? (
                        <span className="text-negative font-semibold">{sale.discount}%</span>
                      ) : (
                        <span className="text-[#888888]">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-primary font-bold">
                      ${sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {state.sales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#888888] italic">No sales transactions logged yet.</td>
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
