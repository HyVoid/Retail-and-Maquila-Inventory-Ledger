import React, { useState } from 'react';
import { LedgerState, BulkReceiving } from '../types';
import { Plus, Trash2, Download, HelpCircle } from 'lucide-react';

interface BulkInTabProps {
  state: LedgerState;
  onAddReceiving: (receiving: BulkReceiving) => void;
  onDeleteReceiving: (receivingId: string) => void;
}

export default function BulkInTab({ state, onAddReceiving, onDeleteReceiving }: BulkInTabProps) {
  // Form state
  const [date, setDate] = useState('2026-07-01');
  const [batchNo, setBatchNo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [boxQty, setBoxQty] = useState<number>(10);
  const [pcsPerBox, setPcsPerBox] = useState<number>(50);

  const handleExportCSV = () => {
    if (state.receiving.length === 0) {
      alert("No receiving logs available to export.");
      return;
    }
    const headers = ["Receiving_ID", "Date", "Batch_No", "Supplier", "Box_Qty", "Pcs_Per_Box", "Total_Pcs_Est"];
    const csvRows = [
      headers.join(","),
      ...state.receiving.map(row => [
        `"${row.receivingId}"`,
        `"${row.date}"`,
        `"${row.batchNo}"`,
        `"${row.supplier.replace(/"/g, '""')}"`,
        row.boxQty,
        row.pcsPerBox,
        row.totalPcsEst
      ].join(","))
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tbl_receiving_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batchNo.trim().toUpperCase();
    const supp = supplier.trim() || "Generic Supplier";
    if (!batch) {
      alert("Please provide a valid Batch Number.");
      return;
    }

    if (state.receiving.some(r => r.batchNo === batch)) {
      alert("Batch Number already exists in records. Please use a unique Batch No.");
      return;
    }

    const receivingId = `REC-${Date.now().toString().slice(-3)}`;
    const totalPcsEst = boxQty * pcsPerBox;

    const newRec: BulkReceiving = {
      receivingId,
      date,
      batchNo: batch,
      supplier: supp,
      boxQty,
      pcsPerBox,
      totalPcsEst
    };

    onAddReceiving(newRec);
    setBatchNo('');
    setSupplier('');
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Add Bulk Arrival Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4 text-accent" />
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Register Bulk Cargo (tbl_Receiving)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Enter physical box counts from suppliers. This ledger registers bulk carton quantities before they are broken down and processed into individual color-size clothing pieces.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Arrival Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="yellow-input w-full font-medium"
                required
              />
            </div>

            {/* Batch No */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Batch Number (Unique Key)</label>
              <input
                type="text"
                placeholder="e.g., BATCH-MD01-A2"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="yellow-input w-full font-mono font-bold uppercase"
                required
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase tracking-wider block">Supplier Name</label>
              <input
                type="text"
                placeholder="e.g., Atlantic Textiles"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="yellow-input w-full font-semibold"
                required
              />
            </div>

            {/* Grid for Box Qty and Pcs/Box */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Box Qty</label>
                <input
                  type="number"
                  value={boxQty}
                  onChange={(e) => setBoxQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="yellow-input w-full font-mono font-bold"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold uppercase tracking-wider block">Pcs per Box</label>
                <input
                  type="number"
                  value={pcsPerBox}
                  onChange={(e) => setPcsPerBox(Math.max(1, parseInt(e.target.value) || 0))}
                  className="yellow-input w-full font-mono font-bold"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Computed pieces estimation preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Auto-Formula Preview (pcs):</span>
              <span className="font-bold text-accent text-sm">
                {(boxQty * pcsPerBox).toLocaleString()} Pcs
              </span>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white w-full py-2.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>POST RECEIVING RECORD</span>
            </button>
          </form>
        </div>

        {/* Right column: Arrivals spreadsheet */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="font-display text-base font-bold text-primary uppercase tracking-tight">
              Bulk Cargo Receiving Ledger (tbl_Receiving)
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
                Formula: Total_Pcs_Est = [@Box_Qty] * [@Pcs_Per_Box]
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Receiving_ID</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Date</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider font-mono">Batch_No</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider">Supplier</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right">Box_Qty</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right">Pcs_Per_Box</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-right bg-slate-50 font-mono">Total_Pcs_Est</th>
                  <th className="p-3 text-primary font-bold uppercase tracking-wider text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {state.receiving.map(row => (
                  <tr key={row.receivingId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{row.receivingId}</td>
                    <td className="p-3 text-slate-500 font-mono">{row.date}</td>
                    <td className="p-3 font-mono font-semibold text-slate-800 bg-slate-50/20">{row.batchNo}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.supplier}</td>
                    <td className="p-3 text-right font-mono text-slate-600">{row.boxQty}</td>
                    <td className="p-3 text-right font-mono text-slate-600">{row.pcsPerBox}</td>
                    <td className="p-3 text-right font-mono font-bold text-accent bg-slate-50/30">
                      {(row.boxQty * row.pcsPerBox).toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete record ${row.receivingId}?`)) {
                            onDeleteReceiving(row.receivingId);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {state.receiving.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 italic">No cargo receiving logs registered yet.</td>
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
