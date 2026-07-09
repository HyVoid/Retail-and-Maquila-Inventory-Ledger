import { LedgerState, ProductMaster } from '../types';

export interface WHInventoryRow {
  skuKey: string;
  model: string;
  color: string;
  size: string;
  unit: string;
  costPrice: number;
  inProduction: number;   // =SUMIFS(tbl_Breakdown[Qty_Pcs], tbl_Breakdown[SKU_Key], SKU_Key)
  outTransfers: number;   // =SUMIFS(tbl_Transfers[Qty_Pcs], tbl_Transfers[SKU_Key], SKU_Key, tbl_Transfers[Source_Loc], "Warehouse")
  outWHMerma: number;     // =SUMIFS(tbl_Merma[Qty_Pcs], tbl_Merma[SKU_Key], SKU_Key, tbl_Merma[Location], "Warehouse")
  currentWHStock: number; // =In_Production - Out_Transfers - Out_WH_Merma
}

export interface StoreInventoryRow {
  skuKey: string;
  model: string;
  color: string;
  size: string;
  costPrice: number;
  stockByStore: { [storeName: string]: number }; // =SUMIFS(Transfers) - SUMIFS(Sales) - SUMIFS(Merma)
  totalStoresStock: number;
}

export interface CombinedInventoryRow {
  skuKey: string;
  model: string;
  color: string;
  size: string;
  costPrice: number;
  whStock: number;
  storeStocks: { [storeName: string]: number };
  totalGlobalStock: number;
  totalAssetValue: number;
}

/**
 * 3.1 仓库库存引擎 (WH Inventory Engine)
 * Calculations are dynamic arrays mimicking:
 * =UNIQUE(tbl_Products[SKU_Key])
 * =XLOOKUP(...)
 * =SUMIFS(...)
 */
export function calculateWHInventory(state: LedgerState): WHInventoryRow[] {
  return state.products.map(prod => {
    const skuKey = prod.skuKey;

    // =SUMIFS(tbl_Breakdown[Qty_Pcs], tbl_Breakdown[SKU_Key], A2#)
    const inProduction = state.breakdown
      .filter(item => item.skuKey === skuKey)
      .reduce((sum, item) => sum + item.qtyPcs, 0);

    // =SUMIFS(tbl_Transfers[Qty_Pcs], tbl_Transfers[SKU_Key], A2#, tbl_Transfers[Source_Loc], "Warehouse")
    const outTransfers = state.transfers
      .filter(item => item.skuKey === skuKey && item.sourceLoc === "Warehouse")
      .reduce((sum, item) => sum + item.qtyPcs, 0);

    // =SUMIFS(tbl_Merma[Qty_Pcs], tbl_Merma[SKU_Key], A2#, tbl_Merma[Location], "Warehouse")
    const outWHMerma = state.merma
      .filter(item => item.skuKey === skuKey && item.location === "Warehouse")
      .reduce((sum, item) => sum + item.qtyPcs, 0);

    // =E2# - F2# - G2#
    const currentWHStock = inProduction - outTransfers - outWHMerma;

    return {
      skuKey,
      model: prod.model,
      color: prod.color,
      size: prod.size,
      unit: prod.unit,
      costPrice: prod.costPrice,
      inProduction,
      outTransfers,
      outWHMerma,
      currentWHStock
    };
  });
}

/**
 * 3.2 门店库存二维矩阵引擎 (Store Inventory Engine)
 * Rows: all SKU keys
 * Columns: retail stores (excluding "Warehouse")
 * Cell Formula: =SUMIFS(tbl_Transfers) - SUMIFS(tbl_Sales) - SUMIFS(tbl_Merma)
 */
export function calculateStoreInventory(state: LedgerState): StoreInventoryRow[] {
  const retailStores = state.params.stores.filter(s => s !== "Warehouse");

  return state.products.map(prod => {
    const skuKey = prod.skuKey;
    const stockByStore: { [storeName: string]: number } = {};
    let totalStoresStock = 0;

    retailStores.forEach(store => {
      // + SUMIFS(tbl_Transfers[Qty_Pcs], tbl_Transfers[SKU_Key], SKU_Key, tbl_Transfers[Dest_Store], Store)
      const inboundTransfer = state.transfers
        .filter(item => item.skuKey === skuKey && item.destStore === store)
        .reduce((sum, item) => sum + item.qtyPcs, 0);

      // - SUMIFS(tbl_Sales[Qty_Pcs], tbl_Sales[SKU_Key], SKU_Key, tbl_Sales[Store_Name], Store)
      const salesQty = state.sales
        .filter(item => item.skuKey === skuKey && item.storeName === store)
        .reduce((sum, item) => sum + item.qtyPcs, 0);

      // - SUMIFS(tbl_Merma[Qty_Pcs], tbl_Merma[SKU_Key], SKU_Key, tbl_Merma[Location], Store)
      const storeMerma = state.merma
        .filter(item => item.skuKey === skuKey && item.location === store)
        .reduce((sum, item) => sum + item.qtyPcs, 0);

      // Final cell calculation
      const netStock = inboundTransfer - salesQty - storeMerma;
      stockByStore[store] = netStock;
      totalStoresStock += netStock;
    });

    return {
      skuKey,
      model: prod.model,
      color: prod.color,
      size: prod.size,
      costPrice: prod.costPrice,
      stockByStore,
      totalStoresStock
    };
  });
}

/**
 * Combined view for easy ledger display
 */
export function calculateCombinedInventory(state: LedgerState): CombinedInventoryRow[] {
  const whInventory = calculateWHInventory(state);
  const storeInventory = calculateStoreInventory(state);

  return state.products.map((prod, index) => {
    const whRow = whInventory[index];
    const stRow = storeInventory[index];

    const whStock = whRow ? whRow.currentWHStock : 0;
    const storeStocks = stRow ? stRow.stockByStore : {};
    const totalGlobalStock = whStock + (stRow ? stRow.totalStoresStock : 0);
    const totalAssetValue = totalGlobalStock * prod.costPrice;

    return {
      skuKey: prod.skuKey,
      model: prod.model,
      color: prod.color,
      size: prod.size,
      costPrice: prod.costPrice,
      whStock,
      storeStocks,
      totalGlobalStock,
      totalAssetValue
    };
  });
}

export interface StoreFinancialRow {
  storeName: string;
  pcsSold: number;
  revenue: number; // GMV
  cogs: number; // cost of goods sold
  grossProfit: number; // gross margin $
  profitMargin: number; // percentage
}

/**
 * Calculates store-by-store sales, revenue, and COGS
 */
export function calculateStoreFinancials(state: LedgerState): StoreFinancialRow[] {
  return state.params.stores.map(store => {
    const sales = state.sales.filter(s => s.storeName === store);
    const pcsSold = sales.reduce((sum, s) => sum + s.qtyPcs, 0);
    const revenue = sales.reduce((sum, s) => sum + s.revenue, 0);

    const cogs = sales.reduce((sum, s) => {
      const prod = state.products.find(p => p.skuKey === s.skuKey);
      const unitCost = prod ? prod.costPrice : 0;
      return sum + s.qtyPcs * unitCost;
    }, 0);

    const grossProfit = revenue - cogs;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      storeName: store,
      pcsSold,
      revenue,
      cogs,
      grossProfit,
      profitMargin
    };
  });
}
