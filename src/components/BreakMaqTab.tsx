import React, { useState } from 'react';
import { LedgerState, MaquilaBatch } from '../types';
import { AlertTriangle, Eye, X, HelpCircle, Package } from 'lucide-react';

interface BreakMaqTabProps {
  state: LedgerState;
}

export default function BreakMaqTab({ state }: BreakMaqTabProps) {
  const [selectedBatch, setSelectedBatch] = useState<MaquilaBatch | null>(null);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of processed batches */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm uppercase-label">PROCESSED MAQUILA BATCHES</h4>
            <span className="text-[11px] text-[#888888] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              SLA Threshold: 3.0% Merma Rate
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#051C2C]">
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-20">Batch ID</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary w-24">Date</th>
                  <th className="py-2.5 uppercase font-semibold text-[11px] text-primary">Model</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Bulk Pcs</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Good Pcs</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Merma</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-20">Rate (%)</th>
                  <th className="py-2.5 text-right uppercase font-semibold text-[11px] text-primary w-16">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(5,28,44,0.06)]">
                {state.maquilaBatches.map((batch) => {
                  const model = state.models.find(m => m.id === batch.modelId);
                  const isAnomaly = batch.mermaRate > 0.03; // > 3% Merma Rate
                  
                  return (
                    <tr
                      key={batch.id}
                      className={`hover:bg-[rgba(5,28,44,0.015)] transition-colors ${
                        isAnomaly ? 'bg-[rgba(211,47,47,0.02)]' : ''
                      }`}
                    >
                      <td className="py-3 font-mono font-bold text-primary">{batch.id}</td>
                      <td className="py-3 text-[#888888] font-mono">{batch.date}</td>
                      <td className="py-3">
                        <div className="font-semibold text-primary">{batch.modelId}</div>
                        <div className="text-[11px] text-[#888888]">{model ? model.name : 'Unknown Model'}</div>
                      </td>
                      <td className="py-3 text-right font-mono text-[#888888]">{batch.bulkPieces}</td>
                      <td className="py-3 text-right font-mono text-primary font-medium">{batch.qualifiedPieces}</td>
                      <td className={`py-3 text-right font-mono font-medium ${isAnomaly ? 'text-negative' : 'text-primary'}`}>
                        {batch.mermaPieces}
                      </td>
                      <td className="py-3 text-right font-mono">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                          isAnomaly 
                            ? 'bg-red-100 text-negative' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {(batch.mermaRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className="p-1 hover:bg-slate-100 rounded text-accent transition-colors cursor-pointer inline-flex items-center"
                          title="View packing breakdown details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed Breakdown View */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-[rgba(5,28,44,0.06)] h-fit">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm uppercase-label">DETAILED PACKED QUANTITIES</h4>
            {selectedBatch && (
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-[#888888] hover:text-primary p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedBatch ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-[rgba(5,28,44,0.06)]">
                <div className="flex justify-between text-xs text-[#888888]">
                  <span>Batch Code:</span>
                  <span className="font-mono font-bold text-primary">{selectedBatch.id}</span>
                </div>
                <div className="flex justify-between text-xs text-[#888888]">
                  <span>Processed Date:</span>
                  <span className="font-mono text-primary">{selectedBatch.date}</span>
                </div>
                <div className="flex justify-between text-xs text-[#888888]">
                  <span>Model ID:</span>
                  <span className="font-mono text-primary font-bold">{selectedBatch.modelId}</span>
                </div>
              </div>

              {selectedBatch.mermaRate > 0.03 && (
                <div className="anomaly-block flex gap-2 items-center text-xs">
                  <AlertTriangle className="w-4 h-4 text-negative shrink-0" />
                  <span className="text-negative font-medium">Excess waste batch audited. Watch margin controls closely.</span>
                </div>
              )}

              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block">SKU breakdown values</span>
              
              <div className="divide-y divide-[rgba(5,28,44,0.06)] border border-[rgba(5,28,44,0.06)] rounded-lg overflow-hidden bg-slate-50">
                {Object.entries(selectedBatch.breakdown).map(([skuKey, qty]) => (
                  <div key={skuKey} className="px-3 py-2 flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-primary">{skuKey}</span>
                    <span className="text-primary font-bold bg-white border px-2 py-0.5 rounded text-right min-w-[36px]">{qty} pcs</span>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-[#888888] space-y-2">
              <Package className="w-8 h-8 mx-auto text-primary/10" />
              <p className="text-xs">Select any batch in the table to view its detailed color-size SKU packing distribution.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
