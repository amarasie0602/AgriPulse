# Backend integration guide (Express + MongoDB — MERN stack)

How the AgriPulse frontend and the `backend/` API fit together. The backend is implemented; this
describes the contract it follows and how to run both sides together.

## Endpoints

### `POST /auth/register`

```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123", "farmName": "Green Valley Farm" }
```

`farmName` is optional and only sent when the user fills it in. Unknown fields are rejected with `400` (the request body is validated strictly with Zod). On success the user is sent to `/login`.

| Status | Meaning                | Message shown to the user                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| 201    | Account created        | "Account created. Sign in to continue."                  |
| 400    | Validation failed      | "Please check the details you entered and try again."    |
| 409    | Email already in use   | "An account with this email already exists."              |
| 429    | Rate limited           | "Too many attempts. Please wait a moment and try again."  |
| 5xx    | Server error           | "AgriPulse ran into a problem. Please try again shortly." |

### `POST /auth/login`

```json
{ "email": "john@example.com", "password": "password123" }
```

Response (`200`):

```json
{
  "access_token": "JWT_TOKEN",
  "user": { "id": "65f...", "name": "John Doe", "email": "john@example.com", "role": "FARMER" }
}
```

`id` is a MongoDB ObjectId string (not a number).

| Status | Meaning                          | Message shown to the user                                  |
| ------ | --------------------------------- | ------------------------------------------------------------ |
| 401    | Wrong email or password           | "Incorrect email or password."                                |
| 400    | Malformed body                    | "Please check the details you entered and try again."         |
| no response / timeout | Offline, CORS blocked, API down | "Unable to connect to AgriPulse. Please try again."            |

The same `401` is used for "unknown email" and "wrong password" so the API never reveals which emails are registered.

### `POST /auth/google`

```json
{ "credential": "eyJhbGciOi..." }
```

`credential` is the ID token Google Identity Services hands the frontend after the person picks an account — the frontend never sees or handles a Google password. The backend verifies it against Google's public keys (via `google-auth-library`), so a forged or tampered token is rejected before any user lookup happens. On success it returns the same shape as `/auth/login`, creating the user on first sign-in or linking Google to an existing account with the same (Google-verified) email.

| Status | Meaning                              | Message shown to the user                                        |
| ------ | -------------------------------------- | -------------------------------------------------------------------- |
| 200    | Signed in (account created if new)     | —                                                                     |
| 400    | Missing `credential`                   | "Please check the details you entered and try again."                |
| 401    | Invalid/expired/forged token           | "Google sign-in failed. Please try again."                            |
| 403    | Google email not verified              | "Please verify your email with Google before continuing."             |
| 503    | `GOOGLE_CLIENT_ID` not set on the server | "Google sign-in is not set up yet. Please sign in with email instead." |

Enabling it requires **the same Client ID on both sides**: `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`. See either `.env.example` for how to create one. Leaving both unset keeps the "Continue with Google" button visibly disabled rather than silently broken.

### `GET /auth/me`

Protected (`Authorization: Bearer <token>`). Returns the current user, in the same shape as `login`'s `user`. Not yet called by the frontend; available for a future "validate stored session" check.

### `GET /users/me` / `PATCH /users/me`

Protected. This is the farm profile shown on the dashboard — a separate resource from the auth identity above, so `/auth/*` stays focused on authentication.

`GET /users/me` returns:

```json
{
  "id": "65f...",
  "name": "Jane Perera",
  "email": "jane@example.com",
  "role": "FARMER",
  "farmName": "Green Valley Farm",
  "location": "Kandy, Sri Lanka",
  "farmSizeHectares": 12.5,
  "cropTypes": ["Rice", "Tea"],
  "authProvider": "local",
  "createdAt": "2026-09-29T05:15:38.859Z"
}
```

`farmName`, `location`, `farmSizeHectares` are omitted (not `null`) until set; `cropTypes` is always an array. `authProvider` is `"local"`, `"google"`, or `"both"`, computed from whether the account has a password and/or a linked Google ID — used only to display "Signed in with…", not for access control.

`PATCH /users/me` accepts any subset of `{ farmName, location, farmSizeHectares, cropTypes }` (a partial update — omitted fields are left unchanged) and returns the updated profile in the same shape. `farmSizeHectares` must be a JSON number, not a string.

| Status | Meaning              | Message shown to the user                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| 400    | Validation failed      | "Please check the details you entered and try again."    |
| 401    | Missing/expired token  | "Your session has expired. Please sign in again."         |
| 404    | Account no longer exists | "Your account could not be found. Please sign in again." |

## How the frontend talks to the backend

1. Axios is created once in `frontend/src/services/api.ts` with `baseURL = import.meta.env.VITE_API_URL`.
2. `authService.login()` posts to `${VITE_API_URL}/auth/login`; `authService.register()` posts to `${VITE_API_URL}/auth/register`.
3. The email is trimmed and lower-cased before sending; the backend does the same before querying MongoDB.
4. After login, the token is stored (see `frontend/README.md`) and every later request carries `Authorization: Bearer <access_token>`.
5. If a protected endpoint answers `401`, the frontend clears the session and redirects to `/login` with a "session expired" notice.
6. The frontend reads the JWT's `exp` claim (without verifying it) to sign the user out when it expires. The backend always signs tokens with an expiry (`JWT_EXPIRES_IN`, default `1d`).
7. "Continue with Google" posts the Google ID token to `POST /auth/google` and stores the returned session exactly like a normal login. In the frontend's offline demo mode (`VITE_USE_MOCK_AUTH=true`), the same button instead decodes that token's payload directly in the browser — no signature check — since there's no backend there to verify it against Google; the real path above is always used against the actual API.

## Running the backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

### Database: local MongoDB only

This project uses a MongoDB server on your own machine. No hosted database service (Atlas, etc.) is required or used.

```bash
docker run -d --name agripulse-mongo -p 27017:27017 -v agripulse-mongo-data:/data/db mongo:7
```

or install MongoDB Community Server directly. Either way, `.env`'s `MONGODB_URI` should point at it:

```
MONGODB_URI="mongodb://127.0.0.1:27017/agripulse"
```

### Start the API

```bash
npm run dev     # http://localhost:3000, restarts on file changes
```

## Architecture

```
backend/src/
├── server.ts                 Connects to MongoDB, then starts Express
├── app.ts                    Express app: helmet, CORS, JSON body, routes, error handler
├── config/
│   ├── env.ts                 Validates process.env with Zod, fails fast if misconfigured
│   └── database.ts            Mongoose connection
├── modules/auth/
│   ├── user.model.ts           Mongoose schema (name, email, passwordHash, farmName, role)
│   ├── auth.validation.ts      Zod schemas for register/login (strict — rejects unknown fields)
│   ├── auth.service.ts         bcrypt hashing, JWT signing, the actual business logic
│   ├── auth.controller.ts      Express handlers — parse req, call the service, send the response
│   ├── auth.routes.ts          POST /register, POST /login, GET /me (+ rate limiting)
│   └── auth.types.ts
├── middleware/
│   ├── validate.ts             Body validation middleware (Zod schema -> 400 with field errors)
│   ├── requireAuth.ts          Verifies the JWT, attaches it to req.auth; requireRole() for later
│   └── errorHandler.ts         Central error -> JSON mapping; never leaks raw errors
└── common/errors/http-error.ts HttpError / ConflictError / UnauthorizedError
```

Passwords are hashed with bcrypt (12 salt rounds) and never returned in a response — the schema marks `passwordHash` `select: false`, so a normal `findOne` doesn't fetch it at all.

## Adding role-based access later

Roles (`FARMER`, `ADMIN`, `ANALYST`) already exist on the `User` model and in the JWT payload. Guard a route with:

```ts
router.get('/admin', requireAuth, requireRole('ADMIN'), handler);
```

## CORS

`app.ts` allows only `FRONTEND_URL` (default `http://localhost:5173`, the Vite dev server). Update it in `.env` if the frontend runs elsewhere.
