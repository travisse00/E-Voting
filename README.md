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




## Frontend
```
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend's /api URL
npm run dev              # dev server
npm run build             # production build -> dist/
```
Dev server runs on http://localhost:5173

