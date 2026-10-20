# Reference-based dashboard UI

Implemented against the user's AgriPulse Sustainable Farming Dashboard reference.
The existing React app and database-backed flows are preserved.

- Leaf identity, forest sidebar, pale-sage active navigation, landscape footer.
- Warm off-white surfaces, rounded bordered cards, scenic welcome banner.
- Four real KPIs: registered farms, registered land area, distinct crop varieties,
  and estimated carbon. No invented sustainability score or monthly growth values.
- Multi-series resource chart with 3/6/12-month selection. Each series retains its
  own labelled unit; quantities from different resource types are never added.
- Carbon ring uses the existing emission factors and actual contribution shares.
  Month comparison is shown only when both months have carbon-relevant records.
- Your Farms, Recent Activity, and Quick Actions follow the reference composition.
- Search opens the real farm directory with a query. Quick Add opens the farm form.
  Help opens an accessible guide. Account menu provides profile and sign-out.
- Existing sidebar items use real routes. Notifications without a backing data model
  are represented by an activity link rather than an invented unread count.
- Shared card surfaces carry the same visual language to the remaining pages.

Decorative landscape: `frontend/public/images/tea-landscape.png`.
Built-in image generation was used; the exact prompt is in `ARTWORK.md` beside it.
The image is illustrative and is not a photograph of a registered farm.

Implementation files:

- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/components/layout/DashboardShell.tsx`
- `frontend/src/components/layout/SidebarNav.tsx`
- `frontend/src/components/ui/Logo.tsx`
- `frontend/src/components/ui/LeafSprig.tsx`
- `frontend/src/components/ui/ResourceUsageChart.tsx`
- `frontend/src/pages/FarmManagement.tsx` (URL search / quick-add support)
- `frontend/src/reference.css` and its import in `frontend/src/index.css`

The pre-change frontend snapshot is under `.backups/reference-ui-20261020-115630/`.
No backend, database schema, emission factors, or environment settings were changed.

Verification: frontend TypeScript/Vite build passed; 57 headless Chrome checks
passed against the isolated development/test stack with zero runtime/console errors.
Checks include all six pages at desktop, tablet, and phone widths, farm CRUD,
header directory search, quick-add, help, chart period selection, and dark mode.
The Docker frontend was rebuilt and started; HTTP checks confirmed the new bundle,
landscape asset, and API health. Backend and MongoDB remain healthy and unchanged.
