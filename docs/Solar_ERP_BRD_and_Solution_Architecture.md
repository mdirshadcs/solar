# SolarERP — Business Requirements & Solution Architecture

| Item | Detail |
|---|---|
| Product | SolarERP (working name) — subscription-based (SaaS) ERP for solar companies |
| Document | Part A: BRD · Part B: Solution Architecture · Part C: Security · Part D: Testing & Test Cases |
| Version | 0.3 — Draft for review |
| Date | 2026-10-24 |
| Database | MySQL 8.x (InnoDB) |
| Status | Awaiting business sign-off before implementation |

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-10-24 | First draft: BRD and Solution Architecture |
| 0.2 | 2026-10-24 | Added Part C (security requirements by phase) and Part D (test strategy and test cases by phase) |
| 0.3 | 2026-10-25 | Added HR & Payroll module (A7.19): HR core in Phase 1, payroll in Phase 2, with roles, plans, architecture, security and test cases |

> **How to review this document:** Every requirement has an ID (for example `FR-CRM-003`) so it can be approved, changed or rejected one by one. Priorities use **MoSCoW**: **M** = Must have, **S** = Should have, **C** = Could have, **W** = Won't have now. Section A13 lists the open questions that need an answer before development starts.

---

## Table of Contents

**Part A — Business Requirements (BRD)**
- A1. Executive Summary
- A2. Business Objectives & Success Metrics
- A3. Scope
- A4. Assumptions & Constraints
- A5. Stakeholders & User Roles
- A6. End-to-End Business Process
- A7. Functional Requirements by Module
- A8. Subscription & Commercial Model
- A9. Non-Functional Requirements
- A10. Reports & KPIs
- A11. Integrations
- A12. Release Plan (Phases)
- A13. Risks & Open Questions

**Part B — Solution Architecture**
- B1. Architecture Principles
- B2. System Context
- B3. Architectural Style
- B4. Technology Stack
- B5. Multi-Tenancy Design
- B6. Logical Architecture & Modules
- B7. Data Architecture (MySQL)
- B8. Subscription & Billing Architecture
- B9. Security Architecture
- B10. Integration Architecture
- B11. Mobile & Offline Architecture
- B12. Deployment Architecture
- B13. High Availability, Backup & DR
- B14. Observability
- B15. Performance & Scalability
- B16. Engineering Standards & Code Structure
- B17. Architecture Decision Log
- B18. Implementation Roadmap

**Part C — Security (Phase-wise)**
- C1. Security Objectives & Compliance Baseline
- C2. Data Classification
- C3. Threat Model (STRIDE)
- C4. Security Requirements — Phase 1 (MVP)
- C5. Security Requirements — Phase 2
- C6. Security Requirements — Phase 3
- C7. Default Role & Permission Matrix
- C8. Security Incident Response
- C9. Security Go-Live Gates per Phase

**Part D — Testing & Test Cases (Phase-wise)**
- D1. Test Strategy
- D2. Test Environments & Test Data
- D3. Entry / Exit Criteria & Defect Severity
- D4. Phase 1 — Functional Test Cases
- D5. Phase 1 — End-to-End Scenario
- D6. Phase 1 — Security Test Cases
- D7. Phase 1 — Non-Functional Test Cases
- D8. Phase 2 — Test Cases
- D9. Phase 3 — Test Cases
- D10. Traceability Summary
- D11. UAT Sign-off

---

# PART A — BUSINESS REQUIREMENTS DOCUMENT

## A1. Executive Summary

Solar installation and EPC (Engineering, Procurement & Construction) companies run their business on spreadsheets, WhatsApp groups and generic accounting software. Leads get lost, quotations are inconsistent, panel and inverter serial numbers are not tracked, subsidy and net-metering paperwork is chased by hand, and after-sales service (O&M/AMC) is reactive.

**SolarERP** is a cloud ERP built for the solar business lifecycle — from the first enquiry to 25 years of plant maintenance — sold as a monthly or annual subscription. Each customer company (a *tenant*) gets its own secure workspace, and is billed according to the plan it chooses.

## A2. Business Objectives & Success Metrics

| ID | Objective | Success metric (12 months after launch) |
|---|---|---|
| BO-01 | Give solar companies one system from lead to O&M | ≥ 80% of active tenants use 5 or more modules |
| BO-02 | Faster, more accurate quotations | Quote creation time < 15 minutes (from site survey data) |
| BO-03 | Improve lead conversion | Tenants report ≥ 10% improvement in lead-to-order conversion |
| BO-04 | Full traceability of equipment | 100% of panels/inverters installed are serial-tracked to a project |
| BO-05 | Recurring revenue for the SaaS business | Target MRR and churn < 3% per month (targets TBD by business) |
| BO-06 | Self-service onboarding | A new tenant can sign up, pay and start working in < 30 minutes |

## A3. Scope

### In scope

- Multi-tenant SaaS platform with self-service sign-up, trials and subscription billing
- Segments: **Residential rooftop**, **Commercial & Industrial (C&I) rooftop**, **Ground-mounted plants up to ~5 MWp**
- Business models: **CAPEX** (customer buys the system) — PPA/OPEX in a later phase
- Lifecycle modules: CRM, site survey, system design & sizing, quotation, sales order, project execution, procurement, inventory, installation/field service, regulatory & subsidy tracking, invoicing & payments, O&M/AMC, warranty, customer portal, HR & payroll, reports
- Web application (desktop/tablet) and mobile app (field staff), with offline use for field work
- Integration with accounting software, payment gateways, messaging (Email/SMS/WhatsApp), and inverter monitoring platforms

### Out of scope (for now)

- Full statutory accounting / general ledger (the system integrates with Tally, Zoho Books, QuickBooks, Xero instead)
- Recruitment, performance appraisal and learning management (HR & Payroll covers employees, attendance, leave, timesheets and payroll — see A7.19)
- Direct filing on government portals (EPFO, ESIC, TRACES) — the system generates the files, the tenant files them
- Utility-scale plants (> 5 MWp) and SCADA control
- Detailed 3D shading design (integrate with tools such as PVsyst, Aurora, HelioScope instead)
- Solar panel manufacturing (MES)

## A4. Assumptions & Constraints

| ID | Assumption / Constraint |
|---|---|
| AS-01 | The database is **MySQL 8.x (InnoDB)** — this is a fixed constraint. |
| AS-02 | Primary market is assumed to be India (GST, DISCOM net metering, government subsidy portals), but tax, currency, language and regulatory workflows must be **configurable per tenant** so other countries can be supported. |
| AS-03 | Tenants are small and mid-sized solar companies (2–500 users each). |
| AS-04 | Field technicians often work with poor mobile connectivity — field features must work offline. |
| AS-05 | Customers expect to see documents (quotes, invoices, warranty) as branded PDFs with the tenant's own logo. |
| AS-06 | Pricing figures in this document are placeholders until the business confirms them. |

## A5. Stakeholders & User Roles

### Platform (SaaS provider) roles

| Role | Responsibility |
|---|---|
| Platform Super Admin | Manages plans, tenants, global settings, feature flags |
| Platform Support | Views tenant data **only** with time-limited, audited consent from the tenant |
| Platform Finance | Subscription revenue, refunds, invoices to tenants |

### Tenant (solar company) roles

| Role | Typical user | Main modules |
|---|---|---|
| Tenant Owner / Admin | Company owner, IT admin | Settings, users, subscription, all data |
| Sales Executive | Sales team | CRM, site survey, quotation |
| Design Engineer | Engineering team | Site survey, system design, BOM |
| Project Manager | Project team | Projects, tasks, procurement requests, approvals |
| Procurement Officer | Purchase team | Vendors, purchase orders |
| Store / Warehouse Keeper | Warehouse | Inventory, goods receipt, stock issue, serials |
| Field Technician / Installer | Installation crew | Mobile app: job cards, checklists, photos |
| Liaison Officer | Regulatory team | Subsidy and net-metering applications |
| Accountant | Finance team | Invoices, payments, expenses, accounting export |
| Service Engineer | O&M team | Service tickets, AMC visits, warranty claims |
| HR Manager / Payroll Admin | HR team | Employees, attendance, leave, timesheets, payroll |
| Employee (self-service) | Every staff member | Own profile, attendance, leave, payslips |
| Management | Directors | Dashboards and reports (read-only) |
| End Customer | The solar system buyer | Customer portal (documents, payments, tickets, generation) |

Roles are **templates**. Each tenant can create its own roles and set permissions per module and action (view / create / edit / delete / approve / export).

## A6. End-to-End Business Process

```
 ┌────────┐   ┌────────────┐   ┌──────────────┐   ┌───────────┐   ┌─────────────┐
 │  Lead  │──▶│ Site Survey│──▶│ System Design│──▶│ Quotation │──▶│ Sales Order │
 └────────┘   └────────────┘   └──────────────┘   └───────────┘   └──────┬──────┘
                                                                         │
      ┌──────────────────────────────────────────────────────────────────┘
      ▼
 ┌────────────────┐   ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐
 │ Subsidy / Net  │   │ Procurement │──▶│  Inventory   │──▶│ Installation (field) │
 │ metering apps  │   │  (PO / GRN) │   │ (serials)    │   └──────────┬───────────┘
 └───────┬────────┘   └─────────────┘   └──────────────┘              │
         │                                                            ▼
         │            ┌───────────────────┐   ┌──────────────┐   ┌──────────────┐
         └──────────▶ │ Inspection & Net  │──▶│Commissioning │──▶│   Handover   │
                      │ meter installation│   │ & invoicing  │   │ (docs, warr.)│
                      └───────────────────┘   └──────────────┘   └──────┬───────┘
                                                                        ▼
                                              ┌───────────────────────────────────┐
                                              │ O&M / AMC · Service tickets ·     │
                                              │ Warranty claims · Monitoring      │
                                              └───────────────────────────────────┘
```

**Project stages (default, configurable per tenant):**
`Lead → Qualified → Survey Done → Design Done → Quoted → Won → Advance Received → Material Ready → Installation → Installed → Inspection → Net Meter Installed → Commissioned → Handed Over → Under O&M → Closed`

## A7. Functional Requirements by Module

### A7.1 Tenant Onboarding & Subscription (Platform) — `SUB`

| ID | Requirement | Priority |
|---|---|---|
| FR-SUB-001 | A company can sign up with company name, admin name, email, mobile and country, and receives an email/OTP verification. | M |
| FR-SUB-002 | Each tenant gets a unique workspace URL (e.g. `acme.solarerp.app`). | M |
| FR-SUB-003 | A new tenant starts on a free trial (default 14 days, configurable) with Growth-plan features. | M |
| FR-SUB-004 | The tenant admin can choose a plan, billing cycle (monthly/annual) and number of user seats, and pay online. | M |
| FR-SUB-005 | Upgrades take effect immediately with a prorated charge; downgrades take effect at the next renewal. | M |
| FR-SUB-006 | The system enforces plan limits (users, projects per month, storage, modules) and shows a clear upgrade prompt when a limit is reached. | M |
| FR-SUB-007 | Failed renewals follow a dunning process: retry payment, reminder emails on day 1/3/7, read-only mode after the grace period, suspension after 30 days. | M |
| FR-SUB-008 | Tenants can download GST/tax invoices for every subscription payment. | M |
| FR-SUB-009 | Add-ons can be bought separately (extra storage, WhatsApp message packs, monitoring integration, extra companies/branches). | S |
| FR-SUB-010 | Coupon and discount codes, and partner/reseller referral codes. | S |
| FR-SUB-011 | On cancellation, data stays available read-only for 30 days and can be exported (Excel/CSV + documents ZIP); it is then deleted after 90 days. | M |
| FR-SUB-012 | Platform admin console: tenant list, plan, MRR, usage, status, impersonation with tenant consent and audit. | M |

### A7.2 Administration & Settings — `ADM`

| ID | Requirement | Priority |
|---|---|---|
| FR-ADM-001 | Manage company profile, logo, tax registration numbers (e.g. GSTIN), bank details, and document templates. | M |
| FR-ADM-002 | Multiple branches/locations under one tenant, with branch-level data access. | M |
| FR-ADM-003 | User management: invite, deactivate, reset password, assign roles and branches. | M |
| FR-ADM-004 | Role-based access control with permissions per module and action, including approval rights. | M |
| FR-ADM-005 | Configurable numbering series (e.g. `QT/2026-27/0001`) per document type and branch. | M |
| FR-ADM-006 | Configurable taxes (GST slabs, HSN/SAC codes), currencies and units of measure. | M |
| FR-ADM-007 | Configurable pipeline stages, project stages, checklists and custom fields per entity. | S |
| FR-ADM-008 | Approval workflows (e.g. quotation discount > 10% needs manager approval; PO > a set amount needs director approval). | M |
| FR-ADM-009 | Full audit trail: who changed what, when, old value and new value. | M |
| FR-ADM-010 | Bulk import of masters (customers, items, vendors, opening stock) from Excel with validation report. | M |
| FR-ADM-011 | Two-factor authentication (TOTP/OTP), enforceable by the tenant admin. | S |
| FR-ADM-012 | Single sign-on (Google / Microsoft) for Enterprise plan. | C |

### A7.3 CRM & Lead Management — `CRM`

| ID | Requirement | Priority |
|---|---|---|
| FR-CRM-001 | Capture leads manually, from a web form embed, from Facebook/Google lead ads, IndiaMART/JustDial, or by Excel import. | M |
| FR-CRM-002 | Lead details: name, contact, address with map pin, segment (residential/C&I/ground), monthly electricity bill, sanctioned load, roof type, source. | M |
| FR-CRM-003 | Automatic lead assignment by territory/branch or round-robin. | S |
| FR-CRM-004 | Kanban pipeline view with drag-and-drop stage changes. | M |
| FR-CRM-005 | Activities: calls, meetings, follow-up reminders, notes, with mobile notifications. | M |
| FR-CRM-006 | Duplicate detection on mobile number and email. | M |
| FR-CRM-007 | Lead-lost reasons and competitor tracking. | S |
| FR-CRM-008 | Click-to-call and WhatsApp messaging from the lead record (with templates). | S |
| FR-CRM-009 | Channel partner / dealer leads with commission tracking. | C |

### A7.4 Site Survey — `SRV`

| ID | Requirement | Priority |
|---|---|---|
| FR-SRV-001 | Schedule a survey and assign it to a surveyor; the surveyor sees it in the mobile app. | M |
| FR-SRV-002 | Mobile survey form (works offline): roof type, usable roof area, orientation (azimuth), tilt, obstructions/shading, structure condition, earthing location, meter location, cable route distance. | M |
| FR-SRV-003 | Capture geo-tagged, time-stamped photos and short videos. | M |
| FR-SRV-004 | Record the electricity connection: consumer number, DISCOM, phase, sanctioned load, tariff category, last 12 months of units/bills (photo + values). | M |
| FR-SRV-005 | Customer signature on the survey report. | S |
| FR-SRV-006 | Survey report PDF generated automatically. | M |

### A7.5 System Design & Sizing — `DSN`

| ID | Requirement | Priority |
|---|---|---|
| FR-DSN-001 | Recommend system size (kWp) from consumption, roof area and sanctioned load (see business rules below). | M |
| FR-DSN-002 | Select panel model, inverter model, structure type and BOS (balance of system) from the item master. | M |
| FR-DSN-003 | Calculate panel count, string configuration hints, DC/AC ratio, and warn when values are outside configured limits. | M |
| FR-DSN-004 | Estimate annual generation using location irradiance (PVGIS / NREL PVWatts API, or tenant-entered peak sun hours). | M |
| FR-DSN-005 | Generate the BOM (bill of materials) automatically from **BOM templates** (e.g. "3 kW residential on-grid, RCC roof"). | M |
| FR-DSN-006 | Attach design files (single-line diagram, layout drawings, PVsyst reports). | M |
| FR-DSN-007 | Keep design versions; a quotation always points to one design version. | M |

**Business rules (defaults, editable per tenant):**

| Calculation | Formula |
|---|---|
| Required size (kWp) | `annual units ÷ (peak sun hours × 365 × performance ratio)` — default PR = 0.78 |
| Panel count | `ceil(system size W ÷ panel Wp)` |
| Actual DC size | `panel count × panel Wp ÷ 1000` |
| Roof area needed | `DC size × area per kWp` — default 6 m² per kWp |
| DC/AC ratio | `DC size ÷ inverter AC rating` — warn outside 1.0–1.3 |
| Annual generation (kWh) | `DC size × peak sun hours × 365 × PR` |
| Annual savings | `annual generation × applicable tariff` (with yearly tariff escalation) |
| Simple payback (years) | `(system cost − subsidy) ÷ annual savings` |
| Panel degradation | Yearly reduction — default 0.5% per year over 25 years |

### A7.6 Quotation & Proposal — `QTN`

| ID | Requirement | Priority |
|---|---|---|
| FR-QTN-001 | Create a quotation from a design version; line items come from the BOM with price list, discount and tax. | M |
| FR-QTN-002 | Price lists per segment/branch, and price per Wp or per item. | M |
| FR-QTN-003 | Show margin to internal users only; block quotations below a minimum margin unless approved. | M |
| FR-QTN-004 | Branded proposal PDF: company profile, system details, generation chart, 25-year savings, payback, ROI, subsidy, payment terms, warranty terms. | M |
| FR-QTN-005 | Quotation revisions with history (Rev 0, Rev 1…). | M |
| FR-QTN-006 | Send by email/WhatsApp with a secure link; track when the customer opens it. | M |
| FR-QTN-007 | Customer can accept online (e-signature / OTP acceptance). | S |
| FR-QTN-008 | Offer financing options (EMI calculation with partner lenders). | C |

### A7.7 Sales Order & Contract — `SO`

| ID | Requirement | Priority |
|---|---|---|
| FR-SO-001 | Convert an accepted quotation into a sales order with one click. | M |
| FR-SO-002 | Payment milestones (e.g. 30% advance, 60% on material delivery, 10% on commissioning). | M |
| FR-SO-003 | Generate the contract/agreement from a template. | S |
| FR-SO-004 | Creating a sales order automatically creates the project and the regulatory application checklist. | M |

### A7.8 Project Management — `PRJ`

| ID | Requirement | Priority |
|---|---|---|
| FR-PRJ-001 | Project record with customer, site, system details, sales order, team, and stage. | M |
| FR-PRJ-002 | Project templates with standard milestones and tasks per segment. | M |
| FR-PRJ-003 | Task list, Gantt/timeline view, dependencies, due dates and owners. | S |
| FR-PRJ-004 | Material planning: compare BOM vs. reserved vs. issued vs. installed. | M |
| FR-PRJ-005 | Project document repository (customer KYC, drawings, approvals, photos, certificates). | M |
| FR-PRJ-006 | Project costing: material, labour, subcontractor and other expenses vs. budget; project profitability. | M |
| FR-PRJ-007 | Subcontractor work orders and bills. | S |
| FR-PRJ-008 | Delay alerts when a stage exceeds its target duration. | S |

### A7.9 Procurement — `PUR`

| ID | Requirement | Priority |
|---|---|---|
| FR-PUR-001 | Vendor master with tax numbers, bank details, rating and approved items. | M |
| FR-PUR-002 | Purchase requisition from projects or from re-order levels. | M |
| FR-PUR-003 | Request for quotation to multiple vendors and comparison sheet. | S |
| FR-PUR-004 | Purchase order with approval workflow, PDF and email to vendor. | M |
| FR-PUR-005 | Goods receipt note (GRN) against PO, partial receipts, quality check, and **serial number capture** (barcode/QR scan) for panels, inverters and batteries. | M |
| FR-PUR-006 | Purchase returns and vendor bills; 3-way match (PO–GRN–bill). | S |

### A7.10 Inventory & Warehouse — `INV`

| ID | Requirement | Priority |
|---|---|---|
| FR-INV-001 | Item master: category, make, model, specs (Wp, efficiency, kVA, battery Ah), HSN, UoM, warranty period, serial-tracked flag. | M |
| FR-INV-002 | Multiple warehouses, including site/van locations. | M |
| FR-INV-003 | Stock transactions: receipt, issue to project, transfer, return, adjustment — every movement recorded. | M |
| FR-INV-004 | **Serial number tracking**: each panel/inverter/battery serial is traced from GRN → warehouse → project → installed position → warranty. | M |
| FR-INV-005 | Batch/lot tracking for consumables such as cables (by drum). | S |
| FR-INV-006 | Stock reservation for projects. | M |
| FR-INV-007 | Re-order levels and low-stock alerts. | M |
| FR-INV-008 | Stock valuation (weighted average cost), ageing report. | M |
| FR-INV-009 | Barcode/QR label printing and mobile scanning. | S |

### A7.11 Installation & Field Service — `FLD`

| ID | Requirement | Priority |
|---|---|---|
| FR-FLD-001 | Job cards assigned to crews with date, site address, navigation link, and material list. | M |
| FR-FLD-002 | Mobile app works **offline** and syncs when connectivity returns. | M |
| FR-FLD-003 | Installation checklists per stage (structure, panel mounting, DC cabling, inverter, earthing, lightning arrester, AC side, commissioning tests). | M |
| FR-FLD-004 | Geo-tagged before/during/after photos required for each checklist step (configurable). | M |
| FR-FLD-005 | Scan serial numbers of installed panels/inverters to link them to the project. | M |
| FR-FLD-006 | Record commissioning test values (Voc, Isc, insulation resistance, earthing resistance). | M |
| FR-FLD-007 | Crew check-in/check-out with GPS for attendance and timesheets. | S |
| FR-FLD-008 | Customer sign-off on completion. | M |

### A7.12 Regulatory, Subsidy & Net Metering — `REG`

| ID | Requirement | Priority |
|---|---|---|
| FR-REG-001 | Configurable application workflows per DISCOM/state/scheme (e.g. national rooftop subsidy scheme, net-metering application). | M |
| FR-REG-002 | Track each step: application submitted, feasibility approval, inspection, meter installation, subsidy claim, subsidy received. | M |
| FR-REG-003 | Document checklist per step with uploads and expiry. | M |
| FR-REG-004 | Generate standard forms/letters from templates (work completion report, undertakings). | S |
| FR-REG-005 | Reminders for pending steps and dashboard of applications by status and age. | M |
| FR-REG-006 | Track subsidy amounts expected vs. received per project. | M |

### A7.13 Finance — `FIN`

| ID | Requirement | Priority |
|---|---|---|
| FR-FIN-001 | Tax invoices (GST-compliant: CGST/SGST/IGST, HSN, place of supply) against sales order milestones. | M |
| FR-FIN-002 | Support for composite supply rules on solar systems (configurable tax split between goods and services). | M |
| FR-FIN-003 | E-invoicing (IRN) and e-way bill integration for eligible tenants. | S |
| FR-FIN-004 | Receipts against invoices (cash, bank, UPI, online link) and advance adjustments. | M |
| FR-FIN-005 | Credit/debit notes. | M |
| FR-FIN-006 | Customer statement and receivables ageing; payment reminders. | M |
| FR-FIN-007 | Vendor payables and payment tracking. | S |
| FR-FIN-008 | Expense claims for field staff with receipt photos and approval. | S |
| FR-FIN-009 | Export/sync to Tally, Zoho Books, QuickBooks or Xero. | M |
| FR-FIN-010 | Online payment links for customers (via the tenant's own payment gateway account). | S |

### A7.14 O&M, AMC, Service & Warranty — `SVC`

| ID | Requirement | Priority |
|---|---|---|
| FR-SVC-001 | Installed base register: every commissioned plant with its equipment and serials. | M |
| FR-SVC-002 | AMC contracts with visit schedules (e.g. quarterly cleaning, half-yearly inspection) and automatic visit generation. | M |
| FR-SVC-003 | Service tickets from customer portal, phone, WhatsApp or monitoring alerts, with SLA timers. | M |
| FR-SVC-004 | Assign tickets to service engineers; mobile job card with checklist and spare-part usage. | M |
| FR-SVC-005 | Warranty tracking per serial (product warranty, performance warranty, workmanship warranty) and expiry alerts. | M |
| FR-SVC-006 | Warranty claims with manufacturer (RMA) and replacement tracking. | S |
| FR-SVC-007 | AMC renewal reminders and renewal invoicing. | M |

### A7.15 Plant Monitoring Integration — `MON` (Phase 2)

| ID | Requirement | Priority |
|---|---|---|
| FR-MON-001 | Connect inverter cloud platforms (e.g. Huawei FusionSolar, SMA, Growatt, Solis, SolarEdge, Enphase) per plant. | S |
| FR-MON-002 | Daily generation import and comparison with expected generation. | S |
| FR-MON-003 | Automatic service ticket when a plant is offline or underperforms beyond a threshold. | S |
| FR-MON-004 | Generation shown in customer portal. | S |

### A7.16 Customer Portal & App — `CPT`

| ID | Requirement | Priority |
|---|---|---|
| FR-CPT-001 | Customer logs in with mobile OTP. | M |
| FR-CPT-002 | See project status/timeline, documents (quote, invoice, warranty, commissioning report). | M |
| FR-CPT-003 | Pay invoices online. | S |
| FR-CPT-004 | Raise and track service tickets. | M |
| FR-CPT-005 | Refer a friend (referral becomes a lead). | C |

### A7.17 Notifications — `NTF`

| ID | Requirement | Priority |
|---|---|---|
| FR-NTF-001 | In-app, email, SMS and WhatsApp notifications driven by configurable event rules. | M |
| FR-NTF-002 | Tenant-editable templates with placeholders (customer name, amount, link). | M |
| FR-NTF-003 | Users can control which notifications they receive. | S |

### A7.18 Reports & Dashboards — `RPT`

| ID | Requirement | Priority |
|---|---|---|
| FR-RPT-001 | Role-based dashboards (sales, projects, inventory, finance, service, HR, management). | M |
| FR-RPT-002 | Standard reports (see A10) with filters, Excel/PDF export and scheduled email delivery. | M |
| FR-RPT-003 | Custom report builder (choose columns, filters, grouping). | C |

### A7.19 HR & Payroll — `HR` (Phase 1) · `PAY` (Phase 2)

Solar companies run large field crews (own technicians and contract labour), so this module ties people, attendance and labour cost directly to projects. **HR core** (employees, attendance, leave, timesheets) is in Phase 1 because project labour costing depends on it; **Payroll** follows in Phase 2.

**HR core — Phase 1**

| ID | Requirement | Priority |
|---|---|---|
| FR-HR-001 | Employee master: personal details, employee code (numbering series), joining date, branch, department, designation, grade, reporting manager, employment type (permanent / contract / apprentice), documents. An employee may or may not have a login. | M |
| FR-HR-002 | Statutory and bank details stored securely: PAN, UAN (PF), ESIC number, bank account; Aadhaar stored as last 4 digits only. | M |
| FR-HR-003 | Organisation structure: departments, designations, grades, org chart. | S |
| FR-HR-004 | Contract labour register: contractor firm, workers, daily rate or piece rate, attendance per site. | S |
| FR-HR-005 | Attendance from the mobile app (GPS check-in at site, linked to FR-FLD-007), web, or biometric device import; shifts, weekly offs and holiday calendars per branch. | M |
| FR-HR-006 | Attendance regularisation (missed punch) with manager approval. | S |
| FR-HR-007 | Leave types and policies (accrual, carry forward, encashment, sandwich rule), balances, apply and approve on mobile. | M |
| FR-HR-008 | Timesheets: hours per project / job card at the employee's labour cost rate, posted to project costing (FR-PRJ-006). | M |
| FR-HR-009 | Overtime requests with approval, passed to payroll. | S |
| FR-HR-010 | Skills and safety certifications (electrical licence, working-at-height, first aid) with expiry alerts; warn or block when assigning a technician with an expired certificate to a job. | S |
| FR-HR-011 | Employee self-service: own profile, attendance, leave, documents (and payslips from Phase 2). | M |
| FR-HR-012 | Onboarding and exit checklists, including tools, PPE and SIM cards issued and returned. | C |

**Payroll — Phase 2**

| ID | Requirement | Priority |
|---|---|---|
| FR-PAY-001 | Salary structures and components (basic, HRA, allowances, deductions) with formulas, templates per grade, and salary revisions with effective dates. | M |
| FR-PAY-002 | Monthly payroll run: attendance and loss-of-pay, overtime, arrears, incentives (e.g. sales commission), reimbursements → gross, deductions, net pay. Mid-month joiners and leavers paid pro rata. | M |
| FR-PAY-003 | Statutory deductions for India, all **configurable** (rates, ceilings, state slabs and effective dates) because rules change: PF (EPF/EPS), ESI, Professional Tax by state, Labour Welfare Fund, TDS on salary (old/new regime, investment declarations and proofs). | M |
| FR-PAY-004 | Payroll workflow: draft → review → approve → lock. Locked payroll cannot be edited; corrections go into the next run as arrears. | M |
| FR-PAY-005 | Password-protected payslip PDFs, emailed and available in self-service. | M |
| FR-PAY-006 | Bank salary transfer files in bank-specific formats; payment status tracking. | M |
| FR-PAY-007 | Statutory output files: EPF ECR, ESIC contribution file, Professional Tax data, Form 24Q data and Form 16. (Filing on government portals is done by the tenant.) | M |
| FR-PAY-008 | Loans and salary advances with monthly EMI recovery. | S |
| FR-PAY-009 | Full & final settlement: notice-period recovery, leave encashment, gratuity (eligibility and formula configurable). | S |
| FR-PAY-010 | Contract labour payments by day rate or piece rate (e.g. ₹ per kWp installed), linked to completed job cards. | S |
| FR-PAY-011 | Payroll accounting journal exported to the accounting software (Tally, Zoho Books, etc.). | M |
| FR-PAY-012 | Approved expense claims (FR-FIN-008) paid through payroll if the tenant chooses. | S |

## A8. Subscription & Commercial Model

### Plans (pricing placeholders — to be confirmed)

| Feature / Limit | Starter | Growth | Enterprise |
|---|---|---|---|
| Target customer | Small installers | Growing EPC companies | Large EPC / multi-branch |
| Included users | 5 | 20 | 50+ (custom) |
| Extra user | per user/month | per user/month | Negotiated |
| Projects per month | 20 | 100 | Unlimited |
| Branches | 1 | 3 | Unlimited |
| Storage | 10 GB | 50 GB | 250 GB+ |
| CRM, Survey, Design, Quotation | ✔ | ✔ | ✔ |
| Projects, Inventory, Procurement | ✔ | ✔ | ✔ |
| Field mobile app (offline) | ✔ | ✔ | ✔ |
| Regulatory & subsidy tracking | ✔ | ✔ | ✔ |
| Finance & accounting export | Basic | ✔ | ✔ |
| O&M / AMC / Warranty | — | ✔ | ✔ |
| HR core (employees, attendance, leave, timesheets) | ✔ | ✔ | ✔ |
| Payroll (Phase 2) | Add-on | Add-on | ✔ |
| Customer portal | — | ✔ | ✔ |
| Approval workflows | Basic | ✔ | Advanced |
| Plant monitoring integration | — | Add-on | ✔ |
| API access & webhooks | — | — | ✔ |
| SSO, custom domain | — | — | ✔ |
| Dedicated database (isolation) | — | — | Optional add-on |
| Support | Email | Email + Chat | Dedicated manager, SLA |
| Price (monthly / annual) | TBD | TBD | Custom quote |

### Commercial rules

| ID | Rule |
|---|---|
| CR-01 | Annual billing gets a discount (default 2 months free — configurable). |
| CR-02 | Prices are stored per currency; tax (e.g. 18% GST) is added on the subscription invoice. |
| CR-03 | Seat count can be increased anytime (prorated); decreased at renewal. |
| CR-04 | Trial converts to paid only after explicit payment; trial data is kept for 30 days if not converted. |
| CR-05 | Enterprise contracts can be invoiced offline (bank transfer) with manual activation by Platform Finance. |
| CR-06 | Usage-based add-ons (WhatsApp/SMS messages) are prepaid packs. |

### Subscription lifecycle

```
            sign-up                pay                   renewal fails
  (none) ──────────▶ TRIALING ───────────▶ ACTIVE ─────────────────────▶ PAST_DUE
                        │                  ▲   │                          │   │
             trial ends │      payment ok  │   │ cancel (end of term)     │   │ grace period
              no payment│                  └───┼──────────────────────────┘   │ over (7 days)
                        ▼                      ▼                              ▼
                     EXPIRED              CANCELLED ◀──── 30 days ──── SUSPENDED (read-only)
                        │                      │
                        └──── 90 days ─────────┴──────────▶ DATA DELETED (after export window)
```

## A9. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Availability | 99.9% monthly uptime for the web app and API (excluding announced maintenance). |
| NFR-02 | Performance | 95% of page/API responses < 500 ms; reports < 5 s for 1 year of data; PDF generation < 10 s. |
| NFR-03 | Scalability | Support 1,000 tenants and 20,000 users on the initial architecture without redesign. |
| NFR-04 | Data isolation | A tenant must never be able to see another tenant's data — verified by automated tests on every release. |
| NFR-05 | Security | OWASP Top 10 and OWASP ASVS Level 2; annual third-party penetration test. |
| NFR-06 | Encryption | TLS 1.2+ in transit; encryption at rest for database, backups and files. |
| NFR-07 | Backup | RPO ≤ 15 minutes; RTO ≤ 4 hours; backups kept 35 days; monthly restore test. |
| NFR-08 | Privacy | Compliance with India's DPDP Act 2023 (and GDPR for EU tenants): consent, data export, deletion. |
| NFR-09 | Audit | Every create/update/delete and every login is logged and retained for 3 years. |
| NFR-10 | Usability | Responsive web (desktop, tablet); mobile app for Android (Phase 1) and iOS (Phase 2). |
| NFR-11 | Localization | Multi-language UI (English first; Hindi and regional languages later), multi-currency, time zones, date formats. |
| NFR-12 | Offline | Field app works fully offline for surveys, job cards and checklists for at least 7 days. |
| NFR-13 | Accessibility | WCAG 2.1 AA for the web application. |
| NFR-14 | Maintainability | Automated test coverage ≥ 70% for business logic; zero-downtime deployments. |

## A10. Reports & KPIs

| Area | Reports |
|---|---|
| Sales | Lead funnel by stage/source, conversion rate, sales by executive, quotation win/loss, average deal size (₹/Wp), lost reasons |
| Projects | Projects by stage, ageing per stage, delayed projects, installed kWp per month, project profitability |
| Inventory | Stock on hand by warehouse, stock valuation, ageing, serial history, reserved vs. free stock, re-order list |
| Procurement | Open POs, vendor performance (on-time delivery), price trend per item |
| Regulatory | Applications by status and age, subsidy expected vs. received |
| Finance | Receivables ageing, collections forecast from milestones, invoice register, tax summary |
| Service | Open tickets, SLA compliance, first-time fix rate, AMC renewals due, warranty expiries |
| HR & Payroll | Headcount by branch/department, attendance and absenteeism, leave balances, overtime, labour cost per project and per kWp installed, certification expiries, payroll register, statutory contribution summary (PF/ESI/PT/TDS), salary cost trend |
| Monitoring | Expected vs. actual generation, underperforming plants |
| Platform (SaaS) | MRR/ARR, churn, trial conversion, active users per tenant, feature usage |

## A11. Integrations

| System | Purpose | Phase |
|---|---|---|
| Payment gateway for SaaS billing (Razorpay Subscriptions / Stripe Billing) | Collect subscription payments, mandates, webhooks | 1 |
| Email (Amazon SES / SendGrid) | Transactional email | 1 |
| SMS & WhatsApp Business API (e.g. Gupshup, Twilio, Meta Cloud API) | OTP, notifications, quote sharing | 1 |
| Maps (Google Maps) | Address, geocoding, site navigation | 1 |
| Irradiance data (PVGIS, NREL PVWatts) | Generation estimates | 1 |
| Biometric attendance devices (file import or device API) | Attendance | 1 |
| Bank salary file formats; EPF ECR, ESIC and Form 24Q file formats | Payroll payments and statutory files | 2 |
| Accounting (Tally, Zoho Books, QuickBooks, Xero) | Sync invoices, receipts, vendors, customers | 1 (export) / 2 (live sync) |
| GST e-invoice / e-way bill (via GSP) | Statutory compliance | 2 |
| Lead sources (Facebook Lead Ads, Google Ads, IndiaMART, website forms) | Lead capture | 2 |
| Inverter monitoring platforms | Generation and alarms | 2 |
| E-signature (e.g. DocuSign, Leegality, Aadhaar eSign) | Quote/contract acceptance | 2 |
| Public REST API & webhooks | Tenant custom integrations | 2 (Enterprise) |

## A12. Release Plan (Phases)

| Phase | Name | Content |
|---|---|---|
| **Phase 1 — MVP** | Sell, build, bill | Tenant sign-up, subscription & billing, admin/RBAC, CRM, site survey, design & sizing, quotation, sales order, projects, procurement, inventory with serials, field app (Android, offline), regulatory tracking, invoicing & receipts, accounting export, HR core (employees, attendance, leave, timesheets), core reports, notifications |
| **Phase 2** | Service & connect | O&M/AMC, service tickets, warranty & RMA, customer portal, payroll, monitoring integrations, e-invoice/e-way bill, e-signature, lead-source integrations, iOS app, public API |
| **Phase 3** | Scale & grow | PPA/OPEX billing (meter readings → monthly energy invoices), custom report builder, dealer/channel partner portal, AI lead scoring and generation-anomaly detection, multi-country packs |

A phase can go live only when it passes its **security gate** (Part C, section C9) and meets its **test exit criteria** (Part D, section D3).

## A13. Risks & Open Questions

### Risks

| ID | Risk | Mitigation |
|---|---|---|
| RK-01 | Regulatory workflows differ by state/DISCOM and change often | Make workflows configurable data, not code; ship templates per state |
| RK-02 | Data leak between tenants | Tenant isolation enforced in the data access layer + automated isolation tests (B5) |
| RK-03 | Field staff resist using the app | Simple offline-first UX, local languages, photo-driven checklists |
| RK-04 | Scope too big for MVP | Strict phase plan (A12); only **M** priorities in Phase 1 |
| RK-05 | Inverter APIs are unstable/vary by vendor | Connector framework with per-vendor adapters, Phase 2 |
| RK-06 | Tax rules on solar change | Tax rules configurable; no hard-coded rates |

### Open questions (please answer before development)

1. **Market:** Is India the launch market? Which states/DISCOMs first?
2. **Segments:** Confirm residential + C&I + ground-mount up to 5 MWp. Is off-grid / hybrid with batteries needed in Phase 1?
3. **Plans & pricing:** Confirm plan names, limits and prices in A8.
4. **SaaS payment gateway:** Razorpay, Stripe or both?
5. **Accounting:** Which accounting software do target customers use most (Tally?), and is export enough for Phase 1?
6. **Hosting:** Public cloud (AWS Mumbai region recommended) or own data centre on the MySQL InnoDB Cluster?
7. **Branding:** Product name and domain.
8. **Team:** In-house developers or a vendor? This changes the technology choice in B4.
9. **Languages:** Which UI languages besides English in Phase 1?
10. **Existing data:** Will early customers migrate data from another system?

---

# PART B — SOLUTION ARCHITECTURE

## B1. Architecture Principles

| # | Principle | What it means in practice |
|---|---|---|
| P1 | **Tenant isolation first** | Every query is tenant-scoped automatically; no developer can forget it. |
| P2 | **Modular monolith, not microservices (yet)** | One deployable application with strict module boundaries; split only when a module has a proven scaling need. |
| P3 | **Configuration over code** | Stages, checklists, approval rules, tax rates, regulatory workflows and templates are data. |
| P4 | **API-first** | The web app, mobile app and integrations all use the same documented REST API. |
| P5 | **Offline-first for field** | The mobile app stores work locally and syncs. |
| P6 | **Asynchronous for slow work** | PDFs, emails, imports, reports and integrations run in background workers. |
| P7 | **Secure by default** | Least privilege, encryption everywhere, audit everything. |
| P8 | **Automate operations** | Infrastructure as code, CI/CD, automated backups and monitoring. |

## B2. System Context

```
                         ┌───────────────────────────────────────────┐
  Tenant users ─────────▶│                                           │◀──── Platform admins
  (web browser)          │                                           │
                         │                SolarERP                   │
  Field staff ──────────▶│        (multi-tenant SaaS platform)       │◀──── End customers
  (mobile app, offline)  │                                           │      (portal / OTP)
                         └───┬───────┬────────┬────────┬────────┬────┘
                             │       │        │        │        │
                ┌────────────┘       │        │        │        └────────────────┐
                ▼                    ▼        ▼        ▼                         ▼
       ┌─────────────────┐  ┌────────────┐ ┌──────┐ ┌──────────────┐  ┌───────────────────┐
       │ Payment gateway │  │ Email/SMS/ │ │ Maps │ │ Accounting   │  │ Inverter monitoring│
       │ (Razorpay/Stripe)│ │ WhatsApp   │ │ PVGIS│ │ Tally/Zoho/  │  │ clouds (Huawei,    │
       └─────────────────┘  └────────────┘ └──────┘ │ QuickBooks   │  │ SMA, Growatt…)     │
                                                    └──────────────┘  └───────────────────┘
```

## B3. Architectural Style

**Decision: Modular monolith + background workers, on containers.**

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Microservices from day 1 | Independent scaling and deploys | High operational cost, distributed transactions (order → stock → invoice), slow MVP | ✘ Not now |
| **Modular monolith** | Simple deploy, ACID transactions across modules in MySQL, fast development, easy to split later | Needs discipline on module boundaries | ✔ **Chosen** |
| Low-code / existing ERP (Odoo, ERPNext) customisation | Fast start | Hard to build SaaS billing/branding on it, license & upgrade constraints, PostgreSQL/MariaDB based | ✘ |

**Rules that keep the monolith modular:**
- Each module owns its tables; other modules **never** query them directly — they call the module's service interface.
- Modules talk through **service interfaces** (synchronous) or **domain events** (asynchronous, via the outbox pattern, B10).
- Architecture tests in CI fail the build if a module imports another module's internals.

## B4. Technology Stack

The stack below is the recommendation. It assumes a team comfortable with TypeScript; if the team is mainly Java or PHP, the equivalent row applies — the architecture does not change.

| Layer | Recommended | Alternative (if team prefers) |
|---|---|---|
| Backend language/framework | **Node.js 22 LTS + TypeScript + NestJS** | Java 21 + Spring Boot 3 · PHP 8.3 + Laravel 11 |
| ORM / DB access | **Prisma** or **TypeORM** with MySQL driver | JPA/Hibernate · Eloquent |
| DB migrations | Prisma Migrate / **Flyway** (SQL files, reviewable) | Liquibase · Laravel migrations |
| Database | **MySQL 8.4 LTS (InnoDB, utf8mb4)** | — (fixed) |
| Cache, sessions, rate limiting | **Redis 7** | — |
| Background jobs / queue | **BullMQ** (Redis) | Spring Batch + RabbitMQ · Laravel Horizon |
| Web frontend | **React 18 + TypeScript + Vite**, Ant Design or MUI, TanStack Query | Angular · Vue 3 |
| Mobile app | **React Native (Expo)** with **SQLite / WatermelonDB** for offline | Flutter + Drift |
| File storage | **S3-compatible object storage** (AWS S3 / MinIO on-prem) | — |
| PDF generation | **Gotenberg** (HTML → PDF in a container) or Puppeteer | JasperReports |
| Search (Phase 2) | MySQL FULLTEXT first → **OpenSearch** when needed | Meilisearch |
| Auth | Built-in JWT (short-lived access + refresh tokens) with optional **Keycloak** for SSO (Enterprise) | Auth0 / AWS Cognito |
| API docs | OpenAPI 3.1 (auto-generated), Swagger UI | — |
| Containers & orchestration | **Docker + Kubernetes** (AWS EKS) — or AWS ECS Fargate for a smaller team | Docker Compose on VMs (only for staging) |
| Infrastructure as code | **Terraform** | Pulumi |
| CI/CD | **GitHub Actions** (or GitLab CI) + Argo CD | Jenkins |
| Observability | **OpenTelemetry → Grafana (Loki, Tempo, Prometheus)** | Datadog / New Relic |
| Error tracking | **Sentry** | — |

## B5. Multi-Tenancy Design

### Model

**Decision: Shared database, shared schema, `tenant_id` column on every tenant-owned table** — with an option to move an Enterprise tenant into its own dedicated database (same schema) later.

| Model | Isolation | Cost | Operations | Used for |
|---|---|---|---|---|
| **Shared schema + `tenant_id`** | Logical | Lowest | One schema to migrate | Starter & Growth (default) |
| Database per tenant | Physical | Higher | Migrate N databases | Enterprise "dedicated DB" add-on |

### How a request is tied to a tenant

```
  Request: https://acme.solarerp.app/api/v1/projects
     │
     ▼
  1. Edge resolves tenant from subdomain (acme) ──▶ tenant_id = 42 (cached in Redis)
  2. Auth guard validates JWT ──▶ token.tenant_id must equal 42, else 403
  3. Tenant context set for the request (AsyncLocalStorage / request scope)
  4. Data access layer adds  "WHERE tenant_id = 42"  to every query automatically
     and sets tenant_id = 42 on every insert
  5. Response
```

### Isolation safeguards (MySQL has no row-level security, so these are mandatory)

1. **Central data-access layer:** a base repository / ORM middleware injects `tenant_id` into every SELECT, UPDATE, DELETE and INSERT. Raw SQL is only allowed through a helper that requires `tenant_id`.
2. **Composite keys and indexes start with `tenant_id`** — e.g. `UNIQUE (tenant_id, quotation_no)`, `INDEX (tenant_id, status, created_at)`.
3. **Foreign keys include `tenant_id`** where practical (`FOREIGN KEY (tenant_id, project_id) REFERENCES projects (tenant_id, id)`), so a row cannot point at another tenant's record.
4. **Automated isolation tests:** for every API endpoint, a test creates data in tenant A and asserts tenant B gets 404.
5. **Files:** object keys are prefixed `tenants/{tenant_id}/…`; downloads only through short-lived signed URLs issued after a permission check.
6. **Cache keys** are prefixed with `tenant_id`.
7. **Background jobs** carry `tenant_id` in the job payload and set the tenant context before running.
8. **Platform support access** uses a separate, audited "impersonation" flow with tenant consent and an expiry time.

## B6. Logical Architecture & Modules

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ CLIENTS        Web app (React)      Mobile app (React Native, offline)   Customer    │
│                                                                          portal      │
└───────────────────────────────────────────┬─────────────────────────────────────────┘
                                            │ HTTPS (REST/JSON)
┌───────────────────────────────────────────▼─────────────────────────────────────────┐
│ EDGE           CDN + WAF ── Load balancer / Ingress ── Rate limiting                 │
└───────────────────────────────────────────┬─────────────────────────────────────────┘
┌───────────────────────────────────────────▼─────────────────────────────────────────┐
│ API APPLICATION (modular monolith, stateless, N replicas)                            │
│  ┌────────────── Cross-cutting: Auth · Tenant context · RBAC · Audit · Validation ─┐ │
│  │                                                                                 │ │
│  │  Platform:  Tenants · Plans · Subscriptions · Entitlements · Usage metering     │ │
│  │  Core:      Users & Roles · Branches · Settings · Numbering · Workflow/Approvals │ │
│  │             Custom fields · Documents · Notifications · Audit log               │ │
│  │  Sales:     CRM · Site survey · Design & sizing · Quotation · Sales order       │ │
│  │  Execution: Projects · Field service · Regulatory & subsidy                     │ │
│  │  Supply:    Items · Procurement · Inventory & serials · Warehouses              │ │
│  │  Finance:   Invoicing · Receipts · Credit notes · Expenses · Accounting export  │ │
│  │  Service:   Installed base · AMC · Tickets · Warranty  (Phase 2)                │ │
│  │  People:    HR · Attendance · Leave · Timesheets · Payroll (Phase 2)            │ │
│  │  Insights:  Dashboards · Reports                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────┬───────────────────────┬────────────────────────────┘
           │                      │ jobs/events           │
┌──────────▼─────────┐  ┌─────────▼──────────────┐  ┌──────▼──────────────────────────┐
│ MySQL 8.4 (primary │  │ WORKERS (N replicas)   │  │ Redis (cache, sessions, queues) │
│ + read replica)    │  │ PDFs · Email/SMS/WA ·  │  └─────────────────────────────────┘
└────────────────────┘  │ Imports · Reports ·    │  ┌─────────────────────────────────┐
                        │ Integrations · Billing │──▶ Object storage (S3/MinIO)       │
                        │ webhooks · Schedulers  │  └─────────────────────────────────┘
                        └────────────────────────┘
```

### Key cross-cutting services

| Service | Responsibility |
|---|---|
| **Entitlement service** | Answers "is feature X / limit Y allowed for this tenant right now?" — cached in Redis, checked by an API guard and by the UI to hide/disable features. |
| **Workflow & approval engine** | Generic state machines and approval rules stored as configuration (used by quotations, POs, expenses, regulatory steps). |
| **Numbering service** | Gap-free document numbers per tenant/branch/series using a locked counter row (`SELECT … FOR UPDATE`). |
| **Document service** | Uploads, versioning, virus scanning, signed URLs, PDF rendering from templates. |
| **Notification service** | Event → rule → template → channel (in-app, email, SMS, WhatsApp), with delivery logs. |
| **Audit service** | Writes before/after values for every change asynchronously to an append-only audit table. |

## B7. Data Architecture (MySQL)

### Database conventions

| Topic | Standard |
|---|---|
| Engine / charset | InnoDB, `utf8mb4`, collation `utf8mb4_0900_ai_ci` |
| Primary keys | `BIGINT UNSIGNED AUTO_INCREMENT` (internal); a `public_id CHAR(26)` ULID for URLs and APIs on main entities (so IDs cannot be guessed) |
| Tenant column | `tenant_id BIGINT UNSIGNED NOT NULL` on every tenant-owned table, first column in every composite index |
| Money | `DECIMAL(18,2)` for amounts, `DECIMAL(18,4)` for unit prices and rates; currency code `CHAR(3)` |
| Power/energy | `DECIMAL(12,3)` for kWp/kW/kWh; panel rating `DECIMAL(8,2)` Wp |
| Time | `DATETIME(3)` stored in **UTC**; tenant time zone applied in the UI |
| Standard columns | `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at` (soft delete), `version` (optimistic locking) |
| Naming | `snake_case`, plural table names, `<entity>_id` for foreign keys |
| JSON | `JSON` columns only for flexible data (custom fields, survey answers, checklist results), with generated columns + indexes when queried |
| Migrations | Versioned SQL migrations, backward-compatible (expand → migrate → contract) for zero-downtime deploys |

### Core entity map

```
 PLATFORM                    CORE                         SALES
 ─────────                   ────                         ─────
 plans ─┐                    tenants ──┬── branches       customers ──┬── contacts
 plan_features               │         ├── users ── user_roles ── roles ── role_permissions
 subscriptions ──────────────┤         ├── settings       │           └── sites (address, geo)
 subscription_invoices       │         └── number_series  leads ── activities
 usage_records               │                            site_surveys ── survey_photos
 payment_events              │                            designs ── design_versions ── design_bom_lines
                             │                            quotations ── quotation_lines
                             │                            sales_orders ── so_lines ── payment_milestones
 EXECUTION                   SUPPLY                       FINANCE
 ─────────                   ──────                       ───────
 projects ── project_tasks   items ── item_categories     invoices ── invoice_lines
 project_documents           vendors                      receipts ── receipt_allocations
 job_cards ── checklist_runs purchase_requisitions        credit_notes
 reg_applications            purchase_orders ── po_lines  expenses
 reg_application_steps       goods_receipts ── grn_lines  tax_rates
                             warehouses                   accounting_exports
 SERVICE (Phase 2)           stock_ledger (every movement)
 ─────────────────           stock_balances
 installed_assets            serial_numbers ── serial_events
 amc_contracts ── amc_visits
 service_tickets             CROSS-CUTTING: attachments · audit_logs · notifications · outbox_events
 warranties ── warranty_claims               custom_field_definitions · workflow_definitions · approvals

 HR & PAYROLL
 ────────────
 employees ── employee_documents ── employee_certifications        departments · designations · grades
 shifts · holiday_calendars · attendance_records · attendance_regularisations
 leave_types ── leave_policies · leave_balances · leave_requests · overtime_requests · timesheets
 contract_workers ── contractor_firms
 salary_structures ── salary_components · employee_salaries (effective-dated)          (Phase 2)
 payroll_runs ── payslips ── payslip_lines · employee_loans · statutory_settings        (Phase 2)
```

### Sample DDL (core tables — final DDL will be produced in the design phase)

```sql
-- ===================== PLATFORM =====================
CREATE TABLE plans (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(40)  NOT NULL UNIQUE,          -- starter, growth, enterprise
  name             VARCHAR(100) NOT NULL,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE plan_prices (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id          BIGINT UNSIGNED NOT NULL,
  billing_cycle    ENUM('MONTHLY','ANNUAL') NOT NULL,
  currency         CHAR(3)       NOT NULL,
  base_price       DECIMAL(18,2) NOT NULL,
  included_users   INT UNSIGNED  NOT NULL,
  extra_user_price DECIMAL(18,2) NOT NULL,
  gateway_price_id VARCHAR(100)  NULL,                    -- id in Razorpay/Stripe
  UNIQUE KEY uq_plan_cycle_cur (plan_id, billing_cycle, currency),
  CONSTRAINT fk_pp_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
) ENGINE=InnoDB;

CREATE TABLE plan_features (
  plan_id          BIGINT UNSIGNED NOT NULL,
  feature_key      VARCHAR(80)  NOT NULL,                 -- e.g. module.amc, limit.projects_per_month
  value            VARCHAR(100) NOT NULL,                 -- 'true' / '100' / 'unlimited'
  PRIMARY KEY (plan_id, feature_key),
  CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
) ENGINE=InnoDB;

CREATE TABLE tenants (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  subdomain        VARCHAR(63)  NOT NULL UNIQUE,
  legal_name       VARCHAR(200) NOT NULL,
  country_code     CHAR(2)      NOT NULL,
  currency         CHAR(3)      NOT NULL,
  time_zone        VARCHAR(64)  NOT NULL DEFAULT 'Asia/Kolkata',
  status           ENUM('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED') NOT NULL,
  isolation_mode   ENUM('SHARED','DEDICATED') NOT NULL DEFAULT 'SHARED',
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE subscriptions (
  id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id              BIGINT UNSIGNED NOT NULL,
  plan_price_id          BIGINT UNSIGNED NOT NULL,
  status                 ENUM('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED') NOT NULL,
  seats                  INT UNSIGNED NOT NULL,
  trial_ends_at          DATETIME(3) NULL,
  current_period_start   DATETIME(3) NULL,
  current_period_end     DATETIME(3) NULL,
  cancel_at_period_end   TINYINT(1)  NOT NULL DEFAULT 0,
  gateway                ENUM('RAZORPAY','STRIPE','OFFLINE') NOT NULL,
  gateway_subscription_id VARCHAR(100) NULL,
  created_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY ix_sub_tenant (tenant_id, status),
  UNIQUE KEY uq_sub_gateway (gateway, gateway_subscription_id),
  CONSTRAINT fk_sub_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  CONSTRAINT fk_sub_price  FOREIGN KEY (plan_price_id) REFERENCES plan_prices (id)
) ENGINE=InnoDB;

-- Webhook events from the payment gateway, stored once (idempotency)
CREATE TABLE payment_events (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gateway          ENUM('RAZORPAY','STRIPE') NOT NULL,
  event_id         VARCHAR(100) NOT NULL,
  event_type       VARCHAR(100) NOT NULL,
  payload          JSON         NOT NULL,
  processed_at     DATETIME(3)  NULL,
  received_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_gateway_event (gateway, event_id)
) ENGINE=InnoDB;

-- ===================== CORE =====================
CREATE TABLE users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  email            VARCHAR(255) NOT NULL,
  mobile           VARCHAR(20)  NULL,
  full_name        VARCHAR(150) NOT NULL,
  password_hash    VARCHAR(255) NULL,                     -- Argon2id; NULL for SSO-only users
  mfa_secret_enc   VARBINARY(255) NULL,                   -- encrypted by the application
  status           ENUM('INVITED','ACTIVE','DISABLED') NOT NULL DEFAULT 'INVITED',
  last_login_at    DATETIME(3)  NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)  NULL,
  UNIQUE KEY uq_user_email (tenant_id, email),
  UNIQUE KEY uq_user_tenant_id (tenant_id, id),
  CONSTRAINT fk_user_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id)
) ENGINE=InnoDB;

-- ===================== SALES / EXECUTION =====================
CREATE TABLE customers (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  customer_type    ENUM('RESIDENTIAL','COMMERCIAL','INDUSTRIAL','GOVERNMENT') NOT NULL,
  name             VARCHAR(200) NOT NULL,
  mobile           VARCHAR(20)  NULL,
  email            VARCHAR(255) NULL,
  tax_number       VARCHAR(20)  NULL,                     -- e.g. GSTIN
  custom_fields    JSON         NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)  NULL,
  UNIQUE KEY uq_cust_tenant_id (tenant_id, id),
  KEY ix_cust_mobile (tenant_id, mobile),
  CONSTRAINT fk_cust_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id)
) ENGINE=InnoDB;

CREATE TABLE projects (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  public_id        CHAR(26)     NOT NULL UNIQUE,
  branch_id        BIGINT UNSIGNED NOT NULL,
  project_no       VARCHAR(40)  NOT NULL,
  customer_id      BIGINT UNSIGNED NOT NULL,
  segment          ENUM('RESIDENTIAL','CI_ROOFTOP','GROUND_MOUNT') NOT NULL,
  system_type      ENUM('ON_GRID','OFF_GRID','HYBRID') NOT NULL,
  dc_capacity_kwp  DECIMAL(12,3) NOT NULL,
  ac_capacity_kw   DECIMAL(12,3) NULL,
  stage_code       VARCHAR(40)  NOT NULL,
  project_manager_id BIGINT UNSIGNED NULL,
  contract_value   DECIMAL(18,2) NOT NULL DEFAULT 0,
  commissioned_on  DATE         NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)  NULL,
  version          INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_project_no (tenant_id, project_no),
  UNIQUE KEY uq_proj_tenant_id (tenant_id, id),
  KEY ix_project_stage (tenant_id, stage_code, updated_at),
  CONSTRAINT fk_proj_customer FOREIGN KEY (tenant_id, customer_id) REFERENCES customers (tenant_id, id),
  CONSTRAINT fk_proj_pm       FOREIGN KEY (tenant_id, project_manager_id) REFERENCES users (tenant_id, id)
) ENGINE=InnoDB;

-- ===================== SUPPLY =====================
CREATE TABLE items (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  sku              VARCHAR(60)  NOT NULL,
  name             VARCHAR(200) NOT NULL,
  category         ENUM('PANEL','INVERTER','BATTERY','STRUCTURE','CABLE','BOS','SERVICE','OTHER') NOT NULL,
  make             VARCHAR(100) NULL,
  model            VARCHAR(100) NULL,
  rating_wp        DECIMAL(8,2)  NULL,                    -- panels
  rating_kw        DECIMAL(12,3) NULL,                    -- inverters
  hsn_code         VARCHAR(10)  NULL,
  uom              VARCHAR(10)  NOT NULL,
  is_serialized    TINYINT(1)   NOT NULL DEFAULT 0,
  warranty_months  INT UNSIGNED NULL,
  specs            JSON         NULL,
  UNIQUE KEY uq_item_sku (tenant_id, sku),
  UNIQUE KEY uq_item_tenant_id (tenant_id, id)
) ENGINE=InnoDB;

-- Append-only ledger: every stock movement. Balances are derived/maintained from it.
CREATE TABLE stock_ledger (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  item_id          BIGINT UNSIGNED NOT NULL,
  warehouse_id     BIGINT UNSIGNED NOT NULL,
  txn_type         ENUM('GRN','ISSUE','RETURN','TRANSFER_IN','TRANSFER_OUT','ADJUSTMENT','OPENING') NOT NULL,
  qty              DECIMAL(18,3) NOT NULL,                -- +in / -out
  unit_cost        DECIMAL(18,4) NOT NULL,
  ref_type         VARCHAR(40)  NOT NULL,                 -- GRN, JOB_CARD, ...
  ref_id           BIGINT UNSIGNED NOT NULL,
  project_id       BIGINT UNSIGNED NULL,
  posted_at        DATETIME(3)  NOT NULL,
  created_by       BIGINT UNSIGNED NOT NULL,
  KEY ix_ledger_item (tenant_id, item_id, warehouse_id, posted_at),
  KEY ix_ledger_ref  (tenant_id, ref_type, ref_id),
  CONSTRAINT fk_ledger_item FOREIGN KEY (tenant_id, item_id) REFERENCES items (tenant_id, id)
) ENGINE=InnoDB;

CREATE TABLE serial_numbers (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  item_id          BIGINT UNSIGNED NOT NULL,
  serial_no        VARCHAR(100) NOT NULL,
  status           ENUM('IN_STOCK','RESERVED','ISSUED','INSTALLED','RETURNED','RMA','SCRAPPED') NOT NULL,
  warehouse_id     BIGINT UNSIGNED NULL,
  project_id       BIGINT UNSIGNED NULL,
  grn_line_id      BIGINT UNSIGNED NULL,
  installed_on     DATE         NULL,
  warranty_until   DATE         NULL,
  UNIQUE KEY uq_serial (tenant_id, item_id, serial_no),
  KEY ix_serial_project (tenant_id, project_id),
  CONSTRAINT fk_serial_item FOREIGN KEY (tenant_id, item_id) REFERENCES items (tenant_id, id)
) ENGINE=InnoDB;

-- ===================== CROSS-CUTTING =====================
-- Transactional outbox: written in the same transaction as the business change
CREATE TABLE outbox_events (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  aggregate_type   VARCHAR(60)  NOT NULL,                 -- Project, Quotation, Invoice ...
  aggregate_id     BIGINT UNSIGNED NOT NULL,
  event_type       VARCHAR(100) NOT NULL,                 -- quotation.accepted ...
  payload          JSON         NOT NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  published_at     DATETIME(3)  NULL,
  KEY ix_outbox_unpublished (published_at, id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id               BIGINT UNSIGNED AUTO_INCREMENT,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  occurred_at      DATETIME(3)  NOT NULL,
  user_id          BIGINT UNSIGNED NULL,
  action           ENUM('CREATE','UPDATE','DELETE','LOGIN','EXPORT','APPROVE','IMPERSONATE') NOT NULL,
  entity_type      VARCHAR(60)  NOT NULL,
  entity_id        BIGINT UNSIGNED NULL,
  changes          JSON         NULL,                     -- {field: [old, new]}
  ip_address       VARCHAR(45)  NULL,
  PRIMARY KEY (id, occurred_at),
  KEY ix_audit_entity (tenant_id, entity_type, entity_id, occurred_at)
) ENGINE=InnoDB
  PARTITION BY RANGE COLUMNS (occurred_at) (
    PARTITION p2026q4 VALUES LESS THAN ('2027-01-01'),
    PARTITION p2027q1 VALUES LESS THAN ('2027-04-01'),
    PARTITION pmax    VALUES LESS THAN (MAXVALUE)
  );
-- Note: MySQL does not allow foreign keys on partitioned tables; audit_logs is append-only.
```

### Data lifecycle

| Data | Retention |
|---|---|
| Business records | For the life of the subscription + 30 days read-only + export window, then hard-deleted within 90 days |
| Audit logs | 3 years (quarterly partitions; old partitions archived to object storage, then dropped) |
| Files / photos | Same as business records; images compressed and thumbnails generated on upload |
| Backups | 35 days point-in-time; monthly snapshot kept 12 months |

## B8. Subscription & Billing Architecture

```
 Tenant admin            SolarERP API                Payment gateway            Workers
 ───────────             ────────────                ───────────────            ───────
 choose plan  ─────────▶ create checkout/subscription ─────────▶ hosted checkout
                                                                   │
 pays on gateway page ◀────────────────────────────────────────────┘
                                                     webhook (signed)
                         POST /webhooks/billing ◀─────────────────── payment.success
                           1. verify signature
                           2. INSERT payment_events (unique event_id → idempotent)
                           3. enqueue job ─────────────────────────────────────▶ process event:
                                                                                  - update subscriptions
                                                                                  - update tenants.status
                                                                                  - create subscription invoice PDF
                                                                                  - refresh entitlement cache
                                                                                  - email receipt
 Daily scheduler (worker): trial expiry · grace-period checks · suspension · usage aggregation
```

| Concern | Design |
|---|---|
| Source of truth | The gateway is the source of truth for payments; SolarERP's `subscriptions` table mirrors it via webhooks and a nightly reconciliation job. |
| Entitlements | `plan_features` + purchased add-ons + tenant overrides → merged into an entitlement set, cached in Redis, invalidated on any subscription change. |
| Enforcement | API guard `@RequiresFeature('module.amc')` and `@CheckLimit('limit.users')`; UI reads the same entitlement set to hide/disable features. |
| Usage metering | Counters (users, projects this month, storage bytes, messages sent) in `usage_records`, aggregated daily. |
| Read-only mode | When `tenants.status` is `PAST_DUE` (after grace) or `SUSPENDED`, a global guard blocks all write requests (HTTP 402) but allows reads and export. |
| Tax invoices | Subscription invoices generated by SolarERP (with GST) from the gateway payment, numbered by the platform's own series. |

## B9. Security Architecture

| Area | Control |
|---|---|
| Authentication | Email/mobile + password (Argon2id), OTP login for customers, optional TOTP MFA, SSO (OIDC/SAML via Keycloak) for Enterprise. Access token 15 min (JWT), refresh token 30 days (rotated, stored hashed, revocable). |
| Authorization | RBAC: `role → permissions (module.action)`; data scopes (own / team / branch / all); field-level masking for cost and margin. Enforced on the server, never only in the UI. |
| Tenant isolation | See B5. |
| Transport | TLS 1.2+ everywhere, HSTS; internal traffic encrypted. |
| Data at rest | Encrypted MySQL storage and backups; S3 server-side encryption; sensitive fields (bank details, MFA secrets, integration tokens) encrypted by the application with keys in a KMS. |
| Secrets | AWS Secrets Manager / HashiCorp Vault; nothing in code or images. |
| Application security | Input validation (DTO schemas), parameterized queries only, CSRF protection for cookie sessions, strict CORS, Content-Security-Policy, rate limiting per IP/user/tenant, file type checks + antivirus scan (ClamAV) on uploads. |
| Webhooks | Inbound: verify signature + replay protection. Outbound: HMAC-signed payloads. |
| Audit | All logins, permission changes, exports and impersonations logged (B7 `audit_logs`). |
| Secure SDLC | SAST, dependency scanning (Dependabot/Snyk), container image scanning, secret scanning in CI; DAST on staging; yearly penetration test. |
| Privacy | Consent capture for customer data, per-tenant data export and deletion, data residency in India region by default. |

The detailed security requirements for each phase, the threat model, the role matrix and the go-live gates are in **Part C**.

## B10. Integration Architecture

### Internal events (between modules) — transactional outbox

```
 Business transaction (single MySQL transaction)
 ┌──────────────────────────────────────────────┐
 │ UPDATE quotations SET status='ACCEPTED' ...  │
 │ INSERT INTO outbox_events (...)              │──▶ commit
 └──────────────────────────────────────────────┘
          │
          ▼  Outbox relay (worker, polls every 1 s, or reads binlog via Debezium later)
     Redis/BullMQ queue
          │
   ┌──────┼──────────────┬───────────────────┐
   ▼      ▼              ▼                   ▼
 create  create        notify customer    send tenant
 sales   regulatory    (WhatsApp/email)   webhooks
 order   checklist
```

This guarantees an event is published **if and only if** the business change is committed. Consumers are idempotent (they record processed event IDs).

### Example domain events

`lead.created`, `survey.completed`, `quotation.sent`, `quotation.accepted`, `sales_order.created`, `po.approved`, `grn.posted`, `job_card.completed`, `project.stage_changed`, `project.commissioned`, `invoice.issued`, `payment.received`, `ticket.created`, `subscription.changed`

### External integrations

| Pattern | Used for |
|---|---|
| **Connector framework** (one adapter per vendor behind a common interface) | Accounting systems, inverter monitoring, messaging providers, payment gateways |
| Outbound calls only from **workers**, with retries (exponential back-off), circuit breaker, and a dead-letter queue | All third-party APIs |
| Per-tenant credentials stored encrypted (`integration_connections` table) | Tenant's own Tally/Zoho/inverter accounts |
| Public REST API `/api/v1` with API keys (scoped) + OAuth2 client credentials, rate-limited per tenant | Enterprise customers |
| Outbound webhooks with HMAC signature and retry | Enterprise customers |

## B11. Mobile & Offline Architecture

```
 ┌──────────────────── Mobile app (React Native) ────────────────────┐
 │  UI ──▶ Local DB (SQLite/WatermelonDB) ──▶ Sync engine            │
 │          job cards, surveys, checklists,     - pull: changes since │
 │          items, photos (queued)                last sync token     │
 │                                              - push: local changes │
 │                                                with client UUIDs   │
 └──────────────────────────────────┬─────────────────────────────────┘
                                    │ HTTPS when online
                   /api/v1/sync/pull · /api/v1/sync/push · signed upload URLs for photos
```

| Topic | Design |
|---|---|
| Data downloaded | Only what the user needs: their assigned job cards/surveys for the next N days + reference data (items, checklists). |
| IDs | Records created offline get a client-generated UUID so they never collide. |
| Conflicts | Field-level "last write wins" for simple fields; checklist results and photos are append-only (no conflict); server rejects changes to locked records (e.g. after approval) and the app shows the reason. |
| Photos | Compressed on device, uploaded in background directly to object storage using pre-signed URLs, then linked. |
| Security | Local DB encrypted (SQLCipher); remote logout wipes local data. |

## B12. Deployment Architecture

### Recommended: AWS, Mumbai region (ap-south-1), across 2–3 availability zones

```
                           Users / Mobile apps
                                   │
                  Route 53 (DNS: *.solarerp.app) ── CloudFront CDN + AWS WAF
                                   │                    └── static web app (S3)
                     Application Load Balancer (TLS)
                                   │
 ┌──────────────────────── VPC (private subnets, 3 AZs) ─────────────────────────────┐
 │                                                                                   │
 │  EKS / ECS cluster                                                                │
 │   ├── api        (N pods, autoscaled on CPU/requests)                             │
 │   ├── worker     (N pods, autoscaled on queue depth)                              │
 │   ├── scheduler  (1 pod, leader-elected cron jobs)                                │
 │   └── gotenberg  (PDF rendering)                                                  │
 │                                                                                   │
 │  Amazon RDS for MySQL 8.4 — Multi-AZ primary + 1 read replica (reports)           │
 │  Amazon ElastiCache for Redis — primary + replica                                 │
 │  Amazon S3 — documents/photos (versioning + lifecycle rules)                      │
 │  Secrets Manager · KMS · CloudWatch / Grafana                                     │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

### Option for own data centre / private cloud

The same containers run on Kubernetes on-prem. MySQL runs as a **3-node MySQL InnoDB Cluster** (one primary + two secondaries, with one node in the near-DR site) behind **MySQL Router** or a keepalived VIP; MinIO replaces S3; Redis Sentinel replaces ElastiCache.

### Environments

| Environment | Purpose | Data |
|---|---|---|
| Local | Developer machines (Docker Compose: MySQL, Redis, MinIO) | Seed data |
| Dev | Integration of all branches, automatic deploy on merge | Synthetic |
| Staging / UAT | Business testing, performance tests, release candidate | Anonymised copy |
| Production | Live | Real |

## B13. High Availability, Backup & DR

| Component | HA approach | Backup / DR |
|---|---|---|
| API & workers | ≥ 2 replicas across AZs, stateless, rolling deploys | Re-deploy from images (IaC) |
| MySQL | RDS Multi-AZ (synchronous standby, automatic failover ~1–2 min) — or InnoDB Cluster on-prem | Automated snapshots + binlog for point-in-time recovery (RPO ≤ 15 min, usually ~5 min); cross-region snapshot copy daily |
| Redis | Replica with automatic failover | Not a source of truth; queues are rebuilt from the outbox if lost |
| Object storage | S3 (11 nines durability), versioning on | Cross-region replication for DR |
| DR site | Warm standby in a second region (Hyderabad ap-south-2) | Documented runbook; DR drill twice a year; target RTO ≤ 4 h |

## B14. Observability

| Signal | Tooling | Key items |
|---|---|---|
| Logs | Structured JSON → Loki/CloudWatch | Every log line has `trace_id`, `tenant_id`, `user_id`; no personal data or secrets in logs |
| Metrics | Prometheus/Grafana | Request rate, latency (p95/p99), error rate, queue depth, job failures, DB connections, slow queries, per-tenant usage |
| Traces | OpenTelemetry → Tempo | End-to-end request and job traces |
| Errors | Sentry (web, mobile, backend) | Release tracking |
| Uptime | External synthetic checks | Login, create lead, generate PDF |
| Alerts | Grafana Alerting → PagerDuty/Slack | SLO burn rate, DB replica lag, failed backups, webhook failures |

## B15. Performance & Scalability

| Technique | Detail |
|---|---|
| Stateless API | Scale horizontally; sessions in Redis/JWT. |
| Indexing | Every list query uses an index starting with `tenant_id`; slow query log reviewed weekly. |
| Read replica | Dashboards and reports read from the replica (accept a few seconds' lag). |
| Pagination | Keyset (cursor) pagination for large lists. |
| Caching | Entitlements, settings, reference data, permission sets in Redis with tenant-prefixed keys. |
| Async | PDFs, imports, exports, emails, integrations always in workers. |
| Large tables | Range-partition append-only tables (audit logs, stock ledger, monitoring readings) by date. |
| Future scale-out | Move large tenants to dedicated databases (`tenants.isolation_mode = DEDICATED`); split high-volume modules (monitoring data) into separate services/stores if needed. |
| "Noisy neighbour" control | Per-tenant rate limits and job concurrency limits. |

## B16. Engineering Standards & Code Structure

### Repository layout (monorepo)

```
solar-erp/
├── apps/
│   ├── api/                      # NestJS modular monolith
│   │   └── src/
│   │       ├── platform/         # tenants, plans, subscriptions, entitlements, billing webhooks
│   │       ├── core/             # auth, users, roles, settings, numbering, workflow, audit, files
│   │       ├── modules/
│   │       │   ├── crm/          # each module: controller · service · repository · dto · events · tests
│   │       │   ├── survey/
│   │       │   ├── design/
│   │       │   ├── quotation/
│   │       │   ├── sales-order/
│   │       │   ├── project/
│   │       │   ├── procurement/
│   │       │   ├── inventory/
│   │       │   ├── field-service/
│   │       │   ├── regulatory/
│   │       │   ├── finance/
│   │       │   ├── hr/
│   │       │   ├── payroll/      # Phase 2
│   │       │   ├── service/      # Phase 2
│   │       │   └── reports/
│   │       └── shared/           # tenant context, base repository, guards, errors
│   ├── worker/                   # job processors, outbox relay, schedulers
│   ├── web/                      # React app
│   └── mobile/                   # React Native app
├── packages/
│   ├── contracts/                # shared DTOs / OpenAPI-generated types
│   └── ui/                       # shared UI components
├── db/
│   └── migrations/               # versioned SQL migrations (V001__init.sql …)
├── infra/
│   ├── terraform/                # cloud infrastructure
│   └── k8s/                      # Helm charts / manifests
└── docs/                         # this document, ADRs, API guide, runbooks
```

### Standards

| Topic | Standard |
|---|---|
| API | REST, JSON, `/api/v1/...`, plural nouns, standard error format (RFC 9457 problem details), idempotency keys on POSTs that create money-related records |
| Branching | Trunk-based with short-lived feature branches; pull requests need review + green CI |
| Testing | Unit (business rules, calculations), integration (with real MySQL in containers), API contract tests, tenant-isolation tests, end-to-end smoke tests (Playwright) |
| CI/CD | Lint → test → build images → scan → deploy to Dev → (manual approval) → Staging → Production with rolling/blue-green deploy |
| DB changes | Backward-compatible migrations only; no destructive change in the same release as the code that stops using a column |
| Feature flags | Used for gradual rollout and plan-based features |
| Documentation | ADRs for every significant decision; OpenAPI published; runbooks for operations |

## B17. Architecture Decision Log

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Modular monolith + workers (not microservices) | Proposed |
| ADR-002 | MySQL 8.4 LTS, InnoDB, utf8mb4 as the only system-of-record database | Accepted (constraint) |
| ADR-003 | Shared-schema multi-tenancy with `tenant_id`; dedicated DB option for Enterprise | Proposed |
| ADR-004 | Tenant resolved from subdomain and verified against JWT | Proposed |
| ADR-005 | NestJS + TypeScript backend; React web; React Native mobile | Proposed — depends on team skills (Q8) |
| ADR-006 | Transactional outbox for domain events | Proposed |
| ADR-007 | Payment gateway is source of truth for SaaS payments; webhooks + nightly reconciliation | Proposed |
| ADR-008 | Offline-first mobile with client-generated UUIDs and sync API | Proposed |
| ADR-009 | AWS Mumbai region primary, Hyderabad DR; on-prem option with InnoDB Cluster | Proposed — depends on Q6 |
| ADR-010 | No general ledger in Phase 1 — integrate with accounting software | Proposed |

## B18. Implementation Roadmap

Indicative plan for a team of about **8–10 people** (1 product owner, 1 architect/tech lead, 4 backend, 2 frontend, 1 mobile, 1 QA, part-time DevOps and UI/UX). Durations are estimates to refine after the open questions are answered.

| Sprint block (2-week sprints) | Deliverables |
|---|---|
| Sprint 0 (2 weeks) | Finalise BRD, UX wireframes, ADRs, repo, CI/CD, environments, IaC, base DB schema |
| Sprints 1–2 | Platform foundation: tenant sign-up, auth, RBAC, settings, numbering, audit, file service, entitlement service |
| Sprints 3–4 | Subscription & billing (plans, checkout, webhooks, dunning, read-only mode), platform admin console |
| Sprints 5–7 | CRM, site survey (web + mobile), system design & sizing, BOM templates |
| Sprints 8–9 | Quotation & proposal PDF, approvals, sales order, payment milestones |
| Sprints 10–12 | Items, procurement (PO, GRN with serials), inventory & warehouses, stock ledger |
| Sprints 13–14 | Projects, job cards, field app offline sync, installation checklists |
| Sprints 15–16 | Regulatory & subsidy tracking, invoicing, receipts, accounting export |
| Sprints 17–18 | Dashboards & reports, notifications (email/SMS/WhatsApp), data import tools, HR core (employees, attendance, leave, timesheets) |
| Sprints 19–20 | Hardening: performance tests, security tests, penetration test, UAT with pilot customers, go-live |

**Phase 1 (MVP) estimate: ~10.5 months** (HR core adds about one sprint). Phase 2 adds ~5–6 months (including payroll).

### Next steps

1. Review this document and answer the open questions in **A13**.
2. Confirm priorities (M/S/C) for each requirement.
3. Approve the architecture decisions in **B17** (especially the technology stack and hosting).
4. After sign-off: produce UI wireframes, the full database design (DDL for all modules) and the OpenAPI specification, then start Sprint 0.

---

# PART C — SECURITY (PHASE-WISE)

Security is built in from the first sprint, not added at the end. Each requirement below has an ID (`SEC-xxx`), the phase and sprint in which it must be done, and the test case(s) in Part D that prove it works.

## C1. Security Objectives & Compliance Baseline

**Objectives:** (1) no tenant can ever see another tenant's data, (2) customer personal data is protected and handled lawfully, (3) only the right people can see prices, margins and financials, (4) every important action can be traced to a person, (5) the platform recovers quickly from attacks and failures.

| Standard / Law | Applies to | Target phase |
|---|---|---|
| OWASP ASVS 4.0 — Level 2 | Web app and API | Phase 1 |
| OWASP API Security Top 10 (2023) | REST API | Phase 1 |
| OWASP MASVS — L1 (Phase 1), L2 (Phase 2) | Mobile app | Phase 1 / 2 |
| India Digital Personal Data Protection (DPDP) Act 2023 and DPDP Rules | End-customer and user personal data | Phase 1 |
| CERT-In Directions (April 2022) — report cyber incidents within 6 hours, keep ICT logs for 180 days in India, sync clocks to NTP | Platform operations | Phase 1 |
| PCI DSS — card data never touches SolarERP (gateway-hosted checkout), keeping scope to the minimum (SAQ A) | SaaS billing | Phase 1 |
| GST record-keeping — tenants are responsible for keeping their statutory records (e.g. 72 months); the platform gives full export before any deletion | Tenant data lifecycle | Phase 1 |
| ISO/IEC 27001:2022 — aligned from Phase 1, certified in Phase 3 | Organisation & platform | Phase 3 |
| SOC 2 Type II (optional, for international customers) | Organisation & platform | Phase 3 |
| GDPR (for EU tenants) | EU personal data | Phase 3 |

## C2. Data Classification

| Class | Examples | Required controls |
|---|---|---|
| **Restricted** | Password hashes, MFA secrets, API keys, refresh tokens, integration credentials (Tally, inverter clouds), bank account numbers, identity numbers (Aadhaar/PAN), employee statutory numbers (UAN, ESIC), salaries and payslips | Application-level encryption (KMS keys), masked in UI, never logged, access only by the owning service. **Full Aadhaar numbers are never stored in database fields** — only the last 4 digits; the KYC document itself is stored encrypted. |
| **Confidential** | End-customer name, mobile, address, electricity bills, site photos, quotations, cost and margin, invoices, subscription data | Tenant isolation, RBAC with data scopes, encryption at rest, signed URLs for files, audit of access and export |
| **Internal** | Item master, templates, settings, workflow configuration | Tenant isolation, RBAC |
| **Public** | Marketing website, published plan prices | Integrity protection only |

## C3. Threat Model (STRIDE)

| # | Threat (STRIDE) | Example in SolarERP | Main mitigations | Requirements |
|---|---|---|---|---|
| T1 | **Information disclosure** — cross-tenant data leak | User of Tenant A changes an ID in the URL and opens Tenant B's project | Automatic tenant filter, tenant-scoped foreign keys, unguessable public IDs, cross-tenant test suite | SEC-110 – SEC-114 |
| T2 | **Elevation of privilege** | Technician calls an admin API directly | Server-side RBAC deny-by-default, permission declared on every endpoint | SEC-106 – SEC-108 |
| T3 | **Spoofing** — account takeover | Password spraying, stolen password, SIM-swap on OTP | Strong passwords, breached-password check, lockout, MFA, WAF bot control | SEC-101 – SEC-105, SEC-141 |
| T4 | **Spoofing** — fake payment webhook | Attacker posts "payment succeeded" to activate a plan for free | Webhook signature check, replay window, reconciliation with gateway | SEC-137 |
| T5 | **Tampering** — injection | SQL injection in search/sort, XSS in lead name shown in a PDF | Parameterized queries, input validation, output encoding, CSP | SEC-130 – SEC-132 |
| T6 | **Tampering** — financial records | Changing a posted invoice or stock after the fact | Posted documents immutable, corrections only via credit notes/adjustments with approval, audit trail | SEC-160, FR-ADM-009 |
| T7 | **Repudiation** | "I never approved that 25% discount" | Audit log with user, time, IP, before/after values; segregation of duties | SEC-160, SEC-172 |
| T8 | **Information disclosure** — files | Shared link to a KYC document forwarded to others | Short-lived signed URLs, permission check before every URL, tenant-prefixed storage | SEC-113 |
| T9 | **Denial of service** | Bot floods sign-up/login, one tenant runs huge exports | WAF, rate limits per IP/user/tenant, async exports with per-tenant concurrency limits | SEC-135, SEC-141 |
| T10 | **Malicious files** | Uploaded "photo" is malware or an SVG with script | File-type check by content, size limits, antivirus scan, image re-encoding | SEC-134 |
| T11 | **Lost / stolen phone** | Technician's phone with customer data is stolen | Encrypted local DB, remote wipe, short sessions | SEC-180 – SEC-182 |
| T12 | **Insider / support misuse** | Support staff browse a tenant's customer list | Consent-based, time-limited, fully audited impersonation; admin console IP allowlist + MFA | SEC-170, SEC-171 |
| T13 | **Supply chain** | Vulnerable npm package, leaked secret in Git | Dependency and secret scanning, image scanning, pinned versions, code review | SEC-150, SEC-151 |
| T14 | **SSRF** (Phase 2) | Tenant sets webhook URL to `http://169.254.169.254/` to read cloud metadata | Block private/link-local addresses, DNS re-check, egress proxy | SEC-203 |

## C4. Security Requirements — Phase 1 (MVP)

### Identity & access

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-101 | Passwords: minimum 10 characters, checked against a breached-password list (k-anonymity API), hashed with **Argon2id**. No forced periodic change. | Sprint 1–2 | TC-SEC-010 |
| SEC-102 | Login protection: after 5 failed attempts the account is locked for 15 minutes and CAPTCHA is shown; per-IP throttling; identical error message for "wrong user" and "wrong password". | Sprint 1–2 | TC-SEC-011 |
| SEC-103 | Tokens: access token (JWT, asymmetric signature, key ID for rotation) valid 15 minutes; refresh token valid 30 days, rotated on every use, stored hashed; re-use of an old refresh token revokes the whole session. | Sprint 1–2 | TC-SEC-012, TC-SEC-013 |
| SEC-104 | Sessions are revoked immediately on password change, user deactivation or role change; users can "log out of all devices". | Sprint 1–2 | TC-SEC-014 |
| SEC-105 | MFA (TOTP + one-time backup codes): optional for users, enforceable by tenant admin, **mandatory for platform staff**. | Sprint 1–2 | TC-SEC-015 |
| SEC-109 | Password reset and invitation links: single use, reset link valid 30 minutes, invitation 72 hours; response does not reveal whether an email exists. | Sprint 1–2 | TC-SEC-016 |
| SEC-106 | Authorization is enforced on the server for **every** endpoint, deny by default. A build check fails if an endpoint has no declared permission. | Sprint 1–2 | TC-SEC-020 |
| SEC-107 | Data scopes per role: own records / team / branch / all. | Sprint 1–2 | TC-SEC-021 |
| SEC-108 | Field-level security: cost price, margin and vendor rates are removed from API responses, PDFs and exports for roles without the permission. | Sprint 8–9 | TC-SEC-022 |

### Tenant isolation

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-110 | Tenant is resolved from the subdomain and must match the `tenant_id` inside the token; mismatch → 403. | Sprint 1–2 | TC-SEC-001 |
| SEC-111 | The data-access layer adds the tenant filter to every query and sets `tenant_id` on every insert; any `tenant_id` (or other protected field) sent by the client is ignored. | Sprint 1–2 | TC-SEC-002, TC-SEC-003 |
| SEC-112 | An automated cross-tenant test suite covers **100% of API endpoints** and runs on every pull request. | Sprint 1 onward | TC-SEC-004 |
| SEC-113 | Files are stored under `tenants/{tenant_id}/…`; downloads only through signed URLs valid for 5 minutes, issued after a permission check. | Sprint 1–2 | TC-SEC-005 |
| SEC-114 | Cache keys, queue jobs and scheduled tasks always carry and enforce the tenant context. | Sprint 1–2 | TC-SEC-006 |

### Data protection & privacy

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-120 | TLS 1.2+ only (TLS 1.3 preferred), HSTS, HTTP redirected to HTTPS. | Sprint 0 | TC-SEC-040 |
| SEC-121 | Encryption at rest for MySQL storage, snapshots, backups and object storage, using KMS-managed keys. | Sprint 0 | TC-SEC-041 |
| SEC-122 | Restricted fields (C2) encrypted by the application (envelope encryption); keys rotated yearly. | Sprint 1–2 | TC-SEC-042 |
| SEC-123 | Masking in the UI and exports: identity numbers show last 4 digits only, bank account numbers masked. | Sprint 5–7 | TC-SEC-043 |
| SEC-124 | Logs never contain passwords, OTPs, tokens, full identity numbers or bank details (automatic log scrubbing). | Sprint 0 onward | TC-SEC-044 |
| SEC-190 | Privacy notice and consent capture for end-customer data (purpose, timestamp, channel); consent withdrawal stops marketing messages. | Sprint 5–7 | TC-SEC-090 |
| SEC-191 | Tenant data export and deletion workflow (FR-SUB-011), including deletion from object storage and search indexes; backups expire naturally within 35 days. | Sprint 3–4 | TC-SUB-015 |
| SEC-193 | Data Processing Agreement (DPA) and list of sub-processors (cloud, email, SMS, WhatsApp providers) published to tenants. | Before go-live | Document review |

### Application & API security

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-130 | All input validated against schemas; only parameterized queries; sort/filter fields checked against allow-lists. | Sprint 0 onward | TC-SEC-030 |
| SEC-131 | Output encoding everywhere, including PDF, email and WhatsApp templates; rich text sanitised. | Sprint 0 onward | TC-SEC-031 |
| SEC-132 | Security headers: Content-Security-Policy, `X-Content-Type-Options`, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. | Sprint 0 | TC-SEC-032 |
| SEC-133 | Strict CORS allow-list; CSRF protection for any cookie-based session. | Sprint 1–2 | TC-SEC-033 |
| SEC-134 | Uploads: allow-list of types checked by file content (not extension), size limits, antivirus scan, images re-encoded; GPS data kept as separate fields before stripping EXIF from shared copies. | Sprint 5–7 | TC-SEC-034 |
| SEC-135 | Rate limits per IP, user and tenant (stricter on login, OTP, sign-up, exports); HTTP 429 with `Retry-After`. | Sprint 1–2 | TC-SEC-035 |
| SEC-136 | Idempotency keys required on POSTs that create money-related records (receipts, invoices, payments). | Sprint 15–16 | TC-FIN-006 |
| SEC-137 | Payment-gateway webhooks: signature verified, timestamp within 5 minutes, event stored once (idempotent). | Sprint 3–4 | TC-SEC-037, TC-SUB-016 |
| SEC-138 | Read-only mode for overdue/suspended tenants is enforced on the server (not just hidden in the UI). | Sprint 3–4 | TC-SUB-012 |
| SEC-172 | Segregation of duties: a user cannot approve their own quotation discount, PO or expense (default on). | Sprint 8–9 | TC-ADM-009 |

### Infrastructure & operations

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-140 | MySQL, Redis and workers in private subnets with no public endpoint; security groups allow only required ports from required sources. | Sprint 0 | TC-SEC-045 |
| SEC-141 | WAF with OWASP managed rules in front of the app; bot protection on sign-up, login and OTP endpoints. | Sprint 0–2 | TC-SEC-046 |
| SEC-142 | Secrets only in a secrets manager; database credentials rotated every 90 days without downtime. | Sprint 0 | TC-SEC-047 |
| SEC-143 | Cloud access: least-privilege IAM roles, MFA for all console users, root account locked away, break-glass procedure documented. | Sprint 0 | Configuration review |
| SEC-144 | Containers: minimal base images, run as non-root, read-only file system, scanned before deploy. | Sprint 0 | TC-SEC-050 |
| SEC-145 | Separate cloud accounts for Dev, Staging and Production; production data never copied to Dev; Staging uses anonymised data only. | Sprint 0 | Configuration review |
| SEC-195 | Backups encrypted, access restricted to a break-glass role, restore tested monthly. | Sprint 0 onward | TC-NFR-006 |

### Secure development (SDLC)

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-150 | CI runs SAST, dependency scanning (SCA), secret scanning and container image scanning; build fails on Critical/High findings. | Sprint 0 | TC-SEC-050 |
| SEC-151 | Every change needs a peer review; changes to auth, billing, tenant-context or permission code need a security-champion review. | Sprint 0 onward | Process audit |
| SEC-152 | Automated DAST (OWASP ZAP) scan of Staging on every release candidate. | Sprint 5 onward | TC-SEC-051 |
| SEC-153 | Independent penetration test (web, API, mobile) before go-live; all Critical/High issues fixed and retested. | Sprints 19–20 | TC-SEC-052 |

### Logging, monitoring & platform access

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-160 | Security events logged: login success/failure, MFA changes, password resets, role/permission changes, exports, impersonation, API key use. | Sprint 1–2 | TC-SEC-060 |
| SEC-161 | Logs stored in India for at least 180 days (CERT-In); audit log 3 years; logs are append-only for application users. | Sprint 0 | Configuration review |
| SEC-162 | All servers and containers synchronised to NTP (CERT-In). | Sprint 0 | Configuration review |
| SEC-163 | Alerts for brute-force attempts, spikes in cross-tenant 403/404, unusual export volume, and admin actions out of hours. | Sprint 17–18 | TC-SEC-061 |
| SEC-170 | Support impersonation needs the tenant admin's consent, lasts at most 4 hours, shows a banner, and logs both identities on every action. | Sprint 3–4 | TC-SEC-070 |
| SEC-171 | Platform admin console on a separate domain, reachable only from an IP allow-list / VPN, with mandatory MFA. | Sprint 3–4 | TC-SEC-071 |
| SEC-192 | Incident response plan (C8) approved and rehearsed with one tabletop exercise before go-live. | Before go-live | Exercise report |

### Mobile app

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-180 | Local database encrypted (SQLCipher); key kept in Android Keystore / iOS Keychain. | Sprint 13–14 | TC-SEC-080 |
| SEC-181 | When a user logs out or is deactivated, the app pushes any pending changes if possible and then wipes local data. | Sprint 13–14 | TC-SEC-081 |
| SEC-182 | HTTPS only; app refuses untrusted certificates; no secrets inside the app package. | Sprint 13–14 | TC-SEC-082 |

### HR data

| ID | Requirement | When | Test case(s) |
|---|---|---|---|
| SEC-196 | Employee statutory and bank details (PAN, UAN, ESIC, bank account) are Restricted data: encrypted, masked, visible only to HR roles. | Sprint 17–18 | TC-HR-002 |
| SEC-197 | Employees see only their own HR records in self-service; managers see attendance and leave of their own team only. | Sprint 17–18 | TC-SEC-091 |

## C5. Security Requirements — Phase 2

| ID | Area | Requirement | Test case(s) |
|---|---|---|---|
| SEC-201 | SSO | OIDC/SAML single sign-on for Enterprise tenants (Microsoft Entra ID, Google Workspace); users disabled in the identity provider lose access at next token refresh. | TC-SEC-101 |
| SEC-202 | Public API | API keys shown once, stored hashed, scoped (read / write per module), rotatable, revocable instantly; OAuth2 client-credentials option; per-key rate limits. | TC-SEC-102, TC-SEC-103 |
| SEC-203 | Webhooks out | HTTPS-only target URLs; block private, loopback and link-local addresses (SSRF), re-check DNS at send time; HMAC-signed payloads with timestamp. | TC-SEC-104 |
| SEC-204 | Customer portal | OTP login: 6 digits, valid 5 minutes, 3 attempts, max 5 OTPs per number per hour; a customer sees only their own projects, invoices and tickets. | TC-SEC-105, TC-SEC-106 |
| SEC-205 | Integrations | Inverter-cloud and accounting credentials encrypted, write-only through the API (never returned), least scope, revocable by the tenant. | TC-SEC-107 |
| SEC-206 | Mobile | MASVS L2: root/jailbreak detection (warn and restrict), certificate pinning with backup pins, iOS app at the same level. | TC-SEC-108 |
| SEC-207 | E-signature | Tamper-evident evidence for accepted quotes/contracts: document hash, timestamp, IP, OTP reference; any later change breaks verification. | TC-SEC-109 |
| SEC-208 | Tenant security policy | Tenant admin can set IP allow-list, idle session timeout, mandatory MFA, and allowed login methods. | TC-SEC-110 |
| SEC-209 | Dedicated DB | Enterprise dedicated-database tenants get separate DB credentials and a separate KMS key. | Configuration review |
| SEC-210 | SIEM | Central security monitoring (e.g. Wazuh / OpenSearch Security Analytics) with 24×7 on-call alerting. | Configuration review |
| SEC-211 | Disclosure | Responsible-disclosure policy and `security.txt`; optional bug bounty. | Document review |
| SEC-212 | Payroll privacy | Salary data needs a separate `payroll.view` permission — even the tenant Admin cannot see salaries without it; salary values are masked in the audit log, general exports and reports for everyone else. | TC-SEC-111 |
| SEC-213 | Payroll control | Maker-checker: the person who prepares a payroll run cannot approve it; locked runs cannot be changed. | TC-SEC-112, TC-PAY-007 |
| SEC-214 | Salary fraud | Bank-account changes need approval and notify the employee; changes made within 7 days before payroll are flagged; bank files are generated only after approval, hashed, and every download is logged. | TC-SEC-113 |
| SEC-215 | Payslips | Payslip PDFs are password-protected (format configurable, e.g. PAN + date of birth). | TC-SEC-114 |

## C6. Security Requirements — Phase 3

| ID | Area | Requirement | Test case(s) |
|---|---|---|---|
| SEC-301 | Certification | ISO/IEC 27001 certification; SOC 2 Type II if selling internationally. | External audit |
| SEC-302 | GDPR | EU data residency option, DPA with Standard Contractual Clauses, data-subject request workflow. | TC-SEC-204 |
| SEC-303 | BYOK | Enterprise tenants can use their own (customer-managed) encryption key; revoking it makes their data unreadable. | TC-SEC-203 |
| SEC-304 | Partner portal | Dealers/channel partners see only the leads and commissions linked to them. | TC-SEC-201 |
| SEC-305 | PPA metering | Meter readings carry source and integrity checks (signed imports or checksums); manual edits need approval and are audited. | TC-SEC-202 |
| SEC-306 | Behaviour analytics | Detect unusual user behaviour (mass export, access at odd hours, many records viewed quickly) and alert. | TC-SEC-205 |
| SEC-307 | Red team | Yearly red-team exercise covering cloud, application and people (phishing). | Exercise report |
| SEC-308 | Data residency | Tenant chooses the data region at sign-up (India, EU, Middle East). | TC-SEC-204 |

## C7. Default Role & Permission Matrix

Legend: **F** = full (incl. delete) · **C** = create/edit · **A** = approve · **V** = view · **O** = own/assigned records only · **—** = no access. Tenants can copy and change these roles.

| Module / Data | Admin | Sales | Design | Proj. Mgr | Purchase | Store | Technician | Liaison | Accounts | Mgmt |
|---|---|---|---|---|---|---|---|---|---|---|
| Settings, users & roles | F | — | — | — | — | — | — | — | — | V |
| Subscription & billing | F | — | — | — | — | — | — | — | V | V |
| Leads & CRM | F | O | V | V | — | — | — | — | — | V |
| Site survey | F | C | C | V | — | — | O | — | — | V |
| Design & BOM | F | V | C | V | V | — | — | — | — | V |
| Quotation (selling prices) | F | O | V | V | — | — | — | — | V | V |
| Quotation cost & margin | F | — | — | V | — | — | — | — | V | V |
| Approve discount / low margin | A | — | — | — | — | — | — | — | — | A |
| Sales order | F | C | V | V | — | — | — | — | V | V |
| Projects | F | V | V | F | V | V | O | V | V | V |
| Purchase requisition / PO | F | — | — | C (PR) | C | V | — | — | V | V |
| Approve PO | A | — | — | — | — | — | — | — | — | A |
| Inventory & serials | F | — | — | V | V | C | O | — | V | V |
| Field job cards | F | — | V | C | — | — | O | — | — | V |
| Regulatory & subsidy | F | V | — | V | — | — | — | C | V | V |
| Invoices & receipts | F | V | — | V | — | — | — | — | C | V |
| Employee records (HR) | F | O | O | O | O | O | O | O | O | V |
| Attendance, leave & timesheets | F | O | O | A (team) | O | O | O | O | O | V |
| Payroll & salaries (Phase 2) | Only with `payroll.view` | O (own payslip) | O | O | O | O | O | O | V (journal only) | V |
| Reports & dashboards | F | O | O | O | O | O | — | O | O | V |
| Bulk data export | F | — | — | — | — | — | — | — | Finance only | F |

The **HR Manager / Payroll Admin** role (not shown as a column) has full access to the three HR rows and no access to other modules by default. Every employee gets self-service access to their own records ("O" in the HR rows).

## C8. Security Incident Response

| Severity | Examples | Response start | Notification |
|---|---|---|---|
| **SEV-1** | Confirmed personal-data breach, any cross-tenant exposure, ransomware, full outage from an attack | 15 minutes, 24×7 | CERT-In within **6 hours**; Data Protection Board of India and affected people as required by the DPDP Rules (intimation without delay, detailed report within 72 hours); affected tenants as soon as facts are confirmed |
| **SEV-2** | Exploitable vulnerability in production, partial outage, suspicious admin access | 1 hour | Internal management; tenants if their data may be affected |
| **SEV-3** | Low-risk vulnerability, blocked attack attempts | Next business day | Internal ticket |

**Steps:** Detect → Triage & classify → Contain (revoke keys/sessions, isolate) → Eradicate → Recover (restore from known-good backup if needed) → Notify → Post-incident review within 5 working days, with actions tracked to closure.

## C9. Security Go-Live Gates per Phase

| Gate item | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| All `SEC` requirements of the phase implemented and their test cases passed | ✔ | ✔ | ✔ |
| Cross-tenant suite covers 100% of endpoints, 0 failures | ✔ | ✔ | ✔ |
| SAST / SCA / image scan: 0 open Critical or High | ✔ | ✔ | ✔ |
| DAST (ZAP) on Staging: 0 open High | ✔ | ✔ | ✔ |
| External penetration test, all Critical/High fixed and retested | ✔ (web, API, Android) | ✔ (portal, public API, iOS) | ✔ (yearly) |
| Backup restore and failover test passed | ✔ | ✔ (region DR drill) | ✔ |
| Incident response plan approved and tabletop exercise done | ✔ | ✔ (with SIEM) | ✔ (red team) |
| Privacy notice, DPA and sub-processor list published | ✔ | Updated | GDPR pack |
| Certifications | — | — | ISO 27001 (SOC 2 optional) |

---

# PART D — TESTING & TEST CASES (PHASE-WISE)

## D1. Test Strategy

| Test level / type | What it covers | Who | Tools (suggested) | When |
|---|---|---|---|---|
| Unit | Business rules and calculations (sizing, tax, prorating, costing) | Developers | Jest / Vitest | Every commit; ≥ 70% coverage on business logic |
| Integration | API + real MySQL + Redis | Developers | Testcontainers, Supertest | Every pull request |
| Contract | API matches the OpenAPI specification | Developers | Schemathesis / Dredd | Every pull request |
| Tenant-isolation suite | Every endpoint, tenant A vs tenant B | Developers | Custom test suite | Every pull request (blocks merge) |
| End-to-end (web) | Main user journeys in the browser | QA | Playwright | Nightly + each release candidate |
| Mobile | Field app flows incl. offline | QA | Maestro / Detox, real devices | Each mobile build |
| Performance | Load, stress, soak | QA / DevOps | k6 | Each release candidate on Staging |
| Security | SAST, SCA, DAST, pen test | DevSecOps / external firm | Semgrep, Snyk/Dependabot, Trivy, OWASP ZAP | CI + each release + before go-live |
| Disaster recovery | Backup restore, failover | DevOps | Runbooks | Monthly restore; DR drill twice a year |
| Accessibility | WCAG 2.1 AA | QA | axe | Each release |
| Regression | Full automated suite | QA | All of the above | Before every production release |
| UAT | Real business scenarios | Pilot tenants / business users | Test scripts (this part) | End of each phase |

## D2. Test Environments & Test Data

| Item | Detail |
|---|---|
| Environments | Dev (automatic), Staging/UAT (release candidates, production-like size), Production (smoke tests only) |
| Payment gateway | Sandbox/test mode only outside Production |
| Messaging | Email/SMS/WhatsApp sent to a capture service (no real customers) outside Production |
| Personal data | Synthetic only; never production data in Dev; anonymised copies only in Staging |

**Standard test data used in the test cases below**

| Data | Value |
|---|---|
| Tenant A | "SunRise Solar Pvt Ltd" — Maharashtra, Growth plan, branches Mumbai and Pune |
| Tenant B | "BrightVolt Energy" — Gujarat, Starter plan |
| Tenant C | "MegaWatt EPC" — Enterprise plan |
| Users (Tenant A) | One user per role in C7; two Sales Executives (S1, S2) for scope tests |
| Panel | 540 Wp mono PERC, serial-tracked, 25-year performance warranty |
| Inverters | 3 kW and 2.5 kW on-grid, serial-tracked |
| Design inputs | Annual consumption 4,800 kWh · peak sun hours 5.0 · performance ratio 0.78 · area per kWp 6 m² |
| Commercials | System price ₹2,00,000 · subsidy ₹78,000 · tariff ₹7/kWh · payment milestones 30% / 60% / 10% |
| Tax | Rates come from the tenant's tax configuration (no fixed rate assumed in tests) |

## D3. Entry / Exit Criteria & Defect Severity

| | Criteria |
|---|---|
| **Entry** (test phase starts) | Features code-complete and deployed to Staging · unit and integration tests green · test data loaded · test cases reviewed |
| **Exit** (phase can go live) | 100% of P1 and ≥ 95% of P2 test cases executed and passed · 0 open Critical/High defects · ≤ 5 open Medium defects with an agreed workaround · all security gate items (C9) met · performance targets (D7) met · UAT signed off (D11) |

| Defect severity | Meaning | Example |
|---|---|---|
| Critical | Data leak, data loss, security breach, system down, wrong money calculation | Tenant B sees Tenant A's invoice; tax total wrong |
| High | Main function blocked, no workaround | Cannot post a GRN |
| Medium | Function works with a workaround or minor wrong output | Filter ignores branch, report column wrong |
| Low | Cosmetic, text, alignment | Typo on PDF |

**Test case priority:** P1 = must pass to go live · P2 = should pass · P3 = nice to have.

## D4. Phase 1 — Functional Test Cases

### Subscription & tenant onboarding (SUB)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-SUB-001 | FR-SUB-001, 002 | Sign up a new company | Sign up "SunRise Solar", admin email + mobile, country IN, enter correct OTP | Tenant created with status TRIALING; admin user ACTIVE; `sunrise.solarerp.app` opens; welcome email captured | P1 |
| TC-SUB-002 | FR-SUB-002 | Subdomain already taken | Sign up with subdomain `sunrise` again | Clear error with alternative suggestions; no tenant created | P2 |
| TC-SUB-003 | FR-SUB-001 | Wrong OTP | Enter a wrong OTP 3 times | OTP invalidated; user must request a new one; attempt logged | P2 |
| TC-SUB-004 | FR-SUB-003 | Trial has Growth features | During trial, create a 3rd branch and use approval workflows | Allowed (Growth limits apply during trial) | P2 |
| TC-SUB-005 | FR-SUB-003 | Trial expiry | Set `trial_ends_at` in the past; run daily scheduler | Status EXPIRED; login shows "Choose a plan"; data untouched | P1 |
| TC-SUB-006 | FR-SUB-004 | Buy a plan | Choose Growth, annual, 25 seats; pay in gateway sandbox | Webhook received; status ACTIVE; period end = +1 year; seats = 25; tax invoice PDF generated and emailed | P1 |
| TC-SUB-007 | FR-SUB-005 | Upgrade mid-cycle | Starter monthly → Growth monthly on day 15 of a 30-day period | Charge = (Growth price − Starter price) × 15/30; Growth features available immediately | P1 |
| TC-SUB-008 | FR-SUB-005 | Downgrade | Growth (12 active users) → Starter (limit 5) | Change scheduled for period end; before it applies, admin is asked to reduce to 5 active users; plan changes at period end | P1 |
| TC-SUB-009 | FR-SUB-006 | User limit | On Starter with 5 users, invite a 6th (UI and API) | Blocked with upgrade prompt; API returns 403 code `LIMIT_REACHED` | P1 |
| TC-SUB-010 | FR-SUB-006 | Monthly project limit | On Starter, create the 21st project in a month; then on the 1st of next month create one | 21st blocked; next month allowed (counter reset) | P1 |
| TC-SUB-011 | FR-SUB-007 | Failed renewal | Simulate failed renewal webhook | Status PAST_DUE; reminders on day 1, 3, 7; writes still allowed during grace | P1 |
| TC-SUB-012 | FR-SUB-007, SEC-138 | Read-only after grace | Move clock to day 8; try create/edit/delete via UI **and** API | Writes return HTTP 402; reads and data export still work; banner shown | P1 |
| TC-SUB-013 | FR-SUB-007 | Suspension and reactivation | Day 30 → suspended; then pay | Status SUSPENDED, then ACTIVE right after payment; all data present | P1 |
| TC-SUB-014 | FR-SUB-008 | Subscription tax invoice | Tenant in Maharashtra vs platform in Maharashtra / Karnataka | Correct invoice number series, tenant GSTIN, CGST+SGST (same state) or IGST (other state) | P2 |
| TC-SUB-015 | FR-SUB-011, SEC-191 | Cancel, export, delete | Cancel → wait to period end → export → move clock +90 days → run purge | Read-only for 30 days; export ZIP has CSV for every entity + documents; after purge no rows with this `tenant_id` and the storage prefix is empty | P1 |
| TC-SUB-016 | SEC-137 | Duplicate webhook | Send the same "payment succeeded" event twice | Processed once: one subscription update, one invoice | P1 |
| TC-SUB-017 | FR-SUB-012 | Platform console | Platform admin opens tenant list | Sees plan, status, MRR, usage; **cannot** see tenant business records without impersonation (TC-SEC-070) | P2 |

### Administration (ADM)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-ADM-001 | FR-ADM-001 | Branding | Upload logo and bank details; generate a quotation PDF | PDF shows the tenant logo, address, GSTIN and bank details | P2 |
| TC-ADM-002 | FR-ADM-002 | Branch access | Pune-only user opens project list; then a Mumbai project URL directly | Only Pune projects listed; Mumbai URL returns 404 | P1 |
| TC-ADM-003 | FR-ADM-003 | Invite & deactivate | Invite user; use link after 73 hours; deactivate an active user | Expired link rejected; deactivated user cannot log in and current sessions end (TC-SEC-014) | P1 |
| TC-ADM-004 | FR-ADM-004 | Custom role | Create "Junior Sales" with view-only leads; log in as that user | Create/edit buttons hidden; `POST /leads` returns 403 | P1 |
| TC-ADM-005 | FR-ADM-005 | Numbering by financial year | Series `QT/{FY}/{0000}`; create quote on 2027-03-31 and on 2027-04-01 | `QT/2026-27/000n`, then `QT/2027-28/0001` | P1 |
| TC-ADM-006 | FR-ADM-005 | Numbering under load | Create 50 quotations in parallel | 50 unique numbers, consecutive, no gaps or duplicates | P1 |
| TC-ADM-007 | FR-ADM-006 | Tax rate change | Change a tax rate with effective date tomorrow | Today's documents use the old rate, tomorrow's use the new rate; existing posted invoices unchanged | P1 |
| TC-ADM-008 | FR-ADM-008 | Discount approval | Rule: discount > 10% needs approval. Create quote with 12% | Status PENDING_APPROVAL, cannot be sent; manager approves → can send; rejection needs a reason and returns it to draft | P1 |
| TC-ADM-009 | FR-ADM-008, SEC-172 | No self-approval | User who has approval rights creates a 12% quote and tries to approve it | Approval blocked; another approver required | P1 |
| TC-ADM-010 | FR-ADM-009 | Audit trail | Edit a lead's mobile number | Audit entry: user, time, IP, old value, new value | P1 |
| TC-ADM-011 | FR-ADM-010 | Bulk import | Import 1,000 customers with 3 bad rows (invalid mobile, duplicate, missing name) | 997 imported; error file lists the 3 rows with reasons | P1 |
| TC-ADM-012 | FR-ADM-011 | Enforced MFA | Tenant admin turns on mandatory MFA | Users without MFA must enrol at next login before using the app | P2 |

### CRM & leads (CRM)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-CRM-001 | FR-CRM-001 | Website form lead | Submit the embedded web form | Lead created, source "Website", assigned per rule, notification to owner | P1 |
| TC-CRM-002 | FR-CRM-002 | Field validation | Mobile with 9 digits; monthly bill "abc" | Validation errors shown; nothing saved | P2 |
| TC-CRM-003 | FR-CRM-003 | Round-robin assignment | 3 sales executives, 6 new leads | Each executive gets 2 leads | P2 |
| TC-CRM-004 | FR-CRM-004 | Pipeline stage change | Drag lead from Qualified to Survey Done | Stage updated, change recorded in activity history and audit | P2 |
| TC-CRM-005 | FR-CRM-005 | Follow-up reminder in local time | Tenant time zone Asia/Kolkata; reminder 10:00 | Notification at 10:00 IST (stored as 04:30 UTC) | P1 |
| TC-CRM-006 | FR-CRM-006 | Duplicate detection | Create a lead with an existing mobile number | Warning shows the existing lead; user can open it instead of creating a duplicate | P1 |
| TC-CRM-007 | FR-CRM-007 | Lost reason | Mark lead as Lost without a reason | Not allowed until a reason is selected | P3 |

### Site survey (SRV)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-SRV-001 | FR-SRV-001 | Assign survey | Assign survey to surveyor; surveyor syncs app | Survey visible in the app with address and map link | P1 |
| TC-SRV-002 | FR-SRV-002 | Offline survey | Airplane mode; fill survey + 10 photos; reconnect | All data and 10 photos synced and linked; nothing lost or duplicated | P1 |
| TC-SRV-003 | FR-SRV-003 | Geo-tagged photos | Take a photo 2 km away from the site pin | Photo saved with GPS and time; flagged "far from site" | P2 |
| TC-SRV-004 | FR-SRV-004 | Consumption entry | Enter 12 months of units | Annual total and monthly average calculated | P2 |
| TC-SRV-005 | FR-SRV-005, 006 | Survey report | Customer signs on device; generate report | PDF with photos and signature created in < 10 s | P2 |

### System design & sizing (DSN)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-DSN-001 | FR-DSN-001 | Recommended size | 4,800 kWh/yr, PSH 5.0, PR 0.78 | 4,800 ÷ (5.0 × 365 × 0.78) = **3.372 kWp** | P1 |
| TC-DSN-002 | FR-DSN-003 | Panel count & area | 540 Wp panel | ceil(3,372 ÷ 540) = **7 panels**; DC size **3.780 kWp**; roof area **22.68 m²** | P1 |
| TC-DSN-003 | FR-DSN-003 | DC/AC ratio warning | Same design with 3 kW inverter, then 2.5 kW | 3 kW → ratio 1.26, no warning; 2.5 kW → ratio 1.51, warning shown | P1 |
| TC-DSN-004 | FR-DSN-004 | Annual generation | DC 3.780 kWp | 3.78 × 5.0 × 365 × 0.78 = **5,380.83 kWh** (year 1) | P1 |
| TC-DSN-005 | FR-DSN-001 | Roof too small | Usable roof area 15 m² | Warning; maximum size suggested 15 ÷ 6 = **2.5 kWp** | P2 |
| TC-DSN-006 | FR-DSN-004 | Irradiance API down | Simulate PVGIS timeout | Falls back to tenant peak sun hours with a visible notice; no error page | P2 |
| TC-DSN-007 | FR-DSN-005 | BOM from template | Apply "3 kW residential, RCC roof" template | BOM lines created: 7 panels, 1 inverter, structure, cables and BOS quantities from template formulas | P1 |
| TC-DSN-008 | FR-DSN-007 | Design versioning | Quote created on design v1; edit design | New version v2 created; existing quote still linked to v1 and unchanged | P1 |
| TC-DSN-009 | FR-DSN-004 | Degradation | 0.5%/year | Year 2 = 5,380.83 × 0.995 = **5,353.93 kWh**; 25-year table shown | P2 |

### Quotation (QTN) & sales order (SO)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-QTN-001 | FR-QTN-001 | Create quote from design | Create quote from design v1 | Lines from BOM with prices from the price list; tax per line; totals correct to 2 decimals | P1 |
| TC-QTN-002 | FR-QTN-003 | Minimum margin | Minimum margin 15%; quote at 12% margin | Cannot be sent without approval | P1 |
| TC-QTN-003 | FR-QTN-003, SEC-108 | Margin hidden from Sales | Log in as Sales; open quote in UI, call API, download PDF and Excel | No cost or margin values anywhere (checked in raw API JSON too) | P1 |
| TC-QTN-004 | FR-QTN-004 | Savings & payback on proposal | Price ₹2,00,000, subsidy ₹78,000, tariff ₹7, generation 5,380.83 kWh | Annual savings **₹37,665.81**; payback = 1,22,000 ÷ 37,665.81 = **3.24 years**; shown on PDF | P1 |
| TC-QTN-005 | FR-QTN-005 | Revisions | Send Rev 0, then edit | Rev 1 created; Rev 0 read-only; history shows both | P1 |
| TC-QTN-006 | FR-QTN-006 | Share link | Send link by WhatsApp; customer opens it; try link after 31 days | Open is tracked; expired link shows "link expired"; link token cannot be guessed | P1 |
| TC-QTN-007 | FR-QTN-007 | Online acceptance | Customer accepts with OTP | Status ACCEPTED; evidence stored (time, IP, OTP reference); quote locked | P2 |
| TC-SO-001 | FR-SO-001 | Convert to sales order | Convert the accepted quote; try converting again | SO has the same lines and values; second conversion blocked | P1 |
| TC-SO-002 | FR-SO-002 | Milestones must total 100% | Enter 30% / 60% / 5% | Rejected; 30/60/10 accepted | P1 |
| TC-SO-003 | FR-SO-004 | Automatic project | Save the SO | Project created at the correct stage; regulatory checklist created from the state template | P1 |

### Projects (PRJ)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-PRJ-001 | FR-PRJ-002 | Project template | Create project from "Residential" template with start date | Milestones and tasks created with due dates relative to start | P2 |
| TC-PRJ-002 | FR-PRJ-004 | Material status | BOM 7 panels; reserved 7; issued 5; installed 5 | Screen shows 7 / 7 / 5 / 5 and "2 pending issue" | P1 |
| TC-PRJ-003 | FR-PRJ-005 | Restricted documents | Upload customer KYC; open as Technician | Technician cannot see it; permitted user downloads via signed URL | P1 |
| TC-PRJ-004 | FR-PRJ-006 | Project costing | Issue material, add labour and expenses | Actual cost = material (weighted avg) + labour + expenses; profit = contract value − actual cost | P1 |
| TC-PRJ-005 | FR-PRJ-008 | Delay alert | Stage target 10 days; move clock to day 11 | Alert to project manager | P3 |

### Procurement (PUR) & inventory (INV)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-PUR-001 | FR-PUR-002 | Re-order requisition | Stock falls below re-order level | Purchase requisition suggested/created | P2 |
| TC-PUR-002 | FR-PUR-004 | PO approval | PO value above the approval limit | Needs director approval; vendor email only after approval | P1 |
| TC-PUR-003 | FR-PUR-005 | Partial receipt | PO 100 panels; receive 60 with 60 serials | PO PARTIALLY_RECEIVED; open qty 40; 60 serials IN_STOCK | P1 |
| TC-PUR-004 | FR-PUR-005 | Serial count mismatch | Receive 60 serialised panels with 59 serials | GRN cannot be posted | P1 |
| TC-PUR-005 | FR-PUR-005 | Duplicate serial | Scan a serial that already exists for this item | Rejected with a clear message | P1 |
| TC-PUR-006 | FR-PUR-005 | Over-receipt | Receive 110 against PO of 100 (tolerance 0%) | Blocked | P2 |
| TC-INV-001 | FR-INV-003 | No negative stock | Issue 10 when 8 are available | Blocked; stock never goes below zero | P1 |
| TC-INV-002 | FR-INV-003 | Concurrent issue | Two users issue the last 5 units at the same moment | One succeeds; the other gets "insufficient stock"; balance = 0 | P1 |
| TC-INV-003 | FR-INV-003 | Transfer | Transfer 10 panels Warehouse → Van-1 | Two ledger entries; both balances correct; serial locations updated | P1 |
| TC-INV-004 | FR-INV-004 | Serial traceability | Search one panel serial after installation | History: GRN → warehouse → issued to project → installed (with dates and users) | P1 |
| TC-INV-005 | FR-INV-006 | Reservation | Stock reserved for Project X; issue it to Project Y | Blocked unless reservation is released | P1 |
| TC-INV-006 | FR-INV-008 | Weighted average cost | Receive 10 @ ₹10,000 and 10 @ ₹12,000; issue 5 | Average **₹11,000**; issue value **₹55,000** | P1 |
| TC-INV-007 | FR-INV-007 | Low-stock alert | Balance drops below re-order level | Alert to store and purchase users | P3 |
| TC-INV-008 | FR-INV-003 | Stock adjustment control | Post an adjustment without reason | Reason required; approval required above set value; audited | P2 |

### Installation & field service (FLD)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-FLD-001 | FR-FLD-001 | Job card on phone | Assign job card to crew | Visible in app with address, navigation link, material list | P1 |
| TC-FLD-002 | FR-FLD-002, NFR-12 | 7 days offline | Offline for 7 days; complete 3 job cards with checklists and 60 photos; reconnect; drop network mid-upload | Everything syncs, in order, no duplicates; interrupted uploads resume | P1 |
| TC-FLD-003 | FR-FLD-004 | Mandatory photo | Try to complete "earthing" step without photo | Step cannot be completed | P1 |
| TC-FLD-004 | FR-FLD-005 | Wrong serial scanned | Scan a panel serial issued to a different project | Rejected with message | P1 |
| TC-FLD-005 | FR-FLD-006 | Commissioning values | Insulation resistance below the configured minimum | Value flagged as FAIL; commissioning cannot be marked complete without override approval | P2 |
| TC-FLD-006 | FR-FLD-002 | Sync conflict | PM edits job card notes online while technician edits offline | Later change wins, earlier one kept in history; edits to an approved job card are rejected with a reason | P2 |
| TC-FLD-007 | FR-FLD-008 | Customer sign-off | Customer signs on the phone | Job card locked; signature on completion report | P1 |
| TC-FLD-008 | FR-FLD-007 | GPS check-in | Check in 1 km from the site | Allowed but flagged "outside site area" | P3 |

### Regulatory & subsidy (REG)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-REG-001 | FR-REG-001 | Workflow from template | Project in Maharashtra | Application steps created in the configured order for that state/DISCOM | P1 |
| TC-REG-002 | FR-REG-003 | Mandatory documents | Complete a step without its required documents | Blocked until documents are uploaded | P1 |
| TC-REG-003 | FR-REG-005 | Ageing reminder | Step pending for 16 days (limit 15) | Reminder sent; appears in the 15+ days bucket | P2 |
| TC-REG-004 | FR-REG-006 | Subsidy shortfall | Expected ₹78,000; received ₹70,000 | Shortfall **₹8,000** shown on project and in report | P2 |

### Finance (FIN)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-FIN-001 | FR-FIN-001 | Milestone invoice | SO ₹2,00,000; raise 30% advance invoice; try again | Invoice for ₹60,000 (+ configured tax); milestone marked invoiced; second invoice for same milestone blocked | P1 |
| TC-FIN-002 | FR-FIN-001 | Place of supply | Tenant in Maharashtra; site in Maharashtra, then Gujarat | Same state: CGST + SGST (equal halves); other state: IGST | P1 |
| TC-FIN-003 | FR-FIN-002 | Goods/services split | Tenant configures a 70/30 goods/services split with rates | Tax calculated separately for each portion and shown on the invoice | P1 |
| TC-FIN-004 | FR-FIN-001 | Rounding | Totals with paise | Line tax to 2 decimals; invoice total rounded to the rupee with a round-off line | P2 |
| TC-FIN-005 | FR-FIN-004 | Partial payment | Receive ₹40,000 against ₹60,000 invoice | Status PARTIALLY_PAID; balance ₹20,000 | P1 |
| TC-FIN-006 | SEC-136 | Duplicate receipt protection | Send the same receipt request twice with the same idempotency key | Only one receipt created | P1 |
| TC-FIN-007 | FR-FIN-005 | Credit note limit | Credit note larger than invoice balance | Rejected; valid credit note linked to its invoice | P1 |
| TC-FIN-008 | FR-FIN-006 | Receivables ageing | Invoices due 10, 45, 75, 120 days ago | Each falls in 0–30, 31–60, 61–90, 90+ buckets | P2 |
| TC-FIN-009 | FR-FIN-009 | Tally export | Export a month of invoices and receipts; import into a Tally test company | Import succeeds with no errors; totals match SolarERP | P1 |
| TC-FIN-010 | FR-FIN-001 | Posted invoice is locked | Try to edit a posted invoice | Not allowed; correction only by credit note or cancellation with reason | P1 |

### Notifications (NTF) & reports (RPT)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-NTF-001 | FR-NTF-001 | Event-driven message | Send a quotation | WhatsApp/email sent from template; delivery status logged | P2 |
| TC-NTF-002 | FR-NTF-002 | Template safety | Customer name contains `<b>` HTML; one placeholder has no value | HTML shown as text; empty placeholder renders blank, message still sent | P2 |
| TC-NTF-003 | FR-NTF-001 | Provider outage | Messaging provider returns errors | Retries with back-off; after 5 failures moves to dead-letter queue; no duplicate messages when it recovers | P2 |
| TC-RPT-001 | FR-RPT-001 | Dashboard accuracy | Commission 3 projects of 3.78, 5.4 and 10.8 kWp this month | "Installed this month" = **19.98 kWp** | P1 |
| TC-RPT-002 | FR-RPT-002 | Large export | Export 50,000 rows | Runs in background; download link sent; file complete | P2 |
| TC-RPT-003 | FR-RPT-001 | Report scope | Pune-only user runs sales report | Only Pune data, only own tenant | P1 |

### HR core (HR)

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-HR-001 | FR-HR-001 | Create employee | Create technician with mandatory fields; create a second employee with the same PAN | Employee code from numbering series; duplicate PAN rejected | P1 |
| TC-HR-002 | FR-HR-002, SEC-196 | Protected statutory data | Open employee as Project Manager; inspect DB row | PAN/UAN/bank shown masked to non-HR roles; stored encrypted in DB | P1 |
| TC-HR-003 | FR-HR-005 | Mobile attendance | Technician checks in at site 09:00 and out at 17:30 | Attendance PRESENT, 8.5 hours, GPS stored; check-in on a holiday is flagged | P1 |
| TC-HR-004 | FR-HR-005 | Biometric import | Import a device file including duplicate punches and an unknown device ID | Punches mapped to employees; duplicates ignored; unknown ID reported | P2 |
| TC-HR-005 | FR-HR-006 | Missed punch | Employee requests regularisation; manager approves | Attendance updated; request and approval audited | P2 |
| TC-HR-006 | FR-HR-007 | Leave balance | Casual leave 12/year accrued 1/month; employee with balance 2 applies for 3 days | Blocked (or extra day marked loss-of-pay, per policy); after approval of a valid request, balance reduces | P1 |
| TC-HR-007 | FR-HR-007 | Sandwich rule | Leave Friday and Monday with weekend in between, sandwich rule ON then OFF | ON: 4 days deducted; OFF: 2 days deducted | P2 |
| TC-HR-008 | FR-HR-008 | Labour cost to project | Timesheet: 6 hours on Project X at ₹250/hour | **₹1,500** added to Project X labour cost (TC-PRJ-004) | P1 |
| TC-HR-009 | FR-HR-009 | Overtime | 2 hours overtime requested and approved | Overtime recorded and available to payroll | P2 |
| TC-HR-010 | FR-HR-010 | Expired certificate | Assign technician whose working-at-height certificate expired to a rooftop job | Warning (or block, per tenant setting); assignment logged | P2 |
| TC-HR-011 | FR-HR-011 | Self-service | Employee opens self-service | Sees own profile, attendance, leave and documents only | P1 |
| TC-HR-012 | FR-HR-004 | Contract labour | Record attendance for 5 contract workers at a site | Attendance stored per worker and contractor firm | P3 |

## D5. Phase 1 — End-to-End Scenario

**TC-E2E-001 (P1) — Lead to cash, residential 3.78 kWp**

| Step | Action | Who | Check |
|---|---|---|---|
| 1 | Lead arrives from website form | System | Lead assigned to Sales S1 |
| 2 | Schedule and complete site survey **offline** | Sales / Surveyor | Survey synced with photos and bill data |
| 3 | Create design (7 × 540 Wp, 3 kW inverter) and BOM | Design Engineer | 3.780 kWp; 5,380.83 kWh/yr |
| 4 | Create quotation with 12% discount → approval | Sales → Management | Approval needed and given; PDF shows payback 3.24 years |
| 5 | Customer accepts online | Customer | Quote locked; SO created; project and regulatory checklist created |
| 6 | Raise 30% advance invoice; record payment | Accounts | Invoice ₹60,000 + tax; paid |
| 7 | PO for panels and inverter → approval → GRN with serials | Purchase / Store | Serials IN_STOCK |
| 8 | Reserve and issue material to project | Store | Serials ISSUED to project |
| 9 | Installation job card completed **offline**, serials scanned, customer signs | Technician | Serials INSTALLED; job card locked |
| 10 | Regulatory steps: application → inspection → net meter | Liaison | All steps done with documents |
| 11 | Commission; raise 60% and 10% invoices; record payments | PM / Accounts | Project fully paid |
| 12 | Close project; check reports | Management | Profitability, installed kWp and receivables reports correct |

**Pass:** every step works without workarounds, every check matches, and the audit log shows each action with the correct user.

## D6. Phase 1 — Security Test Cases

| TC ID | Req | Scenario | Steps | Expected result | Pri |
|---|---|---|---|---|---|
| TC-SEC-001 | SEC-110 | Token used on another tenant | Log in to Tenant A; call Tenant B's subdomain with A's token | 403; attempt logged | P1 |
| TC-SEC-002 | SEC-111 | IDOR across tenants | As Tenant A, GET/PUT/DELETE Tenant B's project, invoice and file IDs | 404 for every call (does not reveal that the record exists) | P1 |
| TC-SEC-003 | SEC-111 | Mass assignment | `POST /leads` with `"tenant_id": <B>`; `PATCH /me` with `"role": "admin"` | Lead created in Tenant A; role unchanged; extra fields ignored | P1 |
| TC-SEC-004 | SEC-112 | Isolation suite coverage | Run the cross-tenant suite in CI | Covers 100% of endpoints in the OpenAPI spec; 0 failures | P1 |
| TC-SEC-005 | SEC-113 | Signed URL abuse | Use a file URL after 6 minutes; change the file key in a valid URL | Both rejected (expired / invalid signature) | P1 |
| TC-SEC-006 | SEC-114 | Job tenant context | Queue a job for Tenant A that tries to update a Tenant B record | Update affects 0 rows; error logged | P1 |
| TC-SEC-010 | SEC-101 | Weak password | Set password `Password@123` | Rejected as known-breached; DB stores an Argon2id hash only | P1 |
| TC-SEC-011 | SEC-102 | Brute force | 6 wrong passwords; compare error for unknown email | Locked 15 minutes + CAPTCHA; same message and similar response time for unknown email | P1 |
| TC-SEC-012 | SEC-103 | Token tampering | Send JWT with `alg: none`, changed `tenant_id`, wrong signature, expired time | All rejected with 401 | P1 |
| TC-SEC-013 | SEC-103 | Refresh token reuse | Use a refresh token, then re-use the old one | Re-use detected; all tokens of that session revoked; user must log in again | P1 |
| TC-SEC-014 | SEC-104 | Session revoked | Deactivate a logged-in user; they click anything | Next request is rejected; user logged out | P1 |
| TC-SEC-015 | SEC-105 | MFA | Log in with correct TOTP; reuse the same code; use a backup code twice | First works; reused code and second backup-code use rejected | P1 |
| TC-SEC-016 | SEC-109 | Password reset | Use reset link twice; after 31 minutes; request reset for unknown email | Second use and expired link rejected; unknown email gets the same response as a real one | P1 |
| TC-SEC-020 | SEC-106 | Privilege escalation | As Technician call `POST /admin/roles`, `GET /finance/invoices`; build check for endpoint without permission | 403 for each call; build fails if any endpoint lacks a permission | P1 |
| TC-SEC-021 | SEC-107 | Own-records scope | Sales S1 lists and opens Sales S2's leads | Not listed; direct URL returns 404 | P1 |
| TC-SEC-022 | SEC-108 | Field-level security | Same as TC-QTN-003 for POs and item cost | Cost fields absent from JSON, PDFs and exports | P1 |
| TC-SEC-030 | SEC-130 | SQL injection | Payloads such as `' OR 1=1 --`, `UNION SELECT`, `SLEEP(5)` in search, filter and sort | No extra data, no delay; invalid sort field → 400 | P1 |
| TC-SEC-031 | SEC-131 | Stored XSS | Lead name `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` | Shown as plain text in web, mobile, PDF, email and WhatsApp | P1 |
| TC-SEC-032 | SEC-132 | Security headers | Scan web and API responses | All required headers present and correct | P2 |
| TC-SEC-033 | SEC-133 | CORS / CSRF | Call the API from `https://evil.example` origin; state-changing request without CSRF token (cookie mode) | No CORS permission for evil origin; request without token rejected | P1 |
| TC-SEC-034 | SEC-134 | Malicious upload | Upload EICAR test file renamed `.jpg`; 60 MB file; SVG with script | Rejected (malware / too large → 413 / type not allowed) | P1 |
| TC-SEC-035 | SEC-135 | Rate limiting | 1,000 login requests per minute from one IP | 429 after threshold with `Retry-After` | P2 |
| TC-SEC-037 | SEC-137 | Fake payment webhook | Send webhook with bad signature; valid signature but 10-minute-old timestamp | Both rejected; no subscription change | P1 |
| TC-SEC-040 | SEC-120 | TLS | Scan public endpoints (e.g. SSL Labs / testssl.sh) | TLS 1.0/1.1 disabled; grade A or better; HTTP → HTTPS with HSTS | P1 |
| TC-SEC-041 | SEC-121 | Encryption at rest | Review DB, snapshot, backup and bucket settings | Encryption enabled with KMS keys everywhere | P1 |
| TC-SEC-042 | SEC-122 | Field encryption | Inspect DB rows for bank details, MFA secrets, integration tokens | Stored as ciphertext only | P1 |
| TC-SEC-043 | SEC-123 | Masking | View customer KYC fields; search DB for a full identity number | UI shows last 4 digits; full number not found in any DB column | P1 |
| TC-SEC-044 | SEC-124 | Secrets in logs | Run the full regression suite; search logs for passwords, OTPs, tokens | None found | P1 |
| TC-SEC-045 | SEC-140 | Network exposure | External port scan of all public IPs | Only 443 (and 80 redirect) open; MySQL/Redis unreachable | P1 |
| TC-SEC-046 | SEC-141 | WAF | Send common attack patterns and scripted sign-ups | Blocked or challenged by WAF | P2 |
| TC-SEC-047 | SEC-142 | Secrets handling | Secret scan repo and images; rotate DB password during load test | No secrets found; rotation causes no errors | P2 |
| TC-SEC-050 | SEC-150, 144 | Pipeline security gate | Add a dependency with a known Critical CVE in a test branch | Build fails and reports the CVE | P1 |
| TC-SEC-051 | SEC-152 | DAST | Full ZAP scan of Staging | 0 High findings | P1 |
| TC-SEC-052 | SEC-153 | Penetration test | External pen test of web, API and Android app | All Critical/High fixed and retested before go-live | P1 |
| TC-SEC-060 | SEC-160 | Security logging | Perform login fail/success, role change, export, impersonation | Each logged with user, tenant, IP, time, result | P1 |
| TC-SEC-061 | SEC-163 | Security alerting | Simulate brute force and 100 cross-tenant 404s in 1 minute | Alert raised to on-call within 5 minutes | P2 |
| TC-SEC-070 | SEC-170 | Support impersonation | Support tries without consent; then with consent; wait 4 hours | Blocked without consent; banner during session; session ends at 4 h; actions logged with both identities | P1 |
| TC-SEC-071 | SEC-171 | Admin console access | Open console from non-allowed IP; log in without MFA | Both blocked | P1 |
| TC-SEC-080 | SEC-180 | Phone data at rest | Copy app database from a rooted test device | File is encrypted and unreadable | P1 |
| TC-SEC-081 | SEC-181 | Remote wipe | Deactivate technician with unsynced work; open app with network | Pending work pushed, then local data wiped and user logged out | P1 |
| TC-SEC-082 | SEC-182 | Man-in-the-middle | Route app through a proxy with an untrusted certificate | App refuses to connect | P1 |
| TC-SEC-090 | SEC-190 | Consent | Capture consent for a customer; then withdraw it | Consent record with purpose and time; marketing messages stop after withdrawal | P2 |
| TC-SEC-091 | SEC-197 | HR self-service scope | Employee changes the employee ID in the URL to a colleague's; manager opens attendance of another team | 404 for the colleague's record; only own team visible to the manager | P1 |

## D7. Phase 1 — Non-Functional Test Cases

| TC ID | Req | Scenario | Method / data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-NFR-001 | NFR-02 | Normal load | k6: 500 concurrent users, mixed workload, 30 minutes | p95 < 500 ms; error rate < 0.1% | P1 |
| TC-NFR-002 | NFR-02 | Report speed | Tenant with 5,000 projects and 500,000 stock-ledger rows; 1-year reports | Each report < 5 s | P1 |
| TC-NFR-003 | NFR-02 | PDF speed | 20 proposal PDFs with charts in parallel | Each < 10 s | P2 |
| TC-NFR-004 | NFR-03 | Scale | 1,000 tenants seeded; repeat TC-NFR-001; increase load until autoscaling | Latency within target; new pods added automatically; isolation suite still green | P1 |
| TC-NFR-005 | NFR-02 | Soak | 8 hours at 60% of normal load | No memory growth or latency drift | P2 |
| TC-NFR-006 | NFR-07, SEC-195 | Point-in-time restore | Restore Production backup to an isolated account at a chosen time | Restore ≤ 4 h; data matches the chosen time; data loss ≤ 15 min | P1 |
| TC-NFR-007 | NFR-01 | Failover | During load: kill an API pod; force DB Multi-AZ failover | Service recovers within 2 minutes; no committed transaction lost | P1 |
| TC-NFR-008 | NFR-14 | Zero-downtime deploy | Deploy a new release during load test (incl. DB migration) | No 5xx errors caused by the deployment | P1 |
| TC-NFR-009 | NFR-13 | Accessibility | axe scan + keyboard-only test of main flows | 0 critical issues; all main flows usable by keyboard | P2 |
| TC-NFR-010 | NFR-11 | Time zones | Tenant in Asia/Dubai creates records | Times shown in Dubai time; stored in UTC | P2 |
| TC-NFR-011 | NFR-10 | Compatibility | Latest Chrome, Edge, Firefox, Safari; Android 10+ phones (low and mid range) | All main flows work; layout correct on tablet and phone | P2 |
| TC-NFR-012 | NFR-09 | Audit retention | Check audit-partition rotation job | Partitions created ahead of time; data older than 3 years archived and removed | P3 |

## D8. Phase 2 — Test Cases

### Functional

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-SVC-001 | FR-SVC-001 | Installed base | Commission a project | Asset created with all installed serials and warranty dates | P1 |
| TC-SVC-002 | FR-SVC-002 | AMC visits | 1-year AMC with quarterly cleaning | 4 visits generated on correct dates and assigned | P1 |
| TC-SVC-003 | FR-SVC-003 | SLA breach | Ticket with 24 h SLA not resolved in time | Escalation to manager; SLA report shows breach | P1 |
| TC-SVC-004 | FR-SVC-004 | Spare parts | Engineer uses 1 MC4 connector pair on a ticket | Stock reduced; cost added to ticket | P2 |
| TC-SVC-005 | FR-SVC-005 | Warranty expiry | Inverter warranty ends in 30 days | Alert to service team (and customer if enabled) | P2 |
| TC-SVC-006 | FR-SVC-006 | RMA replacement | Replace faulty inverter | Old serial → RMA; new serial → INSTALLED on the same asset; history kept | P1 |
| TC-SVC-007 | FR-SVC-007 | AMC renewal | AMC ending in 30 days | Renewal reminder and draft renewal invoice | P2 |
| TC-MON-001 | FR-MON-001 | Connect inverter cloud | Valid and invalid credentials for one vendor | Valid → plants listed; invalid → clear error, nothing saved | P1 |
| TC-MON-002 | FR-MON-002 | Import is idempotent | Run daily import twice for the same day | No duplicate readings | P1 |
| TC-MON-003 | FR-MON-003 | Under-performance ticket | Actual < 80% of expected for 3 days | One ticket created (not one per day) | P1 |
| TC-MON-004 | FR-MON-001 | Vendor API outage | Vendor API returns 500 / rate-limit | Retries with back-off; other vendors unaffected; error visible to admin | P2 |
| TC-CPT-001 | FR-CPT-001 | Portal login | Customer logs in with mobile OTP | Access granted to own portal | P1 |
| TC-CPT-002 | FR-CPT-002 | Portal content | Open project timeline and documents | Correct stage; quote, invoices, warranty and commissioning report downloadable | P1 |
| TC-CPT-003 | FR-CPT-003 | Online payment | Pay an invoice in gateway sandbox | Receipt created automatically from webhook; invoice status updated | P1 |
| TC-CPT-004 | FR-CPT-004 | Raise ticket | Customer raises a ticket with a photo | Ticket created and assigned; customer sees updates | P1 |
| TC-FIN-101 | FR-FIN-003 | E-invoice | Post an eligible B2B invoice | IRN and QR code received and printed; GSP error shown clearly and retry possible | P1 |
| TC-FIN-102 | FR-FIN-003 | E-way bill | Dispatch material above the threshold | E-way bill generated and linked to the delivery | P2 |
| TC-INT-101 | A11 | Lead ads | Submit a test Facebook/Google lead | Lead created with correct source and campaign | P2 |
| TC-INT-102 | A11 | E-signature | Send contract for e-sign; customer signs | Signed PDF stored; status updated; evidence kept | P2 |
| TC-INT-103 | A11 | Public API | CRUD on leads with an API key; check pagination and errors | Behaves as documented in OpenAPI | P1 |
| TC-INT-104 | A11 | Outbound webhooks | Tenant endpoint down for 1 hour | Retries with back-off; delivered once it is back; signature verifiable | P1 |
| TC-MOB-101 | NFR-10 | iOS app | Run all Phase 1 mobile test cases on iOS | Same results as Android | P1 |

### Payroll (PAY)

Statutory rates below are **example test data** loaded into the tenant's statutory settings; the tests check that the system applies the configured values, not that these values are current law.

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-PAY-001 | FR-PAY-001 | Salary structure | Gross ₹30,000/month: Basic 50%, HRA 40% of Basic, Special = balance | Basic **₹15,000**, HRA **₹6,000**, Special **₹9,000** | P1 |
| TC-PAY-002 | FR-PAY-003 | PF | Basic ₹15,000; PF 12%; EPS 8.33% capped at ₹1,250 | Employee PF **₹1,800**; employer **₹1,800** = EPS **₹1,250** + EPF **₹550** | P1 |
| TC-PAY-003 | FR-PAY-003 | ESI | ESI 0.75% / 3.25%, wage ceiling ₹21,000; employees with gross ₹20,000 and ₹30,000 | ₹20,000: employee **₹150**, employer **₹650**; ₹30,000: ESI not applied | P1 |
| TC-PAY-004 | FR-PAY-003 | Professional Tax by state | Same salary for employees in Maharashtra and Gujarat branches | Each gets the slab from their own state's configuration | P1 |
| TC-PAY-005 | FR-PAY-002 | Loss of pay | 30-day month, gross ₹30,000, 2 days loss-of-pay | Gross paid = 30,000 × 28 ÷ 30 = **₹28,000** | P1 |
| TC-PAY-006 | FR-PAY-003 | TDS | Test employee on new regime with a mid-year declaration change | Monthly TDS matches a reference calculation prepared by a payroll expert; remaining months re-spread | P1 |
| TC-PAY-007 | FR-PAY-004, SEC-213 | Lock after approval | Approve and lock a run; try to edit a payslip; add a correction | Edit blocked; correction appears as arrears in the next run | P1 |
| TC-PAY-008 | FR-PAY-005 | Payslip | Generate and email payslips | PDF opens only with the configured password; also visible in self-service | P1 |
| TC-PAY-009 | FR-PAY-006 | Bank file | Generate bank file for 50 employees | Total equals sum of net pay; file passes the bank's sample format validation | P1 |
| TC-PAY-010 | FR-PAY-007 | EPF ECR file | Generate ECR for the month | File passes EPFO format validation; totals match payroll register | P1 |
| TC-PAY-011 | FR-PAY-008 | Loan recovery | Loan ₹12,000 over 6 months | ₹2,000 deducted each month; stops after month 6 | P2 |
| TC-PAY-012 | FR-PAY-009 | Full & final | Leave encashment 10 days and gratuity for 5 years, last Basic ₹15,000, 26-day basis | Encashment 15,000 ÷ 26 × 10 = **₹5,769.23**; gratuity 15 ÷ 26 × 15,000 × 5 = **₹43,269.23** | P2 |
| TC-PAY-013 | FR-PAY-010 | Piece-rate contract labour | ₹1,000 per kWp; crew completes a 3.78 kWp job card | Payment **₹3,780** to the contractor | P2 |
| TC-PAY-014 | FR-PAY-011 | Accounting journal | Export payroll journal and import into Tally test company | Debits equal credits; import succeeds | P1 |
| TC-PAY-015 | FR-PAY-002 | Mid-month joiner | Joined on the 16th of a 30-day month, gross ₹30,000 | Paid 15 days = **₹15,000** | P1 |

### Security

| TC ID | Req | Scenario | Steps | Expected result | Pri |
|---|---|---|---|---|---|
| TC-SEC-101 | SEC-201 | SSO | Log in via Microsoft Entra ID; disable the user in Entra; wait for token refresh | Login works; disabled user loses access | P1 |
| TC-SEC-102 | SEC-202 | API key handling | Create key; try to view it again; revoke it and call API | Key shown only once; stored hashed; revoked key → 401 immediately | P1 |
| TC-SEC-103 | SEC-202 | API key scope | Read-only key calls `POST /leads` | 403 | P1 |
| TC-SEC-104 | SEC-203 | SSRF | Webhook URL `http://169.254.169.254/`, `http://localhost`, `http://10.0.0.5`, a domain that re-resolves to a private IP | All blocked at save time or send time | P1 |
| TC-SEC-105 | SEC-204 | Portal OTP abuse | 3 wrong OTPs; OTP after 6 minutes; 6 OTP requests in an hour | Locked after 3; expired OTP rejected; 6th request throttled | P1 |
| TC-SEC-106 | SEC-204 | Customer-to-customer IDOR | Customer X changes the invoice ID in the URL to Customer Y's | 404 | P1 |
| TC-SEC-107 | SEC-205 | Integration secrets | Save inverter credentials; GET the connection via API; inspect DB | Secret never returned by API; stored encrypted | P1 |
| TC-SEC-108 | SEC-206 | Mobile hardening | Rooted device; MITM proxy with user-installed CA | Warning and restricted mode on rooted device; pinning blocks the proxy | P2 |
| TC-SEC-109 | SEC-207 | Signed document tampering | Change one byte of a signed PDF; run verification | Verification fails | P1 |
| TC-SEC-110 | SEC-208 | Tenant security policy | Set IP allow-list and 15-minute idle timeout | Login from other IPs blocked; idle session expires at 15 minutes | P2 |
| TC-SEC-111 | SEC-212 | Salary privacy | Tenant Admin without `payroll.view` opens payroll screens, API, reports, exports and audit log | Salaries not visible anywhere (403 or masked) | P1 |
| TC-SEC-112 | SEC-213 | Maker-checker | User who prepared the payroll run tries to approve it | Blocked; another approver required | P1 |
| TC-SEC-113 | SEC-214 | Bank-account change fraud | Change an employee's bank account 2 days before payroll; download bank file | Change needs approval, employee notified, run flagged; download logged with user and time | P1 |
| TC-SEC-114 | SEC-215 | Payslip password | Open a payslip PDF without the password | Cannot be opened | P2 |
| TC-NFR-101 | NFR-03 | Monitoring volume | Import daily data for 10,000 plants | Completed within 1 hour; API latency unaffected | P2 |
| TC-NFR-102 | NFR-07 | Region DR drill | Fail over to the DR region | Service restored ≤ 4 h; data loss ≤ 15 min | P1 |

## D9. Phase 3 — Test Cases

| TC ID | Req | Scenario | Steps / test data | Expected result | Pri |
|---|---|---|---|---|---|
| TC-PPA-001 | A12 Phase 3 | PPA monthly invoice | Meter reading 1,200 kWh; tariff ₹5.00 with 2% yearly escalation, contract year 3 | Energy charge = 1,200 × 5.00 × 1.02² = **₹6,242.40** (+ tax) | P1 |
| TC-PPA-002 | A12 Phase 3 | Bad meter reading | Reading lower than last month (no meter replacement recorded) | Flagged for review; no invoice until resolved | P1 |
| TC-PPA-003 | A12 Phase 3 | Meter replacement | Record meter change with final and start readings | Consumption calculated across both meters correctly | P2 |
| TC-PPA-004 | A12 Phase 3 | Late payment charge | Invoice paid 20 days late with configured interest | Interest calculated per contract terms on next invoice | P2 |
| TC-RPT-301 | FR-RPT-003 | Custom report permissions | Sales user builds a report and tries to add "cost" column | Column not available to that role | P1 |
| TC-DLR-301 | A12 Phase 3 | Dealer commission | Dealer-referred project commissioned; commission 2% | Commission entry = 2% of contract value; visible to dealer | P2 |
| TC-AI-301 | A12 Phase 3 | Lead scoring | New lead with complete data | Score shown with main reasons; can be overridden by user | P3 |
| TC-AI-302 | A12 Phase 3 | Generation anomaly | Inject a 25% sudden drop for one plant | Anomaly flagged; ticket suggested | P2 |
| TC-LOC-301 | A12 Phase 3 | Another country | Tenant in UAE with VAT configured | Invoice uses VAT layout, currency AED, local date format | P2 |
| TC-LOC-302 | NFR-11 | Hindi UI | Switch user language to Hindi | All screens translated; PDFs use the selected language template | P2 |
| TC-SEC-201 | SEC-304 | Partner isolation | Dealer D1 tries to open D2's leads | 404 | P1 |
| TC-SEC-202 | SEC-305 | Meter data integrity | Import a reading file with a broken checksum; edit a reading manually | Import rejected; manual edit needs approval and is audited | P1 |
| TC-SEC-203 | SEC-303 | BYOK | Revoke the tenant's customer-managed key in a test account | Tenant data can no longer be decrypted; access restored when key re-enabled | P2 |
| TC-SEC-204 | SEC-302, 308 | Data residency | Create EU tenant; inspect DB, files, backups, logs location | All stored only in the EU region | P1 |
| TC-SEC-205 | SEC-306 | Unusual behaviour | User exports 10× their normal volume at 2 a.m. | Alert raised; optional step-up MFA | P2 |

## D10. Traceability Summary

| Area | Requirements | Test cases |
|---|---|---|
| Subscription | FR-SUB-001 – 012, SEC-137, 138, 191 | TC-SUB-001 – 017, TC-SEC-037 |
| Administration | FR-ADM-001 – 011, SEC-172 | TC-ADM-001 – 012 |
| CRM | FR-CRM-001 – 007 | TC-CRM-001 – 007 |
| Site survey | FR-SRV-001 – 006 | TC-SRV-001 – 005 |
| Design & sizing | FR-DSN-001 – 007 | TC-DSN-001 – 009 |
| Quotation & SO | FR-QTN-001 – 007, FR-SO-001 – 004 | TC-QTN-001 – 007, TC-SO-001 – 003 |
| Projects | FR-PRJ-002 – 008 | TC-PRJ-001 – 005 |
| Procurement & inventory | FR-PUR-002 – 005, FR-INV-003 – 008 | TC-PUR-001 – 006, TC-INV-001 – 008 |
| Field service | FR-FLD-001 – 008 | TC-FLD-001 – 008 |
| Regulatory | FR-REG-001 – 006 | TC-REG-001 – 004 |
| Finance | FR-FIN-001 – 009, SEC-136 | TC-FIN-001 – 010, TC-FIN-101 – 102 |
| Notifications & reports | FR-NTF-001 – 002, FR-RPT-001 – 003 | TC-NTF-001 – 003, TC-RPT-001 – 003, TC-RPT-301 |
| O&M, monitoring, portal (Phase 2) | FR-SVC, FR-MON, FR-CPT | TC-SVC-001 – 007, TC-MON-001 – 004, TC-CPT-001 – 004 |
| HR core (Phase 1) | FR-HR-001 – 011, SEC-196 – 197 | TC-HR-001 – 012, TC-SEC-091 |
| Payroll (Phase 2) | FR-PAY-001 – 011, SEC-212 – 215 | TC-PAY-001 – 015, TC-SEC-111 – 114 |
| Security | SEC-101 – 197 (Phase 1), SEC-201 – 215 (Phase 2), SEC-301 – 308 (Phase 3) | TC-SEC-001 – 091, TC-SEC-101 – 114, TC-SEC-201 – 205 |
| Non-functional | NFR-01 – 14 | TC-NFR-001 – 012, TC-NFR-101 – 102 |
| End-to-end | Whole lifecycle | TC-E2E-001 |

Requirements without a test case yet (to be written during design, as their details are confirmed): FR-SUB-009, FR-SUB-010, FR-ADM-007, FR-ADM-012, FR-CRM-008, FR-CRM-009, FR-DSN-002, FR-DSN-006, FR-REG-004, FR-MON-004, FR-QTN-008, FR-PRJ-001, FR-PRJ-003, FR-PRJ-007, FR-PUR-001, FR-PUR-003, FR-PUR-006, FR-INV-001, FR-INV-002, FR-INV-005, FR-INV-009, FR-FIN-007, FR-FIN-008, FR-FIN-010, FR-NTF-003, FR-CPT-005, FR-HR-003, FR-HR-012, FR-PAY-012.

## D11. UAT Sign-off

| Phase | Scope tested | Test cases run / passed | Open defects (Crit / High / Med / Low) | Business owner | Decision | Date |
|---|---|---|---|---|---|---|
| Phase 1 | | / | / / / | | Go / No-go | |
| Phase 2 | | / | / / / | | Go / No-go | |
| Phase 3 | | / | / / / | | Go / No-go | |

---
*End of document — v0.2 draft*
