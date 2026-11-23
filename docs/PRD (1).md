# Angkringan Senja — Product Requirements Document

> **Product:** Angkringan Senja  
> **Document:** Product Requirements Document (PRD)  
> **Version:** 1.0  
> **Status:** Draft — Ready for implementation planning  
> **Date:** 10 November 2026  
> **Product type:** Single-branch web application  
> **Tagline:** Rasa Tradisi, Kemudahan Masa Kini.

---

## 1. Product Overview

### 1.1 Description

Angkringan Senja is a web-based digital management system for a traditional Indonesian angkringan. It brings customer ordering, cashier operations, kitchen coordination, menu administration, inventory tracking, and business reporting into one application.

The product combines the warmth and familiarity of a traditional angkringan with a clear, modern digital experience.

### 1.2 Problem Statement

Traditional angkringan operations may rely on handwritten notes and informal communication. This can lead to:

- Orders being misplaced, delayed, or prepared incorrectly.
- Slow transaction recording and payment reconciliation.
- Limited visibility into daily sales and popular products.
- Stock records becoming inaccurate.
- Poor coordination between cashier and kitchen staff.
- Difficulty reviewing historical transactions and operational expenses.

### 1.3 Product Vision

Provide a practical, easy-to-use digital operating system for one angkringan location, connecting customers and staff through a consistent ordering and fulfillment workflow.

### 1.4 Goals

1. Allow customers to browse the menu and place orders through a website or table QR code.
2. Allow cashiers to create and process in-store orders through a POS interface.
3. Centralize orders from QR ordering and POS.
4. Give kitchen staff a dedicated view of orders to prepare.
5. Track payments and completed sales accurately.
6. Provide the owner with menu, inventory, expense, and sales management tools.
7. Maintain an auditable record of important operational changes.

### 1.5 Non-goals

The initial release will not include:

- Multiple branches or franchise management.
- A real payment gateway or bank integration.
- Third-party food delivery integration.
- Native Android or iOS applications.
- Full accounting, tax filing, or payroll functionality.
- Supplier procurement and purchase-order workflows.
- AI-based recommendations or demand forecasting.

---

## 2. Users and Roles

| Role | Description | Main permissions |
|---|---|---|
| Owner | Business owner and administrator | Full access to administration, staff, products, inventory, expenses, reports, and settings |
| Cashier | Front-of-house staff | POS, order lookup, payment processing, receipts, and permitted order updates |
| Kitchen Staff | Food preparation staff | View kitchen queue and update preparation statuses |
| Customer | Public website visitor | Browse menu, create guest order, and track an order using a secure tracking link/token |

Customers do not need an account for the MVP. Staff accounts require authentication.

### 2.1 Authorization principles

- Enforce permissions on the backend, not only by hiding frontend navigation.
- Owner has access to all administrative modules.
- Cashier cannot manage staff roles or sensitive business settings.
- Kitchen Staff can access the kitchen workflow but not sales reports or payment administration.
- Customer tracking must be limited to the order associated with the valid tracking token.
- Record sensitive administrative actions in an activity log.

---

## 3. Scope and Priorities

### 3.1 MVP — Must Have

- Staff authentication and role-based authorization.
- Public landing page and digital menu.
- Product categories and product detail.
- Cart and guest checkout.
- QR table identification.
- Cashier POS.
- Cash payment and clearly simulated QRIS payment.
- Central order management.
- Kitchen Display System (KDS).
- Order status tracking.
- Basic owner dashboard and sales summary.

### 3.2 Should Have

- Ingredient and inventory management.
- Product recipes / bill of materials.
- Stock movement history and low-stock alerts.
- Expense recording.
- Sales and inventory reports.
- PDF and spreadsheet exports.
- Promotion codes and discounts.

### 3.3 Could Have

- Customer reviews.
- Loyalty points.
- Advanced analytics.
- Product recommendations.
- Supplier management.

### 3.4 Release approach

Deliver the Must Have scope first as a working end-to-end system. Add Should Have modules after the ordering, payment, and kitchen workflows are stable.

---

## 4. Functional Requirements

### 4.1 Authentication and Staff Management

**Requirements**

- Staff can log in and log out.
- The system identifies the authenticated user's role.
- Protected pages and API endpoints require authorization.
- Owner can create, update, deactivate, and reactivate staff accounts.
- Passwords are securely hashed.
- Invalid login attempts are rate-limited.

**Acceptance criteria**

- An unauthenticated user cannot access staff routes or protected API endpoints.
- A Kitchen Staff account cannot access owner-only inventory or analytics administration.
- Deactivated staff cannot start a new authenticated session.
- Role changes are enforced on subsequent requests.

### 4.2 Public Website and Menu

**Requirements**

- Show the angkringan identity, operating information, and menu.
- Browse products by category.
- Search products by name.
- Show product image, description, price, and availability.
- Mark featured or recommended products.
- Hide or disable unavailable products from ordering.
- Provide a clear cart entry point.

**Acceptance criteria**

- Menu information is loaded from the backend.
- Product price and availability shown to the customer reflect current server data.
- Unavailable products cannot be submitted in a new order.

### 4.3 Cart and Guest Checkout

**Requirements**

- Add products to the cart.
- Change quantities and remove items.
- Add optional item notes.
- Choose dine-in or takeaway.
- For dine-in QR orders, resolve the table from a valid QR token.
- Enter an optional customer name.
- Review the order before submission.
- Receive an order number and secure tracking link/token after successful creation.

**Business rules**

- The backend recalculates all prices and totals.
- The frontend must never be trusted as the source of price, discount, or total values.
- The backend rechecks product availability at checkout.
- Each order must contain at least one valid item.
- Quantity must be a positive integer within configured limits.
- A QR token must resolve to an active table.
- Guest tracking credentials must be high-entropy and stored safely (for example, store a hash and return the raw token only at creation).

**Acceptance criteria**

- A valid cart creates one order with the expected item snapshots and calculated total.
- Invalid, unavailable, or stale cart items are rejected with actionable validation errors.
- A customer can track only the order associated with their token.

### 4.4 Point of Sale (POS)

**Requirements**

- Cashier can search and select available products.
- Cashier can add quantities and item notes.
- Cashier can choose dine-in/table or takeaway.
- Cashier can submit an order through the same order service used by customer ordering.
- Cashier can record cash received and calculate change.
- Cashier can select simulated QRIS.
- Cashier can view order details and transaction history.
- Cashier can display or print a receipt.

**Payment methods**

- `CASH`
- `QRIS_SIMULATED`

**Important simulation rule**

QRIS simulation is a demonstration flow only. It must not claim to verify a real bank transfer or payment-provider transaction. The UI must label it as simulated and only an authorized staff action can mark it paid.

**Acceptance criteria**

- Cash received must be greater than or equal to the amount due.
- Change is calculated by the backend.
- A simulated QRIS payment is clearly identified in the payment record and receipt.
- Repeated payment requests do not create duplicate successful payments.

### 4.5 Order Management

**Order sources**

- `QR_ORDERING`
- `POS`

**Order types**

- `DINE_IN`
- `TAKEAWAY`

**Order statuses**

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `COMPLETED`
- `CANCELLED`

**Requirements**

- Authorized staff can list and inspect orders.
- Orders are filterable by date, source, type, and status.
- Status changes are validated against allowed transitions.
- Status history records previous status, new status, actor, and timestamp.
- Cancellation requires an authorized action and a reason.
- Customer tracking displays an appropriate subset of order information.
- Order creation and status changes emit real-time events where applicable.

**Suggested transition rules**

- `PENDING` → `CONFIRMED` or `CANCELLED`
- `CONFIRMED` → `PREPARING` or `CANCELLED`
- `PREPARING` → `READY` or `CANCELLED` (authorized exception only)
- `READY` → `COMPLETED`
- `COMPLETED` and `CANCELLED` are terminal states.

A payment policy must be applied consistently: for this MVP, orders are paid at the cashier before being marked `COMPLETED`. The owner may configure whether an unpaid order can enter preparation, but the initial default is that staff confirm the order and payment is collected before completion. Do not equate `READY` with `PAID`.

### 4.6 Kitchen Display System (KDS)

**Requirements**

- Display orders that require preparation.
- Show order number, time received, order type, table, items, quantities, and notes.
- Sort oldest actionable orders first.
- Filter by status.
- Allow Kitchen Staff to advance preparation status according to permitted transitions.
- Receive real-time order-created and order-updated events.
- Recover by refetching current orders after a WebSocket reconnect.

**Acceptance criteria**

- A newly confirmed order appears on the kitchen screen without manual refresh when the connection is active.
- A status update is persisted through the API before the UI treats it as successful.
- If real-time connectivity fails, the kitchen screen remains usable through normal API refresh.

### 4.7 Menu Administration

**Requirements**

- Owner can create and edit categories.
- Owner can create, edit, archive, and restore products.
- Owner can upload product images.
- Owner can set product price, description, category, availability, and featured status.
- Historical order item snapshots remain unchanged when a product is renamed or repriced.

**Acceptance criteria**

- Invalid prices and unsupported image formats are rejected.
- Products referenced by historical transactions are archived rather than hard-deleted.

### 4.8 Inventory and Recipes

**Requirements**

- Owner can manage ingredients and units.
- Owner can set current and minimum stock.
- Owner can record stock-in, stock-out, and adjustment movements.
- Owner can define a recipe for a product.
- The system can calculate ingredient requirements from order quantities.
- Low-stock ingredients are highlighted.
- Each stock movement records the before and after balance, reason, actor, and related order where applicable.

**Inventory deduction policy**

For the MVP, deduct recipe ingredients once when an order reaches the configured fulfillment/payment point. The implementation must define one canonical trigger and enforce it transactionally. Recommended default: deduct when payment is successfully recorded for an order that is accepted for fulfillment. If a paid order is later cancelled, create compensating stock movements where goods are actually recoverable; do not silently delete history.

**Concurrency and idempotency**

- Lock affected ingredient rows during deduction.
- Ensure an order can trigger inventory deduction only once.
- Reject or explicitly flag insufficient stock; do not silently create negative stock.
- Keep inventory movements immutable; corrections should use compensating adjustments.

### 4.9 Analytics and Reports

**Dashboard metrics**

- Gross sales from eligible paid transactions.
- Number of paid orders.
- Average order value.
- Best-selling products by quantity and/or revenue.
- Sales over a selected period.
- Payment method breakdown.
- Low-stock count.

**Reports**

- Sales report.
- Order/transaction report.
- Product performance report.
- Inventory movement report.
- Expense report.

**Rules**

- Exclude cancelled, failed, and unpaid orders from recognized sales.
- Handle refunds explicitly and subtract refunded amounts from net sales.
- Use a consistent business timezone (`Asia/Jakarta`).
- Clearly label date range and whether figures are gross or net.
- Do not present revenue minus recorded expenses as formal accounting profit.

### 4.10 Expense Management

**Requirements**

- Owner can record expenses with category, description, amount, and date.
- Owner can filter expenses by date and category.
- Changes to expense records should be auditable.
- Expense totals can be shown alongside sales as an operational summary.

### 4.11 Promotions

**Requirements**

- Owner can create a percentage or fixed-amount promotion.
- Configure start/end dates, minimum order, and active status.
- Validate promotion eligibility on the backend.
- Prevent discounts from exceeding the eligible subtotal.
- Store the applied discount snapshot on the order.

---

## 5. Core User Flows

### 5.1 Customer QR Ordering

1. Customer scans the QR code on a table.
2. Website resolves the QR token to an active table.
3. Customer browses the menu.
4. Customer adds items to the cart and optionally adds notes.
5. Customer reviews the cart and submits the order.
6. Backend validates products, availability, prices, and table.
7. Backend creates the order and item snapshots.
8. Customer receives an order number and tracking link.
9. Staff process the order.
10. Customer sees status updates.

### 5.2 Walk-in POS

1. Cashier opens POS.
2. Cashier selects dine-in/table or takeaway.
3. Cashier adds products and quantities.
4. Backend validates and creates the order.
5. Cashier records payment.
6. Kitchen receives the accepted order.
7. Kitchen updates preparation status.
8. Cashier completes handover and closes the order.
9. Receipt and sales record are available.

### 5.3 Kitchen Workflow

1. Kitchen receives a confirmed order.
2. Staff opens order details.
3. Staff marks it as preparing.
4. Staff marks it ready.
5. Cashier or authorized staff marks it completed after handover and payment conditions are met.

### 5.4 Owner Workflow

1. Owner signs in.
2. Owner reviews dashboard metrics.
3. Owner manages menu and availability.
4. Owner checks stock and records adjustments.
5. Owner records operational expenses.
6. Owner reviews and exports reports.

---

## 6. Information Architecture and Pages

### Public customer pages

- `/` — Landing page
- `/menu` — Digital menu
- `/menu/:slug` — Product detail
- `/cart` — Shopping cart
- `/checkout` — Checkout
- `/order/:token` — Order tracking

### Staff pages

- `/login` — Staff login
- `/admin/dashboard` — Owner dashboard
- `/admin/products` — Product management
- `/admin/categories` — Category management
- `/admin/orders` — Order management
- `/admin/inventory` — Inventory management
- `/admin/recipes` — Recipe management
- `/admin/expenses` — Expense management
- `/admin/reports` — Reports
- `/cashier/pos` — POS
- `/cashier/orders` — Cashier order history
- `/kitchen` — Kitchen Display System

Route access must be role-protected on both frontend and backend.

---

## 7. Data Model Summary

Core entities:

- `roles`
- `users`
- `categories`
- `products`
- `tables`
- `orders`
- `order_items`
- `payments`
- `ingredients`
- `recipes`
- `inventory_movements`
- `expenses`
- `promotions`
- `order_status_histories`
- `activity_logs`

### Key relationships

- One role has many users.
- One category has many products.
- One table can be associated with many orders over time.
- One order has many order items.
- One product can appear in many order items.
- One order can have one or more payment attempts/records, subject to payment rules.
- Products and ingredients are connected many-to-many through recipes.
- Ingredients have many inventory movements.
- Orders have many status history records.

### Data integrity requirements

- Use foreign keys and deliberate deletion rules.
- Use `DECIMAL` for currency and measured stock.
- Store order item product name and unit price snapshots.
- Use unique order numbers and QR tokens.
- Index frequently filtered fields.
- Preserve historical orders, payments, and stock movements.
- Use database transactions and row locking for critical operations.

---

## 8. Technical Architecture

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query for server state
- Zustand or Context for lightweight client state
- Zod for client-side schema validation
- Recharts for analytics charts
- Lucide React for icons

### Backend

- Laravel (pin a release compatible with the installed PHP runtime)
- REST API under `/api/v1`
- Eloquent ORM
- Laravel Sanctum for first-party SPA authentication
- Laravel Policies / Gates for authorization
- Laravel Reverb and broadcasting for real-time updates
- Form Requests for request validation
- API Resources for response serialization
- Service classes for business workflows

### Database and infrastructure

- MySQL 8+
- Local development through a consistent PHP/Node environment
- File storage for product images
- Queue worker for asynchronous jobs where needed
- Git and GitHub for version control

### Authentication note

For a first-party SPA, prefer Sanctum's cookie-based authentication when frontend and backend domains and CORS settings support it. Configure stateful domains, CSRF initialization, secure cookies, and credentials correctly. Choose a suitable token-based or other supported approach only if the deployment topology requires it.

### Real-time note

Reverb broadcasts notifications; MySQL remains the source of truth. The frontend must refetch current data after reconnecting.

---

## 9. API Resource Areas

Base path: `/api/v1`

| Area | Example endpoints |
|---|---|
| Authentication | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Categories | `GET /categories`, `POST /categories` |
| Products | `GET /products`, `GET /products/{slug}`, `POST /products` |
| Tables | `GET /tables/resolve/{token}` |
| Public orders | `POST /public/orders`, `GET /public/orders/{token}` |
| POS | `GET /pos/products`, `POST /pos/orders` |
| Payments | `POST /orders/{id}/payments` |
| Orders | `GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status` |
| Ingredients | `GET /ingredients`, `POST /ingredients` |
| Inventory | `GET /inventory/movements`, `POST /inventory/adjustments` |
| Recipes | `GET /recipes`, `POST /recipes` |
| Analytics | `GET /analytics/overview`, `GET /analytics/sales` |
| Reports | `GET /reports/sales`, `GET /reports/inventory` |

All endpoints require explicit validation, authorization, consistent error responses, and appropriate pagination.

---

## 10. Non-functional Requirements

### Performance

- Paginate product, order, and movement lists.
- Avoid N+1 queries.
- Add indexes for common filters.
- Keep dashboard queries scoped by date range.
- Load large exports asynchronously if necessary.

### Security

- Hash passwords using framework-supported secure hashing.
- Enforce authorization server-side.
- Validate and normalize all input.
- Rate-limit login and public order endpoints.
- Validate upload MIME type, extension, and size.
- Prevent mass assignment by explicitly defining fillable fields or DTO/request mapping.
- Protect against SQL injection, XSS, CSRF, and IDOR.
- Never expose raw tracking tokens in logs.
- Keep secrets outside source control.

### Reliability

- Use database transactions for order/payment/inventory workflows.
- Make payment and stock operations idempotent.
- Keep immutable histories for financial and stock events.
- Handle real-time disconnections gracefully.
- Provide useful loading, empty, and error states.

### Usability and accessibility

- Responsive layouts for mobile, tablet, and desktop.
- Keyboard-accessible forms and controls.
- Clear labels and readable contrast.
- Large controls for cashier and kitchen workflows.
- Consistent status labels and feedback.

### Localization

- Language: Indonesian for customer-facing and operational UI.
- Currency: Indonesian Rupiah (IDR).
- Timezone: `Asia/Jakarta`.
- Date and number formats should be localized consistently.

---

## 11. Testing and Acceptance

### Test levels

- Unit tests for pricing, discounts, state transitions, and inventory calculations.
- Feature tests for API endpoints, authentication, authorization, and validation.
- Integration tests for order/payment/inventory transactions.
- Frontend tests for critical components and state.
- End-to-end tests for complete ordering and fulfillment flows.

### Critical acceptance scenarios

**Scenario A — QR order**
- Valid QR token resolves the correct active table.
- Customer submits a valid cart.
- Server recalculates totals.
- Order and item snapshots are persisted.
- Kitchen receives the order.
- Customer tracking reflects persisted status changes.

**Scenario B — POS cash payment**
- Cashier creates an order.
- Cash received is validated.
- Change is calculated correctly.
- Payment is recorded once.
- Receipt displays correct order and payment information.

**Scenario C — Simulated QRIS**
- UI clearly labels the flow as simulated.
- Only an authorized staff action can confirm the simulated payment.
- Duplicate confirmation does not duplicate the payment or inventory deduction.

**Scenario D — Cancellation**
- Unauthorized users cannot cancel an order.
- Cancellation records actor, time, and reason.
- Cancelled orders are excluded from sales.
- Any required stock correction is recorded as a compensating movement.

**Scenario E — Concurrent stock deduction**
- Two orders attempt to consume the same limited ingredient.
- Stock locking and validation prevent overselling.
- No duplicate movement is recorded for one order.

### Definition of Done

A feature is done when its UI and API work together, authorization and validation are enforced, loading/empty/error states are handled, relevant tests pass, and documentation is updated.

---

## 12. Implementation Roadmap

| Phase | Scope | Main deliverable |
|---|---|---|
| 1. Foundation | Repository, Laravel, React, MySQL, environment, API conventions | Running frontend and backend |
| 2. Data and auth | Migrations, models, seeders, login, roles, policies | Secure staff access |
| 3. Menu | Public landing, categories, products, admin CRUD | Working digital menu |
| 4. Ordering | Cart, QR table resolution, guest checkout, tracking | Customer ordering |
| 5. POS and payments | Cashier UI, cash, simulated QRIS, receipt | In-store transactions |
| 6. Kitchen and realtime | KDS, order transitions, Reverb events | Live kitchen workflow |
| 7. Inventory | Ingredients, recipes, movements, stock deduction | Stock management |
| 8. Reporting | Dashboard, sales, expenses, exports | Owner reporting |
| 9. QA and release | Security, integration, responsive and E2E tests | Demo-ready application |

### Recommended implementation order

Complete one vertical workflow at a time. For example, implement order creation end-to-end (migration, model, service, API, frontend, tests) before starting another large module.

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Scope becomes too large | Keep Must Have scope as the first release |
| Inconsistent order status | Centralize transition rules in backend services |
| Duplicate payment or stock deduction | Use idempotency and database transactions |
| Realtime event is missed | Refetch source-of-truth data after reconnect |
| Customer tracking data is exposed | Use high-entropy tokens and scoped lookup |
| UI and API diverge | Maintain API contracts and integration tests |
| Inventory becomes inaccurate | Immutable movements, locking, and reconciliation |

---

## 14. Success Criteria

The MVP is successful when:

1. Customers can browse and submit orders through the public website.
2. Customers can use a table QR code for dine-in ordering.
3. Cashiers can create and process walk-in orders.
4. Kitchen staff can receive and update orders.
5. Customers can track their own order.
6. Owner can manage products and view basic sales data.
7. Paid, cancelled, and simulated payment states are represented accurately.
8. Critical workflows pass automated tests.
9. The application is usable on common mobile and desktop screen sizes.

---

## 15. Open Decisions

The following details should be finalized during implementation:

- Whether payment is collected before or after food preparation. Initial recommendation: allow preparation after order confirmation, collect payment at cashier, and complete only after payment and handover.
- Exact inventory deduction trigger and cancellation compensation policy.
- Whether QR ordering is restricted to dine-in tables or also supports takeaway.
- Whether customer name is required or optional.
- Receipt printing method (browser print in MVP).
- Final deployment provider and domain topology.

These decisions must be documented before implementing the affected workflows.

---

**End of PRD — Angkringan Senja v1.0**
