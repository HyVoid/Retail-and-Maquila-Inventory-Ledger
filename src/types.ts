export interface ProductMaster {
  model: string; // Model Code, e.g. "MD-01"
  color: string; // e.g. "Black"
  size: string; // e.g. "L"
  skuKey: string; // Formula: Model & "-" & Color & "-" & Size
  unit: string; // default "Pcs"
  costPrice: number; // Cost price per piece ($)
}

export interface BulkReceiving {
  receivingId: string; // e.g., "RCV-001"
  date: string;
  batchNo: string; // e.g., "B2026-A1"
  supplier: string;
  boxQty: number;
  pcsPerBox: number;
  totalPcsEst: number; // Formula: Box_Qty * Pcs_Per_Box
}

export interface BreakdownProduction {
  date: string;
  sourceBatch: string; // references batchNo
  model: string;
  color: string;
  size: string;
  skuKey: string; // Formula: Model & "-" & Color & "-" & Size
  qtyPcs: number; // actual qualified pieces
  costPrice: number; // XLOOKUP from tbl_Products
}

export interface WasteMerma {
  date: string;
  location: string; // e.g., "Warehouse", "Store A", "Store B"
  skuKey: string;
  qtyPcs: number;
  wasteType: string; // e.g., "Maquila Defect", "Transit Damage", "Store Theft"
  lossValue: number; // Formula: Qty_Pcs * Cost_Price
}

export interface WarehouseTransfer {
  transferId: string;
  date: string;
  sourceLoc: string; // Fixed to "Warehouse"
  destStore: string;
  skuKey: string;
  qtyPcs: number;
}

export interface StoreSales {
  salesId: string;
  date: string;
  storeName: string;
  skuKey: string;
  qtyPcs: number;
  unitPrice: number;
  revenue: number; // Formula: Qty_Pcs * Unit_Price
}

export interface LedgerState {
  params: {
    stores: string[];
    wasteTypes: string[];
  };
  products: ProductMaster[];
  receiving: BulkReceiving[];
  breakdown: BreakdownProduction[];
  merma: WasteMerma[];
  transfers: WarehouseTransfer[];
  sales: StoreSales[];
  lastSaved?: string;
}

// Initial default parameters
export const INITIAL_STORES = [
  "Warehouse",
  "Store A",
  "Store B",
  "Store C"
];

export const INITIAL_WASTE_TYPES = [
  "Maquila Defect",
  "Transit Damage",
  "Store Theft"
];

// Initial default Product Master (tbl_Products)
export const INITIAL_PRODUCTS: ProductMaster[] = [
  // MD-01 Black
  { model: "MD-01", color: "Black", size: "S", skuKey: "MD-01-Black-S", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Black", size: "M", skuKey: "MD-01-Black-M", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Black", size: "L", skuKey: "MD-01-Black-L", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Black", size: "XL", skuKey: "MD-01-Black-XL", unit: "Pcs", costPrice: 15.00 },
  // MD-01 Crimson
  { model: "MD-01", color: "Crimson", size: "S", skuKey: "MD-01-Crimson-S", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Crimson", size: "M", skuKey: "MD-01-Crimson-M", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Crimson", size: "L", skuKey: "MD-01-Crimson-L", unit: "Pcs", costPrice: 15.00 },
  { model: "MD-01", color: "Crimson", size: "XL", skuKey: "MD-01-Crimson-XL", unit: "Pcs", costPrice: 15.00 },
  // MD-02 Navy
  { model: "MD-02", color: "Navy", size: "S", skuKey: "MD-02-Navy-S", unit: "Pcs", costPrice: 22.50 },
  { model: "MD-02", color: "Navy", size: "M", skuKey: "MD-02-Navy-M", unit: "Pcs", costPrice: 22.50 },
  { model: "MD-02", color: "Navy", size: "L", skuKey: "MD-02-Navy-L", unit: "Pcs", costPrice: 22.50 },
  { model: "MD-02", color: "Navy", size: "XL", skuKey: "MD-02-Navy-XL", unit: "Pcs", costPrice: 22.50 },
  // MD-03 White
  { model: "MD-03", color: "White", size: "S", skuKey: "MD-03-White-S", unit: "Pcs", costPrice: 9.00 },
  { model: "MD-03", color: "White", size: "M", skuKey: "MD-03-White-M", unit: "Pcs", costPrice: 9.00 },
  { model: "MD-03", color: "White", size: "L", skuKey: "MD-03-White-L", unit: "Pcs", costPrice: 9.00 },
  { model: "MD-03", color: "White", size: "XL", skuKey: "MD-03-White-XL", unit: "Pcs", costPrice: 9.00 }
];

// Initial Bulk Receiving (tbl_Receiving)
export const INITIAL_RECEIVING: BulkReceiving[] = [
  {
    receivingId: "REC-001",
    date: "2026-06-10",
    batchNo: "BATCH-MD01-01",
    supplier: "Pacific Textiles",
    boxQty: 10,
    pcsPerBox: 50,
    totalPcsEst: 500
  },
  {
    receivingId: "REC-002",
    date: "2026-06-12",
    batchNo: "BATCH-MD02-01",
    supplier: "Global Weaving",
    boxQty: 6,
    pcsPerBox: 100,
    totalPcsEst: 600
  },
  {
    receivingId: "REC-003",
    date: "2026-06-15",
    batchNo: "BATCH-MD03-01",
    supplier: "Prime Threads",
    boxQty: 4,
    pcsPerBox: 150,
    totalPcsEst: 600
  }
];

// Initial Breakdown & Production (tbl_Breakdown)
export const INITIAL_BREAKDOWN: BreakdownProduction[] = [
  // Breakdown for BATCH-MD01-01 (MD-01 model)
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Black", size: "S", skuKey: "MD-01-Black-S", qtyPcs: 60, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Black", size: "M", skuKey: "MD-01-Black-M", qtyPcs: 65, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Black", size: "L", skuKey: "MD-01-Black-L", qtyPcs: 60, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Black", size: "XL", skuKey: "MD-01-Black-XL", qtyPcs: 55, costPrice: 15.00 },
  
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Crimson", size: "S", skuKey: "MD-01-Crimson-S", qtyPcs: 62, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Crimson", size: "M", skuKey: "MD-01-Crimson-M", qtyPcs: 64, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Crimson", size: "L", skuKey: "MD-01-Crimson-L", qtyPcs: 61, costPrice: 15.00 },
  { date: "2026-06-11", sourceBatch: "BATCH-MD01-01", model: "MD-01", color: "Crimson", size: "XL", skuKey: "MD-01-Crimson-XL", qtyPcs: 58, costPrice: 15.00 },
  
  // Breakdown for BATCH-MD02-01 (MD-02 Navy)
  { date: "2026-06-13", sourceBatch: "BATCH-MD02-01", model: "MD-02", color: "Navy", size: "S", skuKey: "MD-02-Navy-S", qtyPcs: 145, costPrice: 22.50 },
  { date: "2026-06-13", sourceBatch: "BATCH-MD02-01", model: "MD-02", color: "Navy", size: "M", skuKey: "MD-02-Navy-M", qtyPcs: 150, costPrice: 22.50 },
  { date: "2026-06-13", sourceBatch: "BATCH-MD02-01", model: "MD-02", color: "Navy", size: "L", skuKey: "MD-02-Navy-L", qtyPcs: 142, costPrice: 22.50 },
  { date: "2026-06-13", sourceBatch: "BATCH-MD02-01", model: "MD-02", color: "Navy", size: "XL", skuKey: "MD-02-Navy-XL", qtyPcs: 148, costPrice: 22.50 },
  
  // Breakdown for BATCH-MD03-01 (MD-03 White)
  { date: "2026-06-16", sourceBatch: "BATCH-MD03-01", model: "MD-03", color: "White", size: "S", skuKey: "MD-03-White-S", qtyPcs: 140, costPrice: 9.00 },
  { date: "2026-06-16", sourceBatch: "BATCH-MD03-01", model: "MD-03", color: "White", size: "M", skuKey: "MD-03-White-M", qtyPcs: 155, costPrice: 9.00 },
  { date: "2026-06-16", sourceBatch: "BATCH-MD03-01", model: "MD-03", color: "White", size: "L", skuKey: "MD-03-White-L", qtyPcs: 148, costPrice: 9.00 },
  { date: "2026-06-16", sourceBatch: "BATCH-MD03-01", model: "MD-03", color: "White", size: "XL", skuKey: "MD-03-White-XL", qtyPcs: 143, costPrice: 9.00 }
];

// Initial Waste (Merma) (tbl_Merma)
export const INITIAL_MERMA: WasteMerma[] = [
  // 15 pcs lost in Warehouse processing from batch MD01
  { date: "2026-06-11", location: "Warehouse", skuKey: "MD-01-Black-S", qtyPcs: 5, wasteType: "Maquila Defect", lossValue: 75.00 },
  { date: "2026-06-11", location: "Warehouse", skuKey: "MD-01-Crimson-XL", qtyPcs: 7, wasteType: "Maquila Defect", lossValue: 105.00 },
  // 15 pcs damaged during Transit to Store A
  { date: "2026-06-14", location: "Store A", skuKey: "MD-02-Navy-M", qtyPcs: 3, wasteType: "Transit Damage", lossValue: 67.50 },
  { date: "2026-06-15", location: "Store B", skuKey: "MD-01-Crimson-M", qtyPcs: 2, wasteType: "Store Theft", lossValue: 30.00 }
];

// Initial Transfers (tbl_Transfers)
export const INITIAL_TRANSFERS: WarehouseTransfer[] = [
  { transferId: "TR-001", date: "2026-06-12", sourceLoc: "Warehouse", destStore: "Store A", skuKey: "MD-01-Black-M", qtyPcs: 30 },
  { transferId: "TR-002", date: "2026-06-12", sourceLoc: "Warehouse", destStore: "Store A", skuKey: "MD-01-Black-L", qtyPcs: 30 },
  { transferId: "TR-003", date: "2026-06-12", sourceLoc: "Warehouse", destStore: "Store B", skuKey: "MD-01-Crimson-M", qtyPcs: 25 },
  { transferId: "TR-004", date: "2026-06-12", sourceLoc: "Warehouse", destStore: "Store B", skuKey: "MD-01-Crimson-L", qtyPcs: 25 },
  { transferId: "TR-005", date: "2026-06-14", sourceLoc: "Warehouse", destStore: "Store C", skuKey: "MD-02-Navy-M", qtyPcs: 50 },
  { transferId: "TR-006", date: "2026-06-14", sourceLoc: "Warehouse", destStore: "Store C", skuKey: "MD-02-Navy-L", qtyPcs: 50 },
  { transferId: "TR-007", date: "2026-06-17", sourceLoc: "Warehouse", destStore: "Store A", skuKey: "MD-03-White-M", qtyPcs: 80 },
  { transferId: "TR-008", date: "2026-06-17", sourceLoc: "Warehouse", destStore: "Store B", skuKey: "MD-03-White-L", qtyPcs: 70 }
];

// Initial Sales (tbl_Sales)
export const INITIAL_SALES: StoreSales[] = [
  { salesId: "SAL-001", date: "2026-06-13", storeName: "Store A", skuKey: "MD-01-Black-M", qtyPcs: 12, unitPrice: 45.00, revenue: 540.00 },
  { salesId: "SAL-002", date: "2026-06-13", storeName: "Store A", skuKey: "MD-01-Black-L", qtyPcs: 15, unitPrice: 45.00, revenue: 675.00 },
  { salesId: "SAL-003", date: "2026-06-14", storeName: "Store B", skuKey: "MD-01-Crimson-M", qtyPcs: 8, unitPrice: 45.00, revenue: 360.00 },
  { salesId: "SAL-004", date: "2026-06-15", storeName: "Store B", skuKey: "MD-01-Crimson-L", qtyPcs: 10, unitPrice: 45.00, revenue: 450.00 },
  { salesId: "SAL-005", date: "2026-06-15", storeName: "Store C", skuKey: "MD-02-Navy-M", qtyPcs: 22, unitPrice: 65.00, revenue: 1430.00 },
  { salesId: "SAL-006", date: "2026-06-16", storeName: "Store C", skuKey: "MD-02-Navy-L", qtyPcs: 18, unitPrice: 65.00, revenue: 1170.00 },
  { salesId: "SAL-007", date: "2026-06-18", storeName: "Store A", skuKey: "MD-03-White-M", qtyPcs: 45, unitPrice: 28.00, revenue: 1260.00 },
  { salesId: "SAL-008", date: "2026-06-18", storeName: "Store B", skuKey: "MD-03-White-L", qtyPcs: 35, unitPrice: 28.00, revenue: 980.00 }
];
