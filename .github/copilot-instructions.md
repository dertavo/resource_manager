# Copilot Instructions

## Overview
- Single-page Vite + React app; business logic and state live mostly in [src/App.jsx](src/App.jsx). Tailwind classes are written inline; icons come from lucide-react.
- Two user roles drive feature access: `store` (can register products, accept requests) and `main` (can organize, run stations/warehouses, manage company/workforce). Role toggles in the header and gates views.
- No backend: all data persists in `localStorage` (keys include products, shelves, stations, warehouses, inventory, personalInventory, balances, productsForSale, productRequests, globalBalance, currentUser).

## Build/Run
- Install deps: `npm install`.
- Dev server: `npm run dev` (Vite). Build: `npm run build`. Lint: `npm run lint`. Preview: `npm run preview`.

## Data & UI conventions
- Products: `{ id, name, price/displayPrice, stock, color, capacity?, owner }`. Colors are generated HSL strings when created.
- Stations: `{ id, name, finalProductName, inputProductIds, cost?, processingTime }`; cost is displayed in the station shop, processing time auto-derives from number of inputs.
- Warehouses host station instances in grid slots; station instances gain `status`, `remainingTime`, and assigned actor ids.
- Inventory items carry `{ uniqueId, productId, name, color, qty, capacity? }`; organizer shelves also store `draggable` and optional `parentId` for nesting.
- UI uses Tailwind utility classes (no global CSS framework). Keep markup minimal; prefer composing existing views/components in `src/views` and `src/components`.

## Role-based navigation
- `currentUser` determines the default view and available tabs. Store users are redirected away from organizer/stations/warehouses/company/workforce.
- Navigation buttons are built in [src/App.jsx](src/App.jsx) via `NavButton` and `renderView()`; add new tabs there and gate by role if needed.

## State persistence
- Every primary state slice (`products`, `shelves`, `stations`, `warehouses`, `inventory`, `personalInventory`, `workforce`, `company`, `dailyBalance`, `globalBalance`, `productsForSale`, `productRequests`, `publicSaleProducts`, `isPersonalPanelVisible`, `currentUser`) is initialized from and written back to `localStorage` in `useEffect` hooks in [src/App.jsx](src/App.jsx). Keep keys stable when changing shapes.

## Product lifecycle
- Register products in [src/views/RegisterView.tsx](src/views/RegisterView.tsx); racks/stations can be flagged with `capacity` to become shelves in the organizer.
- Buying flow: `handleAddToCartAll` + `CartView` in [src/App.jsx](src/App.jsx) enforce stock limits and require a positive `globalBalance`. Purchases decrement product `stock` and increase `inventory` entries.
- Product shop UI (with restock modal) lives in [src/components/ProductShop.tsx](src/components/ProductShop.tsx) and [src/cards/ProductCardWithSelector.tsx](src/cards/ProductCardWithSelector.tsx); restock writes through `setProducts` and `localStorage`.

## Organizer & drag/drop
- Organizer logic (drag/drop, touch support, nesting) is in [src/views/OrganizerView.tsx](src/views/OrganizerView.tsx); it relies on `handleDragStart`, `handleDrop`, `handleDropToInventory`, and `handleDropToTrash` from [src/App.jsx](src/App.jsx).
- Shelves enforce capacity per shelf; items moved back to inventory consolidate quantities. Personal inventory is limited to 4 slots and uses the fixed panel.
- Touch dragging uses custom ghost elements and `[data-drop-zone]` markers—preserve these attributes when adding drop targets.

## Stations, warehouses, and processing
- Station catalog creation/removal happens in [src/views/StationsView.tsx](src/views/StationsView.tsx).
- Warehouse grid placement and drag/drop of station instances are in [src/views/WarehousesView.tsx](src/views/WarehousesView.tsx); slots track status (`idle`, `processing`, `completed`).
- Processing loop runs per station via timers stored in `stationTimersRef` in [src/App.jsx](src/App.jsx); it decrements `remainingTime`, consumes required inventory, and logs labor costs to `company`/`dailyBalance`/`globalBalance`.
- Station details modal ([src/views/StationDetailsModal.tsx](src/views/StationDetailsModal.tsx)) handles start/complete, actor assignment, and moving final products back to inventory.

## Workforce and company
- Company setup and ledger live in [src/views/CompanyView.tsx](src/views/CompanyView.tsx); starting with debt seeds `globalBalance` income.
- Workforce registry is in [src/views/WorkforceView.tsx](src/views/WorkforceView.tsx); actors can be humans or machines with hourly costs. Assignment hooks in `StationDetailsModal` call `assignActorToStation` and optional `assignTaskToActor` from [src/App.jsx](src/App.jsx).

## Sales, requests, and balances
- Personal panel ([src/components/PersonalPanel.tsx](src/components/PersonalPanel.tsx)) shows daily/global balances, pending product requests for the store user, and personal sale listings (only for `main`).
- Products can be moved to sale via price modal in [src/App.jsx](src/App.jsx); `productsForSale` is keyed by user (`store` vs `main`).
- Product requests flow: `openRequestModal`/`submitProductRequest` gather inventory into `productRequests`; store user accepts/rejects via `acceptProductRequest`/`rejectProductRequest` (updates catalog and `globalBalance`).
- `dailyBalance` entries capture purchases, labor costs, and income; keep descriptions concise for the panel feed.

## Styling & components
- Tailwind is configured via `tailwind.config.js`/`postcss.config.js`; global styles in `src/index.css` and `src/App.css` are minimal. Prefer utility classes over new CSS.
- Mix of `.jsx` and `.tsx`; TS files are typed lightly—maintain existing types when editing.

## When adding features
- Respect role gating and `currentView` defaults; ensure new state persists through the same `localStorage` pattern.
- Update derived displays (shop, organizer inventory summary, cart) when mutating stock or quantities.
- For drag/drop additions, keep accessibility: preventDefault on dragOver, clean up `classList` on leave/drop, and guard mobile pointer flows in organizer logic.

## Diagnostics
- There are no automated tests. Validate flows manually: product registration → add to cart → purchase → organizer placement → station processing → inventory movement → sale/request handling.
