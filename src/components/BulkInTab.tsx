import React, { useState, useMemo } from 'react';
import { LedgerState, BulkArrival, MaquilaBatch, ModelConfig } from '../types';
import { Plus, Check, Play, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface BulkInTabProps {
  state: LedgerState;
  onAddArrival: (arrival: BulkArrival) => void;
  onProcessMaquila: (batch: MaquilaBatch) => void;
}

export default function BulkInTab({ state, onAddArrival, onProcessMaquila }: BulkInTabProps) {
  // Add Arrival Form state
  const [date, setDate] = useState('2026-07-01');
  const [selectedModelId, setSelectedModelId] = useState(state.models[0]?.id || '');
  const [brand, setBrand] = useState('');
  const [costPerBox, setCostPerBox] = useState<number>(1200);
  const [boxQty, setBoxQty] = useState<number>(2);
  const [pcsPerBox, setPcsPerBox] = useState<number>(100);

  const [formSuccess, setFormSuccess] = useState(false);

  // Maquila active batch state
  const [activeProcessingArrival, setActiveProcessingArrival] = useState<BulkArrival | null>(null);
  const [maquilaBreakdown, setMaquilaBreakdown] = useState<{ [skuKey: string]: number }>({});
  const [maquilaDate, setMaquilaDate] = useState('2026-07-01');

  // Calculate sum of pieces in active processing Maquila
  const activeBulkPieces = activeProcessingArrival?.totalPieces || 0;
  
  const activeQualifiedPieces = useMemo(() => {
    return Object.values(maquilaBreakdown).reduce((sum: number, v: number) => sum + (v || 0), 0);
  }, [maquilaBreakdown]);

  const activeMermaPieces = Math.max(0, activeBulkPieces - activeQualifiedPieces);
  const activeMermaRate = activeBulkPieces > 0 ? (activeMermaPieces / activeBulkPieces) * 100 : 0;

  // Handle Form Submission for new Arrival
  const handleAddArrivalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId) return;

    const totalPieces = boxQty * pcsPerBox;
    const newArrival: BulkArrival = {
      id: `BA-${Date.now().toString().slice(-4)}`,
      date,
      modelId: selectedModelId,
      brand: brand.trim() || 'Generic Brand',
      costPerBox,
      boxQty,
      pcsPerBox,
      totalPieces,
      status: 'Pending'
    };

    onAddArrival(newArrival);
    setBrand('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  // Open Maquila breakdown modal
  const handleOpenMaquila = (arrival: BulkArrival) => {
    const model = state.models.find(m => m.id === arrival.modelId);
    if (!model) return;

    setActiveProcessingArrival(arrival);
    setMaquilaDate('2026-07-01');

    // Initialize blank counts
    const initialBreakdown: { [skuKey: string]: number } = {};
    const colors = Object.keys(model.colorDistribution);
    const sizes = Object.keys(model.sizeDistribution);
    colors.forEach(col => {
      sizes.forEach(sz => {
        initialBreakdown[`${model.id}-${col}-${sz}`] = 0;
      });
    });
    setMaquilaBreakdown(initialBreakdown);
  };

  // Trigger auto-calculate breakdown based on pre-set ratios
  const handleAutoCalculateRatios = () => {
    if (!activeProcessingArrival) return;
    const model = state.models.find(m => m.id === activeProcessingArrival.modelId);
    if (!model) return;

    const totalPcs = activeProcessingArrival.totalPieces;
    const colors = Object.entries(model.colorDistribution);
    const sizes = Object.entries(model.sizeDistribution);

    const newBreakdown: { [skuKey: string]: number } = {};
    
    let distributedSum = 0;

    colors.forEach(([col, colRatio]) => {
      sizes.forEach(([sz, szRatio]) => {
        const skuKey = `${model.id}-${col}-${sz}`;
        // multiply ratios
        const calculated = Math.round(totalPcs * colRatio * szRatio);
        newBreakdown[skuKey] = calculated;
        distributedSum += calculated;
      });
    });

    // Handle rounding offset to ensure sum <= totalPcs
    if (distributedSum > totalPcs) {
      // Find maximum item and subtract difference
      const keys = Object.keys(newBreakdown);
      const diff = distributedSum - totalPcs;
      if (keys.length > 0) {
        newBreakdown[keys[0]] = Math.max(0, newBreakdown[keys[0]] - diff);
      }
    }

    setMaquilaBreakdown(newBreakdown);
  };

  // Handle single SKU input quantity change
  const handleSkuQtyChange = (skuKey: string, val: string) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setMaquilaBreakdown(prev => ({
      ...prev,
      [skuKey]: qty
    }));
  };

  // Submit processed Maquila batch
  const handlePostMaquilaSubmit = () => {
    if (!activeProcessingArrival) return;

    if (activeQualifiedPieces > activeBulkPieces) {
      alert("Error: Qualified piece count cannot exceed the incoming bulk boxes total pieces. Please adjust breakdown values.");
      return;
    }

    const newBatch: MaquilaBatch = {
      id: `MQ-${Date.now().toString().slice(-4)}`,
      arrivalId: activeProcessingArrival.id,
      date: maquilaDate,
      modelId: activeProcessingArrival.modelId,
      bulkPieces: activeBulkPieces,
      qualifiedPieces: activeQualifiedPieces,
      mermaPieces: activeMermaPieces,
      mermaRate: activeMermaRate / 100,
      breakdown: maquilaBreakdown
    };

    onProcessMaquila(newBatch);
    setActiveProcessingArrival(null);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Add Bulk Arrival Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)] h-fit">
          <h4 className="text-sm uppercase-label mb-4">REGISTER BULK ARRIVAL</h4>
          
          <form onSubmit={handleAddArrivalSubmit} className="space-y-4">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Arrival Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="yellow-input w-full"
                required
              />
            </div>

            {/* Model Select */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Model ID</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="yellow-input w-full"
                required
              >
                {state.models.map(m => (
                  <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Brand/Supplier</label>
              <input
                type="text"
                placeholder="e.g. Silk Crafts"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="yellow-input w-full"
              />
            </div>

            {/* Cost Per Box */}
            <div className="space-y-1">
              <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Cost per Box ($)</label>
              <input
                type="number"
                value={costPerBox}
                onChange={(e) => setCostPerBox(parseFloat(e.target.value) || 0)}
                className="yellow-input w-full font-mono"
                required
              />
            </div>

            {/* Grid for Quantities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Box Qty</label>
                <input
                  type="number"
                  value={boxQty}
                  onChange={(e) => setBoxQty(parseInt(e.target.value) || 0)}
                  className="yellow-input w-full font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#888888] font-medium uppercase tracking-wider block">Pcs per Box</label>
                <input
                  type="number"
                  value={pcsPerBox}
                  onChange={(e) => setPcsPerBox(parseInt(e.target.value) || 0)}
                  className="yellow-input w-full font-mono"
                  required
                />
              </div>
            </div>

            {/* Computed Pieces preview */}
            <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
              <span className="text-[#888888] font-medium">TOTAL EXPECTED PIECES:</span>
              <span className="font-mono font-bold text-primary text-sm">{(boxQty * pcsPerBox).toLocaleString()} pcs</span>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white w-full py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>LOG BULK ARRIVAL</span>
            </button>

            {formSuccess && (
              <p className="text-xs text-positive font-medium flex items-center gap-1 justify-center mt-2 animate-fade-up">
                <Check className="w-4 h-4" /> Bulk arrival added as 'Pending'.
              </p>
            )}
          </form>
        </div>

        {/* Right column: Arrivals list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <h4 className="text-sm uppercase-label mb-4">BULK BOX ARRIVALS REGISTER</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#051C2C]">
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-20">ID</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Date</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Model Detail</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Boxes</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Total Pcs</th>
                  <th className="py-2.5 text-center uppercase font-semibold text-[11px] text-primary w-24">Status</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.06)]">
                {state.arrivals.map((arr) => {
                  const model = state.models.find(m => m.id === arr.modelId);
                  return (
                    <tr key={arr.id} className="hover:bg-[rgba(5,28,44,0.01)] transition-colors">
                      <td className="py-3 font-mono font-bold text-primary">{arr.id}</td>
                      <td className="py-3 text-[#888888] font-mono">{arr.date}</td>
                      <td className="py-3">
                        <div className="font-semibold text-primary">{arr.modelId}</div>
                        <div className="text-[11px] text-[#888888]">{model ? model.name : 'Unknown Model'}</div>
                      </td>
                      <td className="py-3 text-right font-mono text-primary">{arr.boxQty} <span className="text-[#888888] text-[10px]">bxs</span></td>
                      <td className="py-3 text-right font-mono font-bold text-primary">{arr.totalPieces.toLocaleString()} <span className="text-[#888888] font-normal text-[10px]">pcs</span></td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                          arr.status === 'Processed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-100 text-accent'
                        }`}>
                          {arr.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {arr.status === 'Pending' ? (
                          <button
                            onClick={() => handleOpenMaquila(arr)}
                            className="bg-accent hover:bg-accent/90 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Break Pack</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#888888] italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Maquila Breakdown Modal Panel */}
      {activeProcessingArrival && (
        <div className="fixed inset-0 z-50 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-up">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">MAQUILA BREAKDOWN & PACKING LEDGER</h3>
                <p className="text-xs text-white/70">
                  Processing Batch for Arrival: <span className="font-mono font-bold text-white">{activeProcessingArrival.id}</span> | Model: <span className="font-bold text-white">{activeProcessingArrival.modelId}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveProcessingArrival(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Batch details summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-[rgba(5,28,44,0.06)] text-xs">
                <div>
                  <span className="text-[#888888] uppercase block">Processing Date</span>
                  <input
                    type="date"
                    value={maquilaDate}
                    onChange={(e) => setMaquilaDate(e.target.value)}
                    className="yellow-input py-1 w-full mt-1"
                  />
                </div>
                <div>
                  <span className="text-[#888888] uppercase block">Total Bulk Box Pieces</span>
                  <div className="font-mono font-bold text-sm text-primary mt-1.5">{activeBulkPieces} pcs</div>
                </div>
                <div>
                  <span className="text-[#888888] uppercase block">Qualified Pieces Packed</span>
                  <div className="font-mono font-bold text-sm text-accent mt-1.5">
                    {activeQualifiedPieces} / {activeBulkPieces} pcs
                  </div>
                </div>
                <div className={activeMermaRate > 3.0 ? 'text-negative font-semibold' : ''}>
                  <span className="text-[#888888] uppercase block">Processing Waste (Merma)</span>
                  <div className="font-mono font-bold text-sm mt-1.5 flex items-center gap-1.5">
                    <span>{activeMermaPieces} pcs ({activeMermaRate.toFixed(1)}%)</span>
                    {activeMermaRate > 3.0 && <AlertTriangle className="w-4 h-4 shrink-0 text-negative" />}
                  </div>
                </div>
              </div>

              {/* SLA Threshold warning */}
              {activeMermaRate > 3.0 && (
                <div className="anomaly-block flex gap-2.5 items-center">
                  <AlertTriangle className="w-5 h-5 text-negative shrink-0" />
                  <p className="text-xs text-negative font-medium">
                    Warning: Merma waste exceeds 3% threshold limit. Sells are flagged with an anomaly rating in reports. Check SKU counts for audit integrity.
                  </p>
                </div>
              )}

              {/* Grid instructions and Auto-calculator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">ENTER ACTUAL SKU COUNTS PACKED</span>
                <button
                  type="button"
                  onClick={handleAutoCalculateRatios}
                  className="bg-accent/10 hover:bg-accent/15 text-accent border border-accent/20 px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>AUTO-BREAK FROM MODEL RATIOS</span>
                </button>
              </div>

              {/* Sku entry matrix */}
              <div className="border border-[rgba(5,28,44,0.06)] rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-100 text-[10px] uppercase font-bold text-primary p-2 text-center border-b border-[rgba(5,28,44,0.1)]">
                  <div className="col-span-4 text-left">SKU Detail</div>
                  <div className="col-span-4 text-center">Color Ratio Template</div>
                  <div className="col-span-4 text-center">Actual Piece Count Packed</div>
                </div>
                <div className="divide-y divide-[rgba(5,28,44,0.06)]">
                  {Object.keys(maquilaBreakdown).map(skuKey => {
                    const parts = skuKey.split('-');
                    const color = parts[1];
                    const size = parts[2];
                    return (
                      <div key={skuKey} className="grid grid-cols-12 p-2 items-center text-xs text-center hover:bg-slate-50/50">
                        <div className="col-span-4 text-left">
                          <span className="font-bold text-primary font-mono">{skuKey}</span>
                          <span className="text-[11px] text-[#888888] ml-2">({color} \ size {size})</span>
                        </div>
                        <div className="col-span-4 font-mono text-[#888888]">
                          Dynamic proportioned output
                        </div>
                        <div className="col-span-4 flex justify-center">
                          <input
                            type="number"
                            value={maquilaBreakdown[skuKey] || ''}
                            onChange={(e) => handleSkuQtyChange(skuKey, e.target.value)}
                            className="yellow-input w-28 text-center py-1 font-mono text-xs font-bold"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-[rgba(5,28,44,0.06)] flex justify-between items-center">
              <span className="text-xs text-[#888888]">
                * Posting will add pieces to Central Warehouse inventory.
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveProcessingArrival(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-primary border border-[rgba(5,28,44,0.12)] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePostMaquilaSubmit}
                  disabled={activeQualifiedPieces > activeBulkPieces}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeQualifiedPieces > activeBulkPieces
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-accent hover:bg-accent/90 text-white shadow-sm'
                  }`}
                >
                  Confirm & Post Ledger
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
