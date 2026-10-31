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
  ChevronRight,
  Menu,
  X
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

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
    link.download = `retail-and-maquila-inventory-ledger-backup-${dateStr}.json`;
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

  const navTabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Activity, subtitle: 'BI & Growth Review' },
    { id: 'ledger', label: 'Excel Calculation Engines', icon: FileSpreadsheet, subtitle: 'Real-time Math Models' },
    { id: 'arrivals', label: 'Bulk Receiving', icon: Download, subtitle: 'tbl_Receiving' },
    { id: 'maquila', label: 'Breakdown Production', icon: RefreshCw, subtitle: 'tbl_Breakdown' },
    { id: 'transfers', label: 'Warehouse Transfers', icon: ArrowLeftRight, subtitle: 'tbl_Transfers' },
    { id: 'sales', label: 'Store Sales Log', icon: TrendingUp, subtitle: 'tbl_Sales' },
    { id: 'config', label: 'Product Master / Params', icon: Settings, subtitle: 'SKU Specs & Rates' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F2] text-slate-800 selection:bg-accent/20">
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md bg-[var(--brand)] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            TW
          </span>
          <div>
            <span className="font-display text-[16px] font-bold text-[var(--brand)] tracking-tight leading-none block">
              Theseus Workshop
            </span>
            <span className="text-[10px] font-medium text-slate-500 block leading-none mt-0.5">
              Retail and Maquila Inventory Ledger
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:text-[var(--brand)] hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-fadeIn">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-md bg-[var(--brand)] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                  TW
                </span>
                <div>
                  <h2 className="font-display text-[16px] font-bold text-[var(--brand)] tracking-tight leading-none">
                    Theseus Workshop
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Retail and Maquila Inventory Ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </div>
              {navTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand)] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[var(--brand)] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{tab.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {tab.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
              {state.lastSaved && (
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Synced: {state.lastSaved}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={handleExportBackup}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-semibold"
                >
                  <Download className="w-3.5 h-3.5 mb-1 text-slate-500" />
                  <span>Export</span>
                </button>
                <label className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5 mb-1 text-slate-500" />
                  <span>Import</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
                <button
                  onClick={handleResetData}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5 mb-1 text-red-600" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shrink-0">
              TW
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-[18px] font-bold text-[var(--brand)] tracking-tight leading-none truncate">
                Theseus Workshop
              </h1>
              <p className="text-[11px] font-semibold text-slate-600 truncate mt-1">
                Retail and Maquila Inventory Ledger
              </p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-[var(--muted)] leading-tight">
            Multi-Store Inventory & Maquila Breakdown Engine
          </div>
        </div>

        {/* Sidebar Vertical Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ledger Modules
          </div>
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[var(--brand)] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[var(--brand)] hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[var(--accent)]' : 'text-slate-400 group-hover:text-[var(--brand)]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{tab.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {tab.subtitle}
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Persistence & Quick Actions Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          
          {/* Storage Sync Indicator */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Persistence</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Browser LocalStorage
              </span>
            </div>
            {state.lastSaved && (
              <div className="mt-1 text-[10px] text-slate-400 truncate">
                Last saved: <span className="font-mono text-slate-600 font-semibold">{state.lastSaved}</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer group"
              title="Export complete JSON backup file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-[var(--accent)] mb-1" />
              <span>Export</span>
            </button>

            {/* Import Backup */}
            <label
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer group"
              title="Import and restore from JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 group-hover:text-[var(--accent)] mb-1" />
              <span>Import</span>
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
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-700 text-[10px] font-semibold transition-colors cursor-pointer"
              title="Wipe and reset to initial demo data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-600 mb-1" />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          
          {/* Dynamic Module Header & Breadcrumb */}
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

            <div className="text-right text-[10px] text-slate-400 font-mono select-none hidden lg:block bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              App State: <span className="text-primary font-bold">Client Event-Ledger</span> | Standard: <span className="text-primary font-bold">Excel-Compatible Formulas</span>
            </div>
          </div>

          {/* Tab View Container */}
          <div className="min-h-[400px]">
            {renderActiveTab()}
          </div>

        </main>

        {/* Global Footer */}
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-[12px] text-slate-500 select-none mt-auto">
          <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-left text-[11px] text-slate-500">
              All data in this tool is stored in your browser's localStorage. The page itself does not retain any user data.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="font-semibold text-slate-600">Theseus Workshop</span>
              <span>&bull;</span>
              <span>Retail and Maquila Inventory Ledger</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
