# Urban Krave

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` for local configuration. Keep real credentials out of Git.

The website is live at [UrbanKrave.com](https://urbankrave.com/). Direct ordering and catering requests remain closed until their integrations are ready.

## Direct ordering build

The menu now supports a customer bag and a checkout page. Food prices are recalculated on the server. The kitchen dashboard is at `/kitchen`; it lists paid orders after a verified Stripe webhook and lets staff accept, prepare, and mark them ready. The dedicated `urban-krave-orders` Neon database is connected to the `urban-krave-preview` Vercel project for Production only. Its schema is in `database/001_orders.sql`.

Direct ordering is intentionally closed. `ORDERING_ENABLED` defaults to `false`, and the delivery quote function refuses checkout until DoorDash Drive is connected. The checkout code is deployed, but ordering is not available to customers. Stripe keys and webhook configuration are also pending. Do not turn on ordering until a real delivery quote, tax configuration, Stripe account and webhook, kitchen credentials, order notifications, and full test order have been verified.

Required server variables for launch: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `KITCHEN_USER`, `KITCHEN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, and `ORDERING_ENABLED`. Never put Stripe secret keys or database credentials in public variables.

## Delivery partner setup

The kitchen portal has a Delivery partners page at `/kitchen/delivery`. It links to the official DoorDash Drive application and Uber Direct account setup, then lets an authenticated kitchen admin track onboarding progress and choose a planned primary service. These progress labels are self-reported, not proof of an API connection. Website delivery remains paused and the page cannot dispatch a driver.

Apply `database/002_delivery_settings.sql` to the dedicated Urban Krave database before using saved settings, or sign in to `/kitchen/delivery` and select **Finish delivery settings setup**. That authenticated action runs only the delivery settings table schema and initial row. Uber Direct credentials use the server-only variables `UBER_DIRECT_CUSTOMER_ID`, `UBER_DIRECT_CLIENT_ID`, and `UBER_DIRECT_CLIENT_SECRET`. The admin page can verify the Client ID and Client Secret with Uber and request a delivery quote from the confirmed pickup address at 515 Broadway E, Seattle, WA 98102. Both actions require the kitchen login. Neither action dispatches a courier. DoorDash Drive integration, Uber Direct dispatch and webhooks, payment setup, and an end-to-end test are still required before website ordering can open. Do not enable ordering based on an onboarding progress label or successful quote alone.

## Source handoff

# Handoff: Urban Krave — "Build First" website

## Overview
Urban Krave is a **delivery-only Mediterranean restaurant** (a virtual brand) run from one kitchen in Seattle. It sells wraps, rice plates, salad bowls and shawarma plates, each with chicken, beef, falafel or mixed protein. The menu also has mezze, sides, kids meals, family and catering trays, desserts and drinks.

The website's jobs are to sell the food, show the full menu, and let people plan a custom build. It then **sends customers to DoorDash or Uber Eats to order**. It also collects catering quote requests. Direct checkout and tracking are designed as an optional **Phase 2**.

The build prompt for Codex is in `CODEX_PROMPT.md`.

## About the design files
`design/Urban Krave - Build First.dc.html` is a **high-fidelity HTML prototype** used as a design reference. It is not production code. Rebuild it in the target stack (recommended: Next.js + TypeScript + Tailwind).

To view it, serve the `design/` folder (`npx serve design`) and open the file. It shows a pan/zoom canvas with the home page and six site pages. Photos are labeled empty slots.

## Fidelity
High-fidelity: colors, type, spacing, copy and interactions are final.

## Design tokens

### Base system: "Classical" (see `design/_ds/.../styles.css`)
The page overrides some of its values; those are included below.

| Token | Value | Use |
|---|---|---|
| `bg` | `#FBF5EA` | Warm cream page background |
| `surface` | `#F3E4CC` | Photo mat, quiet surfaces |
| `text` | `#201F1D` | Primary text |
| `neutral-700` | `#605D5D` | Secondary text |
| `neutral-800` | `#444141` | Body paragraphs |
| `divider` | `#201F1D` @ 16% | Hairline rules and card borders |
| `accent` | `#D98A1E` | Gold: rules, focus ring, small marks |
| `accent-100` | `#FCEACB` | Tint fills |
| `accent-700` | `#8C4F0E` | Kicker text, small accent text |

### Mediterranean palette (brand layer)
| Token | Hex | Use |
|---|---|---|
| `saffron` | `#F2B441` | Selected builder options (base, protein) |
| `saffron-100` | `#FDF0D5` | Soft card fill (Delivery card) |
| `pomegranate` | `#B8322A` | **Primary buttons (filled)**, selected sauce/topping chips, active menu tab, tracking progress, italic headline accents |
| `pomegranate-700` | `#8E2019` | Primary hover, active tab text |
| `olive` | `#3F5A2A` | Dark feature band (story page), selected dietary filter |
| `olive-100` / `olive-800` | `#E7EED8` / `#2E4420` | VG/GF tags, Catering card |
| `sea` | `#1E5A78` | Kickers on sea cards |
| `sea-100` | `#DDEBF1` | "Just for kids" card |
| `terracotta` | `#C85A2E` | Outline tags, catering headline accent |
| `terracotta-100` / `-800` | `#FBE3D6` / `#7A3014` | Catering hero band, outline tag text |

Text on pomegranate and olive is `#FFF` or `#FFF4E6`. Text on saffron is `#201F1D`. The sauce band on pomegranate uses `#FAD9CF` for secondary text and a saffron italic accent.

### Type
- **Cormorant Garamond** for headings.
  - Weight 400 at display sizes: h1 80px/0.95, section h2 48–52px.
  - Weight 500–600 for card titles (20–34px) and the nav brand (30px, with "Krave" in italic).
  - Italic is used for emphasis, often in pomegranate: "*four moves.*", "*love language.*".
- **Lora** for body text.
  - Body 14–17px at line-height 1.6. Long paragraphs are justified.
  - Kickers are 12px uppercase with 0.14em letter-spacing, in `accent-700`.
- Prices and figures always use `font-variant-numeric: tabular-nums`.

### Shape, space, elevation
- Radius is 4px (`--radius-md`) on cards, inputs and option tiles. Chips are pills (999px).
- Page gutter is 56px on 1280-wide layouts. Section padding is 44–56px. Card padding is 12px (image cards) or 22–32px (text cards).
- Photos sit in a `.plate`: a 6px `surface` mat with a 1px divider outline and a light `saturate(1.08)` filter.
- Elevation is minimal: `--shadow-sm` on the checkout summary only.
- Focus style: `outline: 2px solid accent; outline-offset: 2px`.

### Buttons
- **Primary:** pomegranate fill, white text, 4px radius. Hover goes to pomegranate-700.
- **Secondary:** transparent with a divider border.
- **Ghost:** text only, in accent color.
- Heights: about 36px default, 48px for large CTAs (padding 14px × 20–22px).

## Screens

### Home (1b "Build First")
1. **Nav:** "Urban *Krave*" plus Menu, Mezze, Catering, Story and an "Order delivery" primary button.
2. **Hero:** a two-column grid (1.3fr / 1fr).
   - Left column:
     - h1 "Build your krave in *four moves.*"
     - 01 Pick a base: 4 tiles (Wrap $11.49, Rice plate $14.49, Salad bowl $13.49, Shawarma plate $15.49).
     - 02 Pick a protein: Chicken (incl.), Beef +$1.50, Falafel −$1.00 (VG·GF), Mixed +$2.50.
     - 03/04 Sauce chips: Garlic toum, Tahini, Tzatziki, Harissa 🌶, Amba (max 2).
     - Summary row: live build name, summary, price and an "Order this →" button.
   - Right column: a 520px plated photo with the italic caption "Pictured: the chicken rice plate, garlic toum, extra pickles. A strong choice."
3. **"Or skip the thinking":** 4 favorite cards (Beef Shawarma Wrap, Falafel Rice Plate, Chicken Salad Bowl, Mezze Trio). Each shows photo, name, description, price and VG/GF marks.
4. **Sauce band:** full-width pomegranate. h2 "Garlic sauce is a *love language.*" plus 5 sauce columns (Toum, Tahini, Tzatziki, Harissa, Amba), each with a one-liner.
5. **Three cards:**
   - Delivery (saffron-100): "Hot to your door, 11am–11pm." with DoorDash and Uber Eats buttons.
   - Catering (olive-100): "Trays that start conversations."
   - Just for kids (sea-100): "Tiny plates, zero complaints."
6. **Footer:** brand, "Delivery-only kitchen · Seattle, WA", and links.

### S1 Menu
- Kicker, h1 showing the category name, and two dietary toggles ("Vegan only" and "Gluten-free only") that turn olive when on.
- Category tabs: All, Wraps, Rice plates, Salad bowls, Shawarma plates, Mezze & dips, Sides, Kids, Family & trays, Desserts, Drinks. The active tab has a pomegranate underline.
- 3-column card grid with photo, category kicker, name, price, description, VG/GF/🌶 tags and an "Order →" link.
- Empty state: "Nothing here matches those filters. Try removing one."
- Allergen note in the footer area.

### S2 Build your own
- Left column:
  - h1 "Make it exactly how you *krave* it."
  - 1 Base and 2 Protein (required, pick 1).
  - 3 Sauces (up to 2).
  - 4 Toppings (unlimited). Free: tomato, cucumber, pickled turnip, pickles, onion-sumac, parsley. Paid: feta +$1, fries inside +$1, extra protein +$3.99, hummus +$1.50.
  - Special instructions field.
- Right column: photo, live build name and summary, itemized price lines, total, and "Add to bag · $x".
- In marketplace mode this sends the user to DoorDash or Uber Eats.

### S3 Cart & checkout (Phase 2 — direct ordering)
- Left column:
  - Guest banner with "Sign in".
  - Delivery: address, ASAP (30–40 min) or Schedule, drop-off note.
  - Contact: name, mobile.
  - Payment: Card, Apple Pay, Google Pay, Gift card, then card fields.
- Right column (bag summary):
  - Items with modifiers.
  - "Finish strong" add-ons (baklava, hummus, extra toum).
  - Promo code, tip selector (None / 15 / 18 / 20%).
  - Subtotal, delivery fee, tax, tip, total.
  - "Place order · $52.99".

### S4 Order tracking (Phase 2)
- Six stages: Order received → In the kitchen → Off the spit → Wrapped & packed → Out for delivery → Delivered.
- Headline per stage:
  - "Got it. Krave confirmed."
  - "Pans are hot. So are we."
  - "Shawarma is being carved. Stay strong."
  - "Wrapped tight, sauces on the side."
  - "On its way. Clear the table."
  - "Delivered. Go, go, go."
- Big ETA in minutes, a 6-segment progress bar and a stage list with ✓ ● ○ marks.
- Order card, then Receipt / Help / Reorder.
- Cancellation is offered only at "Order received". After that: "The kitchen has started your order. For changes, contact support."

### S5 Catering
- Terracotta-100 hero: "Feed the room. *Win the meeting.*"
- Four tray cards:
  - Shawarma Bar $189 / serves 10
  - Falafel Platter $149 / 10
  - Wrap Tray $129 / 12
  - Mezze Board $99 / 10
- Quote form: name, email, event date, a guest slider (10–150 in steps of 5), and dietary needs.
- Live estimate: guests × $14.50 to guests × $19.
- "Request a quote" button.

### S6 Our story
- h1 "No dining room. *All flavor.*"
- Wide team photo and a two-column justified story.
- Olive band with three facts: Made to travel, Halal meats, Plant-forward.

## Interactions
- Builder state is shared between Home and S2. Selected base and protein tiles are saffron; selected chips are pomegranate with white text. The sauce limit is 2: extra taps are ignored until one is removed. Price recomputes live.
- Menu tabs and dietary filters combine with AND logic.
- The tracking bar segments are clickable in the prototype. In production, stages come from the order state.
- Catering slider updates the label and the estimate.
- All toggles expose `aria-pressed`. Status never relies on color alone.

## Content
The full menu (32 items with prices, descriptions and VG/GF/spicy flags), tray data and all copy are in the prototype's `<script data-dc-script>` block (`MENU`, `BASES`, `PROTEINS`, `SAUCES`, `TOPS`, `STAGES`, `TITLES`, `TRAYS`). Use it as seed data.

## Assets
There is no photography yet; every image is a labeled placeholder describing the shot. Photo direction: warm daylight, overhead spreads, sauce drips, halved wraps. Use Lucide for icons.

## Files
- `design/Urban Krave - Build First.dc.html`: all screens, tokens, copy and logic.
- `design/_ds/.../styles.css`: the base design-system stylesheet (Classical).
- `design/support.js`, `design/image-slot.js`: needed only to view the prototype.
