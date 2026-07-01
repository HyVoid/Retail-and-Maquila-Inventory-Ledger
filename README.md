# Transform Multi-Store Retail + Maquila Inventory Chaos into an Auditable SKU-Level Decision System

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-green.svg)
![Tool](https://img.shields.io/badge/Tool-Inventory%20Decision%20Support-orange.svg)

**Track inventory movement, processing loss, store profitability, and SKU-level stock exposure across factories, warehouses, and retail stores — without installing software or implementing an ERP.**

> ### **No signup. No installation. Free.**
>
> 🌐 **Open in Browser** → HTML interactive version *(coming soon)*
>
> 📥 **Download Excel** → Excel workbook release *(coming soon)*

---

## Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Interactive operational dashboard showing central warehouse inventory, store stock levels, processing losses, and sell-through performance.*

### Excel Version

<!-- screenshot: excel version -->

*Excel-based transaction engine displaying bulk receiving, maquila processing, inventory transfers, and real-time inventory reconciliation.*

---

## What It Helps You Track

* Bulk carton purchases converted into SKU-level inventory by color and size.
* Processing losses (Merma) by supplier, batch, and production cycle.
* Real-time inventory availability across central warehouse and retail stores.
* Product-level sell-through rates and inventory turnover performance.
* Store profitability and contribution by location.
* Inventory imbalances, shrinkage, and reconciliation exceptions before they become financial losses.

---

# Why I Built This

Many small and mid-sized retail businesses operate in a hybrid environment:

> Purchase inventory in bulk cartons → send products to maquila processors → split inventory into sellable SKUs → distribute to stores → sell through multiple retail locations.

The operational problem is that every stage uses a different unit of measurement.

Procurement teams think in cartons.

Processors think in pieces.

Stores think in sizes and colors.

Management thinks in revenue and margin.

As a result, inventory disappears into what I call an **analytical blind spot**.

The biggest failure is not inventory theft or accounting error. It is the inability to answer simple operational questions with confidence:

* Did the maquila processor lose inventory?
* Which store actually needs replenishment?
* Which SKU is generating profit?
* Which inventory is quietly becoming dead stock?

A real example:

| Situation        | Traditional Spreadsheet         |
| ---------------- | ------------------------------- |
| Purchase         | 100 cartons received            |
| Processing       | 29,150 sellable pieces returned |
| Loss             | Unknown                         |
| Store inventory  | Estimated                       |
| Best-selling SKU | Unknown                         |

After implementing a transaction-based inventory ledger:

| Situation            | Structured Inventory Ledger |
| -------------------- | --------------------------- |
| Purchase             | 30,000 pieces received      |
| Processing output    | 29,150 pieces               |
| Merma loss           | 850 pieces (2.83%)          |
| Inventory allocation | Fully traceable             |
| Best-selling SKU     | SKU-RED-M sold 1,285 units  |

This workbook is therefore not a spreadsheet template.

It is a **productized inventory reasoning framework** that converts fragmented operational events into auditable business decisions.

---

## Common Inventory Management Problems This Solves

| Problem                          | Without This Tool                               | With This Tool                            |
| -------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| Bulk-to-SKU conversion           | Manual calculations and frequent errors         | Automated carton-to-SKU conversion engine |
| Processing loss control          | Supplier losses remain hidden                   | Batch-level Merma tracking and alerts     |
| Multi-store inventory visibility | Headquarters and stores operate blindly         | Unified inventory visibility              |
| Inventory transfers              | Inventory adjusted manually                     | Auditable transfer ledger                 |
| Store performance analysis       | Revenue visible, inventory efficiency invisible | Profitability and turnover metrics        |
| Stock imbalance                  | Overstock and stockouts coexist                 | Dynamic replenishment visibility          |

---

## Who This Is For

This tool is designed for:

* Multi-store apparel retailers.
* Footwear retailers operating central warehouses.
* Fashion businesses using maquila or outsourced processing.
* Importers who purchase in bulk and sell at SKU level.
* Small distributors that cannot justify ERP implementation costs.
* Business owners requiring operational visibility without dedicated IT teams.

This tool is not designed for:

* Real-time concurrent inventory management.
* Enterprise ERP replacement projects.
* Manufacturing MRP scheduling.
* Multi-user transactional database environments.

**No spreadsheet expertise is required. Open the browser version or Excel workbook and begin recording inventory movements immediately.**

---

## About

I build lightweight operational decision-support tools for business situations where there are simply too many moving parts to manage mentally.

The central question behind every tool is:

> **What information needs to exist in one place so the next operational decision can be made confidently?**

This inventory management framework is one example of that approach: converting fragmented inventory events into a reusable operational decision model rather than building another generic dashboard.

---

## Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

---

### Workbook Architecture

```
INPUT LAYER
│
├── Config
├── Bulk_In
├── Break_Maq
├── Transfer
└── Sales_Log
        │
        ▼
CALCULATION LAYER
│
└── Stock_Calc
        │
        ▼
OUTPUT LAYER
│
└── Dashboard
```

| Worksheet  | Purpose                       | Type        |
| ---------- | ----------------------------- | ----------- |
| Config     | Master data and parameters    | Input       |
| Bulk_In    | Bulk carton receiving         | Transaction |
| Break_Maq  | Processing and SKU conversion | Transaction |
| Transfer   | Warehouse/store movements     | Transaction |
| Sales_Log  | Retail sales records          | Transaction |
| Stock_Calc | Inventory calculation engine  | Calculation |
| Dashboard  | Executive reporting           | Output      |

---

### Three Traps That Catch Even Experienced Retail Operators

#### Trap #1 — Assuming Cartons Equal Inventory

A purchasing decision was made.

The decision relied on the assumption that purchased cartons equal available inventory.

| Metric            | Assumed | Actual |
| ----------------- | ------- | ------ |
| Cartons purchased | 100     | 100    |
| Pieces expected   | 30,000  | 30,000 |
| Sellable pieces   | 30,000  | 29,150 |
| Loss              | 0       | 850    |

The recommendation changes significantly because the business actually lost 2.83% during processing.

The reasoning is incorrect because cartons are procurement units, not operational inventory units.

Correct approach:

```
Bulk Received
        ↓
Processing Output
        ↓
Merma Loss
        ↓
Available Inventory
```

Result:

* Supplier performance becomes measurable.
* Processing quality becomes auditable.

<details>
<summary>Formula Logic</summary>

```excel
Merma Rate =
Merma_Qty /
(Good_Qty + Merma_Qty)
```

</details>

---

#### Trap #2 — Using Current Inventory Snapshots

A replenishment decision was made.

The decision relied on manually updated inventory balances.

| Store   | Recorded Stock | Actual Stock |
| ------- | -------------- | ------------ |
| Store A | 120            | 42           |
| Store B | 18             | 67           |

The flaw changes replenishment priorities completely.

The reasoning is incorrect because inventory balances are outcomes, not source data.

Correct approach:

```
Inventory
=
Opening
+ Incoming
+ Transfers In
- Transfers Out
- Sales
```

Result:

* Inventory becomes reproducible.
* Historical audit becomes possible.

<details>
<summary>Formula Logic</summary>

```excel
=SUMIFS(Inbound)
-SUMIFS(Outbound)
-SUMIFS(Sales)
```

</details>

---

#### Trap #3 — Measuring Revenue Instead of Inventory Productivity

A merchandising decision was made.

The decision relied on total sales revenue.

| SKU   | Revenue | Turnover |
| ----- | ------- | -------- |
| SKU-A | $52,000 | 8.3x     |
| SKU-B | $58,000 | 1.4x     |

Revenue suggests SKU-B performs better.

Inventory turnover demonstrates the opposite.

The reasoning is incorrect because capital efficiency matters more than gross sales.

Correct approach:

```
Inventory Turnover
=
Units Sold
÷
Average Inventory
```

Result:

* Capital allocation improves.
* Dead inventory becomes visible.

<details>
<summary>Formula Logic</summary>

```excel
Turnover =
Sales_Qty /
Average_Inventory
```

</details>

---

### Example Scenario

**Business Case: Women's Fashion Retailer**

#### Raw Inputs

| Event             | Quantity    |
| ----------------- | ----------- |
| Bulk purchase     | 100 cartons |
| Units per carton  | 300         |
| Total pieces      | 30,000      |
| Processing output | 29,150      |
| Merma             | 850         |

#### Distribution

| Location          | Inventory |
| ----------------- | --------- |
| Central warehouse | 12,000    |
| Store A           | 6,500     |
| Store B           | 5,400     |
| Store C           | 5,250     |

#### Sales

| SKU     | Units Sold |
| ------- | ---------- |
| RED-M   | 1,285      |
| BLACK-L | 923        |
| BLUE-S  | 741        |

#### Analytical Interpretation

* Processing loss = 2.83%.
* Store B inventory turnover = 5.8x.
* Store C inventory turnover = 1.7x.
* BLACK-L inventory approaching stockout.
* BLUE-S inventory accumulating.

#### Recommendation

* Increase replenishment frequency for BLACK-L.
* Reduce purchases of BLUE-S.
* Review maquila supplier performance.
* Reallocate excess inventory from Store C.

#### Decision Impact

Without analysis:

```
Purchase more inventory.
```

With analysis:

```
Redistribute inventory.
Reduce procurement.
Improve supplier controls.
```

---

### Formula Reference

<details>
<summary>Inventory Engine</summary>

```excel
Stock =
Opening
+ Receipts
+ Transfer_In
- Transfer_Out
- Sales
```

</details>

<details>
<summary>Processing Loss</summary>

```excel
Merma% =
Merma /
(Good + Merma)
```

</details>

<details>
<summary>Inventory Turnover</summary>

```excel
Turnover =
Sales /
Average Inventory
```

</details>

<details>
<summary>SKU Allocation</summary>

```excel
SKU Qty =
Carton Qty *
Allocation Ratio
```

</details>

---

### Validation Rules

| Field                    | Rule                            | Error Behavior    |
| ------------------------ | ------------------------------- | ----------------- |
| Store                    | Dropdown only                   | Reject entry      |
| SKU                      | Config lookup required          | Highlight error   |
| Processing loss          | Cannot exceed received quantity | Block calculation |
| Sales quantity           | Cannot exceed inventory         | Warning           |
| Transfer quantity        | Cannot exceed source stock      | Warning           |
| Inventory reconciliation | Must equal system total         | Red alert         |
| Duplicate transactions   | Not allowed                     | Validation error  |

</details>

---

## Other Tools in This Series

* **Multi-Channel VAT Compliance Dashboard** — monthly tax reconciliation and reporting.
* **DTC Fashion Inventory Planning Console** — demand planning and replenishment.
* **Project Cost Allocation Dashboard** — labor and overhead allocation analysis.
* **Marketing Attribution Audit System** — channel efficiency and ROI validation.

More tools available via GitHub profile and release repository.

---

## License

This project is licensed under the **Apache License 2.0**.

See the LICENSE file for details.
