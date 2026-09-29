# AgriPulse — Backend

Express + MongoDB (Mongoose) API for the AgriPulse authentication stage. Part of the MERN stack alongside `../frontend`.

## Stack

Node.js · Express · TypeScript · MongoDB · Mongoose · JWT (`jsonwebtoken`) · bcryptjs · Zod · Google Identity Services (`google-auth-library`)

## Getting started

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Fill in `.env` (see below), then:

```bash
npm run dev          # tsx watch — restarts on file changes, http://localhost:3000
npm run build         # compile to dist/
npm start              # run the compiled build
npm run typecheck
```

### Database: local MongoDB only

No hosted/online database service (e.g. MongoDB Atlas) is used or required. Run MongoDB on your own machine, either via Docker:

```bash
docker run -d --name agripulse-mongo -p 27017:27017 -v agripulse-mongo-data:/data/db mongo:7
```

or by installing MongoDB Community Server directly. Point `.env`'s `MONGODB_URI` at it (`.env.example` already does, for the default local setup).

### Environment variables

| Variable          | Example                              | Purpose                                          |
| ----------------- | ------------------------------------- | ------------------------------------------------- |
| `MONGODB_URI`     | `mongodb://127.0.0.1:27017/agripulse` | Local MongoDB connection string.                   |
| `JWT_SECRET`      | a long random string                  | Signs and verifies JWTs. Generate your own.        |
| `JWT_EXPIRES_IN`  | `1d`                                   | Token lifetime.                                    |
| `FRONTEND_URL`    | `http://localhost:5173`               | Origin allowed by CORS.                            |
| `PORT`            | `3000`                                | Port the API listens on.                           |
| `GOOGLE_CLIENT_ID` | *(optional)*                         | Enables `POST /auth/google`. See below.            |

`env.ts` validates these at startup with Zod and exits with a clear message if any are missing or invalid.

### Google sign-in (optional)

`GOOGLE_CLIENT_ID` is the only thing standing between the "Continue with Google" button and actually working. Leave it unset and `POST /auth/google` returns `503`; the frontend then shows the button disabled with a "Setup needed" badge instead of pretending it works.

To turn it on:

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials), create an OAuth client ID of type "Web application".
2. Add `http://localhost:5173` (and your production origin, once you have one) under "Authorized JavaScript origins". No redirect URI is needed — Google Identity Services uses a token flow, not a redirect.
3. Copy the client ID into **both** `backend/.env`'s `GOOGLE_CLIENT_ID` and `frontend/.env`'s `VITE_GOOGLE_CLIENT_ID` — they must be identical, since the backend checks that the token's audience matches this exact value.
4. Restart both `npm run dev` processes.

The backend never sees a Google password — only a signed ID token, which it verifies against Google's public keys before trusting any of its claims (email, name, etc.). A forged or expired token is rejected with `401` before any database lookup happens.

## API

See [`../docs/BACKEND_INTEGRATION.md`](../docs/BACKEND_INTEGRATION.md) for the full request/response contract (`POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `GET /auth/me`, `GET`/`PATCH /users/me`) and the status-to-message table the frontend relies on.

## Project structure

```
backend/src/
├── server.ts              Connects to MongoDB, then starts the HTTP server
├── app.ts                 Express app: helmet, CORS, JSON parsing, routes, error handling
├── config/
│   ├── env.ts               Validates and exposes environment variables
│   └── database.ts          Mongoose connect/disconnect
├── modules/auth/
│   ├── user.model.ts          Mongoose User schema (password optional — Google-only accounts have none)
│   ├── auth.validation.ts     Zod request schemas (register/login/google)
│   ├── auth.service.ts        Hashing, JWT signing, Google token verification, database access
│   ├── auth.controller.ts     Express request handlers
│   ├── auth.routes.ts         Route table + rate limiting
│   └── auth.types.ts
├── modules/users/
│   ├── users.types.ts          FarmProfile shape (separate from the auth identity)
│   ├── users.validation.ts     Zod schema for PATCH /users/me (a partial update)
│   ├── users.service.ts        Reads/writes the profile fields on User
│   ├── users.controller.ts     Express request handlers
│   └── users.routes.ts         GET/PATCH /users/me, both behind requireAuth
├── middleware/
│   ├── validate.ts            Body validation middleware
│   ├── requireAuth.ts         JWT verification (+ requireRole for later)
│   └── errorHandler.ts        Central error -> JSON response mapping
└── common/errors/http-error.ts
```

## Security notes

- Passwords are hashed with bcrypt (12 salt rounds); `passwordHash` is `select: false` on the schema, so it is never fetched by a normal query, let alone returned in a response.
- `/auth/login` and `/auth/register` are behind their own rate limits.
- `helmet()` sets sensible security headers; CORS is restricted to `FRONTEND_URL`.
- Validation is `.strict()`, so a request with unexpected fields is rejected with `400` rather than silently accepted.
- Never commit `.env`. Keep `JWT_SECRET` and `MONGODB_URI` out of source control and out of the frontend bundle.
- Google sign-in is verified server-side against Google's public keys (`google-auth-library`'s `verifyIdToken`), and rejects tokens whose `email_verified` claim is false — an unverified email can never sign in or get linked to an existing account.

## Adding role-based access later

Roles (`FARMER`, `ADMIN`, `ANALYST`) already exist on the `User` model and in the JWT payload. Guard a new route with:

```ts
router.get('/admin', requireAuth, requireRole('ADMIN'), handler);
```
