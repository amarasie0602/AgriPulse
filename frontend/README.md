# AgriPulse — Frontend

Authentication foundation for **AgriPulse**, a smart farm sustainability and resource management platform built on the MERN stack. This is the "R" — the client. See [`../backend/README.md`](../backend/README.md) for the Express + MongoDB API.

This stage contains only the sign-in / registration experience, JWT session handling and a protected-route foundation. The farm dashboard, resource tracking, carbon calculator, simulator, analytics and maps come later.

## Stack

React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · React Router 7 · Axios · Lucide React

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

| Variable             | Example                 | Purpose                                                             |
| -------------------- | ----------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`       | `http://localhost:3000` | Base URL of the NestJS API (no trailing `/`).                       |
| `VITE_USE_MOCK_AUTH` | `true` / `false`        | Demo mode: sign in without a backend (dev server only, see below).  |

### Demo mode (no backend needed)

While the NestJS API isn't ready, set `VITE_USE_MOCK_AUTH=true` in `.env` and restart `npm run dev`. Login and registration then run against an offline stand-in (`src/services/mockAuthService.ts`):

- Sign in with `demo@agripulse.dev` / `password123`, or register your own account.
- Accounts (with hashed passwords) live only in your browser's localStorage and are never sent anywhere.
- It returns the same errors and messages as the real API (401, 409), so the UI behaves identically.
- It works only on the dev server. A production build ignores the flag and always calls the real API.

Set `VITE_USE_MOCK_AUTH=false` (the default in `.env.example`) once the backend is running.

Vite exposes only variables prefixed with `VITE_` to the browser, and everything in a frontend bundle is public. Never put secrets (JWT secret, database URL) in this file.

## Routes

| Path         | Access       | Notes                                                       |
| ------------ | ------------ | ----------------------------------------------------------- |
| `/login`     | Public only  | Signed-in users are redirected to `/dashboard`.             |
| `/register`  | Public only  | On success, goes to `/login` with a confirmation banner.    |
| `/dashboard` | Protected    | Placeholder. Unauthenticated users are sent to `/login`.    |
| `/`, `*`     | —            | Redirect to `/dashboard`.                                   |

## Folder structure

```
frontend/
├── .env.example
├── index.html
├── vite.config.ts
└── src/
    ├── main.tsx                     Providers: Router → AuthProvider → App
    ├── App.tsx                      Route table
    ├── index.css                    Tailwind import + design tokens + animations
    ├── components/
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── PasswordInput.tsx    Show/hide toggle
    │   │   └── PasswordStrength.tsx
    │   ├── layout/
    │   │   ├── AuthLayout.tsx       Split-screen shell
    │   │   ├── BrandPanel.tsx       Desktop brand side
    │   │   ├── MobileBrandHeader.tsx
    │   │   ├── FieldVisualization.tsx  Abstract precision-agriculture SVG
    │   │   ├── FloatingStatCard.tsx    Glass cards (sample data)
    │   │   ├── ContourLines.tsx
    │   │   └── AppShell.tsx         Signed-in frame (header + sign out)
    │   └── ui/                      Button, TextField, Checkbox, Alert, Divider, Logo, …
    ├── pages/                       Login, Register, Dashboard (placeholder)
    ├── context/AuthContext.tsx      user, token, login, register, logout, isAuthenticated, loading, hasRole
    ├── hooks/                       useAuth, useForm, useDocumentTitle
    ├── routes/                      ProtectedRoute, PublicOnlyRoute
    ├── services/
    │   ├── api.ts                   Axios instance + interceptors
    │   ├── authService.ts           /auth/login, /auth/register
    │   ├── errors.ts                HTTP status → friendly message
    │   └── tokenStorage.ts          Session persistence
    ├── types/                       Auth and navigation types
    └── utils/                       validators, jwt, cn
```

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

Palette (defined as tokens in `src/index.css`): deep forest, warm bone surfaces, wheat and clay accents. Display type is Fraunces, body type is Manrope (loaded from Google Fonts in `index.html`). The figures on the brand panel (78 %, 4.82 t CO₂e) are labelled **Sample** and are illustrative only. "Continue with Google" is intentionally disabled — no OAuth provider exists on the backend yet.

See [`../docs/BACKEND_INTEGRATION.md`](../docs/BACKEND_INTEGRATION.md) for the API contract and required NestJS changes.
