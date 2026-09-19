# SHYNISH /customizer Frontend Regression Notes (iteration_2)

Run via mcp_browser_automation with viewport 1920x1080 (desktop) or 390x844 (mobile).
No auth needed. Public URL: https://jewelry-visualizer-2.preview.emergentagent.com

## Key data-testids

- panel-toggle          -> collapsed WornItemsPanel button (appears when panel collapsed)
- panel-collapse        -> collapse control inside expanded WornItemsPanel (appears when expanded)
- camera-view-wrist / camera-view-ring / camera-view-neck  -> view switchers (NOT `view-wrist`)
- tab-bangles / tab-bracelets / tab-rings / tab-necklaces
- catalog-card-<PRODUCT_ID>
- reset-model-view
- finger-select-{thumb,index,middle,ring,little}

## Storage keys
- shynish-3d-tryon (zustand items[])
- eshara-cart

## Regression steps

1. Load /customizer?product=NK201 desktop -> assert front camera shows continuous gold chain forming a full oval around the neck ending at pearl pendant. No mid-chain burial.
2. Assert panel-collapse count is 1 when panel expanded, 0 when collapsed; toggle both ways.
3. Load /customizer?product=RG101 at 390x844 -> assert full hand (wrist + forearm end + fingers) all within canvas, no left-edge clip.
4. Header: on /customizer document.querySelector('header').getBoundingClientRect().top === 0, no `[class*="nnouncement"]` element, documentElement.scrollHeight == clientHeight (no root scroll).
5. Regression: /shop still has an announcement bar element.
6. Anchor persistence: add BG001 on wrist, switch to ring view, assert localStorage 'shynish-3d-tryon' still contains BG001.

Iteration 2 findings: all six pass. Browser screenshot artifacts were remote; no shared screenshot files were produced. Do not use the nonexistent screenshot paths from iteration 1.

## Report corrections
- `panel-collapse` exists only in expanded state; iteration 1's missing-selector report was a false positive
- The camera button IDs above were already correct in the implementation and test brief
- `Mannequin.tsx` validates all seven anchors and both display nodes before mounting the asset; missing nodes throw inside the error boundary
- Final polish moves neckAnchor forward by 0.02 scene units to keep the chain clear in angled views

