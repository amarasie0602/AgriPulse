# AgriPulse

Smart Farm Sustainability & Resource Management Platform — built on the **MERN** stack (MongoDB, Express, React, Node.js).

| Folder      | Contents                                                        |
| ----------- | ----------------------------------------------------------------- |
| `frontend/` | React + Vite + TypeScript client (authentication stage)           |
| `backend/`  | Express + MongoDB (Mongoose) API — auth endpoints                 |
| `docs/`     | API contract shared by the frontend and backend                   |

## Quick start

```bash
# 1. Database — local MongoDB only, no hosted service
docker run -d --name agripulse-mongo -p 27017:27017 -v agripulse-mongo-data:/data/db mongo:7

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run dev          # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev           # http://localhost:5173
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for details, and [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) for the API contract.
