# Project state — Glaze Bakehouse

## Current architecture

- Next.js 16 App Router storefront under `src/app/(storefront)`.
- The storefront fetches its catalogue from `/api/products`. `StoreProvider` keeps the browser cart and checkout draft; the product database remains the source of truth for catalogues and payments.
- `prisma/schema.prisma` models products, orders, payments, reviews, and custom-cake requests. The repository includes the corresponding reviewed migration history.

## Product and admin status

- IMPLEMENTED: the home page shows Fresh Today products and every non-hidden cake. Both carousels fetch live catalogue data, render loading/error/empty states, and update when the catalogue response changes.
- IMPLEMENTED: products created in the protected admin workspace write to PostgreSQL and appear dynamically in the public catalogue and cake carousel. Product rows may be deleted only after the application checks that their Cloudinary asset is unreferenced; immutable order snapshots preserve completed-order history.
- IMPLEMENTED: the admin custom-cake screen lists database-backed requests, exposes all customer/order details, and supports protected status updates.
- CONFIGURATION REQUIRED: Firebase authentication, the admin email allow-list, Cloudinary credentials, and an authorized production user still need an end-to-end browser check.

## Payments and notifications

- IMPLEMENTED: Razorpay order creation uses trusted server re-pricing, creates a pending internal order, returns only the public key ID, verifies the checkout HMAC and provider amount server-side, and reconciles signed `payment.captured` webhooks. Failed or dismissed checkout attempts are safely marked as failed without overwriting a paid order.
- IMPLEMENTED: Formspree notifications are server-side only. Verified paid orders and custom-cake requests send complete customer, item, total, and custom-cake details. A request is not accepted as successful when Formspree is unavailable.
- CONFIGURATION REQUIRED: set `RAZORPAY_WEBHOOK_SECRET`, add the live `payment.captured` webhook URL, and perform one real Razorpay test-mode checkout and webhook reconciliation. This must not be faked with production funds.

## Confirmation and reviews

- IMPLEMENTED: a verified checkout redirects to `/thank-you/[token]`, which shows the private order reference, a payment-received state, a safe order summary, and a link to the existing private order-tracking page. When `WHATSAPP_BAKERY_RECIPIENT` is configured, it also creates a pre-filled `wa.me` tracking link server-side; it never hard-codes a number or includes payment credentials.
- IMPLEMENTED: reviews are stored in PostgreSQL with original text, cleaned text, cleanup provider, rating, and a `PENDING`/`APPROVED`/`REJECTED` moderation state. The optional server-only OpenAI cleanup edits only grammar, spelling, punctuation, and capitalization. Missing or failed AI configuration stores the original text as the safe fallback.
- IMPLEMENTED: `/admin/reviews` is protected by the existing admin authorization and exposes original versus cleaned wording, rating, status, publish/reject/unpublish, and deletion. Public APIs, the dedicated reviews page, and the homepage show approved reviews only with loading, error, and empty states.

## Environment and security

All referenced environment-variable names are documented without values in `.env.example`. Real `.env` and `.env.local` files are ignored and have been removed from version control. Rotate every credential that was previously committed, particularly Firebase Admin, Cloudinary, and Razorpay credentials, before release.

## Verification status

- Prisma migrations are applied to the configured database.
- Live product API inspection returned four visible database-backed cakes, including admin-created entries that now render in the home carousel.
- A controlled custom-cake submission persisted and notified the configured Formspree endpoint. Its record ID is `cmtyizcpt000dekl6z0635fgk`; keep or mark it as a test record in admin according to bakery policy.
- Lint, TypeScript, Prisma validation, production build, fresh-browser console checks, and desktop/mobile carousel checks have passed for this change set.

## Remaining launch work

1. Rotate all previously exposed credentials; commit the removal of `.env` and `.env.local` from Git while retaining the local ignored files.
2. Configure production/preview values for the database, Firebase browser/Admin credentials, `ADMIN_ALLOWED_EMAILS`, `NEXT_PUBLIC_APP_URL`, Cloudinary, Razorpay, Formspree, `WHATSAPP_BAKERY_RECIPIENT`, and (optionally) `OPENAI_API_KEY`.
3. Set and test `RAZORPAY_WEBHOOK_SECRET` with a Razorpay test-mode payment and signed webhook.
4. Verify an allowed admin user can sign in, add a cake with an uploaded image, and see it on the storefront in the deployment environment.
5. Confirm business contact, delivery, policy, and supplied imagery before launch. Current delivery policy is complimentary delivery, consistently reflected in browser and server totals.
