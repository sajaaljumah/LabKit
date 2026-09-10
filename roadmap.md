# LabKit roadmap

## Done
- Products + orders tables with 22 seeded KWD demo products (Sensor Kit out of stock)
- LabKit design system, header/footer, reusable components
- Home, products listing (search + category filter), product details, cart
- Cart persisted in the browser
- Checkout form + order creation in the database
- Stripe Checkout session created server-side (secret key stays on the server)
- Payment success (confirms session, marks order paid, clears cart) and cancelled pages
- Stripe webhook route at /api/public/stripe/webhook
- Loading, empty, error and out-of-stock states
- Verified end to end with a Stripe test card (4242…): order created, paid, confirmed

## Open
- Webhook signature verification needs STRIPE_WEBHOOK_SECRET (add it after creating the
  webhook endpoint in Stripe). Success page confirmation already works without it.
