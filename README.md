# AgriPulse

Smart Farm Sustainability & Resource Management Platform - built on the **MERN** stack (MongoDB, Express, React, Node.js).

| Folder | Contents |
| --- | --- |
| `frontend/` | React + Vite + TypeScript client |
| `backend/` | Express + MongoDB (Mongoose) API |
| `docs/` | API contract shared by the frontend and backend |

## Run the full app with Docker Compose (Windows PowerShell)

MongoDB, the API, and the frontend run locally as a Compose stack. MongoDB data is kept in the `mongo-data` Docker volume.

```powershell
# From D:\AgriPulse. Create the root environment file only if it does not exist.
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Set `JWT_SECRET` in the root `.env` to a strong random value. Generate one with:

```powershell
node -p "require('crypto').randomBytes(48).toString('hex')"
```

Paste the generated value after `JWT_SECRET=` in `.env`, then build and start the stack:

```powershell
docker compose up --build -d
docker compose ps
```

Open the Docker frontend at <http://localhost:5174>. Port 5173 remains available for the Vite development server. The API is at <http://localhost:3000> and its health endpoint is <http://localhost:3000/health>. The browser calls that API URL directly; the backend reaches MongoDB at `mongodb://mongo:27017/agripulse` over Compose's private network. Do not launch the backend image alone, because it needs Compose to provide its configuration and database.

Useful commands:

```powershell
docker compose logs -f backend
docker compose logs -f mongo
docker compose down
```

`docker compose down` keeps the MongoDB volume. Do not add `-v` unless you intend to delete the local database.

## Run for local development without the frontend container

The API's `backend/.env` uses `127.0.0.1:27017` for a locally reachable MongoDB. Set a private `JWT_SECRET` there. Start MongoDB locally (for example, with `docker run -d --name agripulse-mongo -p 27017:27017 -v agripulse-mongo-data:/data/db mongo:7`), then run `npm ci` and `npm run dev` from `backend/`. In a second terminal, run `npm ci` and `npm run dev` from `frontend/`; its `.env` should set `VITE_API_URL=http://localhost:3000`. The frontend dev server is at <http://localhost:5173>.

See [`backend/README.md`](backend/README.md), [`frontend/README.md`](frontend/README.md), and [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) for additional details.
