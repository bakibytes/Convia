# Apna Video Call

A React and Express video-calling app with meeting chat, user registration and
login, and meeting history. The backend uses MongoDB and Socket.IO; the
frontend is built with Vite.

## Requirements

- Node.js 20.19 or newer
- npm
- A MongoDB connection string (for example, a MongoDB Atlas database)

## Run locally

1. Create `backend/.env` from `backend/.env.example` and set `MONGO_URI` to
   your MongoDB connection string.
2. Create `frontend/.env` from `frontend/.env.example`. The default backend URL
   is suitable when running both apps locally.
3. In a terminal, run the backend:

   ```sh
   cd backend
   npm ci
   npm run dev
   ```

4. In another terminal, run the frontend:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

Open the frontend URL printed by Vite (usually `http://localhost:5173`). The
backend health endpoint is available at `/health`.

## Deploy

Deploy the backend as a Node.js web service and the frontend as a static site.
Keep both directories as their respective project roots:

| Service | Build/install command | Start command or output |
| --- | --- | --- |
| Backend | `npm ci` | `npm start` |
| Frontend | `npm ci && npm run build` | Publish the `dist` directory |

Set these environment variables in the hosting provider's dashboard (do not
commit real values):

| Service | Variable | Value |
| --- | --- | --- |
| Backend | `MONGO_URI` | MongoDB connection string; make sure the database user and network access are configured |
| Backend | `CLIENT_URL` | Public origin of the deployed frontend, such as `https://your-app.example.com` |
| Backend | `PORT` | Usually supplied by the backend host; otherwise defaults to `8080` |
| Frontend | `VITE_SERVER_URL` | Public backend origin, without a trailing slash |

After setting the public frontend URL, redeploy the backend. Then build and
deploy the frontend with the public backend URL configured. Enable SPA fallback
on the static host so application routes such as `/auth` and meeting URLs serve
`index.html`. Both services must use HTTPS in production for browser camera,
microphone, and screen-sharing permissions.

## Checks

- Frontend: `npm run lint` and `npm run build` from `frontend/`
- Backend: `npm start` from `backend/` (requires a reachable `MONGO_URI`)
