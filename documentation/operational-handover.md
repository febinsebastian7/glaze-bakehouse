# Glaze Bakehouse operational handover

## Customer and admin flows

- Storefront catalogue, product detail, bag, checkout, thank-you confirmation, order tracking, reviews, and custom-cake pages are available under `src/app/(storefront)`.
- The home page's Fresh Today carousel shows visible products marked `freshToday`; Our Collection shows every visible cake. Each fetches live data from `/api/products` and handles loading, failure, and empty states.
- Admin-created products persist in PostgreSQL and are returned dynamically by the public catalogue API. Admin custom-cake requests are listed at `/admin/custom-cakes`, with request details and status updates.
- Browser cart and checkout drafts are local to the browser. Product pricing, product availability, order totals, and payment state are server-authoritative.

## Payment and notification flow

1. Checkout sends only item identifiers and customer details to the server.
2. The server re-prices the bag from the trusted product database, creates a pending internal order, then creates a Razorpay order using private credentials.
3. The browser receives only Razorpay's public key ID. It reports the checkout result to the server, where the HMAC and provider payment amount/status are checked.
4. A verified capture records the order as paid and sends the complete order details to Formspree. A signed `payment.captured` webhook provides an idempotent reconciliation path.
5. The browser then opens `/thank-you/[token]`, which gives the customer a payment-received confirmation, private order reference, and a server-built WhatsApp tracking link when the bakery recipient is configured.
6. Custom-cake requests are validated, stored, sent to Formspree with all supplied cake details, and visible to admins. A notification failure returns an actionable error rather than a false success.

## Reviews

- Direct and delivery-invitation reviews are saved to the existing `Review` table as `PENDING`; no customer review is published automatically.
- `originalText` is retained unchanged. When `OPENAI_API_KEY` is configured, the server stores a separate conservative grammar/spelling cleanup in `cleanedText`; a timeout or missing configuration safely retains the original text instead.
- `/admin/reviews` is protected by the existing admin guard. The team can compare both versions, then publish, reject, unpublish, or delete a review. Public review responses are limited to approved records.

## Required configuration

Copy `.env.example` to a local ignored `.env` file, then set the values needed by the selected services:

- `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ADMIN_ALLOWED_EMAILS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `ORDER_NOTIFICATION_PROVIDER=FORMSPREE`, `FORMSPREE_ORDER_ENDPOINT`
- `WHATSAPP_BAKERY_RECIPIENT`; optionally `OPENAI_API_KEY`, `OPENAI_REVIEW_CLEANUP_MODEL`

Optional WhatsApp, email, and OpenAI variables are also documented in `.env.example`. Never expose a variable without the `NEXT_PUBLIC_` prefix to the browser.

## Launch checklist

1. Rotate every credential that was previously committed, then commit the removal of `.env` and `.env.local` from version control.
2. Apply Prisma migrations with `npx prisma migrate deploy`.
3. Configure Razorpay's `payment.captured` webhook at `https://<your-domain>/api/webhooks/razorpay`, set the webhook secret, and complete a test-mode payment and webhook reconciliation.
4. Test an allowed Firebase admin user: sign in, upload a product image, create a cake, and confirm it appears on the public home page and `/cakes`.
5. Confirm Formspree's recipient and send a controlled custom-cake request; mark its test record accordingly in admin.
6. Confirm business contact, delivery, policy, and imagery before public launch. The code currently applies complimentary delivery consistently in browser and server totals.

## Verification performed

- Product API inspection verified four visible database-backed cakes on the storefront.
- A controlled custom-cake request was saved and delivered to the configured Formspree endpoint; record ID `cmtyizcpt000dekl6z0635fgk` remains available to identify it as a test.
- Lint, TypeScript, Prisma validation, and a production build pass. Fresh browser sessions have no console errors, and carousel controls were checked on mobile and desktop layouts.
