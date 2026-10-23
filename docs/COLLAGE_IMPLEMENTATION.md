# Agricultural collage implementation

Primary reference: the user's **AgriPulse Sustainable Farming Dashboard Collage.png** and accompanying implementation brief. This implementation adapts the photographic and editorial direction to the existing React/Vite/TypeScript, Tailwind, Express, and MongoDB application. It does not replace the project or its records.

## Pages and working features

| Page | Implementation |
| --- | --- |
| Dashboard | Real farm count, registered area, active crop count, resource history, estimated emissions, crop photography/stages/planned harvest dates, farm directory, and recent saved records. The existing real-footage Remotion hero reaches behind the transparent header, which turns opaque on scroll. |
| Farms | Three representative photographic cover choices assigned deterministically, grid/list view, search, crop filtering, sorting, details, creation, editing, and confirmed deletion through the existing API. |
| Crop plans | Name/category-specific photography for eleven subjects, farm/stage filters, search, sorting, dates, observed stages, areas, details, creation, editing, and confirmed deletion. Stages are manually recorded; no maturity percentages are invented. |
| Resource Tracking | Unit-separated summaries, entry/edit form, search/category/date/order controls, transaction table, confirmed deletion, and expandable dated resource-history charts. |
| Carbon Calculator | Existing illustrative factors and exclusions preserved; source breakdown, proportional donut, transparent assumptions, and monthly history with missing periods preserved as gaps. |
| Analytics | Actual crop/land distributions and resource/impact history. Five required resource categories, day/week/month grouping, per-unit scales, keyboard/pointer feedback, and data tables remain intact. |
| Farm Profile | Existing account-level farm information and profile API, improved cover and identity presentation. Distinct from operational farms. |
| Notifications | Actual resource-record activity and review reminders derived from unharvested crops with planned harvest dates within 30 days or already passed. Category/unread filters and local read state. No delivery service is simulated. |
| Settings | Functional light/dark appearance, background-video preference, interface-motion preference, account summary, and link to the existing profile editor. |
| Login | Real authentication, validation, loading/errors, password visibility, and existing Google integration in a photographic composition with a light form panel. |
| Registration | Existing validated account creation and Google workflow, using a distinct rice-landscape photograph. |

## Brand and media

`frontend/src/premium.css` establishes evergreen navigation, sage accents, ivory working surfaces, restrained borders, Manrope operational typography, and Fraunces for selected editorial headings and the wordmark. Component-specific CSS retains responsive data-chart dimensions and existing accessible dialogs/forms. There are no neon accents, decorative chart curves, or stock metrics.

The centralized registry is `frontend/src/utils/media.ts`; `Photo.tsx` provides consistent sizing, lazy loading, descriptive text, and graceful unavailable states. Sixteen local JPEG assets are documented in [photography/SOURCES.md](../frontend/public/images/photography/SOURCES.md), including original source pages and the Pexels license. Auth images are requested at 1600px, farm covers at 1000px, and crop images at 800px. They total approximately 2.5 MB and are not all preloaded.

All sixteen subjects were visually reviewed in a contact sheet; all downloaded hashes differ. Browser verification loaded three distinct farm covers and eleven distinct crop photographs, plus separate login and registration images. Farm covers are openly identified as representative landscapes, not user-uploaded property photographs. More than three farms can reuse the finite fallback pool. Crop records of the same subject can intentionally share their category photograph; a crop shown on the dashboard reuses its catalog photograph intentionally.

## Motion and video

Motion uses the existing CSS transitions and deterministic Remotion animations; no additional animation or charting package was added. Page/card/menu/dialog entrances remain short. Keyboard focus remains visible. Device reduced-motion settings take priority; interface-motion preference disables workspace animation and transitions. Background playback also respects data saving and reduced motion, with a static poster on failure. Playback remains controllable through a keyboard-revealed control, without the removed visible footage caption or toolbar.

The existing `AgriPulseHero` composition is a 12-second 960×540/30fps real rice-field loop; the served MP4 is `frontend/public/media/agripulse-hero.mp4` (approximately 2.7 MB). `AgriPulse` remains the 18-second real-footage brand film; its default now selects footage rather than still-image mode.

`AgriPulseProductTour`, in `video/src/ProductTour.tsx`, is a 20-second 960×540/30fps walkthrough of actual browser screenshots over the reusable real-footage loop. Captures in `video/public/ui/` come from an isolated API-backed verification account, and the film continuously labels them as an example workspace with test records. It is an exported product artifact, not a reintroduced promotional footer in the app.

Render from `video/`:

```powershell
npm.cmd run render:hero -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2 --port=9335
npm.cmd run render -- --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2 --port=9335
npm.cmd run render:tour -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2 --port=9335
```

Port 9335 belongs only to the temporary renderer, avoiding the backend on port 3000. Existing application ports are unchanged. Verified render output: `video/out/agripulse-product-tour.mp4` (20 seconds, H.264, 960×540, 30fps, silent, 1,733,861 bytes). All five scene frames were inspected from the actual encoded MP4. Poster: `video/out/agripulse-product-tour-poster.jpg`. Existing verified hero and brand renders are also under `video/out/`. Reproduction details and source credits are in [video/README.md](../video/README.md) and [media/SOURCES.md](../frontend/public/media/SOURCES.md).

## Important implementation files

- Shell/navigation/auth: `DashboardShell.tsx`, `SidebarNav.tsx`, `ConsoleAuthShell.tsx`, `FieldOverview.tsx`, `HeroBackground.tsx`, `premium.css`.
- Media: `utils/media.ts`, `components/ui/Photo.tsx`, `public/images/photography/`.
- Operational pages: `Dashboard.tsx`, `FarmManagement.tsx`, `CropManagement.tsx`, `ResourceTracking.tsx`, `CarbonCalculator.tsx`, `FarmProfile.tsx`.
- New account pages: `Notifications.tsx`, `Settings.tsx`, `hooks/usePreferences.ts`, and authenticated routes in `App.tsx`.
- Existing corrected charts: `TrendChart.tsx`, `ResourceUsageChart.tsx`, `ResourceHistorySection.tsx`, `utils/resourceHistory.ts`. See [RESOURCE_TRENDS.md](RESOURCE_TRENDS.md).
- Product video: `video/src/ProductTour.tsx`, `video/src/index.tsx`, `video/package.json`, `video/public/ui/`.

## Validation and boundaries

- Frontend production build and TypeScript check passed; backend build and TypeScript check passed.
- Backend: 24 tests passed, including authenticated ownership/CRUD integration in a separate verification database.
- Resource history: 13 aggregation regressions passed.
- Browser workflows: 107 checks passed for authentication, forms, farm/crop CRUD, persistence, resources, filters, profile editing, dark mode, responsive navigation, transparent/solid header behavior, playback controls, and reduced motion.
- Additional visual/account checks: 47 passed against both the development server and the Docker-served build, covering distinct assets, no broken images, all nine workspace routes at desktop/768/390px widths, grid/list display, actual plan-derived reminders, read-state persistence, video/motion preferences, and theme switching. No browser runtime errors were reported. Temporary example records/accounts were cleaned up by owner ID only.
- Docker Compose configuration validated. The standard multi-stage rebuild was blocked by Docker Hub DNS resolution. The verified Vite output was packaged using the existing local Nginx frontend image, then started with `docker compose up -d --no-build --no-deps frontend`. This temporary local runtime build leaves the existing Dockerfile/Compose configuration intact; the normal build should be used once Docker Hub is reachable. Existing backend and MongoDB containers were healthy; the `agripulse_mongo-data` volume and port mappings were retained. No database replacement or volume deletion occurred.
- Backend lint could not run: the existing `lint` script invokes ESLint, which is not installed. No new lint failure is claimed as passing.

Notification read status and video/motion preferences are account-scoped browser storage; appearance retains the existing browser-wide theme mechanism. They do not synchronize across devices. No weather API, geocoded map, delivery service, production/yield measurements, scheduled-task backend, password-reset service, or scientifically validated reduction engine was invented. Farm operational status is not added because the model does not track it. The existing latest-200 resource-record API limit remains explicitly disclosed. Existing emission factors remain illustrative and are not upgraded into certified calculations.
