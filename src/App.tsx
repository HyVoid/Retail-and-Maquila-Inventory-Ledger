import React, { useState, useEffect, useMemo } from 'react';
import {
  LedgerState,
  ProductMaster,
  BulkReceiving,
  BreakdownProduction,
  WasteMerma,
  WarehouseTransfer,
  StoreSales,
  INITIAL_STORES,
  INITIAL_WASTE_TYPES,
  INITIAL_PRODUCTS,
  INITIAL_RECEIVING,
  INITIAL_BREAKDOWN,
  INITIAL_MERMA,
  INITIAL_TRANSFERS,
  INITIAL_SALES
} from './types';
import { calculateCombinedInventory } from './utils/inventory';

// Import Tab Components
import DashboardTab from './components/DashboardTab';
import ConfigTab from './components/ConfigTab';
import BulkInTab from './components/BulkInTab';
import BreakMaqTab from './components/BreakMaqTab';
import TransferTab from './components/TransferTab';
import SalesLogTab from './components/SalesLogTab';
import StockCalcTab from './components/StockCalcTab';

// Import Icons
import {
  Activity,
  Sliders,
  Package,
  ArrowLeftRight,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'multi_store_retail_maquila_state_v2';

export default function App() {
  // Master Ledger State
  const [state, setState] = useState<LedgerState>({
    params: {
      stores: INITIAL_STORES,
      wasteTypes: INITIAL_WASTE_TYPES
    },
    products: INITIAL_PRODUCTS,
    receiving: INITIAL_RECEIVING,
    breakdown: INITIAL_BREAKDOWN,
    merma: INITIAL_MERMA,
    transfers: INITIAL_TRANSFERS,
    sales: INITIAL_SALES,
    lastSaved: ''
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Trigger loading from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.params && parsed.products && parsed.receiving) {
          setState(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing cached inventory ledger state.', e);
      }
    }
    // Default initial mock load
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const initialState: LedgerState = {
      params: {
        stores: INITIAL_STORES,
        wasteTypes: INITIAL_WASTE_TYPES
      },
      products: INITIAL_PRODUCTS,
      receiving: INITIAL_RECEIVING,
      breakdown: INITIAL_BREAKDOWN,
      merma: INITIAL_MERMA,
      transfers: INITIAL_TRANSFERS,
      sales: INITIAL_SALES,
      lastSaved: formatted
    };
    setState(initialState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialState));
  }, []);

  // Sync / Auto-save updates helper
  const updateStateAndSave = (updater: (prev: LedgerState) => LedgerState) => {
    setState(prev => {
      const updated = updater(prev);
      const now = new Date();
      updated.lastSaved = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Params callbacks
  const handleAddStore = (storeName: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      params: { ...prev.params, stores: [...prev.params.stores, storeName] }
    }));
  };

  const handleAddWasteType = (wasteType: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      params: { ...prev.params, wasteTypes: [...prev.params.wasteTypes, wasteType] }
    }));
  };

  // 2. Product Master callbacks
  const handleAddProduct = (prod: ProductMaster) => {
    updateStateAndSave(prev => ({
      ...prev,
      products: [...prev.products, prod]
    }));
  };

  const handleDeleteProduct = (skuKey: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      products: prev.products.filter(p => p.skuKey !== skuKey)
    }));
  };

  const handleUpdateProductCost = (skuKey: string, newCost: number) => {
    updateStateAndSave(prev => {
      const updatedProducts = prev.products.map(p =>
        p.skuKey === skuKey ? { ...p, costPrice: newCost } : p
      );
      // recalculate all breakdown and merma row values reflecting the new XLOOKUP cost
      const updatedBreakdown = prev.breakdown.map(b =>
        b.skuKey === skuKey ? { ...b, costPrice: newCost } : b
      );
      const updatedMerma = prev.merma.map(m =>
        m.skuKey === skuKey ? { ...m, lossValue: m.qtyPcs * newCost } : m
      );

      return {
        ...prev,
        products: updatedProducts,
        breakdown: updatedBreakdown,
        merma: updatedMerma
      };
    });
  };

  // 3. Receiving callbacks
  const handleAddReceiving = (rec: BulkReceiving) => {
    updateStateAndSave(prev => ({
      ...prev,
      receiving: [...prev.receiving, rec]
    }));
  };

  const handleDeleteReceiving = (id: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      receiving: prev.receiving.filter(r => r.receivingId !== id)
    }));
  };

  // 4. Breakdown & Production callbacks
  const handleAddBreakdownRows = (rows: BreakdownProduction[]) => {
    updateStateAndSave(prev => ({
      ...prev,
      breakdown: [...prev.breakdown, ...rows]
    }));
  };

  const handleDeleteBreakdownRow = (index: number) => {
    updateStateAndSave(prev => ({
      ...prev,
      breakdown: prev.breakdown.filter((_, i) => i !== index)
    }));
  };

  // 5. Merma callbacks
  const handleAddMerma = (m: WasteMerma) => {
    updateStateAndSave(prev => ({
      ...prev,
      merma: [...prev.merma, m]
    }));
  };

  const handleDeleteMerma = (index: number) => {
    updateStateAndSave(prev => ({
      ...prev,
      merma: prev.merma.filter((_, i) => i !== index)
    }));
  };

  // 6. Transfer callbacks
  const handleAddTransfer = (tr: WarehouseTransfer) => {
    updateStateAndSave(prev => ({
      ...prev,
      transfers: [...prev.transfers, tr]
    }));
  };

  const handleDeleteTransfer = (id: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      transfers: prev.transfers.filter(t => t.transferId !== id)
    }));
  };

  // 7. Sales callbacks
  const handleAddSale = (s: StoreSales) => {
    updateStateAndSave(prev => ({
      ...prev,
      sales: [...prev.sales, s]
    }));
  };

  const handleDeleteSale = (id: string) => {
    updateStateAndSave(prev => ({
      ...prev,
      sales: prev.sales.filter(s => s.salesId !== id)
    }));
  };

  // Export state backup file
  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    link.href = url;
    link.download = `supply-chain-ledger-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import state backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Basic schema verification
        if (parsed.params && parsed.products && parsed.receiving) {
          const now = new Date();
          parsed.lastSaved = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setState(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          alert('Ledger Backup spreadsheet imported successfully!');
        } else {
          alert('Error: Selected file is not a valid ledger backup schema.');
        }
      } catch (err) {
        alert('Error: Failed to parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Wipe data and reset to original initial mock template
  const handleResetData = () => {
    if (window.confirm('Wipe ledger databases and reset to default templates? All your logs will be restored.')) {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const resetState: LedgerState = {
        params: {
          stores: INITIAL_STORES,
          wasteTypes: INITIAL_WASTE_TYPES
        },
        products: INITIAL_PRODUCTS,
        receiving: INITIAL_RECEIVING,
        breakdown: INITIAL_BREAKDOWN,
        merma: INITIAL_MERMA,
        transfers: INITIAL_TRANSFERS,
        sales: INITIAL_SALES,
        lastSaved: formatted
      };
      setState(resetState);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetState));
    }
  };

  // Calculations derived from transaction list
  const skuInventory = useMemo(() => {
    return calculateCombinedInventory(state);
  }, [state]);

  // Tab Switching Anim Helper
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab state={state} skuInventory={skuInventory} />;
      case 'ledger':
        return <StockCalcTab state={state} onAddMerma={handleAddMerma} onDeleteMerma={handleDeleteMerma} />;
      case 'arrivals':
        return <BulkInTab state={state} onAddReceiving={handleAddReceiving} onDeleteReceiving={handleDeleteReceiving} />;
      case 'maquila':
        return <BreakMaqTab state={state} onAddBreakdownRows={handleAddBreakdownRows} onDeleteBreakdownRow={handleDeleteBreakdownRow} />;
      case 'transfers':
        return <TransferTab state={state} skuInventory={skuInventory} onAddTransfer={handleAddTransfer} onDeleteTransfer={handleDeleteTransfer} />;
      case 'sales':
        return <SalesLogTab state={state} skuInventory={skuInventory} onAddSale={handleAddSale} onDeleteSale={handleDeleteSale} />;
      case 'config':
        return (
          <ConfigTab
            state={state}
            onAddStore={handleAddStore}
            onAddWasteType={handleAddWasteType}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductCost={handleUpdateProductCost}
          />
        );
      default:
        return <DashboardTab state={state} skuInventory={skuInventory} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F2] text-slate-800 selection:bg-accent/20">
      
      {/* Horizontal Sticky Top Nav Bar */}
      <header className="sticky top-0 z-40 h-[56px] bg-white border-b border-slate-200 shadow-sm px-6 flex items-center justify-between">
        
        {/* Left Side: Brand Identity */}
        <div className="flex items-center gap-2">
          <div className="brand font-display text-[18px] font-black text-primary tracking-tight flex items-center gap-1.5 uppercase">
            <span className="p-1 bg-primary text-white rounded font-mono text-xs">RM</span>
            <span>Retail and Maquila Inventory Ledger</span>
          </div>
          <span className="text-xs text-[#888888] font-mono border-l border-slate-200 pl-3 hidden lg:inline">
            Event-Driven Inventory Engine
          </span>
        </div>

        {/* Center: Tabs Switcher */}
        <nav className="hidden md:flex items-center gap-6 h-full">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
            { id: 'ledger', label: 'Excel Calculation Engines', icon: FileSpreadsheet },
            { id: 'arrivals', label: 'Bulk Receiving', icon: Download },
            { id: 'maquila', label: 'Breakdown Production', icon: RefreshCw },
            { id: 'transfers', label: 'Warehouse Transfers', icon: ArrowLeftRight },
            { id: 'sales', label: 'Store Sales Log', icon: TrendingUp },
            { id: 'config', label: 'Product Master / Params', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full flex items-center gap-2 border-b-2 text-xs font-bold tracking-wide transition-all cursor-pointer relative ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-500 hover:text-primary'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Saved Status, Import/Export/Reset buttons */}
        <div className="flex items-center gap-4 text-xs">
          {/* Last Saved Pill */}
          {state.lastSaved && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span>Synced: {state.lastSaved}</span>
            </div>
          )}

          {/* Action Operations */}
          <div className="flex items-center gap-1.5">
            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-primary transition-colors cursor-pointer"
              title="Export Local Backup JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import Backup */}
            <label
              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-primary transition-colors cursor-pointer inline-block"
              title="Import Backup JSON file"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            {/* Reset Data */}
            <button
              onClick={handleResetData}
              className="p-1.5 hover:bg-slate-100 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Wipe and Reset to Default Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Nav Helper bar */}
      <div className="md:hidden sticky top-[56px] z-30 bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto flex gap-2 shadow-sm">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'ledger', label: 'Engines' },
          { id: 'arrivals', label: 'Receiving' },
          { id: 'maquila', label: 'Breakdown' },
          { id: 'transfers', label: 'Transfers' },
          { id: 'sales', label: 'Sales' },
          { id: 'config', label: 'Master' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Dynamic header title based on Tab */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 select-none">
              <span>Retail and Maquila Inventory Ledger</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500">
                {activeTab === 'dashboard' && "Executive BI Screen"}
                {activeTab === 'ledger' && "Computation Engines"}
                {activeTab === 'arrivals' && "Receiving Logs"}
                {activeTab === 'maquila' && "Breakdown & Production logs"}
                {activeTab === 'transfers' && "Warehouse Dispatch"}
                {activeTab === 'sales' && "POS Terminal Logs"}
                {activeTab === 'config' && "Model Master Config"}
              </span>
            </div>
            <h2 className="font-display text-[26px] font-black tracking-tight text-primary leading-none">
              {activeTab === 'dashboard' && "Executive Decision Center Dashboard"}
              {activeTab === 'ledger' && "Dynamic Excel Inventory Engines"}
              {activeTab === 'arrivals' && "Bulk Cargo Cargo Receiving (tbl_Receiving)"}
              {activeTab === 'maquila' && "Breakdown & Packaging Production (tbl_Breakdown)"}
              {activeTab === 'transfers' && "Inter-Store Logistics Dispatch (tbl_Transfers)"}
              {activeTab === 'sales' && "Store Retail Sales Ledger (tbl_Sales)"}
              {activeTab === 'config' && "Baseline Parameters & SKU Master (tbl_Products)"}
            </h2>
          </div>

          <div className="text-right text-[10px] text-slate-400 font-mono select-none hidden lg:block bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
            App State: <span className="text-primary font-bold">Client Event-Ledger</span> | Standard: <span className="text-primary font-bold">Excel-Compatible Formulas</span>
          </div>
        </div>

        {/* Tab View Container */}
        <div className="min-h-[400px]">
          {renderActiveTab()}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400 select-none">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
          <span>&copy; 2026 Retail Inventory Control & Maquila Logistics Panel. Excel-Driven Architecture.</span>
          <span className="font-mono bg-slate-50 px-2.5 py-1 border border-slate-200 rounded text-slate-500">
            System Sandbox v4.1 (React + Tailwind)
          </span>
        </div>
      </footer>

    </div>
  );
}
