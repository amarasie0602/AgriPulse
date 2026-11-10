# AgriPulse operational workspace and authentication story

This revision follows the complete project transformation brief. It supersedes earlier dashboard-video decisions; the collage remains the visual reference for forest green navigation, sage accents, warm surfaces, restrained borders, real crop photography and editorial typography.

## Audit and preserved functionality

The repository already contained authenticated farm and crop CRUD, resource tracking, profile editing, corrected SVG history charts, notifications derived from saved records, and browser-local settings. The brief's statement that farm routes were missing did not match the repository. React/Vite, Express, Mongoose/MongoDB, JWT authentication, existing routes, environment files, Dockerfiles and the MongoDB volume are retained. No NestJS/PostgreSQL migration, database reset, production seed data or fabricated history was introduced.

## Implementation

- The dashboard now starts with the current user's greeting, a resource-entry action, farm/date controls and operational metrics. There is no hero video or promotional film. Farm area means registered land; active crop counts mean non-harvested records. Dates filter resource records, not historical farm area or crop counts.
- Resource creation/editing can assign an owned farm and an optional crop belonging to that farm. The table displays assignments. Farm, crop, date, category and search filters scope the table, totals and history. Unassigned records remain a deliberate selection.
- Dashboard, analytics and carbon reports filter the actual loaded resource records by farm and usage date. The existing 200-record API cap is disclosed. Units remain separate; missing periods remain gaps; one observation is not drawn as invented history.
- Dashboard crop names open the corresponding persisted crop detail dialog. Farm links open the existing searchable directory.
- The carbon calculation retains the existing numeric factors to avoid silently changing historical comparisons. The UI now identifies all four as **unverified project defaults**, documents assumptions and exclusions, and displays factor version `agripulse-legacy-v1`. These are illustrative calculations, not a verified footprint. No authoritative source was invented for unsupported legacy coefficients.
- Login and registration have a controllable four-chapter story with three real footage sources, synchronized HTML typography, chapter seeking/progress, play/pause, replay and skip-to-form focus. Playback is explicit, never required for authentication. Reduced-motion/data-saving/slow-2G users get still imagery and chapter controls. Mobile supports the same still initial view and optional playback. Media errors preserve the form.
- The obsolete dashboard-video setting was removed from the visible Settings page because the dashboard no longer plays a film. Existing saved preferences were not rewritten. The interface-motion and theme controls remain functional.
- The resource hook no longer requests the unused mixed-unit summary endpoint. That API route remains available for compatibility.

## Additive API/database changes

`ResourceEntry` gains nullable `farmId` and `cropId` references and indexes on `(userId, farmId, date)` and `(userId, cropId)`. The existing `/resources` POST and PUT payloads accept these optional fields. Omission on PUT preserves assignments for older clients; explicit null clears them. Old documents missing both fields are returned as unassigned. There is no destructive migration or automatic attribution of old records.

The server validates ownership and crop/farm consistency. A farm/crop with linked resource records cannot be deleted, and a linked crop cannot move farms until its resource references are reassigned or cleared. Existing routes and response fields are retained. These are application-level integrity checks on the existing standalone MongoDB deployment, not cross-request database transactions.

## Media and reproducibility

The real rendered asset is `frontend/public/media/agripulse-auth-story.mp4`: 20 seconds, H.264, 960×540, 30fps, silent, 6,950,367 bytes. `AuthStoryFilm` in `video/src/AuthStory.tsx` uses four five-second chapters and a short footage crossfade. `frontend/src/content/authStory.ts` is the timing/text source shared by Remotion and the web controls. The browser layer owns accessible typography, so seeking follows the media clock. The composition also supports baked titles when explicitly rendering with `--props='{"titles":true}'` to a separate output.

Sources are Tom Fisk's rice fields (Pexels 6252566), Kindel Media's vegetable harvest (7456581) and Amar Preciado's irrigation footage (8166769), under the Pexels license. Source links and processing details are in [media/SOURCES.md](../frontend/public/media/SOURCES.md). The existing distinct crop/farm/auth photographs and credits are retained in [photography/SOURCES.md](../frontend/public/images/photography/SOURCES.md). Representative imagery is not presented as the user's actual farm. Earlier hero/product-tour exports are historical artifacts and do not describe the current dashboard.

Render from `video/`:

```powershell
npm.cmd run render:auth -- --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=1 --port=9338
```

The initial high-resolution render failed decoding a source scene. The successful render used normalized silent 960×540 harvest/irrigation clips. Encoded harvest and irrigation frames were inspected from the final MP4. No new production or charting dependencies were added.

## Verification

Frontend and backend production builds and TypeScript checks passed. Backend integration/validation: **25 passed**, including invalid parent IDs, cross-account links, crop/farm mismatch, guarded deletion/movement, omitted-field compatibility, explicit clearing and a pre-schema MongoDB record. Frontend history and report scope: **16 passed**, including sparse/empty/single-period series, units, inclusive date boundaries and scoped carbon estimates.

```powershell
npm.cmd --prefix frontend run build
npm.cmd --prefix frontend run typecheck
npm.cmd --prefix backend run build
npm.cmd --prefix backend run typecheck
$env:TEST_MONGODB_URI='mongodb://127.0.0.1:27018/agripulse_ui_verification'
npm.cmd --prefix backend test
node --import ./backend/node_modules/tsx/dist/loader.mjs --test frontend/tests/resourceHistory.test.ts frontend/tests/reportScope.test.ts
```

The existing backend lint command fails because ESLint is absent. Installing ESLint with the TypeScript ESLint adapter was attempted and rejected by npm: the available adapter declares TypeScript `<6.1`, while this repository uses TypeScript 7. No forced peer override, compiler downgrade or new dependency was left behind. Lint is not reported as passing.

Standard `docker compose build backend frontend` succeeded, and the final frontend was rebuilt again after dependency patches. No temporary replacement Dockerfile is needed for this revision. Backend and MongoDB health checks passed; the frontend serves the application on port 5174.

The browser suite passed **62 checks** against the Docker-served application: real registration/login/logout and protected redirects, empty dashboard, persisted resource assignments, all five dated histories, chart keyboard feedback, farm/date filters, crop detail links, resource editing, refresh persistence, nine workspace routes at 1366/768/390px, mobile authentication, motion preference, actual MP4 playback/seeking/pause, reduced-motion/data-saving behavior and media-error fallback. No runtime/console errors were reported. The earlier development run passed 57 checks; the five additional checks cover mobile auth and data saving. Temporary accounts and their own records were cleaned up by owner ID only.

Reproduce the Docker browser checks from the repository root (Chrome must be installed):

```powershell
$env:QA_FRONTEND_ORIGIN='http://localhost:5174'
$env:QA_MONGODB_URI='mongodb://127.0.0.1:27018/agripulse'
node frontend/tests/browser-workflows.cjs
```

`QA_MONGODB_URI` must point to the same database used by the API so the suite can remove its temporary account. Screenshots and results are written under ignored `.qa/`.

A normal `docker compose restart backend` was verified with a temporary authenticated account: the same JWT remained usable, the farm and crop persisted, and the resource retained both parent references. A SHA-256 comparison of the seven preexisting non-QA resource documents was unchanged. The existing volume was preserved. Docker Desktop and the existing services were also restored successfully after the later session interruption.

The frontend build initially reported three high-severity npm dependency advisories. `npm.cmd audit fix` applied compatible updates within existing ranges, including Vite 8.3.5, follow-redirects 1.16.1 and source-map-js 1.2.2, with related build-tool lockfile updates. The final install/audit reported **zero vulnerabilities**. No new dependency category or major-version override was added. Frontend build/type checks and all 16 history/scope regressions passed again after these patches. The Docker frontend was rebuilt and all **62 browser checks passed again on 23 October 2026**, with no browser runtime or console errors. `git diff --check` passed. This audit result describes the frontend npm dependency tree, not a complete infrastructure security assessment.

## Main changed files

- Workspace: `frontend/src/pages/Dashboard.tsx`, `components/ui/FieldOverview.tsx`, `components/layout/DashboardShell.tsx`, `premium.css`, and `pages/Settings.tsx`.
- Data/reporting: `pages/ResourceTracking.tsx`, `Analytics.tsx`, `CarbonCalculator.tsx`, `CropManagement.tsx`, `components/ui/LandUse.tsx`, `TrendChart.tsx`, `FarmFilter.tsx`, `hooks/useFarmDirectory.ts`, `useResourceEntries.ts`, `utils/reportScope.ts`, `carbon.ts`, and `types/resource.ts`.
- API/integrity: resource model/service/DTO/validation, farm deletion service, crop route guards, and `backend/tests/farms.integration.test.ts`.
- Authentication/video: `components/auth/AuthStory.tsx`, `components/layout/ConsoleAuthShell.tsx`, `content/authStory.ts`, `video/src/AuthStory.tsx`, `video/src/index.tsx`, `video/package.json`, the rendered MP4 and two normalized source clips.
- Reproducible checks: `frontend/tests/reportScope.test.ts`, existing history regressions, and `frontend/tests/browser-workflows.cjs`.
- Dependency lockfile, README, media credits, video instructions, backend integration guide and current design/delivery pointers.

## Startup

Use the existing root `.env`; do not replace it. For a fresh checkout, copy `.env.example` only if `.env` is absent and set its required secret before starting.

```powershell
docker compose up --build -d
docker compose ps
```

Frontend: http://localhost:5174. API/health: http://localhost:3000/health. MongoDB host port: 27018; the backend's Compose connection remains `mongodb://mongo:27017/agripulse`. Data remains in `agripulse_mongo-data`.

For frontend development against the running Docker backend:

```powershell
npm.cmd --prefix frontend run dev -- --host 127.0.0.1 --port 5181
```

The Vite `/api` proxy uses the configured API URL; production retains the existing direct API URL. Notifications/read state and interface preferences remain browser-local. Weather, maps, outbound delivery, production/yield measurements and scientifically verified reduction predictions were not fabricated. Historical reports cover the loaded resource window, not all database history.
