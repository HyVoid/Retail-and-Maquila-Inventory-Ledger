export interface ModelConfig {
  id: string; // Model Code, e.g. "M01"
  name: string; // e.g. "Premium Silk Dress"
  category: string; // e.g. "Dresses"
  unitCost: number; // Cost price per piece ($)
  unitPrice: number; // Retail price per piece ($)
  safetyStock: number; // Alert threshold, e.g. 20
  // Distribution percentages of colors and sizes for auto-breakdown
  sizeDistribution: { [size: string]: number }; // e.g. { S: 0.2, M: 0.3, L: 0.3, XL: 0.2 }
  colorDistribution: { [color: string]: number }; // e.g. { Red: 0.5, Navy: 0.5 }
}

export interface BulkArrival {
  id: string; // e.g. "B-001"
  date: string;
  modelId: string;
  brand: string;
  costPerBox: number;
  boxQty: number;
  pcsPerBox: number;
  totalPieces: number;
  status: 'Pending' | 'Processed';
}

export interface MaquilaBatch {
  id: string; // e.g. "MQ-001"
  arrivalId: string; // References BulkArrival.id
  date: string;
  modelId: string;
  bulkPieces: number; // totalPieces from BulkArrival
  qualifiedPieces: number; // sum of SKUs generated
  mermaPieces: number; // waste pieces
  mermaRate: number; // mermaPieces / bulkPieces
  // SKU level breakdown output from Maquila
  breakdown: { [skuKey: string]: number }; // e.g., "M01-Red-M": 45
}

export interface TransferLog {
  id: string; // e.g. "TR-001"
  date: string;
  skuKey: string; // e.g. "M01-Red-M"
  modelId: string;
  color: string;
  size: string;
  source: string; // Store name, e.g. "Central Warehouse"
  destination: string; // Store name, e.g. "Store Alpha"
  quantity: number;
}

export interface SalesLog {
  id: string; // e.g. "SL-001"
  date: string;
  store: string; // Store name, e.g. "Store Alpha"
  skuKey: string; // e.g. "M01-Red-M"
  modelId: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number; // dynamic or editable retail price
  discount: number; // percentage, e.g. 10 for 10%
  totalAmount: number; // quantity * unitPrice * (1 - discount/100)
}

// Global active ledger state
export interface LedgerState {
  stores: string[];
  models: ModelConfig[];
  arrivals: BulkArrival[];
  maquilaBatches: MaquilaBatch[];
  transfers: TransferLog[];
  sales: SalesLog[];
  lastSaved: string;
}

export const INITIAL_STORES = [
  "Central Warehouse",
  "Store Alpha",
  "Store Beta",
  "Store Gamma"
];

export const INITIAL_MODELS: ModelConfig[] = [
  {
    id: "M01",
    name: "Imperial Silk Dress",
    category: "Dresses",
    unitCost: 15.00,
    unitPrice: 45.00,
    safetyStock: 15,
    sizeDistribution: { S: 0.20, M: 0.30, L: 0.30, XL: 0.20 },
    colorDistribution: { Crimson: 0.40, Navy: 0.40, Black: 0.20 }
  },
  {
    id: "M02",
    name: "Tech-Knit Linen Blazer",
    category: "Outerwear",
    unitCost: 22.50,
    unitPrice: 69.90,
    safetyStock: 10,
    sizeDistribution: { S: 0.15, M: 0.35, L: 0.35, XL: 0.15 },
    colorDistribution: { Slate: 0.50, Taupe: 0.50 }
  },
  {
    id: "M03",
    name: "Classic Oxford Shirt",
    category: "Tops",
    unitCost: 9.00,
    unitPrice: 29.90,
    safetyStock: 25,
    sizeDistribution: { S: 0.20, M: 0.30, L: 0.30, XL: 0.20 },
    colorDistribution: { White: 0.60, SkyBlue: 0.40 }
  },
  {
    id: "M04",
    name: "Athletic Pleated Skirt",
    category: "Bottoms",
    unitCost: 11.20,
    unitPrice: 35.00,
    safetyStock: 15,
    sizeDistribution: { S: 0.25, M: 0.40, L: 0.25, XL: 0.10 },
    colorDistribution: { ForestGreen: 0.50, Pearl: 0.50 }
  }
];

export const INITIAL_ARRIVALS: BulkArrival[] = [
  {
    id: "BA-101",
    date: "2026-06-15",
    modelId: "M01",
    brand: "Imperial Threads",
    costPerBox: 1500,
    boxQty: 2,
    pcsPerBox: 100,
    totalPieces: 200,
    status: "Processed"
  },
  {
    id: "BA-102",
    date: "2026-06-16",
    modelId: "M02",
    brand: "Nordic Atelier",
    costPerBox: 2250,
    boxQty: 1,
    pcsPerBox: 100,
    totalPieces: 100,
    status: "Processed"
  },
  {
    id: "BA-103",
    date: "2026-06-18",
    modelId: "M03",
    brand: "Gentry Loom",
    costPerBox: 1350,
    boxQty: 3,
    pcsPerBox: 150,
    totalPieces: 450,
    status: "Processed"
  },
  {
    id: "BA-104",
    date: "2026-06-25",
    modelId: "M04",
    brand: "AeroActive",
    costPerBox: 1120,
    boxQty: 2,
    pcsPerBox: 100,
    totalPieces: 200,
    status: "Pending"
  }
];

export const INITIAL_MAQUILA_BATCHES: MaquilaBatch[] = [
  {
    id: "MQ-201",
    arrivalId: "BA-101",
    date: "2026-06-16",
    modelId: "M01",
    bulkPieces: 200,
    qualifiedPieces: 195,
    mermaPieces: 5,
    mermaRate: 0.025,
    breakdown: {
      "M01-Crimson-S": 16, "M01-Crimson-M": 24, "M01-Crimson-L": 24, "M01-Crimson-XL": 14,
      "M01-Navy-S": 16, "M01-Navy-M": 24, "M01-Navy-L": 24, "M01-Navy-XL": 14,
      "M01-Black-S": 8, "M01-Black-M": 12, "M01-Black-L": 11, "M01-Black-XL": 8
    }
  },
  {
    id: "MQ-202",
    arrivalId: "BA-102",
    date: "2026-06-17",
    modelId: "M02",
    bulkPieces: 100,
    qualifiedPieces: 96,
    mermaPieces: 4,
    mermaRate: 0.04, // Anomaly! > 3%
    breakdown: {
      "M02-Slate-S": 7, "M02-Slate-M": 17, "M02-Slate-L": 17, "M02-Slate-XL": 7,
      "M02-Taupe-S": 7, "M02-Taupe-M": 17, "M02-Taupe-L": 17, "M02-Taupe-XL": 7
    }
  },
  {
    id: "MQ-203",
    arrivalId: "BA-103",
    date: "2026-06-19",
    modelId: "M03",
    bulkPieces: 450,
    qualifiedPieces: 441,
    mermaPieces: 9,
    mermaRate: 0.02,
    breakdown: {
      "M03-White-S": 53, "M03-White-M": 80, "M03-White-L": 80, "M03-White-XL": 53,
      "M03-SkyBlue-S": 35, "M03-SkyBlue-M": 53, "M03-SkyBlue-L": 53, "M03-SkyBlue-XL": 34
    }
  }
];

export const INITIAL_TRANSFERS: TransferLog[] = [
  // Distribution from Central Warehouse to Store Alpha
  { id: "TR-501", date: "2026-06-17", skuKey: "M01-Crimson-M", modelId: "M01", color: "Crimson", size: "M", source: "Central Warehouse", destination: "Store Alpha", quantity: 15 },
  { id: "TR-502", date: "2026-06-17", skuKey: "M01-Crimson-L", modelId: "M01", color: "Crimson", size: "L", source: "Central Warehouse", destination: "Store Alpha", quantity: 15 },
  { id: "TR-503", date: "2026-06-17", skuKey: "M01-Navy-M", modelId: "M01", color: "Navy", size: "M", source: "Central Warehouse", destination: "Store Alpha", quantity: 12 },
  
  // Distribution to Store Beta
  { id: "TR-504", date: "2026-06-18", skuKey: "M01-Crimson-M", modelId: "M01", color: "Crimson", size: "M", source: "Central Warehouse", destination: "Store Beta", quantity: 8 },
  { id: "TR-505", date: "2026-06-18", skuKey: "M01-Black-L", modelId: "M01", color: "Black", size: "L", source: "Central Warehouse", destination: "Store Beta", quantity: 5 },
  
  // Distribution for M02 to Store Gamma
  { id: "TR-506", date: "2026-06-20", skuKey: "M02-Slate-M", modelId: "M02", color: "Slate", size: "M", source: "Central Warehouse", destination: "Store Gamma", quantity: 10 },
  { id: "TR-507", date: "2026-06-20", skuKey: "M02-Taupe-L", modelId: "M02", color: "Taupe", size: "L", source: "Central Warehouse", destination: "Store Gamma", quantity: 12 },
  
  // Distribution of M03 classic shirt to Alpha and Beta
  { id: "TR-508", date: "2026-06-22", skuKey: "M03-White-M", modelId: "M03", color: "White", size: "M", source: "Central Warehouse", destination: "Store Alpha", quantity: 40 },
  { id: "TR-509", date: "2026-06-22", skuKey: "M03-White-L", modelId: "M03", color: "White", size: "L", source: "Central Warehouse", destination: "Store Beta", quantity: 30 }
];

export const INITIAL_SALES: SalesLog[] = [
  // Store Alpha Sales
  { id: "SL-801", date: "2026-06-18", store: "Store Alpha", skuKey: "M01-Crimson-M", modelId: "M01", color: "Crimson", size: "M", quantity: 4, unitPrice: 45.00, discount: 0, totalAmount: 180.00 },
  { id: "SL-802", date: "2026-06-19", store: "Store Alpha", skuKey: "M01-Crimson-L", modelId: "M01", color: "Crimson", size: "L", quantity: 3, unitPrice: 45.00, discount: 10, totalAmount: 121.50 },
  { id: "SL-803", date: "2026-06-20", store: "Store Alpha", skuKey: "M01-Navy-M", modelId: "M01", color: "Navy", size: "M", quantity: 2, unitPrice: 45.00, discount: 0, totalAmount: 90.00 },
  { id: "SL-804", date: "2026-06-23", store: "Store Alpha", skuKey: "M03-White-M", modelId: "M03", color: "White", size: "M", quantity: 12, unitPrice: 29.90, discount: 5, totalAmount: 340.86 },

  // Store Beta Sales
  { id: "SL-805", date: "2026-06-20", store: "Store Beta", skuKey: "M01-Crimson-M", modelId: "M01", color: "Crimson", size: "M", quantity: 5, unitPrice: 45.00, discount: 0, totalAmount: 225.00 },
  { id: "SL-806", date: "2026-06-21", store: "Store Beta", skuKey: "M01-Black-L", modelId: "M01", color: "Black", size: "L", quantity: 2, unitPrice: 45.00, discount: 15, totalAmount: 76.50 },
  { id: "SL-807", date: "2026-06-24", store: "Store Beta", skuKey: "M03-White-L", modelId: "M03", color: "White", size: "L", quantity: 8, unitPrice: 29.90, discount: 0, totalAmount: 239.20 },

  // Store Gamma Sales
  { id: "SL-808", date: "2026-06-22", store: "Store Gamma", skuKey: "M02-Slate-M", modelId: "M02", color: "Slate", size: "M", quantity: 6, unitPrice: 69.90, discount: 0, totalAmount: 419.40 },
  { id: "SL-809", date: "2026-06-23", store: "Store Gamma", skuKey: "M02-Taupe-L", modelId: "M02", color: "Taupe", size: "L", quantity: 5, unitPrice: 69.90, discount: 10, totalAmount: 314.55 }
];
