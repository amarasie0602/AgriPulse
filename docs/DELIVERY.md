# AgriPulse delivery — 20 October 2026

## Scope and preservation

Extended the existing React/Vite/TypeScript application and Express/Mongoose API
on `feature/docker`. Existing farm management, authentication, carbon methodology,
resource endpoints, and default Farm Profile remain in place. No environment
values, database contents, ports, or Docker volume definitions were replaced.
The initial Git working tree was clean. No database migration is required:
Mongoose creates the new `crops` collection and its owner/farm indexes on use.

## Implemented

- Crop Management has a dedicated responsive field ledger, details dialog,
  MongoDB-backed creation/editing/deletion, farm association, ten crop categories,
  custom names/varieties/seasons/notes, observed growth stages, and explicit
  planting/expected-harvest dates. Search, farm/stage filters, sorting, loading,
  empty/error/success states, confirmations, and accessible shared dialogs.
- `/crops` GET/POST and `/crops/:id` GET/PUT/DELETE require the existing JWT.
  Strict Zod validation rejects owner injection, impossible calendar dates,
  invalid stages, and harvest before planting. Farm ownership and crop area are
  checked server-side. Records are always scoped to the authenticated owner.
- Farms with attached crop records cannot be deleted. Move/delete crops first.
  No automatic cascade deletes or changes to default Farm Profile.
- Dashboard displays real active-crop counts and expected harvest priorities.
  Farm rows use neutral icons rather than depicting every farm as a tea estate.
- Resource records support persistent editing through owner-scoped PUT
  `/resources/:id`, confirmed deletion, text/category/date filters, and sorting.
  Summaries now group by both resource type and unit instead of adding incompatible
  units. Existing demo resource editing remains explicitly within demo mode.
- Analytics adds accessible farm-area/crop-category distribution meters and
  resource date/category filters. Carbon factors remain unchanged.
- Existing cream/forest visual system extended with an editorial seasonal ledger,
  purposeful page compositions, visible states, responsive layouts, and the
  existing reduced-motion behavior. No new web-app runtime dependencies.
- Real Pexels photography replaces generated scenic imagery in the active shell.
  Media credits/license records live beside assets. Stock imagery is never
  represented as the user's farm or verified Sri Lankan footage.
- Isolated, pinned Remotion project with reusable frame-based scenes, configurable
  duration, real footage mode, photographic fallback, titles, and rendering commands.
  Rendered and inspected the 18-second 1080p master and optimized 960×540 web version.
  Dashboard film loads on demand with a poster, controls, muted playback, no autoplay,
  and a playback-error fallback. Original source clip remains in `video/public/`.

## Key files

| Area | Files |
| --- | --- |
| Crop API | `backend/src/modules/crops/{crop.model,crops.validation,crops.routes}.ts`, `backend/src/app.ts` |
| Crop workspace | `frontend/src/pages/CropManagement.tsx`, `frontend/src/services/cropService.ts`, `frontend/src/types/crop.ts`, `frontend/src/crops.css` |
| Navigation | `frontend/src/App.tsx`, `frontend/src/components/layout/{SidebarNav,DashboardShell}.tsx` |
| Dashboard and analytics | `frontend/src/pages/{Dashboard,Analytics}.tsx`, `frontend/src/components/ui/{LandUse,BrandFilm}.tsx` |
| Resource editing | `backend/src/modules/resources/{resources.routes,resources.service}.ts`, `frontend/src/pages/ResourceTracking.tsx`, resource services/types |
| Media | `frontend/public/images/SOURCES.md`, `frontend/public/media/`, `video/` |
| Tests | `backend/tests/crops.validation.test.ts`, extended `backend/tests/farms.integration.test.ts` |

## Run

Existing root `.env` stays in place. On a fresh checkout, copy `.env.example` and
set its required JWT secret before running. Never commit `.env`.

```powershell
docker compose up --build -d
docker compose ps
```

App: http://localhost:5174 . API: http://localhost:3000 . MongoDB host port: 27018.
The original `mongo-data` volume is retained. No hosted database is required.

## Verify

```powershell
npm --prefix frontend run build
npm --prefix frontend run typecheck
npm --prefix backend run build
npm --prefix backend run typecheck
$env:TEST_MONGODB_URI='mongodb://127.0.0.1:27018/agripulse_verification'
npm --prefix backend test
git diff --check
```

Integration tests use unique temporary accounts and clean up only records they
create. Without `TEST_MONGODB_URI`, database integration tests are skipped.
Local browser scripts/screenshots/results are in ignored `.qa/`; they are local
verification artifacts rather than a portable automated browser-testing package.

Verified: frontend/backend builds and typechecks; 24 backend tests including
MongoDB/JWT integration; Docker rebuild and service startup; 74 headless Chrome
checks for seven signed-in pages at 1366×768, 768×1024, and 390×844. Browser checks
also exercise auth, farm/crop CRUD, resource edits/search, profile saving, mobile
navigation, themes, analytics filters, and film metadata/seeking with no runtime/console errors.

## Render

See `video/README.md` for full render options, provenance, and fallback behavior.

```powershell
cd video
npm ci
npm run render -- --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2
npm run still -- --props=footage.json --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"
```

Actual outputs (ignored): `video/out/agripulse.mp4` (1920×1080, 34.3 MB),
`video/out/agripulse-web.mp4` (960×540, 3.6 MB), `video/out/poster.jpg`.
Both films are H.264, 30fps, 18 seconds, silent. ffprobe confirms dimensions,
duration, codec, and size; decoded frames and browser seeking were inspected.
Web assets are included in `frontend/public/media/`.

## Limitations

- The pre-existing backend `lint` script fails because ESLint is not installed
  or configured. There is no frontend lint script. Typechecks and builds pass.
- Resource analytics operate on the existing latest-200-record list. Filters and
  unit-safe summaries explicitly reflect that scope; server pagination and
  historical aggregation across all records are not implemented.
- Resource records remain account-level; farm/crop resource attribution is not
  added. Existing profile `cropTypes` and farm `cropTypes` remain descriptive
  metadata rather than being silently synchronized with operational crop records.
- Crop stages and expected harvest dates are entered by users; they are not
  agronomic predictions. Overlapping crop areas are disclosed and not treated as
  unique land coverage. Activity history beyond timestamps is not implemented.
- No email/push notifications, scheduled tasks, or automated alerts are claimed.
  Navigation identifies actual recent resource activity and profile settings.
- Existing illustrative carbon methodology is retained, not scientifically certified.
- Password reset still lacks a backend. Google OAuth requires the existing client
  configuration and an interactive account-owner sign-in; it was not exercised.
- Directory filtering is client-side. Multi-document farm/crop changes are not
  transactional; concurrent farm deletion/crop creation needs additional handling
  before a high-concurrency deployment.
- Media uses one genuine agricultural source clip with distinct excerpts. It does
  not claim multi-location or Sri Lankan documentary coverage. Full-motion looping
  hero video is intentionally unnecessary for the operational dashboard; users
  choose when to view the brand film.
