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

Feature overview (current)
--------------------------

Core app
- Home dashboard (`/home`) with quick links to Send Money, Book Tickets, Order Food, Learn/Practice, and History.
- Top navigation with persistent language selector and logout.

Authentication & preferences
- Register/Login with JWT.
- Remembered session via `localStorage` + token verification on app boot.
- User preferences API for language and tutorial completion.

PhonePe-like Send Money flow (`/send-money/phonepe`)
- To Mobile Number: contact search, verification, chat-like UI, amount entry, simulated UPI PIN, success UI.
- To Bank & Self A/c: bank transfer options UI (Self Bank Account, Account Number & IFSC, UPI/Number link).
- QR Scan Mock (step 10) and Alerts/Search screens.
- Invite & Refer screen with share entry points and suggested contacts.
- Bottom navigation (Home/Search/Scan/Alerts/History) and deep-link support via query params (`step`, `chat`, `detail`).
- After payment: transaction is saved (server + local), and the flow returns to PhonePe Home.

Dynamic transaction history
- Server persistence: `POST /api/transactions`, `GET /api/transactions` for logged-in users.
- Local fallback: writes to `localStorage` (`phonepe_history`, `phonepe_last_payment`) for instant UX.
- PhonePe in-flow History (step 22): merges server items + local snapshot + recents; relative times.
- Global History page (`/history`): same UI as in-flow History; clickable rows deep-link back to PhonePe:
  - Open chat: `/send-money/phonepe?chat=1&name=<n>&number=<digits>`
  - Open details: `/send-money/phonepe?detail=1&type=<paid|received|failed>&name=<n>&number=<digits>&amount=<amt>`
- From History page bottom nav, jump back to PhonePe tabs via `step` param.

Other flows
- GPay (`/send-money/gpay`) and Paytm (`/send-money/paytm`) mock flows.
- Food ordering (simulated end-to-end):
  - Swiggy (`/order-food/swiggy`), Zomato (`/order-food/zomato`), Blinkit (`/order-food/blinkit`), Dominos (`/order-food/dominos`).
  - Add items to cart, view totals, provide address, and place order → success page.
  - Designed to mimic real app flows for guided learning; no real orders are placed.
- Booking tickets (simulated):
  - Movies (`/book-tickets/movies`), Train (`/book-tickets/train`), Bus (`/book-tickets/bus`), Flights (`/book-tickets/flights`).
  - Select category, proceed through basic steps, and land on a success/confirmation page.

Learn/Practice
- Practice page to safely simulate sending money without real transactions, with optional logging via backend (`/api/practice`).
  - Route: `/practice`
  - Enter an amount and a PIN to simulate a transfer; no real transaction occurs.
  - If logged in, a practice log is stored via `POST /api/practice` and viewable via `GET /api/practice`.
  - Use this mode to learn UPI concepts without affecting the dynamic history used by PhonePe flow.

Internationalization & Voice
- Language selection via `LanguageContext` and `i18n` helpers.
- Voice prompts via `services/voice` (with Telugu voice handling).

Accessibility & UX
- Keyboard and touch-friendly components.
- Clear visual hierarchy and large tap targets.
- Phone-like UI styling to mirror real-world apps for learning.

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
 - Clicking a contact/recent opens the amount entry screen directly for fast payments.

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

# Digital Guide - Learn Digital Services

A simple full-stack learning app. The frontend (React) simulates common digital payment flows (PhonePe, Google Pay, Paytm). The backend (Node/Express) provides basic scaffolding for auth and practice logs.

## Features
- Send Money practice flows with step-by-step guidance
  - PhonePe, Google Pay, Paytm
  - Mobile/UPI input validation (strict handle whitelist)
  - Recipient confirmation, amount entry with numeric keypad
  - UPI PIN modal validation (digits only; 4 or 6)
- Food ordering practice flows
  - Swiggy, Zomato, Domino's (DominosFlow), generic Order Food (OrderFood, FoodOrderSelect)
- Shopping and delivery practice
  - BlinkitFlow
- Ticket booking and travel
  - BookTickets, BookTicketsSelect, TrainFlow, BusFlow, FlightsFlow, MoviesFlow
- Money transfer entry points
  - SendMoney, SendMoneySelect
- App-level utilities
  - Language selection (ChooseLanguage), multi-language i18n and voice prompts
  - Help page (Help) and practice page (Practice)
  - Home and Login pages
- UI/UX elements
  - Icon-driven cards, grid keypads, QR scanner mock, contacts grid picker
  - Simple, readable styling and transitions

## Tech Stack
- Frontend: React (Context API), CSS
- Backend: Node.js, Express

## Project Structure
```
backend/
  src/
    middleware/
    models/
    routes/
    server.js
frontend/
  public/
    index.html
    manifest.json
  src/
    pages/
    services/
    contexts/
    i18n.js
    App.js
    index.js
    index.css
```

## Getting Started
### Backend
```
cd backend
npm install
npm start
```

### Frontend
```
cd frontend
npm install
npm start
```
The app runs at http://localhost:3000.

## Validation Details
Defined in `frontend/src/services/validation.js`:
- Mobile numbers: 10 digits starting with 6-9 (spaces/dashes ignored)
- UPI IDs: `local@handle` with a curated whitelist (e.g. ybl, okaxis, okhdfcbank, okicici, oksbi, paytm, upi, icici, axisbank, idfcbank, idfc, hdfcbank, kotak, sbi, yesbank, rbl, fbl, aubank, airtel, barodampay)
- UPI PIN: digits only; exactly 4 or 6

To modify allowed UPI handles, edit `UPI_HANDLES` in `validation.js`.

## Backend Endpoints (summary)
- `POST /auth/register`: create user (name, email, password, language)
- `POST /auth/login`: returns JWT token
- `GET /auth/me`: current user (requires auth)
- `GET /app/prefs`: fetch user preferences (requires auth)
- `POST /app/prefs`: update language (requires auth)
- `POST /app/practice`: log a practice action (requires auth)
- `GET /app/practice`: list recent practice logs (requires auth)

## Troubleshooting
- Duplicate import errors: ensure each symbol is imported once per file
- Manifest icon warnings: icons are embedded as data URLs in `public/manifest.json`
- After manifest changes, hard refresh (Ctrl+F5)

## License
Educational/demo use.
