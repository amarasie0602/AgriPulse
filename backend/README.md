# AgriPulse — Backend

Express + MongoDB (Mongoose) API for the AgriPulse authentication stage. Part of the MERN stack alongside `../frontend`.

## Stack

Node.js · Express · TypeScript · MongoDB · Mongoose · JWT (`jsonwebtoken`) · bcryptjs · Zod

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

`env.ts` validates these at startup with Zod and exits with a clear message if any are missing or invalid.

## API

See [`../docs/BACKEND_INTEGRATION.md`](../docs/BACKEND_INTEGRATION.md) for the full request/response contract (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`) and the status-to-message table the frontend relies on.

## Project structure

```
backend/src/
├── server.ts              Connects to MongoDB, then starts the HTTP server
├── app.ts                 Express app: helmet, CORS, JSON parsing, routes, error handling
├── config/
│   ├── env.ts               Validates and exposes environment variables
│   └── database.ts          Mongoose connect/disconnect
├── modules/auth/
│   ├── user.model.ts          Mongoose User schema
│   ├── auth.validation.ts     Zod request schemas (register/login)
│   ├── auth.service.ts        Hashing, JWT signing, database access
│   ├── auth.controller.ts     Express request handlers
│   ├── auth.routes.ts         Route table + rate limiting
│   └── auth.types.ts
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

## Adding role-based access later

Roles (`FARMER`, `ADMIN`, `ANALYST`) already exist on the `User` model and in the JWT payload. Guard a new route with:

```ts
router.get('/admin', requireAuth, requireRole('ADMIN'), handler);
```
