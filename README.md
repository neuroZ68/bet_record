# Bet Record (Prototype)

Prototype web app to track bettors' picks with verified historical records.

## Local setup

1) Install deps
- `npm install`
- `npm --prefix functions install`

2) Web app env
- Copy `.env.example` to `apps/web/.env.local`
- Fill in `VITE_FIREBASE_*` values from the Firebase console

3) Run web dev server
- `npm run dev:web`

## Firebase (prototype)

This repo includes Firestore rules and a basic Functions scaffold, but you still need to:
- Install the Firebase CLI (already in devDependencies): `npx firebase --version`
- `npx firebase login`
- `npx firebase init` (Firestore, Hosting, Functions)
- Create/select a Firebase project and set it in `.firebaserc`

## Data model (MVP)

- `bets/{betId}`
  - `userId`: string
  - `createdAt`: timestamp
  - `sport`: string
  - `league`: string
  - `event`: string
  - `pick`: string
  - `oddsDecimal`: number
  - `stake`: number
  - `status`: "pending" | "win" | "loss" | "push"
  - `settledAt`: timestamp | null

