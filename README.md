Digital Guide (Full-Stack) – Setup, Scripts, and Feature Guide
===============================================================

This repository contains a full-stack learning app that simulates common digital literacy flows (e.g., UPI/PhonePe-like send money, ordering food, booking tickets) with a React frontend and a Node/Express/MongoDB backend.

What’s included
---------------
- Frontend: React SPA (in `frontend/`) with flows like PhonePe, GPay, Paytm, Order Food, Book Tickets, etc.
- Backend: Express API (in `backend/`) with MongoDB persistence for users, preferences, practice logs, and dynamic transaction history.
- Auth: Email/password auth with JWT.
- i18n: Language selection and voice guidance.
- Transaction History: Persisted to MongoDB when logged in; falls back to localStorage if offline/not logged in. Global History page and in-flow History.

Quick start
-----------

Prerequisites
- Node.js 16+ (LTS recommended)
- MongoDB running locally or a MongoDB URI

1) Backend
```
cd backend
npm install
# .env (create if needed)
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/digital_guide
# JWT_SECRET=dev_secret
npm start
```
The backend exposes the API at `http://localhost:5000/api`.

2) Frontend
```
cd frontend
npm install
# .env (create if needed)
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```
The frontend runs on `http://localhost:3000`.

Project structure
-----------------
```
backend/
  src/
    middleware/auth.js         # JWT auth middleware
    models/
      User.js                  # Users
      PracticeLog.js           # Practice mode logs
      Transaction.js           # Transaction history entries
    routes/
      auth.js                  # Register/Login/Me
      app.js                   # Prefs, Practice, Transactions
    server.js                  # Express app & Mongo connection

frontend/
  src/
    components/                # Layout, Language selector
    contexts/                  # AuthContext, LanguageContext
    pages/                     # App pages and flows
      PhonePeFlow.js           # Rich PhonePe-like flow
      History.js               # Global History page
      Home.js                  # Home with deep links
    services/
      api.js                   # API client
      voice.js, validation.js
    App.js, index.js           # Routing/bootstrap
```

Key features and flows
----------------------

Authentication
- Register and login via `POST /api/auth/register` and `POST /api/auth/login`.
- `AuthContext` stores token in `localStorage` (`dg_token`) and hydrates on app load.

User Preferences
- `GET /api/prefs` / `POST /api/prefs` to read/update language and tutorial completion.

Practice Logs
- `POST /api/practice` records simulated actions when the user is logged in.
- `GET /api/practice` fetches recent practice logs.

Transactions & History (dynamic)
- Model: `backend/src/models/Transaction.js`
- Endpoints (JWT required):
  - `POST /api/transactions` – create an entry with `{ type, name, number, amount, status?, meta? }`.
  - `GET /api/transactions?limit=50` – latest transactions for the current user.
- Frontend client methods: `api.createTransaction`, `api.getTransactions`.
- Where history is created: payments in `PhonePeFlow.js` call `api.createTransaction` and also cache to localStorage for fallback.
- Where history is shown:
  - In-flow History screen (step 22) inside `PhonePeFlow.js`.
  - Global `History` page (`/history`) combines server items, local history snapshot, and recents for the UI.

PhonePe-like Flow highlights
- Send to contacts or number, enter amount, PIN modal simulation, success views.
- After payment:
  - Transaction is stored (server if logged in, local always for UX).
  - App returns to PhonePe Home (step 0).
- Bottom navigation deep links from History page back to specific PhonePe screens via query param `step`:
  - Home: `/send-money/phonepe?step=0`
  - Search: `/send-money/phonepe?step=23`
  - Scan: `/send-money/phonepe?step=10`
  - Alerts: `/send-money/phonepe?step=24`
- History item deep links:
  - Open chat view: `/send-money/phonepe?chat=1&name=<n>&number=<digits>`
  - Open detailed receipt: `/send-money/phonepe?detail=1&type=<paid|received|failed>&name=<n>&number=<digits>&amount=<amt>`

Environment variables
---------------------

Backend `.env` (or environment)
- `PORT` – defaults to `5000`
- `MONGO_URI` – defaults to `mongodb://localhost:27017/digital_guide`
- `JWT_SECRET` – defaults to `dev_secret`

Frontend `.env`
- `REACT_APP_API_URL` – API base, e.g. `http://localhost:5000/api`

Development tips
----------------
- If history appears empty, confirm:
  - You are logged in (for server-side history); fallback still uses localStorage.
  - `REACT_APP_API_URL` points to your backend.
  - MongoDB is running and reachable.
- The UI intentionally mirrors popular app designs; all money movement is simulated and safe.

Scripts
-------

Backend
```
npm start           # start dev server on PORT
```

Frontend
```
npm start           # run React app at http://localhost:3000
```

License
-------
For learning and demonstration. No real transactions are made.
- Duplicate import errors: ensure each symbol is imported once per file
- Manifest icon warnings: icons are embedded as data URLs in `public/manifest.json`
- After manifest changes, hard refresh (Ctrl+F5)

## License
Educational/demo use.
