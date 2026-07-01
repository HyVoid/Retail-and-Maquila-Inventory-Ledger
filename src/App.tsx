import React, { useState, useEffect, useMemo } from 'react';
import {
  LedgerState,
  ModelConfig,
  BulkArrival,
  MaquilaBatch,
  TransferLog,
  SalesLog,
  INITIAL_STORES,
  INITIAL_MODELS,
  INITIAL_ARRIVALS,
  INITIAL_MAQUILA_BATCHES,
  INITIAL_TRANSFERS,
  INITIAL_SALES
} from './types';
import { calculateSkuInventory, calculateStorePerformance } from './utils/inventory';

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
  Layers,
  Activity,
  Sliders,
  Package,
  ArrowLeftRight,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Settings,
  HelpCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'multi_store_retail_maquila_state';

export default function App() {
  // Master Ledger State
  const [state, setState] = useState<LedgerState>({
    stores: INITIAL_STORES,
    models: INITIAL_MODELS,
    arrivals: INITIAL_ARRIVALS,
    maquilaBatches: INITIAL_MAQUILA_BATCHES,
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
        if (parsed.stores && parsed.models && parsed.arrivals) {
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
      stores: INITIAL_STORES,
      models: INITIAL_MODELS,
      arrivals: INITIAL_ARRIVALS,
      maquilaBatches: INITIAL_MAQUILA_BATCHES,
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

  // Master State Callbacks
  const handleModelsChange = (newModels: ModelConfig[]) => {
    updateStateAndSave(prev => ({ ...prev, models: newModels }));
  };

  const handleAddStore = (storeName: string) => {
    updateStateAndSave(prev => ({ ...prev, stores: [...prev.stores, storeName] }));
  };

  const handleAddArrival = (arrival: BulkArrival) => {
    updateStateAndSave(prev => ({ ...prev, arrivals: [...prev.arrivals, arrival] }));
  };

  const handleProcessMaquila = (batch: MaquilaBatch) => {
    updateStateAndSave(prev => {
      // 1. Add processed batch
      const updatedBatches = [...prev.maquilaBatches, batch];
      
      // 2. Mark corresponding arrival as processed
      const updatedArrivals = prev.arrivals.map(arr => {
        if (arr.id === batch.arrivalId) {
          return { ...arr, status: 'Processed' as const };
        }
        return arr;
      });

      return {
        ...prev,
        maquilaBatches: updatedBatches,
        arrivals: updatedArrivals
      };
    });
  };

  const handleAddTransfer = (transfer: TransferLog) => {
    updateStateAndSave(prev => ({ ...prev, transfers: [...prev.transfers, transfer] }));
  };

  const handleAddSale = (sale: SalesLog) => {
    updateStateAndSave(prev => ({ ...prev, sales: [...prev.sales, sale] }));
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
    link.download = `inventory-ledger-backup-${dateStr}.json`;
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
        if (parsed.stores && parsed.models && parsed.arrivals && parsed.maquilaBatches) {
          const now = new Date();
          parsed.lastSaved = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setState(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          alert('Backup imported successfully! All records and ledgers have been updated.');
        } else {
          alert('Error: Selected file is not a valid ledger backup schema.');
        }
      } catch (err) {
        alert('Error: Failed to parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
    // clear input
    e.target.value = '';
  };

  // Wipe data and reset to original initial mock template
  const handleResetData = () => {
    if (window.confirm('Are you absolutely sure you want to reset all inventory records, sales, and transfers back to default demo templates? This cannot be undone.')) {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const resetState: LedgerState = {
        stores: INITIAL_STORES,
        models: INITIAL_MODELS,
        arrivals: INITIAL_ARRIVALS,
        maquilaBatches: INITIAL_MAQUILA_BATCHES,
        transfers: INITIAL_TRANSFERS,
        sales: INITIAL_SALES,
        lastSaved: formatted
      };
      setState(resetState);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetState));
    }
  };

  // Calculations derived from transaction lists
  const skuInventoryRows = useMemo(() => {
    return calculateSkuInventory(state);
  }, [state]);

  const storePerformanceRows = useMemo(() => {
    return calculateStorePerformance(state);
  }, [state]);

  // Tab Switching Anim Helper
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab state={state} skuRows={skuInventoryRows} storePerformance={storePerformanceRows} />;
      case 'config':
        return <ConfigTab state={state} onChangeModels={handleModelsChange} onAddStore={handleAddStore} />;
      case 'arrivals':
        return <BulkInTab state={state} onAddArrival={handleAddArrival} onProcessMaquila={handleProcessMaquila} />;
      case 'maquila':
        return <BreakMaqTab state={state} />;
      case 'transfers':
        return <TransferTab state={state} skuRows={skuInventoryRows} onAddTransfer={handleAddTransfer} />;
      case 'sales':
        return <SalesLogTab state={state} skuRows={skuInventoryRows} onAddSale={handleAddSale} />;
      case 'ledger':
        return <StockCalcTab state={state} skuRows={skuInventoryRows} />;
      default:
        return <DashboardTab state={state} skuRows={skuInventoryRows} storePerformance={storePerformanceRows} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-custom text-body-text selection:bg-accent/20">
      
      {/* Horizonal Sticky Top Nav Bar (56px) */}
      <header className="sticky top-0 z-40 h-[56px] bg-white border-b border-[var(--nav-border)] shadow-nav px-8 flex items-center justify-between">
        
        {/* Left Side: Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-sm tracking-tight text-primary uppercase leading-tight">
              RETAIL & MAQUILA
            </h1>
            <span className="text-[10px] text-[#888888] uppercase tracking-widest block font-bold">
              INVENTORY LEDGER
            </span>
          </div>
        </div>

        {/* Center: Tabs Switcher */}
        <nav className="hidden md:flex items-center h-full">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
            { id: 'ledger', label: 'Stock Ledger', icon: Package },
            { id: 'arrivals', label: 'Arrivals', icon: Download },
            { id: 'maquila', label: 'Maquila', icon: RefreshCw },
            { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
            { id: 'sales', label: 'Retail Sales', icon: TrendingUp },
            { id: 'config', label: 'Config Parameters', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full px-4 flex items-center gap-1.5 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
                  isActive
                    ? 'border-accent text-accent bg-blue-50/20'
                    : 'border-transparent text-primary/75 hover:text-primary hover:bg-slate-50/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-[#888888]'}`} />
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
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 text-primary/80 border border-slate-200/50 px-2.5 py-1 rounded-full text-[11px] font-medium select-none">
              <Clock className="w-3.5 h-3.5 text-[#888888]" />
              <span>Last saved: {state.lastSaved}</span>
            </div>
          )}

          {/* Action Operations */}
          <div className="flex items-center gap-2">
            {/* Export Backup */}
            <button
              onClick={handleExportBackup}
              className="p-1.5 hover:bg-slate-100 rounded text-primary hover:text-accent transition-colors cursor-pointer"
              title="Export Local Backup JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import Backup */}
            <label
              className="p-1.5 hover:bg-slate-100 rounded text-primary hover:text-accent transition-colors cursor-pointer inline-block"
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
              className="p-1.5 hover:bg-slate-100 rounded text-negative hover:bg-red-50 transition-colors cursor-pointer"
              title="Wipe and Reset to Default Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Nav Helper bar */}
      <div className="md:hidden sticky top-[56px] z-30 bg-white border-b border-[var(--nav-border)] px-4 py-2 overflow-x-auto flex gap-2">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'ledger', label: 'Ledger' },
          { id: 'arrivals', label: 'Arrivals' },
          { id: 'maquila', label: 'Maquila' },
          { id: 'transfers', label: 'Transfers' },
          { id: 'sales', label: 'Sales' },
          { id: 'config', label: 'Config' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'bg-slate-100 text-primary hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container Content (max-width 1400px, centered, 40px left/right padding) */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 py-8">
        
        {/* Dynamic header title based on Tab */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-primary uppercase">
              {activeTab === 'dashboard' && "Executive Decision Center"}
              {activeTab === 'ledger' && "Real-Time Stock Audit Ledger"}
              {activeTab === 'arrivals' && "Bulk Cargo Receiving Yard"}
              {activeTab === 'maquila' && "Maquila Processing Records"}
              {activeTab === 'transfers' && "Inter-Channel Distribution Dispatch"}
              {activeTab === 'sales' && "POS Retail Revenue Logging"}
              {activeTab === 'config' && "Baseline Settings Configurator"}
            </h2>
            <p className="text-xs text-[#888888] mt-1 font-sans">
              {activeTab === 'dashboard' && "High-fidelity KPI tracking, executive slicers, store profit comparisons, and color-size matrices."}
              {activeTab === 'ledger' && "Instant cross-channel SKU query, safety stock triggers, and visual stock magnitude density mapping."}
              {activeTab === 'arrivals' && "Log incoming bulk cargo containers. Trigger color-size breakdowns for custom outer packaging."}
              {activeTab === 'maquila' && "Review previous out-of-box packing splits. Audit material loss (Merma) yields against contract benchmarks."}
              {activeTab === 'transfers' && "Authorize logistics transport routes. Form validates and locks source inventory to prevent negative values."}
              {activeTab === 'sales' && "Record retail client transaction flow. Live subtotal computation with proportional discounts."}
              {activeTab === 'config' && "Edit store lists, clothing categories, and configure safety threshold limits to adjust system warnings."}
            </p>
          </div>

          <div className="text-right text-[11px] text-[#888888] font-mono select-none">
            System Environment: <span className="text-primary font-bold">Cloud Run Sandbox</span> | Version: <span className="text-primary font-bold">v3.4.1-SaaS</span>
          </div>
        </div>

        {/* Tab View Container with fadeUp transition */}
        <div className="animate-fade-up">
          {renderActiveTab()}
        </div>

      </main>

      {/* Humble Footer */}
      <footer className="py-6 border-t border-[rgba(5,28,44,0.06)] bg-white text-center text-[11px] text-[#888888] select-none">
        <div className="max-w-[1400px] mx-auto px-10 flex flex-wrap justify-between items-center gap-4">
          <span>&copy; 2026 Retail & Maquila Inventory Management Systems. All rights reserved.</span>
          <span className="font-mono">Secure Client Sandbox | No External Database Dependencies</span>
        </div>
      </footer>

    </div>
  );
}
