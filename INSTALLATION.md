# Mooncrafts — Installation Guide

Step-by-step setup for running this project after cloning it from GitHub. The repo has two parts:

- `mooncraft-backend` — Node.js/Express API (MySQL database)
- `mooncraft-jewelry` — Angular frontend

## Prerequisites

Install these before you start:

| Tool | Version | Check with |
|------|---------|------------|
| [Node.js](https://nodejs.org/) | v20 LTS or later | `node -v` |
| [Git](https://git-scm.com/) | any recent version | `git --version` |
| [MySQL Server](https://dev.mysql.com/downloads/) | 8.x | `mysql --version` |
| Angular CLI | matches Angular 21 | `npm install -g @angular/cli` |

## 1. Clone the repository

```bash
git clone https://github.com/hussainofficial/mooncrafts.git
cd mooncrafts
```

## 2. Backend setup (`mooncraft-backend`)

```bash
cd mooncraft-backend
npm install
```

### 2.1 Create the database

Open MySQL (Workbench, CLI, or any client you use) and run the SQL files **in this exact order** — later files alter tables created by earlier ones:

```bash
mysql -u root -p < DATABASE_SETUP.sql
mysql -u root -p < DATABASE_MIGRATION_PHASE2.sql
mysql -u root -p < DATABASE_MIGRATION_PRODUCTS.sql
mysql -u root -p < DATABASE_MIGRATION_MATERIALS.sql
mysql -u root -p < DATABASE_MIGRATION_MATERIAL_SUPPORT.sql
mysql -u root -p < DATABASE_MIGRATION_DISPLAY_FLAGS.sql
mysql -u root -p < DATABASE_MIGRATION_IMAGE_FIX.sql
mysql -u root -p < DATABASE_MIGRATION_LOCATIONS.sql
mysql -u root -p < DATABASE_MIGRATION_ORDERS.sql
mysql -u root -p < DATABASE_MIGRATION_PAYMENT_TABLES.sql
mysql -u root -p < CREATE_ADMIN_USER.sql   # optional: creates admin@mooncraft.com / Admin@123
```

(Or open each file in MySQL Workbench with **File → Open SQL Script** and execute in the same order.)

### 2.2 Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your own values:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mooncraft_jewelry
DB_PORT=3306

PORT=5000
NODE_ENV=development

JWT_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:4200
```

> **Security note:** `.env.example` currently contains a real-looking MySQL password from earlier development. It's excluded from git now, but since it was pushed to GitHub before, treat that password as compromised — change it on your MySQL server and use a fresh `JWT_SECRET`/`JWT_REFRESH_SECRET` (never reuse example values).

### 2.3 Start the backend

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

Leave this terminal running.

## 3. Frontend setup (`mooncraft-jewelry`)

Open a **new terminal**:

```bash
cd mooncrafts/mooncraft-jewelry
npm install
ng serve
```

Visit **http://localhost:4200** — the site should load and talk to the backend at `http://localhost:5000` automatically (the API URL is hardcoded per-service, e.g. `mooncraft-jewelry/src/app/core/services/auth.service.ts`).

## 4. Verify everything works

- Backend: `http://localhost:5000/api/v1/auth/me` should respond (401 without a token is expected — it confirms the server is up).
- Frontend: homepage loads at `http://localhost:4200` with no console errors.
- Try registering a user or logging in as admin (`admin@mooncraft.com` / `Admin@123`, if you ran `CREATE_ADMIN_USER.sql`) — change this password immediately after first login.

## Troubleshooting

- **`ECONNREFUSED` / DB connection errors**: confirm MySQL is running and `.env` credentials match your local MySQL user/password.
- **Port already in use**: change `PORT` in `.env` (backend) or run `ng serve --port 4300` (frontend), and update `CORS_ORIGIN` / `API_URL` to match.
- **CORS errors in browser console**: `CORS_ORIGIN` in `.env` must exactly match the URL the frontend runs on (protocol + host + port).
- **`ng` not recognized**: install the Angular CLI globally with `npm install -g @angular/cli`.
