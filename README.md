# 🌍 English | [简体中文](README.zh-CN.md)

# Inventory Operations Control Tool
### Event-Driven Inventory Tracking and Decision Support for Retail & Apparel Supply Chains

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-success)
![Tool](https://img.shields.io/badge/Tool-Inventory%20Decision%20Support-orange)

**Track every inventory movement from receiving to sale through a single event-driven workflow—free to use, with both browser and Excel editions, no installation or signup required.**

> ### **No signup. No installation. Free.**
>
> 🌐 **Open in Browser**  
> *(HTML live version — coming soon)*
>
> 📥 **Download Excel**  
> *(GitHub Release / Gumroad — coming soon)*

---

# Screenshots

### Browser Version

<!-- screenshot: browser version -->

*A browser-based operational dashboard showing warehouse inventory, store stock, inventory health, transfers, waste analysis, and sales performance.*

---

### Excel Version

<!-- screenshot: excel version -->

*The Excel workbook where operational events are recorded once and automatically flow through calculation engines into management dashboards.*

---

# What It Helps You Track

Instead of manually reconciling inventory balances across multiple spreadsheets, the workbook continuously reconstructs inventory positions from operational events.

It provides visibility into:

- Warehouse inventory available after production, transfers, and warehouse waste.
- Current inventory for every SKU across every retail store from a single consolidated view.
- Inventory value tied to actual unit costs instead of estimated balances.
- Product losses by operational cause, including production defects, transit damage, and store shrinkage.
- Sales performance alongside inventory depletion to identify fast-moving and slow-moving products.
- Inventory health indicators that highlight stock shortages, overstock situations, and operational exceptions before they become financial problems.

---

# Quick Start Workflow

Getting operational insight requires only a few recurring steps. No formulas need to be edited after the workbook is configured.

### 1. Configure the business once

Open the **Parameters** worksheet and define the operational environment.

Typical configuration includes:

- Warehouse and store locations
- Waste categories
- Product master records
- Cost information
- Operating thresholds

This setup normally changes only when new products or stores are introduced.

---

### 2. Import operational data

Copy existing operational records into the designated input tables.

Typical sources include:

- ERP exports
- POS exports
- CSV files
- Warehouse management reports
- Supplier receiving logs
- Existing Excel worksheets

Data is entered only into the transaction sheets.

No manual recalculation is required.

---

### 3. Review operational results

Switch to the inventory engines or management dashboard.

The workbook automatically updates:

- Warehouse inventory
- Store inventory
- Inventory valuation
- Sales revenue
- Waste analysis
- KPI summaries

The dashboard immediately reflects the latest operational position.

---

### 4. Refresh on a regular schedule

Repeat the same import process weekly, daily, or monthly depending on business requirements.

No redesign.

No rebuilding.

No additional configuration.

Simply replace or append operational transactions and refresh the workbook.

**Set a few key parameters. Drop in existing operational data. Review the analysis. Refresh whenever new transactions become available.**

---

# Why I Built This

Many retail businesses believe they have an inventory problem when they actually have an information problem.

Inventory is often maintained by directly adjusting balances whenever something changes. Receiving updates one spreadsheet. Production maintains another. Store managers record sales somewhere else. Warehouse transfers are tracked separately, while damaged goods are frequently documented only after month-end reconciliation.

Eventually the inventory numbers stop agreeing.

At that point, nobody knows whether the discrepancy came from production, transfers, shrinkage, or delayed data entry. The business spends more time explaining inventory than managing it.

I built this workbook around a different idea.

Instead of maintaining inventory balances directly, every operational activity becomes an event. Receiving inventory, converting bulk stock into sellable SKUs, transferring products, recording waste, and posting sales are stored as independent business events. Inventory is reconstructed automatically from those events every time the workbook refreshes.

A typical example illustrates why this matters.

Before using this framework, a warehouse manager might simply see that **SKU MD-01 has only 18 units remaining** and immediately schedule an urgent replenishment.

After reconstructing the complete event history, the same inventory position may reveal something very different:

- 60 units were transferred to stores yesterday.
- 42 units remain unsold in retail locations.
- 8 units were written off due to production defects.
- Warehouse inventory appears low, but company-wide inventory is healthy.

The recommendation changes completely.

Instead of manufacturing more inventory, management can redistribute existing stock and investigate the unusually high production waste.

That reasoning is reusable.

Rather than creating another custom spreadsheet for every company, this workbook packages the analytical logic into a repeatable framework that can be applied whenever inventory decisions depend on understanding **how inventory moved**, not simply **where inventory currently appears to be**.

---

# Common Inventory Management Problems This Solves

| Problem | Without This Tool | With This Tool |
|----------|-------------------|----------------|
| Inventory balances drift over time | Manual adjustments overwrite history, making discrepancies difficult to explain. | Every inventory movement remains traceable as a business event with a complete audit trail. |
| Warehouse appears out of stock while stores hold excess inventory | Purchasing decisions rely only on warehouse balances. | Warehouse and store inventory are evaluated together before replenishment decisions are made. |
| Product losses become visible only during physical counts | Shrinkage accumulates unnoticed until month-end reconciliation. | Waste is categorized by operational cause and quantified continuously. |
| Store inventory requires separate worksheets for every location | Additional stores increase maintenance effort and reporting complexity. | New stores automatically appear in the dynamic inventory matrix without redesigning formulas. |
| Management cannot identify where inventory disappeared | Receiving, production, transfers, sales, and adjustments exist in isolated files. | Every inventory change is reconstructed into a single operational timeline. |
| Inventory valuation becomes unreliable | Stock quantities and unit costs are maintained independently. | Inventory quantities and cost data remain linked through standardized SKU master records. |

---

# Who This Is For

This workbook is designed for organizations that manage inventory across warehouses and retail locations while relying on Excel or exported operational data instead of a full ERP implementation.

Typical users include:

- Retail and apparel supply chain managers.
- Warehouse supervisors responsible for inventory accuracy.
- Operations analysts building recurring inventory reports.
- Small and medium-sized businesses managing multiple stores.
- Consultants creating inventory visibility for growing retail operations.

This workbook is **not** intended to replace enterprise ERP or warehouse management systems that require real-time transaction locking, barcode scanning, purchasing automation, or high-volume concurrent data entry.

No spreadsheet expertise is required.

Open the browser edition or download the Excel workbook, import operational transactions, and begin reviewing inventory movements immediately.

---

# About

I build lightweight analytical tools for operational decisions that become difficult once too many moving parts can no longer be understood from memory alone.

Instead of asking, *"How can another dashboard be built?"*, I start with a different question:

**"What information needs to exist in one place so the next operational decision becomes obvious?"**

The **Inventory Operations Control Tool** is one example of that approach—transforming routine operational records into a reusable decision-support framework that helps inventory teams understand what happened before deciding what to do next.
---

# Technical Details

<details>
<summary><strong>For technical reviewers, Excel practitioners, and collaborators</strong></summary>

---

## Workbook Architecture

The workbook separates operational data entry from inventory calculations. Users record business events only once, while inventory positions are reconstructed automatically from those events.

```text
Parameters
Product Master
        │
        ▼
──────────────────────────────────────
Operational Event Tables
──────────────────────────────────────
Bulk Receiving
Breakdown & Production
Waste (Merma)
Warehouse Transfers
Store Sales
        │
        ▼
──────────────────────────────────────
Calculation Engines
──────────────────────────────────────
Warehouse Inventory Engine
Store Inventory Engine
        │
        ▼
──────────────────────────────────────
Management Dashboard
──────────────────────────────────────
KPI Cards
Inventory Health
Sales Performance
Waste Analysis
Inventory Valuation
```

| Layer | Worksheets | Responsibility |
|---------|------------|----------------|
| Configuration | Parameters, Product Master | Standardize master data and validation lists |
| Transaction Input | Receiving, Breakdown, Waste, Transfers, Sales | Record operational events only |
| Calculation | Warehouse Inventory Engine, Store Inventory Engine | Reconstruct inventory automatically |
| Reporting | Dashboard | Present KPIs and operational insights |

Data always flows in one direction:

**Configuration → Business Events → Inventory Engine → Dashboard**

---

## Three Traps That Catch Even Experienced Inventory Managers

### Trap 1 — Treating Warehouse Inventory as Company Inventory

A replenishment order is created because warehouse inventory appears low.

The decision relies on warehouse stock only.

Meanwhile, several stores still hold significant inventory that has not yet been sold.

| Wrong Assumption | Correct Interpretation |
|-----------------|-----------------------|
| Warehouse inventory equals available inventory. | Company inventory equals warehouse inventory plus every retail location. |

Before

```text
Warehouse
SKU-A = 12 pcs

Decision:
Purchase immediately.
```

After

```text
Warehouse = 12

Store A = 31

Store B = 18

Company Total = 61

Decision:
Transfer inventory instead of purchasing.
```

The event-driven model reconstructs inventory across all locations before recommending replenishment.

<details>
<summary>Formula logic</summary>

```excel
Warehouse Stock
=
Production
-
Transfers
-
Warehouse Waste

Company Inventory
=
Warehouse
+
SUM(All Store Inventory)
```

</details>

---

### Trap 2 — Assuming Inventory Loss Happens Only During Physical Counts

Inventory appears accurate until month-end.

A physical count suddenly reveals missing inventory.

Without operational history there is no evidence explaining where the loss occurred.

| Wrong Approach | Correct Approach |
|----------------|-----------------|
| Investigate only after stock discrepancies appear. | Record every waste event when it occurs. |

Before

```text
Month End

Inventory Difference

-148 units

Cause:
Unknown
```

After

```text
Production Defect

42

Transit Damage

35

Store Theft

28

Warehouse Damage

43
```

Management can immediately identify operational weaknesses rather than investigating historical balances.

<details>
<summary>Formula logic</summary>

```excel
Loss Value

=
Quantity

×

Unit Cost
```

</details>

---

### Trap 3 — Correct Inventory Balance, Wrong Operational Decision

The inventory number itself is technically correct.

The interpretation is not.

Sales increase rapidly.

Management schedules additional production.

However, demand increased only because one store received an unusually large transfer last week.

Sales are healthy, but company inventory remains sufficient.

| Incorrect Decision | Correct Decision |
|--------------------|-----------------|
| Increase production. | Rebalance inventory between stores first. |

Inventory balances should always be interpreted together with transfers, sales and operational events rather than as isolated quantities.

<details>
<summary>Formula logic</summary>

```excel
Store Inventory

=
Transfers In

-

Sales

-

Store Waste
```

</details>

---

## Example Scenario

A clothing retailer receives **40 cartons** containing **50 pieces per carton**.

Total estimated inventory:

```text
40 × 50 = 2,000 pieces
```

After quality inspection:

- 1,950 pieces become sellable inventory.
- 50 pieces are rejected during production.

The warehouse distributes inventory:

| Destination | Quantity |
|-------------|---------:|
| Store A | 700 |
| Store B | 500 |
| Warehouse | 750 |

During the following week:

- Store A sells 420 pieces.
- Store B sells 280 pieces.
- Warehouse records 15 damaged units.
- Store B records 8 stolen items.

Instead of reporting only current inventory balances, the workbook reconstructs the complete operational picture.

Management immediately understands:

- where inventory entered the business,
- where losses occurred,
- which stores are selling fastest,
- whether shortages require purchasing or redistribution,
- how much inventory value remains tied up in stock.

The recommendation becomes operational rather than reactive.

Rather than manufacturing another production batch, management can first transfer inventory from slower-moving locations while simultaneously investigating production quality losses.

---

### Formula Reference

<details>
<summary>Product Master</summary>

| Formula | Purpose |
|---------|---------|
| `Model & "-" & Color & "-" & Size` | Generate unique SKU keys |
| `XLOOKUP()` | Retrieve standard cost information |

</details>

<details>
<summary>Receiving</summary>

| Formula | Purpose |
|---------|---------|
| `Box Qty × Pieces per Box` | Calculate estimated received quantity |

</details>

<details>
<summary>Breakdown & Production</summary>

| Formula | Purpose |
|---------|---------|
| `XLOOKUP()` | Retrieve SKU cost |
| SKU concatenation | Standardize inventory identity |

</details>

<details>
<summary>Waste</summary>

| Formula | Purpose |
|---------|---------|
| `Quantity × Unit Cost` | Calculate financial loss |

</details>

<details>
<summary>Warehouse Inventory Engine</summary>

| Formula | Purpose |
|---------|---------|
| `UNIQUE()` | Generate dynamic SKU list |
| `SUMIFS()` | Aggregate production quantities |
| `SUMIFS()` | Aggregate warehouse transfers |
| `SUMIFS()` | Aggregate warehouse waste |
| Final Balance | Production − Transfers − Waste |

</details>

<details>
<summary>Store Inventory Engine</summary>

| Formula | Purpose |
|---------|---------|
| `FILTER()` | Build dynamic store list |
| `TRANSPOSE()` | Create store matrix |
| `SUMIFS()` | Calculate inventory for every Store × SKU combination |

</details>

---

### Validation Rules

| Field | Rule | Error Behavior |
|--------|------|----------------|
| SKU | Must exist in Product Master | Lookup returns blank or `#N/A` |
| Store | Must exist in Parameters | Validation rejects invalid values |
| Waste Type | Must exist in Parameters | Invalid category prevented |
| Transfer Quantity | Positive integer only | Inventory calculation becomes incorrect if violated |
| Sales Quantity | Positive integer only | Negative inventory may appear |
| Unit Cost | Required for valuation | Inventory value cannot be calculated |
| Duplicate SKU Keys | Not permitted | Reporting inconsistencies |
| Blank Product Attributes | Not permitted | SKU generation fails |

</details>

---

## Other Tools in This Series

- Manufacturing Labor Cost & Capacity Planning Toolkit — Analyze labor efficiency, production capacity, and unit manufacturing cost.
- Cross-Border DTC Inventory Governance Console — Improve replenishment and inventory allocation across international fulfillment networks.
- Personal & Business Unified Budget Framework — Manage personal and business cash flow within one integrated financial model.
- Residential Transitional Loan Sizer & Pricer — Evaluate lending scenarios, funding structures, and project feasibility.

More decision-support templates will be published through this GitHub profile and Gumroad store.

---

## License

This project is released under the **Apache License 2.0**.

You are free to use, modify, and distribute this project in accordance with the terms of the Apache License 2.0.
