import { LedgerState, ModelConfig } from '../types';

export interface SkuInventoryRow {
  skuKey: string; // "M01-Crimson-S"
  modelId: string;
  modelName: string;
  category: string;
  color: string;
  size: string;
  safetyStock: number;
  unitCost: number;
  unitPrice: number;
  stockByStore: { [storeName: string]: number };
  totalStock: number;
}

/**
 * Calculates the dynamic real-time inventory level for all SKUs across all stores
 * based on Maquila breakdowns, transfers, and sales.
 */
export function calculateSkuInventory(state: LedgerState): SkuInventoryRow[] {
  const rows: SkuInventoryRow[] = [];

  for (const model of state.models) {
    const colors = Object.keys(model.colorDistribution);
    const sizes = Object.keys(model.sizeDistribution);

    for (const color of colors) {
      for (const size of sizes) {
        const skuKey = `${model.id}-${color}-${size}`;
        const stockByStore: { [store: string]: number } = {};
        let totalStock = 0;

        for (const store of state.stores) {
          let stock = 0;
          if (store === "Central Warehouse") {
            // 1. Inflow from Maquila breakdowns
            for (const batch of state.maquilaBatches) {
              if (batch.modelId === model.id && batch.breakdown[skuKey] !== undefined) {
                stock += batch.breakdown[skuKey];
              }
            }
            // 2. Adjust for transfers
            for (const transfer of state.transfers) {
              if (transfer.skuKey === skuKey) {
                if (transfer.source === "Central Warehouse") {
                  stock -= transfer.quantity;
                }
                if (transfer.destination === "Central Warehouse") {
                  stock += transfer.quantity;
                }
              }
            }
            // 3. Adjust for sales (if any)
            for (const sale of state.sales) {
              if (sale.skuKey === skuKey && sale.store === "Central Warehouse") {
                stock -= sale.quantity;
              }
            }
          } else {
            // Retail stores
            for (const transfer of state.transfers) {
              if (transfer.skuKey === skuKey) {
                if (transfer.destination === store) {
                  stock += transfer.quantity;
                }
                if (transfer.source === store) {
                  stock -= transfer.quantity;
                }
              }
            }
            for (const sale of state.sales) {
              if (sale.skuKey === skuKey && sale.store === store) {
                stock -= sale.quantity;
              }
            }
          }
          stockByStore[store] = stock;
          totalStock += stock;
        }

        rows.push({
          skuKey,
          modelId: model.id,
          modelName: model.name,
          category: model.category,
          color,
          size,
          safetyStock: model.safetyStock,
          unitCost: model.unitCost,
          unitPrice: model.unitPrice,
          stockByStore,
          totalStock
        });
      }
    }
  }

  return rows;
}

export interface StoreFinancialRow {
  storeName: string;
  unitsSold: number;
  grossSales: number;
  estCOGS: number;
  grossProfit: number;
  profitMargin: number; // percentage
}

/**
 * Calculates store performance data for gross margins, sales volumes, and profits.
 */
export function calculateStorePerformance(state: LedgerState): StoreFinancialRow[] {
  // We only show retail stores (excluding Central Warehouse, or optionally including it)
  return state.stores.map(store => {
    const storeSales = state.sales.filter(s => s.store === store);
    let unitsSold = 0;
    let grossSales = 0;
    let estCOGS = 0;

    for (const sale of storeSales) {
      unitsSold += sale.quantity;
      grossSales += sale.totalAmount;
      // lookup unit cost
      const model = state.models.find(m => m.id === sale.modelId);
      const costPerPiece = model ? model.unitCost : 0;
      estCOGS += sale.quantity * costPerPiece;
    }

    const grossProfit = grossSales - estCOGS;
    const profitMargin = grossSales > 0 ? (grossProfit / grossSales) * 100 : 0;

    return {
      storeName: store,
      unitsSold,
      grossSales,
      estCOGS,
      grossProfit,
      profitMargin
    };
  });
}
