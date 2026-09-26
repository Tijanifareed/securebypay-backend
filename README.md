# SecureByPay Backend

REST API for the SecureByPay platform — handles authentication, wallet management, and shipment tracking.

## Stack

- **Runtime:** Node.js 22
- **Framework:** Express 5
- **Language:** TypeScript 7
- **ORM:** Prisma 7 with SQLite (via `better-sqlite3`)
- **Auth:** JWT (access token: 15m, refresh token: 7d)
- **Deploy:** Fly.io

## Project Structure

```
src/
├── app.ts                  # Entry point, Express setup
├── config/
│   └── prisma.ts           # Prisma client singleton
├── controllers/
│   ├── auth.controller.ts
│   └── dashboard.controller.ts
├── middleware/
│   └── authenticate.ts     # JWT auth middleware
├── routes/
│   ├── auth.routes.ts
│   └── dashboard.routes.ts
├── services/
│   ├── auth.service.ts
│   └── dashboard.service.ts
└── generated/
    └── prisma/             # Generated Prisma client (git-ignored)
```

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Login and receive tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |

### Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Yes | Wallet, stats, and recent shipments |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |

## Getting Started

**1. Clone and install dependencies**

```bash
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
```

**3. Run database migrations**

```bash
npx prisma migrate dev
```

**4. Start the dev server**

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |

## Database

The project uses SQLite via Prisma. The schema defines three models:

- **User** — account with email, phone, and hashed password
- **Wallet** — one-to-one with User, holds a balance (NGN)
- **Shipment** — tracks package movements with status (`in-transit`, `delayed`, `delivered`, `paid`)

## Deployment (Fly.io)

**Prerequisites:** [flyctl](https://fly.io/docs/hands-on/install-flyctl/) installed and authenticated.

**First deploy:**

```bash
fly launch --name securebypay-backend --region iad --no-deploy
fly volumes create securebypay_data --region iad --size 1
fly secrets set DATABASE_URL="file:/data/prod.db" JWT_SECRET="..." JWT_REFRESH_SECRET="..."
fly deploy
```

**Subsequent deploys:**

```bash
fly deploy
```

The SQLite database is persisted on a Fly volume mounted at `/data`. Migrations run automatically on startup via `prisma migrate deploy`.
