# Glaze Bakehouse

Glaze Bakehouse is a Next.js storefront and bakery administration workspace. The supplied bakery photography and quiet, editorial visual direction are preserved; the project now has a central development catalogue, one persistent cart, guarded admin boundaries, a PostgreSQL/Prisma schema, and service adapters ready for configuration.

## Start locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add only the providers you are ready to configure.
3. Generate Prisma Client with `npx prisma generate`.
4. Start the app with `npm run dev`.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment.

## Production configuration

### Database

Set `DATABASE_URL` to a non-empty PostgreSQL connection string in both `.env.local` and the Vercel Production environment. Checkout intentionally refuses to create a Razorpay order until this database is reachable, because it first creates a pending internal order and re-prices the bag from trusted product data.

This repository includes Prisma migration history. For a new or existing production database, apply the reviewed migrations with `npx prisma migrate deploy`. Use `npx prisma migrate dev --name <descriptive-name>` only when creating a newly reviewed schema change in development, then commit the generated migration. Add approved products through the protected admin workspace before accepting payments; the preview catalogue is intentionally not used as a source of truth for paid orders.

### Firebase and Google sign-in

Use one Firebase project for both the browser app and Firebase Admin. Enable Google in Firebase Authentication, add `localhost`, `glaze-bakehouse-beta.vercel.app`, and `glazebakehouse.in` to Firebase Authentication's Authorized domains, and add the matching `NEXT_PUBLIC_FIREBASE_*` values. Create a **new** Firebase service-account key and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and the complete PEM `FIREBASE_PRIVATE_KEY` server-side only. Add permitted admin Google addresses to `ADMIN_ALLOWED_EMAILS` as a comma-separated list. Admin pages and admin APIs reject users without a verified session and matching address.

Set these same values in Vercel for Production and Preview before deploying. Do not use a Firebase web project ID from one project with a service account from another; session verification will fail. Rotate any service-account key that appeared in a sample or shared configuration file.

### Cloudinary

Set the three `CLOUDINARY_*` variables. Admin image uploads use the server-side `/api/admin/uploads` route, storing images in `glaze-bakehouse/cakes`, `desserts`, `fresh-today`, `reviews`, or `founder`. Persist both the secure URL and public ID in the database. Product deletion removes the database row first, and only deletes an unreferenced Cloudinary asset.

### Razorpay

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Point Razorpay's `payment.captured` webhook to `/api/webhooks/razorpay`. The server creates the provider order only after creating a pending internal order, returns only the public key ID to checkout, verifies the checkout HMAC and Razorpay payment amount server-side, and treats the verified provider response or signed webhook—not the browser—as proof of payment.

### Formspree order notifications

Set `ORDER_NOTIFICATION_PROVIDER=FORMSPREE` and the private `FORMSPREE_ORDER_ENDPOINT` to the bakery's HTTPS Formspree `/f/` endpoint. Verified paid orders and custom-cake requests are posted server-to-server with their complete details. Checkout and custom-cake submission stop before accepting a new request if the notification endpoint is not configured.

### WhatsApp and email

Set the official Meta Cloud API values for WhatsApp and configure an email provider behind the `EmailService` interface. `WHATSAPP_BAKERY_RECIPIENT` is also the server-configured destination for the customer&apos;s order-tracking link on the confirmation page; no number is embedded in client code. Neither service sends messages until its credentials and production order workflow are configured and tested.

### Customer reviews

Reviews are persisted in PostgreSQL as pending by default. The server retains each customer&apos;s original text and, when `OPENAI_API_KEY` is configured, stores a conservative spelling/grammar cleanup separately. If OpenAI is unavailable, the original text is stored as the cleaned fallback so submission never fails. Only an authenticated admin can approve a review; public review pages and the home section request approved records only.

See [PROJECT_STATE.md](PROJECT_STATE.md) for current architecture, limitations, and launch work.
