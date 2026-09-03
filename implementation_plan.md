# Goal Description

The goal is to fix the Referral Program by fully migrating customer authentication and referral tracking away from Shopify and into the custom PostgreSQL database (Prisma). Since Shopify has been removed, the referral program is currently broken because it relies on Shopify customer access tokens.

## User Review Required

> [!WARNING]
> This involves updating your database schema to support a `CUSTOMER` role within the `User` model, and rewriting the customer login/registration flow to use your own database instead of Shopify.

## Open Questions

None at this time.

## Proposed Changes

### Prisma Schema
- Update `schema.prisma` to add `CUSTOMER` to `UserRole`.
- Add `npx prisma db push` to sync the database schema.

### Customer Authentication
- Rewrite `app/actions/customer.ts` to handle customer login, registration, and session management using the `User` model in Postgres instead of Shopify.
- Update `app/account/login/page.tsx`, `app/account/register/page.tsx`, and `app/account/page.tsx` to use the updated session context.

### Referral Dashboard
- Update `app/account/refer-and-earn/page.tsx` to fetch the logged-in user from the custom session rather than querying Shopify.

### Checkout Integration
- Update `app/actions/checkout.ts` to track if the buyer was referred by someone (by reading the `eshara_referral` cookie). If a referral exists, increment the referrer's `successfulReferrals` and potentially unlock a reward for them.

## Verification Plan

### Manual Verification
- Register a new customer account.
- Check that the user is assigned a referral code and can access the `/account/refer-and-earn` dashboard.
- Simulate an order placed with a referral cookie and verify the referrer's successful count increases.
