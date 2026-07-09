import React, { useState, useMemo } from 'react';
import { LedgerState, WasteMerma, ProductMaster } from '../types';
import {
  calculateWHInventory,
  calculateStoreInventory,
  WHInventoryRow,
  StoreInventoryRow
} from '../utils/inventory';
import { Layers, HelpCircle, FileSpreadsheet, Plus, Trash2, ShieldAlert, Download } from 'lucide-react';

interface StockCalcTabProps {
  state: LedgerState;
  onAddMerma: (merma: WasteMerma) => void;
  onDeleteMerma: (index: number) => void;
}

export default function StockCalcTab({ state, onAddMerma, onDeleteMerma }: StockCalcTabProps) {
  // Excel Tab mimicking sheets
  const [activeSheet, setActiveSheet] = useState<'wh_engine' | 'store_engine' | 'tbl_merma'>('wh_engine');
  
  // Selected cell mimicking Excel highlight
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string; formula: string; val: string } | null>(null);

  // Waste form states
  const [mermaDate, setMermaDate] = useState('2026-07-01');
  const [mermaLocation, setMermaLocation] = useState('Warehouse');
  const [mermaSku, setMermaSku] = useState('');
  const [mermaQty, setMermaQty] = useState<number>(5);
  const [mermaType, setMermaType] = useState('Maquila Defect');

  const handleExportMermaCSV = () => {
    if (state.merma.length === 0) {
      alert("No waste records available to export.");
      return;
    }
    const headers = ["Date", "Location", "SKU_Key", "Qty_Pcs", "Waste_Type", "Loss_Value"];
    const csvRows = [
      headers.join(","),
      ...state.merma.map(row => [
        `"${row.date}"`,
        `"${row.location}"`,
        `"${row.skuKey}"`,
        row.qtyPcs,
        `"${row.wasteType}"`,
        row.lossValue
      ].join(","))
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tbl_merma_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Set initial state values
  React.useEffect(() => {
    if (state.params.stores.length > 0 && !mermaLocation) {
      setMermaLocation(state.params.stores[0]);
    }
  }, [state.params.stores, mermaLocation]);

  React.useEffect(() => {
    if (state.products.length > 0 && !mermaSku) {
      setMermaSku(state.products[0].skuKey);
    }
  }, [state.products, mermaSku]);

  React.useEffect(() => {
    if (state.params.wasteTypes.length > 0 && !mermaType) {
      setMermaType(state.params.wasteTypes[0]);
    }
  }, [state.params.wasteTypes, mermaType]);

  // Engines recalculation
  const whRows = useMemo(() => calculateWHInventory(state), [state]);
  const storeRows = useMemo(() => calculateStoreInventory(state), [state]);
  const retailStores = useMemo(() => state.params.stores.filter(s => s !== "Warehouse"), [state.params.stores]);

  // Waste posting handler
  const handlePostMerma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mermaSku) return;

    const prod = state.products.find(p => p.skuKey === mermaSku);
    if (!prod) return;

    const lossValue = mermaQty * prod.costPrice;

    const newMerma: WasteMerma = {
      date: mermaDate,
      location: mermaLocation,
      skuKey: mermaSku,
      qtyPcs: mermaQty,
      wasteType: mermaType,
      lossValue
    };

    onAddMerma(newMerma);
    setMermaQty(5);
    alert("Merma loss posted to ledger!");
  };

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* Excel Sheet Navigation Bar */}
      <div className="flex bg-slate-200/60 p-1 rounded-t-xl gap-1 items-center border border-slate-300">
        <button
          onClick={() => {
            setActiveSheet('wh_engine');
            setSelectedCell(null);
          }}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-t transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSheet === 'wh_engine'
              ? 'bg-white text-primary border-t-2 border-t-accent font-semibold'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>WH Inventory Engine</span>
        </button>
        <button
          onClick={() => {
            setActiveSheet('store_engine');
            setSelectedCell(null);
          }}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-t transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSheet === 'store_engine'
              ? 'bg-white text-primary border-t-2 border-t-accent font-semibold'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Store Inventory Engine (2D Matrix)</span>
        </button>
        <button
          onClick={() => {
            setActiveSheet('tbl_merma');
            setSelectedCell(null);
          }}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-t transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSheet === 'tbl_merma'
              ? 'bg-white text-primary border-t-2 border-t-accent font-semibold'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>Waste Register (tbl_Merma)</span>
        </button>

        <span className="text-[10px] text-[#666666] font-mono ml-auto mr-3 hidden sm:inline select-none">
          ⭐ Click cells to inspect actual Excel formulas in Formula Bar
        </span>
      </div>

      {/* Excel Style Formula Bar */}
      <div className="flex bg-[#F3F2F1] border-x border-b border-slate-300 p-2 items-center gap-2 font-mono text-[11px] text-slate-700 shadow-sm rounded-b-lg">
        <div className="bg-white border border-slate-300 px-3 py-1 font-bold text-center w-20 uppercase text-slate-500 rounded select-none">
          {selectedCell ? selectedCell.row + selectedCell.col : "A1"}
        </div>
        <div className="font-sans font-bold text-[#8c8c8c] italic text-xs select-none">fx</div>
        <div className="bg-white border border-slate-300 px-3 py-1 flex-1 font-semibold rounded text-slate-800 flex items-center h-7 select-all">
          {selectedCell ? selectedCell.formula : activeSheet === 'wh_engine' ? "=UNIQUE(tbl_Products[SKU_Key])" : activeSheet === 'store_engine' ? "=TRANSPOSE(FILTER(tbl_Params[Store_Name], Store_Name<>\"Warehouse\"))" : "=tbl_Merma"}
        </div>
        {selectedCell && (
          <div className="bg-accent/10 text-accent px-2.5 py-1 rounded font-bold text-[10px]">
            Value: {selectedCell.val}
          </div>
        )}
      </div>

      {/* Main calculation sheet area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        
        {/* SHEET 1: WH Inventory Engine */}
        {activeSheet === 'wh_engine' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-sm font-bold text-primary uppercase tracking-tight">
                  WH Inventory Engine Worksheet
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates real-time central warehouse stock levels across all SKU keys by applying physical balance logic.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#F3F2F1] text-slate-700 border-b border-slate-300 text-[10px] uppercase font-bold select-none">
                    <th className="p-2 border-r border-slate-200 text-center w-8">Row</th>
                    <th className="p-2.5 border-r border-slate-200">SKU_Key (Col A)</th>
                    <th className="p-2.5 border-r border-slate-200">Model (Col B)</th>
                    <th className="p-2.5 border-r border-slate-200">Color (Col C)</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">Size (Col D)</th>
                    <th className="p-2.5 border-r border-slate-200 text-right bg-blue-50/50">In_Production (Col E)</th>
                    <th className="p-2.5 border-r border-slate-200 text-right bg-amber-50/30">Out_Transfers (Col F)</th>
                    <th className="p-2.5 border-r border-slate-200 text-right bg-red-50/30">Out_WH_Merma (Col G)</th>
                    <th className="p-2.5 text-right bg-[#E1F5FE] text-primary font-bold">Current_WH_Stock (Col H)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {whRows.map((row, index) => {
                    const rNum = index + 2;
                    return (
                      <tr key={row.skuKey} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2 border-r border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-400 select-none">{rNum}</td>
                        
                        {/* Col A */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `A`, col: `${rNum}`,
                            formula: `=UNIQUE(tbl_Products[SKU_Key])`, val: row.skuKey
                          })}
                          className={`p-2.5 border-r border-slate-200 font-mono font-bold text-primary cursor-pointer transition-all ${selectedCell?.row === 'A' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.skuKey}
                        </td>

                        {/* Col B */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `B`, col: `${rNum}`,
                            formula: `=XLOOKUP(A${rNum}#, tbl_Products[SKU_Key], tbl_Products[Model], "")`, val: row.model
                          })}
                          className={`p-2.5 border-r border-slate-200 font-semibold text-slate-700 cursor-pointer transition-all ${selectedCell?.row === 'B' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.model}
                        </td>

                        {/* Col C */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `C`, col: `${rNum}`,
                            formula: `=XLOOKUP(A${rNum}#, tbl_Products[SKU_Key], tbl_Products[Color], "")`, val: row.color
                          })}
                          className={`p-2.5 border-r border-slate-200 text-slate-600 cursor-pointer transition-all ${selectedCell?.row === 'C' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.color}
                        </td>

                        {/* Col D */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `D`, col: `${rNum}`,
                            formula: `=XLOOKUP(A${rNum}#, tbl_Products[SKU_Key], tbl_Products[Size], "")`, val: row.size
                          })}
                          className={`p-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-400 cursor-pointer transition-all ${selectedCell?.row === 'D' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.size}
                        </td>

                        {/* Col E */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `E`, col: `${rNum}`,
                            formula: `=SUMIFS(tbl_Breakdown[Qty_Pcs], tbl_Breakdown[SKU_Key], A${rNum})`, val: `${row.inProduction}`
                          })}
                          className={`p-2.5 border-r border-slate-200 text-right font-mono font-semibold bg-blue-50/20 text-slate-800 cursor-pointer transition-all ${selectedCell?.row === 'E' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.inProduction} <span className="text-[9px] text-slate-400">pcs</span>
                        </td>

                        {/* Col F */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `F`, col: `${rNum}`,
                            formula: `=SUMIFS(tbl_Transfers[Qty_Pcs], tbl_Transfers[SKU_Key], A${rNum}, tbl_Transfers[Source_Loc], "Warehouse")`, val: `${row.outTransfers}`
                          })}
                          className={`p-2.5 border-r border-slate-200 text-right font-mono font-semibold bg-amber-50/10 text-slate-800 cursor-pointer transition-all ${selectedCell?.row === 'F' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.outTransfers} <span className="text-[9px] text-slate-400">pcs</span>
                        </td>

                        {/* Col G */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `G`, col: `${rNum}`,
                            formula: `=SUMIFS(tbl_Merma[Qty_Pcs], tbl_Merma[SKU_Key], A${rNum}, tbl_Merma[Location], "Warehouse")`, val: `${row.outWHMerma}`
                          })}
                          className={`p-2.5 border-r border-slate-200 text-right font-mono font-semibold bg-red-50/10 text-red-700 cursor-pointer transition-all ${selectedCell?.row === 'G' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.outWHMerma} <span className="text-[9px] text-slate-400">pcs</span>
                        </td>

                        {/* Col H */}
                        <td
                          onClick={() => setSelectedCell({
                            row: `H`, col: `${rNum}`,
                            formula: `=E${rNum} - F${rNum} - G${rNum}`, val: `${row.currentWHStock}`
                          })}
                          className={`p-2.5 text-right font-mono font-bold bg-[#E1F5FE]/40 cursor-pointer transition-all ${row.currentWHStock < 0 ? 'text-red-600 bg-red-50/80 font-black' : 'text-slate-900'} ${selectedCell?.row === 'H' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.currentWHStock} <span className="text-[9px] text-slate-400">pcs</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SHEET 2: Store Inventory Engine */}
        {activeSheet === 'store_engine' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-sm font-bold text-primary uppercase tracking-tight">
                  Store Inventory Engine Matrix Sheet
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated 2D dimensional intersection. Multi-store inventory level updates instantaneously using sum/difference formulas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#F3F2F1] text-slate-700 border-b border-slate-300 text-[10px] uppercase font-bold select-none">
                    <th className="p-2 border-r border-slate-200 text-center w-8">Row</th>
                    <th className="p-2.5 border-r border-slate-200 font-mono">SKU / Stores (Col A)</th>
                    {retailStores.map((store, sIndex) => {
                      const colLetter = String.fromCharCode(66 + sIndex); // B, C, D...
                      return (
                        <th key={store} className="p-2.5 border-r border-slate-200 text-center bg-slate-100 font-mono">
                          {store} ({colLetter}1)
                        </th>
                      );
                    })}
                    <th className="p-2.5 text-right font-bold bg-[#E8F5E9] text-[#1B5E20]">Total Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {storeRows.map((row, index) => {
                    const rNum = index + 2;
                    return (
                      <tr key={row.skuKey} className="hover:bg-slate-50/70 transition-colors">
                        {/* Row Index */}
                        <td className="p-2 border-r border-slate-200 bg-slate-50 text-center font-mono font-bold text-slate-400 select-none">{rNum}</td>
                        
                        {/* Col A */}
                        <td
                          onClick={() => setSelectedCell({
                            row: 'A', col: `${rNum}`,
                            formula: '=UNIQUE(tbl_Products[SKU_Key])', val: row.skuKey
                          })}
                          className={`p-2.5 border-r border-slate-200 font-mono font-bold text-slate-900 cursor-pointer ${selectedCell?.row === 'A' && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                        >
                          {row.skuKey}
                        </td>

                        {/* Stores Cols */}
                        {retailStores.map((store, sIndex) => {
                          const colLetter = String.fromCharCode(66 + sIndex);
                          const storeStock = row.stockByStore[store] || 0;
                          return (
                            <td
                              key={store}
                              onClick={() => setSelectedCell({
                                row: colLetter, col: `${rNum}`,
                                formula: `=SUMIFS(tbl_Transfers[Qty_Pcs], tbl_Transfers[SKU_Key], A${rNum}, tbl_Transfers[Dest_Store], ${colLetter}$1) - SUMIFS(tbl_Sales[Qty_Pcs], tbl_Sales[SKU_Key], A${rNum}, tbl_Sales[Store_Name], ${colLetter}$1) - SUMIFS(tbl_Merma[Qty_Pcs], tbl_Merma[SKU_Key], A${rNum}, tbl_Merma[Location], ${colLetter}$1)`,
                                val: `${storeStock}`
                              })}
                              className={`p-2.5 border-r border-slate-200 text-center font-mono font-bold cursor-pointer transition-all ${
                                storeStock === 0
                                  ? 'text-slate-400 font-normal bg-slate-50/50'
                                  : storeStock < 0
                                  ? 'text-red-600 bg-red-50/70 font-black'
                                  : 'text-accent bg-blue-50/10'
                              } ${selectedCell?.row === colLetter && selectedCell?.col === String(rNum) ? 'bg-[#107c41]/10 ring-1 ring-[#107c41]' : ''}`}
                            >
                              {storeStock} <span className="text-[9px] font-normal text-slate-400">pcs</span>
                            </td>
                          );
                        })}

                        {/* Sum Row */}
                        <td className="p-2.5 text-right font-mono font-bold bg-[#E8F5E9]/20 text-emerald-800">
                          {row.totalStoresStock} pcs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SHEET 3: tbl_merma Waste Register */}
        {activeSheet === 'tbl_merma' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Write off Form */}
              <div className="lg:col-span-1 border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <h4 className="text-xs uppercase tracking-wider font-bold text-red-700">Add supply-loss (Merma) Row</h4>
                </div>

                <form onSubmit={handlePostMerma} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold uppercase tracking-wider block">Occurrence Date</label>
                    <input
                      type="date"
                      value={mermaDate}
                      onChange={(e) => setMermaDate(e.target.value)}
                      className="yellow-input w-full font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold uppercase tracking-wider block">Discovered Location</label>
                    <select
                      value={mermaLocation}
                      onChange={(e) => setMermaLocation(e.target.value)}
                      className="yellow-input w-full font-semibold"
                      required
                    >
                      {state.params.stores.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold uppercase tracking-wider block">SKU Key</label>
                    <select
                      value={mermaSku}
                      onChange={(e) => setMermaSku(e.target.value)}
                      className="yellow-input w-full font-mono font-bold"
                      required
                    >
                      {state.products.map(p => (
                        <option key={p.skuKey} value={p.skuKey}>{p.skuKey}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold uppercase tracking-wider block">Qty Pieces</label>
                      <input
                        type="number"
                        value={mermaQty}
                        onChange={(e) => setMermaQty(Math.max(1, parseInt(e.target.value) || 0))}
                        className="yellow-input w-full font-mono font-bold"
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold uppercase tracking-wider block">Waste Reason</label>
                      <select
                        value={mermaType}
                        onChange={(e) => setMermaType(e.target.value)}
                        className="yellow-input w-full font-semibold"
                        required
                      >
                        {state.params.wasteTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white w-full py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    <span>POST MERMA DECREMENT</span>
                  </button>
                </form>
              </div>

              {/* tbl_Merma list */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="font-display text-base font-bold text-red-700 uppercase tracking-tight">
                    Loss and Defect Log (tbl_Merma)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportMermaCSV}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-red-600" />
                      <span>Export CSV</span>
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                      Formula: Loss_Value = [@Qty_Pcs] * Cost_Price
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[360px] overflow-y-auto shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-red-50 text-red-900 shadow-sm border-b border-red-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 font-bold uppercase tracking-wider">Date</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Location</th>
                        <th className="p-3 font-bold uppercase tracking-wider font-mono">SKU_Key</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right">Qty_Pcs</th>
                        <th className="p-3 font-bold uppercase tracking-wider">Waste_Type</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-right font-mono bg-red-100/50">Loss_Value</th>
                        <th className="p-3 font-bold uppercase tracking-wider text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 bg-white">
                      {state.merma.slice().reverse().map((row, idx) => {
                        const absoluteIndex = state.merma.length - 1 - idx;
                        return (
                          <tr key={absoluteIndex} className="hover:bg-red-50/30 transition-colors">
                            <td className="p-3 font-mono text-slate-500">{row.date}</td>
                            <td className="p-3 font-semibold text-slate-700">{row.location}</td>
                            <td className="p-3 font-mono font-bold text-primary bg-slate-50/20">{row.skuKey}</td>
                            <td className="p-3 text-right font-mono font-bold text-red-600">{row.qtyPcs}</td>
                            <td className="p-3 font-medium text-slate-600">{row.wasteType}</td>
                            <td className="p-3 text-right font-mono font-bold text-red-800 bg-red-50/40">
                              ${row.lossValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete loss log row?`)) {
                                    onDeleteMerma(absoluteIndex);
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
                      {state.merma.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 italic">No supply-loss rows recorded in tbl_Merma.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
