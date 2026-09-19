# SHYNISH — PRD

## Original Problem Statement
Modify the EXISTING SHYNISH store (github.com/Mrimperfect7/shy — Next.js 16 + Prisma/Postgres + Razorpay) with a CODE-BASED 3D jewelry try-on/customizer. NO AI/CV/external AI APIs. Exact store product ↔ 3D model sync by product ID. Categories: BANGLE/BRACELET→wrist, RING→finger (with finger picker), NECKLACE→neck. Named body anchors (wristAnchor, 5 finger anchors, neckAnchor). Category tabs ALL/BANGLES/BRACELETS/RINGS/NECKLACES. TRY ON buttons everywhere, 3 cinematic camera views, drag-from-store, multiple simultaneous items with wrist stacking, selected-product panel (View Product / Add to Cart / Remove), product page ↔ customizer round-trip, existing cart reuse, graceful "3D Try-On unavailable" fallback — never substitute another product.

## User Personas
- Jewelry shopper browsing on mobile/desktop who wants to see pieces on a body before buying
- Store owner (admin) managing products via /admin

## Architecture Decisions (done)
- User's actual repo cloned into /app/frontend; frontend runs production `next start -p 3000 -H 0.0.0.0` under supervisor (dev chunk serving is unreliable through the preview proxy)
- PostgreSQL 15 installed via apt; DB `shynish`; Prisma schema EXTENDED (not duplicated): Product += `tryOnBodyPart` (wrist|finger|neck), `tryOnConfig` (Json: scale/position/rotation/finger/variant/gem); existing model3dUrl/tryOnEnabled reused
- Platform ingress forces /api/* → FastAPI:8001, so FastAPI (backend/server.py) reverse-proxies unmatched /api/* to Next on :3000 — Next codebase untouched
- Single catalog source: lib/data/shynish-products.json → typed TS wrapper → scripts/seed-showroom.mjs upserts into Postgres (21 products, 10 categories; spec IDs BG001-3, BR001-3, RG101-3, NK201-3)
- 3D: react-three-fiber 9 + drei 10; local code-sculpted ivory body GLB with continuous hand/wrist/forearm, five tapered fingers/nails, and closed neck/shoulder bust. Seven named anchors are baked into the asset and used via R3F createPortal. No AI or external body asset dependency.
- Procedural per-product jewelry (variant/gem/metal derived deterministically from the product record, marked "PREVIEW MODEL"); model3dUrl GLB path supported via useGLTF + error boundary → loadFailed message, never substitutes
- zustand tryOnStore (persist key shynish-3d-tryon): items carry instanceId/productId/category/bodyPart/anchorId/finger/position/rotation/scale; wrist stacking offset 0.11 along axis
- AI try-on entry points removed/repointed (gallery "AI Try On" → 3D showroom; dead VirtualTryOnModal listener removed; /tryon route → redirect to /customizer)
- next.config: allowedDevOrigins for Emergent preview domains

## Implemented (2026-09-16/19)
- /customizer showroom: dark luxury theme, "Customize Your Look", view switcher (Wrist/Ring/Neck animated camera), catalog sidebar with category tabs + marquee, dnd-kit drag-from-store, finger picker modal, worn-items panel (image/name/₹/category + sliders + View Product/Add to Cart/Remove + look total); panel collapsible on phones (slim bar ↔ expanded)
- Product page "Try This On" (tryOnEnabled only), gallery "3D Try On" chip, shop card chips, ProductForm link uses ?product=<id> only
- /api/products returns category + tryOn fields; catch falls back to static catalog
- REAL GLB assets: scripts/generate-glb-models.mjs (three + @gltf-transform) writes per-product GLBs to /public/models/jewelry/<ID>.glb and patches catalog JSON model3dUrl; runtime loads exact GLB via useGLTF, procedural preview only when model3dUrl is null
- Admin → 3D: TryOn3DSection on new/edit product forms (enable toggle, category → auto body anchor, GLB upload via uploadProductModelAction writes to /public/models/jewelry, URL field); create/update actions set categoryId + tryOnEnabled + tryOnBodyPart + default tryOnConfig. New admin products appear in the showroom instantly (procedural preview if no GLB)
- All 15 spec flows verified via Playwright + curl; admin-create→3D verified E2E (test product cleaned up after)
- Infra fixes: production serving (dev chunks got 403 via proxy), experimental.serverActions.allowedOrigins for preview domains, Postgres data in /app/postgres-data + supervisor autostart, recovery script /app/scripts/init-db.sh

## Backlog
- P0: (none blocking)
- P1: Artist-verified jewelry GLBs per product (current generated GLBs are illustrative previews, NOT verified replicas; product identity/routing stays exact)
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


## Latest Revision — Body Model Correction (2026-09-19)
### User request
"Still the 3d model is disturbing make a perfect one"; clarification: "A perfect 3d parts". Preserve existing store and code-based/no-AI behavior; improve the body parts rather than redesign the store.

### Implemented
- Reproduced the disconnected forearm/palm and primitive finger construction. Replaced it with one welded, code-sculpted continuous hand surface, natural finger length variation, thumb pad, tapered wrist and subtle nail inlays. No separate capsule joints or gaps.
- Added `scripts/generate-body-models.mjs` and local `/public/models/body/atelier-mannequin-v1.glb` (~2 MB, ~87k total triangles including both displays). Uses offline Three.js marching cubes and parametric sections; no runtime meshing, AI, uploads, external asset service or new dependencies.
- Replaced rotationally symmetric necklace display with a closed elliptical shoulder/chest/neck sculpture. Calibrated chest depth and baked neck anchor [0, .72, .15], rotation X=.30 to keep existing necklace assets continuous and clear of the chest in front/angled views. Jewelry assets/product IDs were not changed.
- `Mannequin.tsx` loads and validates all seven anchors plus HandDisplay/NeckDisplay. It retains both hierarchies but shows only the relevant body part. Loading and error states are explicit. Body forms are stylized ivory display sculptures, NOT photorealistic scans or personal fit measurements.
- `TryOnScene.tsx`: viewport-bounds camera fitting, smooth cancellable transitions, reduced-motion support, safer zoom limits, neutral studio lighting. Removed decorative sparkles and extra torus selection outlines that could be mistaken for jewelry.
- `JewelryCustomizer.tsx`: reset-view control, accessible view buttons, corrected viewport height and mobile catalog split, isolated scroll input from Lenis. Narrow-screen ring view includes full hand/forearm without clipping.
- `WornItemsPanel.tsx`: collapse control now usable on desktop too, explicit accessible expanded/collapsed states. Existing cart/selection controls preserved.
- `StorefrontLayout.tsx` and `Header.tsx`: showroom-only compact header; no announcement bar, unrelated promotion popups, floating overlays or footer in customizer. Normal shop layout unchanged. No authentication logic changed.

### Verification
- Production build and TypeScript passed; supervisor frontend restarted. Public asset-only final clearance update regenerated successfully.
- Testing agent reports: `/app/test_reports/iteration_1.json`, `iteration_2.json`; final targeted angled-view/panel/reset verification: `iteration_3.json`.
- Checked desktop/mobile body views, correct ring finger selection, wrist stacking, necklace visibility, view switching/persistence, panel toggle, product link/cart ID and price, body-load error boundary, normal shop header regression.
- Iteration 1 necklace occlusion fixed; mobile ring clipping fixed. Missing panel-collapse report was a false positive (only present when panel expanded), independently verified. Required GLB names are validated before rendering.
- Regression notes: `/app/tests/frontend_customizer_regression.md`. Browser screenshots were remote inline artifacts, not files in `/app/test_reports/screenshots`; earlier report paths were corrected in notes.
- User visual approval is pending. No perfect anatomical accuracy or physically measured fit is claimed. Existing generated jewelry models remain illustrative; verified real-product assets still needed for exact physical resemblance.

### Remaining / Optional Backlog
- P0: No known blocker in this change
- P1: User-approved, artist-verified jewelry GLBs and per-product fit calibration
- P1: Previously requested GitHub export remains a user action through Save to GitHub
- P1: Razorpay setup/checkout verification remains outside this task and untested
- P2: Admin tryOnConfig transform fields, chain-link refinement, optional ear anchors
- Optional: Artist-made/scanned human body asset if the user later requests human realism instead of a display mannequin
- Optional: Ivory/charcoal display finishes; individual finger or pendant detail zoom
- Development workflow remains production-build based; no unrelated refactor performed
