# Angkringan Senja — Design System & UI/UX Specification

> **Product:** Angkringan Senja  
> **Document:** Design System and UI/UX Specification  
> **Version:** 1.0  
> **Status:** Draft — Ready for UI implementation  
> **Date:** 10 November 2026  
> **Design direction:** Traditional-modern hybrid  
> **Tagline:** Rasa Tradisi, Kemudahan Masa Kini.

---

## 1. Design Vision

Angkringan Senja should feel like a familiar Indonesian angkringan presented through a polished, contemporary digital product.

The design must balance two qualities:

1. **Traditional warmth:** earthy colors, warm lighting, food photography, friendly language, and subtle visual references to wooden carts, woven materials, and evening ambience.
2. **Modern usability:** clear hierarchy, restrained decoration, responsive layouts, consistent components, accessible contrast, and efficient operational screens.

The product should not look like a generic corporate SaaS dashboard, nor should it look like a crowded traditional food flyer.

### 1.1 Design principles

- Warm, not visually noisy.
- Modern, not sterile.
- Food-first on customer pages.
- Task-first on staff pages.
- Consistent status language throughout the application.
- Mobile-first for customer ordering.
- Desktop/tablet-friendly for POS and kitchen operations.
- Accessible and readable under different lighting conditions.

---

## 2. Brand Identity

### 2.1 Brand name

**Angkringan Senja**

### 2.2 Tagline

**Rasa Tradisi, Kemudahan Masa Kini.**

### 2.3 Brand personality

- Friendly
- Warm
- Humble
- Familiar
- Reliable
- Contemporary

### 2.4 Visual motifs

Use subtle references to:

- Angkringan wooden carts.
- Warm hanging lamps.
- Traditional food wrapping.
- Woven bamboo textures.
- Steam from hot drinks.
- Evening skies and terracotta tones.

Avoid excessive illustrations, heavy textures, decorative borders, and overly ornamental typography in operational interfaces.

---

## 3. Color System

Use the following palette as the initial design token set.

| Token | Hex | Usage |
|---|---|---|
| `brand-900` | `#493323` | Primary brand, dark headers, key actions |
| `brand-800` | `#60432E` | Hover and secondary dark surfaces |
| `brand-700` | `#79543A` | Supporting brand elements |
| `cream-50` | `#FAF7F0` | Main page background |
| `cream-100` | `#F5EBD9` | Warm surface and cards |
| `cream-200` | `#EADCC5` | Borders and dividers |
| `terracotta-500` | `#C87545` | Accent and promotional emphasis |
| `terracotta-600` | `#A95D36` | Accent hover |
| `ink-900` | `#29231F` | Main text |
| `ink-600` | `#6D6259` | Secondary text |
| `white` | `#FFFFFF` | Elevated surfaces |

### 3.1 Semantic colors

| Token | Suggested color | Meaning |
|---|---|---|
| Success | `#287A52` | Paid, completed, available |
| Warning | `#B7791F` | Pending, attention required |
| Danger | `#B5453C` | Cancelled, failed, destructive action |
| Info | `#3B6F91` | Preparing, informational |
| Neutral | `#77716B` | Draft, inactive, secondary |

Semantic colors must be paired with text or icons; never communicate state by color alone.

### 3.2 Color usage rules

- Use `cream-50` as the main customer and dashboard background.
- Use white or cream surfaces for cards.
- Use `brand-900` for primary buttons and navigation accents.
- Use terracotta sparingly for calls to action, promotions, and featured details.
- Keep body text dark enough for comfortable reading.
- Do not use terracotta for long paragraphs or large areas of small text.

---

## 4. Typography

### 4.1 Font families

- **Display / editorial headings:** Playfair Display.
- **UI / body / controls:** Plus Jakarta Sans.

Use sensible system fallbacks if external fonts fail to load.

### 4.2 Type scale

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 40–48 px | 600–700 | Customer hero headline |
| H1 | 32 px | 700 | Page title |
| H2 | 24 px | 600–700 | Section heading |
| H3 | 20 px | 600 | Card or module heading |
| Body large | 16 px | 400–500 | Introductory text |
| Body | 14–16 px | 400 | General content |
| Label | 13–14 px | 500–600 | Form labels |
| Caption | 12 px | 400–500 | Metadata and helper text |

### 4.3 Typography rules

- Use Playfair Display sparingly for brand moments and customer-facing hero headings.
- Use Plus Jakarta Sans for dashboards, tables, buttons, inputs, and all operational data.
- Avoid all-caps body text.
- Use tabular numerals for prices, quantities, and dashboard metrics where supported.

---

## 5. Layout and Spacing

Use a 4 px base spacing scale.

| Token | Value |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

### 5.1 Radius

- Small controls: 8 px.
- Inputs and standard cards: 10–12 px.
- Large feature cards: 16 px.
- Pills and status labels: fully rounded.

### 5.2 Shadows and borders

- Prefer subtle borders over heavy shadows.
- Use soft shadows only for floating menus, dialogs, and elevated cards.
- Keep card borders low contrast.
- Avoid applying shadows to every element.

### 5.3 Content widths

- Customer content: maximum width around 1200 px.
- Dashboard content: flexible width with a comfortable maximum around 1440 px.
- Forms: 480–640 px where practical.
- POS: use the full available viewport width.
- KDS: prioritize order visibility over decorative whitespace.

---

## 6. Responsive Breakpoints

Use a mobile-first approach.

| Breakpoint | Width | Expected behavior |
|---|---:|---|
| Small | `< 640 px` | Single-column customer layout, compact navigation |
| Medium | `640–1023 px` | Two-column cards where suitable, tablet staff layout |
| Large | `1024–1279 px` | Desktop navigation and dashboard grids |
| Extra large | `>= 1280 px` | Full dashboard and POS workspace |

### Responsive rules

- Customer menu cards become one or two columns on small screens.
- Cart summary becomes a sticky bottom action on mobile where appropriate.
- Admin sidebar becomes a drawer on small screens.
- POS controls remain touch-friendly on tablets.
- KDS cards should remain readable from a practical viewing distance.
- Tables should become stacked cards or horizontally scrollable regions on narrow screens.

---

## 7. Navigation and Information Architecture

### 7.1 Customer navigation

Desktop:

- Brand logo/name.
- Beranda.
- Menu.
- Tentang.
- Contact/location information.
- Cart action.

Mobile:

- Compact brand header.
- Menu access.
- Cart action.
- Simple navigation drawer if additional links are needed.

### 7.2 Staff navigation

Use a consistent application shell with:

- Sidebar navigation.
- Page title and breadcrumbs.
- User/profile menu.
- Main content region.
- Contextual page actions.

Owner navigation:

- Dashboard
- Pesanan
- Menu
- Kategori
- Inventaris
- Resep
- Pengeluaran
- Laporan
- Pengguna
- Pengaturan

Cashier navigation:

- POS
- Pesanan
- Riwayat transaksi

Kitchen navigation:

- Kitchen Display

Do not show links that the current role cannot use. Backend authorization remains mandatory.

---

## 8. Customer Experience Screens

### 8.1 Landing Page

**Purpose:** Introduce Angkringan Senja and guide visitors to the menu.

Sections:

1. Header/navigation.
2. Hero section with warm angkringan photography.
3. Short brand introduction.
4. Featured menu items.
5. Popular categories.
6. Short “why visit us” section.
7. Location and operating hours.
8. Footer.

Hero content suggestion:

- Eyebrow: `ANGKRINGAN TRADISIONAL`
- Heading: `Hangatnya Malam, Nikmatnya Kebersamaan.`
- Supporting text: `Temukan nasi kucing, sate-satean, dan minuman hangat favoritmu.`
- Primary CTA: `Lihat Menu`
- Secondary CTA: `Tentang Kami`

### 8.2 Digital Menu

**Purpose:** Help customers find products quickly.

Elements:

- Page title and short description.
- Search field.
- Horizontally scrollable category chips on mobile.
- Featured product section.
- Product grid.
- Product availability labels.
- Cart summary/action.

Product card:

- Product image with consistent aspect ratio.
- Product name.
- Short description (optional).
- Price in IDR.
- Availability.
- Add button.

Do not show an add button as active for unavailable products.

### 8.3 Product Detail

Elements:

- Product image.
- Product name and description.
- Price.
- Availability.
- Quantity selector.
- Optional item notes.
- Add to cart CTA.

### 8.4 Cart

Elements:

- Product thumbnail and name.
- Unit price.
- Quantity controls.
- Remove action.
- Item subtotal.
- Order type/table context.
- Order subtotal.
- Discount, if applicable.
- Final total.
- Checkout CTA.

Empty state should explain that the cart is empty and provide a menu CTA.

### 8.5 Checkout

Elements:

- Customer name (optional).
- Order type.
- Table information for QR dine-in.
- Item summary.
- Notes.
- Payment instruction (if relevant to the configured workflow).
- Total.
- Submit order CTA.

The customer-facing checkout must not claim a real QRIS payment is available when the implementation only supports staff-confirmed simulation.

### 8.6 Order Tracking

Elements:

- Order number.
- Order creation time.
- Table or takeaway label.
- Ordered items.
- Total.
- Current status.
- Simple progress timeline.
- Helpful status explanation.

Never expose internal staff notes, other customer details, or unrelated orders.

---

## 9. Staff Interface Screens

### 9.1 Login

- Brand mark and product name.
- Email field.
- Password field with visibility toggle.
- Submit button.
- Validation and error messages.
- Responsive centered layout.

Keep the login page simple and avoid unnecessary registration links for staff.

### 9.2 Owner Dashboard

Top-level metric cards:

- Pendapatan.
- Pesanan dibayar.
- Rata-rata transaksi.
- Stok menipis.

Main content:

- Sales chart with date range selector.
- Best-selling products.
- Recent orders.
- Low-stock alerts.

Metric cards must be driven by API data and include loading, empty, and error states.

### 9.3 Product Management

- Page heading and add-product action.
- Search and category filters.
- Product table or responsive cards.
- Product thumbnail.
- Name and category.
- Price.
- Availability.
- Featured indicator.
- Edit and archive actions.

Create/edit form:

- Product name.
- Category.
- Description.
- Price.
- Image upload.
- Availability toggle.
- Featured toggle.

### 9.4 POS

**Purpose:** Make order entry fast and reliable.

Recommended desktop layout:

- Left region: searchable product catalog and category filters.
- Right region: cart, order type, table selection, totals, and checkout action.

Requirements:

- Large touch targets.
- Clear selected state.
- Fast quantity adjustment.
- Persistent order summary.
- Confirmation before destructive cart reset.
- Clear payment method selection.
- Cash received and change display.
- Receipt preview after successful payment.

Avoid unnecessary animation in POS.

### 9.5 Kitchen Display System

**Purpose:** Make the kitchen queue easy to scan.

Use clear columns or grouped sections:

- Menunggu.
- Diproses.
- Siap.

Each order card should display:

- Order number.
- Time received and elapsed time.
- Dine-in/table or takeaway.
- Items and quantities.
- Preparation notes.
- Primary next-status action.

Use a strong visual distinction between new, in-progress, and ready orders. Provide a visible connection indicator for real-time status.

### 9.6 Inventory

- Stock summary.
- Low-stock filter.
- Ingredient table.
- Unit and current quantity.
- Minimum stock.
- Stock status.
- Stock adjustment action.
- Movement history.

Stock adjustment dialog should require movement type, quantity, and reason.

### 9.7 Recipe Management

- Select a product.
- Add ingredients.
- Set required quantity and unit.
- Review total ingredient requirements.
- Validate that units are compatible.

### 9.8 Reports

- Date range filter.
- Sales summary.
- Transaction table.
- Product performance.
- Payment method breakdown.
- Export actions.
- Clear gross/net definitions.

---

## 10. Components and Interaction Patterns

### 10.1 Buttons

Variants:

- Primary: brand dark brown.
- Secondary: cream or outlined.
- Accent: terracotta, used sparingly.
- Destructive: semantic danger.
- Ghost: low-emphasis actions.

States:

- Default.
- Hover.
- Focus-visible.
- Active.
- Disabled.
- Loading.

### 10.2 Form controls

- Labels must be visible.
- Show validation near the relevant field.
- Provide helper text for non-obvious fields.
- Required fields must be identified.
- Do not rely only on placeholder text.
- Preserve user input after recoverable validation errors.

### 10.3 Cards

Use consistent padding, border, and radius. Customer product cards are image-led; operational cards are data-led.

### 10.4 Tables

- Clear column labels.
- Right-align currency and numeric values.
- Keep row actions consistent.
- Support pagination and filters.
- Provide a useful empty state.
- On mobile, use a responsive card presentation or a deliberate horizontal scroll container.

### 10.5 Dialogs and drawers

Use dialogs for focused tasks such as confirmation, payment, and stock adjustment. Use drawers for navigation or contextual detail when appropriate.

### 10.6 Toasts and feedback

Use concise messages:

- `Pesanan berhasil dibuat.`
- `Pembayaran berhasil dicatat.`
- `Stok berhasil diperbarui.`
- `Terjadi kesalahan. Silakan coba lagi.`

Do not use a success toast before the backend confirms success.

---

## 11. Status Design

Use a consistent status mapping across order lists, POS, KDS, and tracking.

| Status | Label | Semantic treatment |
|---|---|---|
| PENDING | Menunggu | Warning |
| CONFIRMED | Dikonfirmasi | Info |
| PREPARING | Diproses | Info |
| READY | Siap diambil | Success |
| COMPLETED | Selesai | Neutral/success |
| CANCELLED | Dibatalkan | Danger |

Payment status:

| Status | Label |
|---|---|
| PENDING | Menunggu pembayaran |
| PAID | Lunas |
| FAILED | Gagal |
| REFUNDED | Dikembalikan |

Always include readable text with status colors.

---

## 12. Photography and Imagery

### 12.1 Image direction

Use realistic, appetizing Indonesian food photography:

- Nasi kucing wrapped in banana leaves.
- Sate usus, sate telur puyuh, and other skewers.
- Gorengan.
- Wedang jahe, tea, and coffee.
- Warm-lit angkringan scenes.

### 12.2 Image treatment

- Prefer natural warm lighting.
- Use consistent image ratios in product grids.
- Use object-fit cover for product cards.
- Avoid overly saturated filters.
- Avoid mixing unrelated photography styles.
- Provide fallback imagery when a product image is unavailable.
- Add meaningful alt text.

### 12.3 Licensing

Use original, properly licensed, or otherwise permitted images. Do not assume random internet images are free for commercial use.

---

## 13. Iconography and Illustration

- Use Lucide icons consistently.
- Prefer simple line icons.
- Keep icon sizes consistent within each control type.
- Pair unfamiliar icons with labels.
- Avoid decorative icons that do not communicate meaning.

Suggested icon concepts:

- Utensils — menu.
- Shopping bag — cart/order.
- Receipt — transactions.
- Chef hat — kitchen.
- Package — inventory.
- Chart column — analytics.
- Users — staff management.
- Clock — pending orders.

---

## 14. Motion and Micro-interactions

Motion should support feedback, not distract.

Suggested interactions:

- Subtle hover state on product cards.
- Small cart count update when an item is added.
- Short drawer and dialog transitions.
- Clear loading indicators.
- Gentle highlight when a new kitchen order arrives.
- Status transition feedback after a successful API response.

Respect reduced-motion preferences. Avoid continuous decorative animation in cashier and kitchen screens.

---

## 15. Accessibility

- Maintain readable contrast.
- Use semantic HTML elements.
- Ensure keyboard navigation.
- Provide visible focus indicators.
- Associate labels with inputs.
- Announce important dynamic updates accessibly.
- Do not convey status by color alone.
- Provide alt text for meaningful images.
- Use adequate touch target sizes, especially in POS and KDS.

---

## 16. Frontend Design Tokens

Suggested CSS variables:

```css
:root {
  --color-brand-900: #493323;
  --color-brand-800: #60432E;
  --color-brand-700: #79543A;

  --color-cream-50: #FAF7F0;
  --color-cream-100: #F5EBD9;
  --color-cream-200: #EADCC5;

  --color-terracotta-500: #C87545;
  --color-terracotta-600: #A95D36;

  --color-ink-900: #29231F;
  --color-ink-600: #6D6259;

  --color-success: #287A52;
  --color-warning: #B7791F;
  --color-danger: #B5453C;
  --color-info: #3B6F91;

  --radius-control: 8px;
  --radius-card: 12px;
  --radius-feature: 16px;

  --shadow-card: 0 2px 12px rgba(41, 35, 31, 0.06);
}
```

These are initial tokens. Verify contrast and adjust values during implementation.

---

## 17. Design Quality Checklist

### Customer website

- [ ] Brand identity is immediately recognizable.
- [ ] Menu is easy to browse on mobile.
- [ ] Product availability is clear.
- [ ] Cart and checkout are easy to understand.
- [ ] Total price is visible before order submission.
- [ ] QR table context is visible and correct.
- [ ] Order tracking is readable and secure.

### Admin

- [ ] Navigation is consistent.
- [ ] Dashboard metrics are readable.
- [ ] Forms have labels and validation.
- [ ] Tables support useful filters and pagination.
- [ ] Destructive actions require confirmation.
- [ ] Empty, loading, and error states exist.

### POS

- [ ] Product selection is fast.
- [ ] Cart is always easy to access.
- [ ] Payment total is prominent.
- [ ] Cash and change calculations are clear.
- [ ] Payment success is confirmed by the backend.

### Kitchen

- [ ] New orders are visually prominent.
- [ ] Items and notes are easy to scan.
- [ ] Status actions are obvious.
- [ ] Real-time connection state is visible.
- [ ] Layout is readable at the intended display distance.

### Accessibility and responsive behavior

- [ ] Keyboard focus is visible.
- [ ] Color contrast is sufficient.
- [ ] Status is not communicated by color alone.
- [ ] Mobile layouts do not overflow unexpectedly.
- [ ] Touch targets are sufficiently large.
- [ ] Reduced-motion preferences are respected.

---

## 18. Design Handoff Rules

1. Implement shared tokens before page-specific styling.
2. Build reusable buttons, inputs, badges, cards, dialogs, and table patterns.
3. Use the same status labels and semantic colors throughout the application.
4. Keep customer and staff shells visually related but optimized for their tasks.
5. Use real API data in the final interface; mock data is for development only.
6. Every page must include loading, empty, error, and success states where applicable.
7. Keep responsive behavior in scope from the beginning.
8. Do not introduce new colors, font families, or component styles without updating this document.

---

**End of Design Specification — Angkringan Senja v1.0**
