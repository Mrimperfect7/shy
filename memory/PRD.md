# SHYNISH — PRD

## Original Problem Statement
Modify the EXISTING SHYNISH store (github.com/Mrimperfect7/shy — Next.js 16 + Prisma/Postgres + Razorpay) with a CODE-BASED 3D jewelry try-on/customizer. NO AI/CV/external AI APIs. Exact store product ↔ 3D model sync by product ID. Categories: BANGLE/BRACELET→wrist, RING→finger (with finger picker), NECKLACE→neck. Named body anchors (wristAnchor, 5 finger anchors, neckAnchor). Category tabs ALL/BANGLES/BRACELETS/RINGS/NECKLACES. TRY ON buttons everywhere, 3 cinematic camera views, drag-from-store, multiple simultaneous items with wrist stacking, selected-product panel (View Product / Add to Cart / Remove), product page ↔ customizer round-trip, existing cart reuse, graceful "3D Try-On unavailable" fallback — never substitute another product.

## User Personas
- Jewelry shopper browsing on mobile/desktop who wants to see pieces on a body before buying
- Store owner (admin) managing products via /admin

## Architecture Decisions (done)
- User's actual repo cloned into /app/frontend; `yarn start` runs `next dev -p 3000 -H 0.0.0.0` (supervisor unchanged, READONLY)
- PostgreSQL 15 installed via apt; DB `shynish`; Prisma schema EXTENDED (not duplicated): Product += `tryOnBodyPart` (wrist|finger|neck), `tryOnConfig` (Json: scale/position/rotation/finger/variant/gem); existing model3dUrl/tryOnEnabled reused
- Platform ingress forces /api/* → FastAPI:8001, so FastAPI (backend/server.py) reverse-proxies unmatched /api/* to Next on :3000 — Next codebase untouched
- Single catalog source: lib/data/shynish-products.json → typed TS wrapper → scripts/seed-showroom.mjs upserts into Postgres (21 products, 10 categories; spec IDs BG001-3, BR001-3, RG101-3, NK201-3)
- 3D: react-three-fiber 9 + drei 10 (procedural mannequin: hand form + velvet necklace bust; anchors via named groups + R3F createPortal attachment)
- Procedural per-product jewelry (variant/gem/metal derived deterministically from the product record, marked "PREVIEW MODEL"); model3dUrl GLB path supported via useGLTF + error boundary → loadFailed message, never substitutes
- zustand tryOnStore (persist key shynish-3d-tryon): items carry instanceId/productId/category/bodyPart/anchorId/finger/position/rotation/scale; wrist stacking offset 0.11 along axis
- AI try-on entry points removed/repointed (gallery "AI Try On" → 3D showroom; dead VirtualTryOnModal listener removed; /tryon route → redirect to /customizer)
- next.config: allowedDevOrigins for Emergent preview domains

## Implemented (2026-09-16/19)
- /customizer showroom: dark luxury theme, "Customize Your Look", view switcher (Wrist/Ring/Neck animated camera), catalog sidebar with category tabs + marquee, dnd-kit drag-from-store, finger picker modal, worn-items panel (image/name/₹/category + sliders + View Product/Add to Cart/Remove + look total)
- Product page "Try This On" (tryOnEnabled only), gallery "3D Try On" chip, shop card chips, ProductForm link uses ?product=<id> only
- /api/products returns category + tryOn fields
- All 15 spec flows verified via Playwright + curl (bangle/bracelet/ring/necklace placement, exact IDs through cart `eshara-cart`, View Product round-trip, stacking, multi-item, unavailable fallback, mobile layout, desktop drag)

## Backlog
- P0: (none blocking)
- P1: Real GLB assets per product (drop files in /public/models/jewelry/<ID>.glb + set model3dUrl in admin/seed)
- P1: Razorpay keys for live checkout (currently unset — checkout untested/MOCKED)
- P2: Admin UI fields for tryOnConfig editing; chain-link refinement on bracelet variant; earring anchors (ear lobes) if desired

## Ops Notes (important)
- Frontend runs PRODUCTION build (`next start`). After any code change: `cd /app/frontend && yarn build && sudo supervisorctl restart frontend`
- Postgres data lives in /app/postgres-data (persists); its supervisor conf lives in /etc (does NOT persist). After a pod restart, if products API returns empty: `bash /app/scripts/init-db.sh`
- Bugfix 2026-09-19: switched dev→production serving (dev chunks got 403-blocked through preview proxy → infinite "Preparing the showroom…" on real devices); Postgres cluster was wiped by pod restart → moved to /app/postgres-data + supervisor autostart; /api/products catch now falls back to static catalog

## Next Tasks
1. Upload real GLBs and flip model3dUrl per product
2. Add Razorpay keys → test checkout
3. Optional: earrings try-on (would need ear anchors + spec change)
