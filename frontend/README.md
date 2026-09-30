# AgriPulse — Frontend

Authentication foundation for **AgriPulse**, a smart farm sustainability and resource management platform built on the MERN stack. This is the "R" — the client. See [`../backend/README.md`](../backend/README.md) for the Express + MongoDB API.

This stage contains only the sign-in / registration experience, JWT session handling and a protected-route foundation. The farm dashboard, resource tracking, carbon calculator, simulator, analytics and maps come later.

## Stack

React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · React Router 7 · Axios · Lucide React · Google Identity Services (`@react-oauth/google`)

## Getting started

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

Other scripts:

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Vite dev server with hot reload               |
| `npm run build`     | Type-check, then produce a production build   |
| `npm run preview`   | Serve the production build locally            |
| `npm run typecheck` | Type-check only                               |

### Environment variables

| Variable                | Example                 | Purpose                                                             |
| ----------------------- | ----------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`          | `http://localhost:3000` | Base URL of the Express API (no trailing `/`).                      |
| `VITE_USE_MOCK_AUTH`    | `true` / `false`        | Demo mode: sign in without a backend (dev server only, see below).  |
| `VITE_GOOGLE_CLIENT_ID` | *(optional)*             | Enables "Continue with Google". See below.                          |

### Demo mode (no backend needed)

While the NestJS API isn't ready, set `VITE_USE_MOCK_AUTH=true` in `.env` and restart `npm run dev`. Login and registration then run against an offline stand-in (`src/services/mockAuthService.ts`):

- Sign in with `demo@agripulse.dev` / `password123`, or register your own account.
- Accounts (with hashed passwords) live only in your browser's localStorage and are never sent anywhere.
- It returns the same errors and messages as the real API (401, 409), so the UI behaves identically.
- It works only on the dev server. A production build ignores the flag and always calls the real API.

Set `VITE_USE_MOCK_AUTH=false` (the default in `.env.example`) once the backend is running.

### Google sign-in (optional)

"Continue with Google" appears on both the login and registration forms. Without `VITE_GOOGLE_CLIENT_ID` configured, it renders disabled with a "Setup needed" badge — it never pretends to work when it can't. To turn it on:

1. Create an OAuth Client ID at [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (see `.env.example` for the exact steps).
2. Set the **same** client ID in `frontend/.env`'s `VITE_GOOGLE_CLIENT_ID` and `backend/.env`'s `GOOGLE_CLIENT_ID`.
3. Restart both dev servers.

Once configured, the real Google-branded button renders (via `@react-oauth/google`), and a successful sign-in calls `POST /auth/google` on the backend, which verifies the token against Google's own public keys before creating or signing in the account — see `docs/BACKEND_INTEGRATION.md`.

In demo mode (`VITE_USE_MOCK_AUTH=true`) with a client ID configured, the button still works, but `mockAuthService` decodes the token's payload directly in the browser instead of sending it anywhere — there's no backend to verify it against, so this path never runs outside local development.

Vite exposes only variables prefixed with `VITE_` to the browser, and everything in a frontend bundle is public. Never put secrets (JWT secret, database URL) in this file.

## Routes

| Path         | Access       | Notes                                                            |
| ------------ | ------------ | ------------------------------------------------------------------- |
| `/login`     | Public only  | Signed-in users are redirected to `/dashboard`.                     |
| `/register`  | Public only  | On success, goes to `/login` with a confirmation banner.            |
| `/dashboard` | Protected    | Overview: farm summary, profile-completion prompt, upcoming modules. |
| `/profile`   | Protected    | Farm profile form (name, location, size, crop types).               |
| `/`, `*`     | —            | Redirect to `/dashboard`.                                            |

`/dashboard` and `/profile` share the `DashboardShell` layout (sidebar on desktop, a slide-over drawer on mobile).

## Folder structure

```
frontend/
├── .env.example
├── index.html
├── vite.config.ts
└── src/
    ├── main.tsx                     Providers: Router → GoogleOAuthProvider → AuthProvider → App
    ├── App.tsx                      Route table
    ├── index.css                    Tailwind import + design tokens + animations
    ├── components/
    │   ├── auth/
    │   │   ├── LoginForm.tsx        Sign-in panel (Smart Field Console)
    │   │   ├── RegisterForm.tsx
    │   │   ├── GoogleSignInButton.tsx  Real button when configured, disabled fallback otherwise
    │   │   ├── PasswordInput.tsx    Show/hide toggle
    │   │   └── PasswordStrength.tsx
    │   ├── layout/
    │   │   ├── ConsoleAuthShell.tsx     Dark shell shared by Login/Register (always dark — no toggle)
    │   │   ├── SmartFieldConsoleFrame.tsx  Ring + orbiting sample-data cards around Login
    │   │   ├── SmartFieldConsole.tsx / OrbitMetricCard.tsx / AerialFieldBackdrop.tsx / ContourLines.tsx
    │   │   ├── DashboardShell.tsx   Signed-in frame: sidebar (desktop) / drawer (mobile) + outlet + ThemeToggle
    │   │   └── SidebarNav.tsx       Nav links + "Coming soon" section, shared by both
    │   └── ui/                      Button, TextField, Select, Checkbox, ChipInput, Alert, Divider, Logo, ThemeToggle, …
    │                                 (TextField/Select/Checkbox/Alert/Divider/Button take a light/dark `tone`/`surface`/`variant`)
    ├── pages/
    │   ├── Login.tsx / Register.tsx
    │   ├── Dashboard.tsx            Overview: farm summary, resource totals, upcoming modules
    │   ├── ResourceTracking.tsx     Log + list water/energy/input usage, per-type totals
    │   └── FarmProfile.tsx          Edit farm name, location, size, crop types
    ├── context/
    │   ├── AuthContext.tsx           user, token, login, register, loginWithGoogle, logout, isAuthenticated, loading, hasRole
    │   └── ThemeContext.tsx          theme ('light'|'dark'), setTheme, toggleTheme — persisted, follows system until chosen
    ├── hooks/                       useAuth, useTheme, useProfile, useResourceEntries, useForm, useDocumentTitle, useElementWidth
    ├── routes/                      ProtectedRoute, PublicOnlyRoute
    ├── config/google.ts             isGoogleAuthEnabled, googleClientId (from VITE_GOOGLE_CLIENT_ID)
    ├── services/
    │   ├── api.ts                   Axios instance + interceptors
    │   ├── authService.ts           /auth/login, /auth/register, /auth/google
    │   ├── profileService.ts        GET/PATCH /users/me (real + offline demo)
    │   ├── resourceService.ts       /resources, /resources/summary (real + offline demo)
    │   ├── errors.ts                HTTP status → friendly message
    │   └── tokenStorage.ts          Session persistence
    ├── types/                       Auth, navigation, farm profile and resource entry types
    └── utils/                       validators, jwt (decode + expiry), cn
```

## Light / dark mode

The signed-in dashboard (Overview, Resource Tracking, Farm Profile — everything inside `DashboardShell`) supports light and dark mode via a toggle in the sidebar (desktop) or top bar (mobile). The always-dark Login/Register console is untouched by this — it has no toggle and isn't affected by the choice.

- **Default:** follows the OS `prefers-color-scheme`, live, until the user picks explicitly.
- **Persisted:** an explicit choice is saved to `localStorage` (`agripulse.theme`) and applied on every future visit.
- **No flash:** a small inline script in `index.html` sets `<html data-theme="...">` before React mounts.
- **How it works:** `index.css` defines a small set of `--color-app-*` CSS tokens (background, surface, border, text, accent, …) with light values in `@theme` and dark overrides under `:root[data-theme="dark"]`. Dashboard-area components use `bg-app-surface`, `text-app-heading`, etc. instead of literal palette colors, so they repaint automatically — no per-component dark-mode logic needed beyond passing `tone={theme}` (or `variant={theme === 'dark' ? 'gold' : 'primary'}` for CTAs) to the shared `ui/` atoms, reusing the same dark styling already built for the login console.

## How authentication works

```
LoginForm ─► useAuth().login() ─► authService.login() ─► Axios ─► POST {VITE_API_URL}/auth/login
                                        │
                                        ▼
                     { access_token, user }  ─► tokenStorage.save() ─► AuthContext state
                                                                             │
                                             ProtectedRoute reads isAuthenticated ◄┘
```

- **UI never calls Axios.** Components use `useAuth()`; HTTP lives in `services/`.
- **Requests** get `Authorization: Bearer <token>` from an Axios request interceptor.
- **Errors** are converted to friendly messages in `services/errors.ts`. Raw backend payloads never reach the UI.
- **Session restore:** on load the stored session is read once. `loading` is `true` until then, so `ProtectedRoute` does not flash the login page.
- **Expiry:** the JWT `exp` claim is read (not verified) to sign the user out when it passes. A `401` from any non-auth endpoint also ends the session and returns to `/login`.

### Token storage

The API returns the JWT in the response body, so the client has to keep it:

| "Remember me" | Storage          | Lifetime                |
| ------------- | ---------------- | ----------------------- |
| On            | `localStorage`   | Survives browser restarts |
| Off (default) | `sessionStorage` | Cleared when the tab closes |

Only the token and the basic profile (`id`, `name`, `email`, `role`) are stored. Web storage is readable by any script on the page, so an XSS bug would expose the token. For a hardened production setup, have NestJS set the JWT in an `httpOnly`, `Secure`, `SameSite` cookie and switch Axios to `withCredentials`. Only `tokenStorage.ts` and `api.ts` would change.

## Adding role-based access later

Roles (`FARMER`, `ADMIN`, `ANALYST`) are already part of `AuthUser`. Guard a group of routes with:

```tsx
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/admin" element={<AdminHome />} />
</Route>
```

Inside components, use `const { hasRole } = useAuth()` and `hasRole('ADMIN', 'ANALYST')`. Users without a matching role are redirected to `/dashboard`.

## Validation

| Field            | Rules                                  |
| ---------------- | -------------------------------------- |
| Full name        | Required, 2–80 characters              |
| Email            | Required, valid format                 |
| Password         | Required, minimum 8 characters         |
| Confirm password | Must match password                    |
| Farm name        | Optional, up to 80 characters          |

Errors appear inline after a field is blurred or the form is submitted, and the first invalid field receives focus. Client-side checks are a convenience — the backend must validate too.

## Accessibility

Semantic landmarks and headings, a visible label for every field, `aria-invalid` / `aria-describedby` wiring for errors, live regions for inline messages, a "Skip to form" link, visible focus rings, an `aria-pressed` password toggle, and `prefers-reduced-motion` support.

## Design notes

Palette (defined as tokens in `src/index.css`): deep forest, warm bone surfaces, wheat and clay accents. Display type is Fraunces, body type is Manrope (loaded from Google Fonts in `index.html`). The figures on the brand panel (78 %, 4.82 t CO₂e) are labelled **Sample** and are illustrative only. "Continue with Google" renders Google's own button once configured (see above) — its look follows Google's branding guidelines, not this design system.

See [`../docs/BACKEND_INTEGRATION.md`](../docs/BACKEND_INTEGRATION.md) for the API contract and backend architecture.
