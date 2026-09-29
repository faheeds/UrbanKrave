# URBAN KRAVE — BUILD PROMPT FOR CODEX

## 0. Source of truth
The design lives in `design_handoff_urban_krave/`.
- `README.md` has the exact tokens, type, screen specs, copy and interactions.
- `design/Urban Krave - Build First.dc.html` is the HTML prototype. View it with `npx serve design_handoff_urban_krave/design`.

Build the site to match the design faithfully. Don't redesign it or swap in a restaurant template. Change visuals only when accessibility or feasibility requires it, and log each change in `DECISIONS.md`.

## 1. Business context
- **Urban Krave** is a delivery-only Mediterranean restaurant (virtual brand) with one kitchen in Seattle. It has no dining room and no pickup counter.
- **Phase 1 ordering model:** menu and builder on the website, with ordering on **DoorDash** and **Uber Eats**.
  - Every "Order" CTA deep-links to the matching store or item on the marketplace. Store URLs come from environment config.
  - Where a deep link to a specific item isn't possible, link to the store and show the user's build summary, with a "copy build" option, so they can recreate it.
- **Catering:** quote requests are submitted on the site (the form sends email and stores the lead in the database). There is no online payment for catering.
- **Phase 2 (build behind a feature flag, `DIRECT_ORDERING=false` by default):** direct cart, checkout (Stripe) and order tracking, as designed in S3 and S4.
- The data model is menu-first. Keep a `Kitchen` entity (address, hours, delivery zone) for structured data and future expansion. Don't build location pages.

## 2. Stack
Use this stack unless there's a justified reason to change it (note any change in `DECISIONS.md`):
- Next.js (App Router), React, TypeScript (strict).
- Tailwind CSS, with the theme generated from README tokens. Don't put raw hex values in components.
- Content:
  - Phase 1: menu stored as typed JSON/TS in `/content` (seeded from the prototype's `MENU`, `BASES`, `PROTEINS`, `SAUCES`, `TOPS`, `TRAYS`), or a headless CMS such as Sanity if the owner needs to edit it.
  - Phase 2: move to PostgreSQL + Prisma.
- Fonts: Cormorant Garamond (400, 500, 600, italic 400/500) and Lora (400, 500, 600, italic), loaded via `next/font`.
- Images via `next/image` with a CDN (Cloudinary or Vercel). Icons from Lucide.
- Forms: server actions + Zod, Resend (or equivalent) for email, and hCaptcha or Turnstile for spam protection.
- Privacy-friendly analytics (Plausible or PostHog). Sentry for errors.
- Tests: Vitest, Playwright and axe-core. CI on GitHub Actions. Deploy to Vercel.

## 3. Routes
```
/                         Home (1b Build First)
/menu                     Full menu, all categories (static, crawlable)
/menu/[category]          wraps, rice-plates, salad-bowls, shawarma-plates, mezze-dips,
                          sides, kids, family-trays, desserts, drinks
/menu/[category]/[item]   Item detail (photo, description, dietary tags, allergens, order CTAs)
/build                    Build your own (S2)
/catering                 Catering + quote form (S5)
/about                    Our story (S6)
/faq  /allergens  /contact  /privacy  /terms  /accessibility
Phase 2 (flagged): /cart  /checkout  /order/[id]  /order/[id]/track
```

## 4. Components (build as reusable primitives first)
- **Layout:** `SiteNav` (brand "Urban *Krave*"), `SiteFooter`.
- **Actions:** `Button` (primary = pomegranate fill, secondary, ghost), `OrderButtons` (DoorDash and Uber Eats, from config).
- **Tags and chips:** `Tag` (VG / GF / 🌶), `Chip` (toggle, `aria-pressed`, pomegranate when selected).
- **Builder:** `OptionTile` (single-select, saffron when selected), `BuilderSummary` (live name, summary, price lines and total).
- **Content:** `Plate` (photo mat wrapper), `MenuCard`, `CategoryTabs`, `DietFilter`, `SauceBand`, `TrayCard`, `QuoteForm`, `Kicker`, `SectionHeading` (with italic accent support).

## 5. Builder logic (shared by Home hero and /build)
- **Base:** required, choose 1. Wrap $11.49, Rice plate $14.49, Salad bowl $13.49, Shawarma plate $15.49.
- **Protein:** required, choose 1. Chicken +$0, Beef +$1.50, Falafel −$1.00 (vegan, GF), Mixed +$2.50.
- **Sauces:** up to 2. Garlic toum, Tahini, Tzatziki, Harissa (spicy), Amba. A third tap does nothing and shows the hint "Up to 2".
- **Toppings:** unlimited. The free ones: tomato, cucumber, pickled turnip, pickles, onion-sumac, parsley. Paid:
  - Feta +$1
  - Fries inside +$1
  - Extra protein +$3.99
  - Hummus +$1.50
- **Special instructions:** max 140 characters.
- **Derived values:** the name (e.g. "Beef wrap"), a summary line, itemized price lines and the total. Store state in the URL (`/build?base=wrap&protein=beef&sauces=toum,tahini&tops=...`) so builds can be shared, and keep it in sync between Home and `/build`.
- **Dietary flag:** the build is vegan only when the protein is falafel and there's no feta and no tzatziki. Show VG/GF marks on the summary.
- **Phase 1 CTA:** "Order this →" opens a sheet showing the build summary, "Copy my build", and DoorDash / Uber Eats buttons.
- **Phase 2 CTA:** "Add to bag".

## 6. Menu
- Include all 32 items from the prototype with category, name, price, description and vegan/GF/spicy flags. Add an allergen list per item (wheat, sesame, dairy, tree nuts, soy, egg). Mark any unknown allergens `TODO` in the content file rather than inventing them.
- Filters: category tabs plus the "Vegan only" and "Gluten-free only" toggles, combined with AND. Keep filter state in query params. Show the empty state from the design.
- The full menu must render as static HTML (no client-only rendering), with a `Menu` / `MenuSection` / `MenuItem` / `Offer` schema.

## 7. Catering
- Four trays: Shawarma Bar $189 (serves 10), Falafel Platter $149 (10), Wrap Tray $129 (12), Mezze Board $99 (10).
- Quote form fields: name, email, phone (optional), event date (at least 24h ahead, validated), guests (slider 10–150 in steps of 5), trays of interest, dietary notes.
- Show a live estimate: guests × $14.50 to guests × $19.
- On submit: server-side validation, spam check, email to the owner, confirmation email to the customer, a database or CMS record, and an inline success state.

## 8. Phase 2 (flagged): direct ordering
Only build this once Phase 1 ships.
- **Cart and checkout (S3):**
  - Delivery address with zone check, ASAP or scheduled, contact details.
  - Stripe Payment Element (card, Apple Pay, Google Pay), gift card, promo code, tip (0/15/18/20%), tax, delivery fee.
  - Guest checkout.
- **Order state machine:** `CREATED → PAID → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`, plus `CANCELLED` and `REFUNDED`.
- **Tracking (S4):** use the six stage labels and headlines from README, updated in realtime.
- **Cancellation:** a request is allowed only before PREPARING. After that, show the support message.
- **Delivery:** use a dispatch provider (e.g. DoorDash Drive or Uber Direct) behind an adapter interface. Never fake status.

## 9. SEO
- Unique titles and meta descriptions, canonical URLs, OpenGraph and Twitter images, XML sitemap, robots.txt, breadcrumbs.
- Structured data:
  - `Restaurant` with `servesCuisine: Mediterranean`, `areaServed: Seattle`, `hasMenu`, and `potentialAction: OrderAction` pointing to the marketplace URLs.
  - No public street address unless the owner provides one.
  - `FAQPage` on /faq, `BreadcrumbList` on every page.
  - Never output AggregateRating without real first-party data.
- Content targets: "Mediterranean delivery Seattle", "shawarma delivery Seattle", "falafel Seattle", "halal shawarma Seattle", "Mediterranean catering Seattle". Build them into the copy naturally.

## 10. Accessibility (WCAG 2.2 AA)
- Visible 2px accent focus ring everywhere; full keyboard navigation for tabs, chips and tiles (roving tabindex for tile groups).
- `aria-pressed` on toggles and `aria-live="polite"` on the builder total and form status.
- Labeled inputs; errors announced and linked with `aria-describedby`.
- Contrast: body text ≥ 4.5:1. Text on pomegranate and olive is white or cream.
- Touch targets ≥ 44px on mobile, `prefers-reduced-motion` respected, and descriptive alt text on all food photos.

## 11. Responsive
The design is drawn at 1280px. Implement mobile-first with breakpoints at 360, 768, 1024 and 1280.
- **Mobile layout:**
  - The builder stacks vertically, with a sticky bottom bar showing the build total and "Order this".
  - Category tabs scroll horizontally.
  - The card grid goes 1 → 2 → 3 (or 4) columns.
  - The sauce band columns stack into a 2-column grid.
  - The nav collapses to a menu button.

## 12. Performance
- Lighthouse > 90 on mobile for /, /menu and /build.
- Static generation for every marketing and menu page.
- Self-hosted fonts, responsive images with blur placeholders, lazy loading below the fold.
- Almost no client JavaScript outside the builder and filters.

## 13. Analytics events
`builder_option_selected`, `builder_completed`, `order_cta_clicked` (with `provider`: doordash | ubereats, and `source`: hero | card | build | menu), `menu_filter_used`, `menu_category_viewed`, `item_viewed`, `build_copied`, `catering_form_started`, `catering_quote_submitted`.

## 14. QA before completion
- Builder: all combinations, the sauce limit, price math, URL state round-trip, vegan-flag logic.
- Menu: every category and filter combination, the empty state, static HTML output.
- Marketplace links: all open the right store, in a new tab, with `rel="noopener"`.
- Catering form: validation, spam protection, emails, success and error states.
- Accessibility audit (axe plus manual keyboard pass), responsive checks at every breakpoint, SEO metadata and structured-data validation, Lighthouse.
- Phase 2 flag off: no cart or checkout routes are reachable.

## 15. Deliverables
- The working site.
- `README` with setup (`pnpm i && pnpm dev`).
- `.env.example` (`DOORDASH_STORE_URL`, `UBEREATS_STORE_URL`, email, captcha, analytics, Sentry, and later Stripe).
- `DECISIONS.md`.
- A `/content` folder the owner can edit.
- Tests passing in CI.

Work in phases:
1. Foundation and tokens.
2. Home and builder.
3. Menu.
4. Catering, About and the legal pages.
5. SEO, accessibility and performance hardening.
6. Phase 2 (flagged).

Summarize at the end of each phase.
