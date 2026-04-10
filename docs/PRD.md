# Product Requirements Document (PRD) — MVP

## Project: Bodega

**Product Type:** SaaS Web Application  
**Status:** FINAL (MVP-locked)

---

## 0. Tech Stack (Locked — Option A)

### Main App (In Scope)

- **Frontend:** Next.js (React) + TypeScript
- **Backend:** Next.js API routes (initial MVP)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Auth.js (NextAuth) _(free option)_
- **Hosting/Deployment:** Vercel (app) + Managed Postgres (provider TBD)
- **CI/CD:** GitHub Actions (recommended)
- **Error Monitoring (recommended):** Sentry (optional for MVP)

### Landing Page (Out of Scope for this PRD)

- Separate repository for marketing/landing page (implementation deferred)

---

## 1. Project Summary

**Bodega** is a SaaS inventory management web application that enables organizations to track inventory accurately using a ledger-based stock movement system. Users can belong to multiple organizations, while admins primarily monitor usage, inventory health, and system activity.

The MVP focuses on correctness, auditability, and usability — not advanced supply-chain automation.

---

## 2. Goals & Success Criteria

### Goals

- Replace spreadsheets and manual inventory tracking
- Provide a trustworthy, centralized inventory system
- Support multiple organizations per user
- Enable admins to monitor activity and data health
- Validate product usefulness with real users quickly

### Success Criteria

- Users can complete the full inventory lifecycle:
  - Create items
  - Receive, issue, and adjust stock
  - View accurate current inventory
- Inventory levels remain consistent after multiple concurrent actions
- Admins can audit activity and export data
- MVP is usable by at least one real organization without external tools

---

## 3. Target Users

### User (Primary)

- Operational staff managing inventory
- Can belong to multiple organizations
- Performs item and stock operations

### Platform Admin (Secondary)

- Platform-level overseer (not tied to a single organization)
- Monitors users, activity, and inventory health across organizations
- Monitoring-only, no routine operational involvement

---

## 4. Scope

### In Scope (MVP)

- SaaS web app (main app only)
- Authentication and organization switching
- Organization-level roles (Org Admin, Org User)
- Platform Admin role (platform-level monitoring)
- Item management
- Ledger-based inventory movements
- Inventory views and reports
- Admin monitoring dashboard
- CSV export

### Out of Scope

- Billing and subscriptions
- Supplier management / purchase orders
- Demand forecasting / ML
- Multi-location inventory UI
- Offline support
- Native mobile apps
- Landing page content (separate repo)
- Third-party integrations

---

## 5. Functional Requirements

### 5.1 Organization & Membership

- Users can join multiple organizations
- Role is assigned per organization (Org Admin or Org User)
- Platform Admin is a separate global role (not per-organization)
- Users can switch active organization context

---

### 5.1.1 Role Matrix (MVP)

| Capability | Org User | Org Admin | Platform Admin |
| --- | --- | --- | --- |
| Create/edit/deactivate items | Yes | Yes | No |
| Record stock movements | Yes | Yes | No |
| View inventory and movement history (own org) | Yes | Yes | No |
| Manage org members (invite/remove/change role) | No | Yes | No |
| View admin monitoring dashboard (own org) | No | Yes | No |
| View cross-org monitoring dashboard | No | No | Yes |
| View cross-org audit and exports | No | No | Yes |

---

### 5.2 Item Management

- Users can create, edit, deactivate items
- Required fields:
  - Name
  - SKU / unique identifier
  - Unit of measure
- Optional fields:
  - Category
- Deactivated items cannot receive new movements

---

### 5.3 Inventory & Stock Rules

- Inventory is ledger-based (movement-driven)
- Stock is derived, never directly edited
- Negative inventory is prevented
- Movement types:
  - Receive
  - Issue
  - Adjustment (requires reason)
- Movements are immutable
- Corrections require adjustments

---

### 5.4 Location Model

- Single default location per organization
- Internally structured to allow future multi-location support

---

### 5.5 User Dashboard

- Inventory list with current stock
- Create/edit items
- Record stock movements
- View movement history
- Low-stock indicators

---

### 5.6 Platform Admin Dashboard

**Monitoring-focused only**

- User list per organization
- Role visibility and basic user management
- Inventory health overview:
  - Low-stock items
  - Recent adjustments
  - Large outbound movements
- Full movement audit view
- CSV export access

---

### 5.7 CSV Export

- Current inventory export
- Movement ledger export
- Filtered by date range and item

---

## 6. Non-Functional Requirements

- Authentication required for all access
- Organization-level data isolation (Platform Admin has read-only cross-org visibility)
- Atomic inventory transactions
- Audit trail for all movements
- Acceptable performance for MVP-scale datasets

---

## 7. Assumptions

- Users have reliable internet access
- Single-location MVP is sufficient initially
- Manual data entry is acceptable
- Admin role is primarily observational
- Free auth solution is acceptable for MVP security posture

---

## 8. Risks & Mitigation

### Risk 1: Scope Creep Toward Full Supply Chain

**Impact:** Delays MVP delivery  
**Mitigation:**

- Lock MVP scope
- Defer suppliers, POs, forecasting explicitly
- Review new requests against MVP goals

---

### Risk 2: Inventory Inconsistencies Due to User Error

**Impact:** Loss of trust  
**Mitigation:**

- Prevent negative stock
- Require adjustment reasons
- Immutable movement ledger
- Clear UI feedback

---

### Risk 3: Multi-Organization Permission Bugs

**Impact:** Data leakage  
**Mitigation:**

- Org context required on all requests
- Automated tests for isolation
- Explicit role checks

---

### Risk 4: Auth & Security Misconfiguration

**Impact:** Security vulnerabilities  
**Mitigation:**

- Use proven auth library
- Minimize custom auth logic
- Enforce HTTPS and secure cookies

---

### Risk 5: CSV Export Scope Expansion

**Impact:** Unexpected effort  
**Mitigation:**

- Fixed export formats
- No customization in MVP

---

### Risk 6: Admin Dashboard Overengineering

**Impact:** Low ROI  
**Mitigation:**

- Read-heavy dashboards
- No advanced admin workflows
- Focus on visibility only

---

## 9. MVP Product Backlog (Prioritized)

### Epic 1: Foundation & SaaS Setup

- Authentication
- Organization model
- Membership & roles
- Organization switching
- Environment setup

---

### Epic 2: Core Inventory Data Model

- Item entity
- Movement ledger
- Stock calculation
- Adjustment rules

---

### Epic 3: User Inventory Operations

- Item CRUD
- Receive stock
- Issue stock (no negative)
- Adjustments with reason
- Inventory view
- Movement history

---

### Epic 4: Admin Monitoring

- User list per org
- Role visibility
- Inventory health dashboard
- High-risk activity view

---

### Epic 5: Smart MVP Indicators

- Low-stock thresholds
- Large outbound flags
- Frequent adjustment flags

---

### Epic 6: Reporting & CSV Export

- Inventory CSV export
- Movement ledger CSV export
- Filtering support

---

### Epic 7: Hardening & MVP Readiness

- Permission validation
- Error handling
- UX cleanup
- Audit verification
- Pilot readiness

---

## 10. MVP Definition of Done

The MVP is complete when:

- All MVP epics are delivered
- Inventory workflows work end-to-end
- Organization isolation is verified
- Admin monitoring is functional
- CSV exports are usable
- At least one real organization can operate without external tools

---

## 11. PRD Gaps to Finalize Before Implementation

### 11.1 Organization & Roles

- Who can create organizations (any user vs admin-only)
- Ownership model (single owner vs multiple admins, transfer rules)
- Exact permissions matrix (Admin vs User for all actions)
- Org switching UX rules when a user has many orgs

---

### 11.2 Inventory Rules

- Unit rules (integers only vs decimals, rounding behavior)
- Low-stock threshold definition (global default vs per-item)
- "Large outbound" and "frequent adjustments" thresholds and time windows
- Adjustment reasons (free text vs fixed list)
- Idempotency requirements for movement submissions

---

### 11.3 Data Integrity & Concurrency

- Concurrency expectations for simultaneous movements on same item
- Immutability policy exceptions (if any), e.g., admin voids vs adjust-only
- Stock calculation strategy for reporting (real-time vs cached refresh rules)

---

### 11.4 CSV Export Details

- Exact CSV schemas and column order
- Date/time format and timezone
- Export limits (max rows, sync vs async generation)

---

### 11.5 Non-Functional & Security

- Performance targets (e.g., inventory list response time)
- Data retention, backups, and audit trail duration
- Session duration and re-auth policies
- Browser support and accessibility baseline
