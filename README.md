# E-Voting System

## Backend
```
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, FRONTEND_URL, JWT_SECRET
npm run dev             # or npm start in production
```
Runs on http://localhost:5000

**MongoDB transactions** (used when submitting a vote) require MongoDB to run as a **replica set**, not standalone.
- Locally: `mongod --replSet rs0`, then once, in `mongosh`, run `rs.initiate()`.
- MongoDB Atlas clusters are replica sets by default — no extra setup needed there.

Generate a strong `JWT_SECRET`:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Creating an admin
There's no public admin sign-up route on purpose. Instead, run the CLI script from inside `backend/`:
```
npm run create-admin
```
It prompts for username, email, password, and role (`admin` or `superadmin`), then inserts the account directly into the database.

## Frontend
```
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend's /api URL
npm run dev              # dev server
npm run build             # production build -> dist/
```
Dev server runs on http://localhost:5173

## How the flow works

**Voters**
1. Register at `/register` with a username, email and password — the backend auto-generates a `voterId` in the format `REG1001`, `REG1002`, etc.
2. Log in at `/login`.
3. Land on `/dashboard`, which shows their voter ID and any elections currently open.
4. Click "Vote" on an open election → cast one choice per post → confirm → submit.
5. After submitting, they're redirected straight back to `/dashboard` with a success message — **they never see live results**, per the intended flow.

**Admins**
1. Log in at `/admin/login` (account created via the CLI script above).
2. From `/admin/dashboard`: create a new election, add **all** its posts (President, Vice President, Secretary, Financial Secretary, Provost, Director, etc.) and candidates under each — this is only possible while the election is in `draft`.
3. Once you're done setting it up, open the election so it shows up on voters' dashboards. **Posts and candidates lock in place the moment an election is opened** — you can't add more afterward. This is intentional: if a post were added after some voters had already submitted their ballot, they'd be permanently locked out of voting on it (their one-time vote submission would already show as "voted" for that election). Finish the ballot before opening it; if you need to change it, create a fresh election instead.
4. "Manage / Results" on an election expands it to view live vote tallies (and add more posts/candidates, while still in draft).
5. "Close vote" ends the election — it stops appearing as open on voter dashboards.

## API overview
| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | — | Voter registration, returns a JWT + voterId |
| `POST /api/auth/login` | — | Voter login |
| `GET /api/voter/me` | voter | Own profile (voterId, username, email) |
| `GET /api/elections/open` | voter | List open elections + whether they've voted |
| `GET /api/elections/:id/ballot` | voter | Get positions/candidates for one open election |
| `POST /api/elections/:id/vote` | voter | Submit selections (transaction-protected, one-shot) |
| `POST /api/admin/auth/login` | — | Admin login |
| `GET/POST /api/admin/elections` | admin | List / create elections |
| `POST /api/admin/elections/:id/positions` | admin | Add a post to an election |
| `POST /api/admin/positions/:id/candidates` | admin | Add a candidate to a post |
| `PATCH /api/admin/elections/:id/open` | admin | Open an election for voting |
| `PATCH /api/admin/elections/:id/close` | admin | Close an election |
| `GET /api/admin/elections/:id/results` | admin | Vote tallies per candidate per post |

## Deploying
- **Database:** MongoDB Atlas — gives you a replica set automatically.
- **Backend:** Render or Railway. Build command `npm install`, start command `npm start`. Set `MONGO_URI`, `FRONTEND_URL`, `JWT_SECRET`, `NODE_ENV=production` as environment variables — never commit `.env`. Run `npm run create-admin` against the production database once, from your own machine with `MONGO_URI` pointed at it (or via the host's shell/console).
- **Frontend:** Vercel or Netlify, auto-detects Vite. Set `VITE_API_URL` to your deployed backend's `/api` URL.

## What's hardened for production
- `helmet` for security headers, `compression` for gzip
- CORS locked to `FRONTEND_URL` instead of `*`
- Rate limiting on register/login/vote endpoints
- Passwords hashed with bcrypt (`bcryptjs`, 12 salt rounds)
- JWT auth, separately scoped for voters vs admins, with role checks on admin routes
- Input sanitization against NoSQL injection (`express-mongo-sanitize`)
- Centralized error handler that hides internal error details in production
- Request validation (valid Mongo ObjectIds, password length, etc.) before hitting the DB
- Atomic, race-safe voter ID generation via a counter document
- Graceful shutdown on `SIGTERM`

## Still worth adding before a high-stakes real election
- Email verification on registration, and a password-reset flow
- An audit log of admin actions (who opened/closed which election)
- Automated backups of the MongoDB database
- Logging/monitoring (e.g. Sentry) so failures during the actual voting window get caught immediately
