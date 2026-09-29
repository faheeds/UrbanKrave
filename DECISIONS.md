# Build decisions

## Phase 1

- The website is a delivery marketplace handoff. Primary ordering links use `NEXT_PUBLIC_DOORDASH_STORE_URL`; configure the Uber Eats store URL before adding a second provider action.
- The home builder, menu filters, and catering estimate are interactive in the browser.
- The website is live on UrbanKrave.com, but ordering actions still show a coming soon state until the required integrations are configured. Catering quote requests are unavailable because email delivery, storage, and spam validation are not connected.
- The site is currently excluded from search indexing while launch details are being completed.

## Assets

- Each of the 32 menu items has a distinct generated food image in `public/images/menu`. The files are optimized WebP images and the site identifies them as illustrative concepts. Replace them with photographs of the actual prepared dishes before using them as a literal product representation.

## Deferred scope

- The cart, checkout, and kitchen dashboard are built, but customer ordering remains closed. DoorDash Drive, Stripe, taxes, order notifications, and a verified test order are still required before launch.
