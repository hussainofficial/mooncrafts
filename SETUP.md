# MOONCRAFT — Setup & Deployment Guide

This repo contains two projects:

- `mooncraft-backend/` — Node.js + Express REST API, MySQL database
- `mooncraft-jewelry/` — Angular 21 frontend (public storefront + admin dashboard)

## Architecture

```
Browser
  │
  ├─▶ https://sufiinfotech.in/           → nginx serves static Angular build
  │                                        (/var/www/html/mooncraft)
  │
  └─▶ https://sufiinfotech.in/api/v1/...  → nginx reverse-proxies to
                                             http://localhost:5000 (Node/Express,
                                             managed by pm2), which talks to MySQL
```

The frontend is a **static build** — it is not served by `ng serve` in production.
It must be rebuilt and copied into place after every change (see Deploy section).

---

## 1. Local Development Setup

### Prerequisites
- Node.js v20+ (`node -v`)
- MySQL 8.0+
- npm

### Backend

```bash
cd mooncraft-backend
npm install
cp .env.example .env
# edit .env — set DB_USER/DB_PASSWORD to your local MySQL credentials,
# and generate real random values for JWT_SECRET / JWT_REFRESH_SECRET
```

Create the database and import the schema/seed data:

```bash
mysql -u root -p -e "CREATE DATABASE mooncraft_jewelry"
for f in mooncraft_jewelry_*.sql; do
  mysql -u root -p mooncraft_jewelry < "$f"
done
```

> The `mooncraft_jewelry_*.sql` files are full table dumps (schema + data) taken
> from the production DB at the time they were exported. They include real user
> records, password hashes and (now-expired-by-rotation) session tokens — treat
> a local DB seeded from them as sensitive, and rotate any credentials before
> using this data outside a private dev environment.

Run the backend:

```bash
npm run dev      # nodemon, auto-reload
# or
npm start        # plain node
```

API will be available at `http://localhost:5000/api/v1`. Health check:
`GET http://localhost:5000/api/health`.

### Frontend

```bash
cd mooncraft-jewelry
npm install
npm start         # ng serve, http://localhost:4200
```

`src/environments/environment.ts` already points at `http://localhost:5000/api/v1`
for local dev — no changes needed unless your backend runs on a different port.

### Default login

An admin user exists in the seeded DB dump (`mooncraft_jewelry_users.sql`) —
check that file directly for the account email, and reset its password via the
`/api/v1/auth` endpoints or directly in MySQL before relying on it, since the
password hash that ships in the dump should not be trusted as a known password.

---

## 2. Production Server Setup (what this server is currently running)

This describes the setup on the live server so it can be reproduced elsewhere.

### Stack
- **nginx** — reverse proxy + static file server, config at
  `/etc/nginx/sites-available/sufiinfotech.in` (symlinked into `sites-enabled/`)
- **pm2** — process manager keeping the Node backend alive across reboots/crashes
- **MySQL** — local instance, database `mooncraft_jewelry`
- **Let's Encrypt / certbot** — TLS certs for `sufiinfotech.in`

### One-time server setup

```bash
# System deps
sudo apt update && sudo apt install -y nginx mysql-server nodejs npm
sudo npm install -g pm2

# Clone the repo
git clone https://github.com/hussainofficial/mooncrafts.git /root/mooncrafts
cd /root/mooncrafts

# Backend
cd mooncraft-backend
npm install
cp .env.example .env   # then fill in real production values
mysql -u root -p -e "CREATE DATABASE mooncraft_jewelry"
for f in mooncraft_jewelry_*.sql; do mysql -u root -p mooncraft_jewelry < "$f"; done

# Start backend under pm2
pm2 start server.js --name mooncraft-backend
pm2 save
pm2 startup   # follow the printed instructions to enable pm2 on boot
```

### nginx site config (`/etc/nginx/sites-available/sufiinfotech.in`)

```nginx
server {
    server_name sufiinfotech.in www.sufiinfotech.in;

    root /var/www/html/mooncraft;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        client_max_body_size 50m;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/sufiinfotech.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sufiinfotech.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    if ($host = www.sufiinfotech.in) { return 301 https://$host$request_uri; }
    if ($host = sufiinfotech.in) { return 301 https://$host$request_uri; }
    listen 80;
    server_name sufiinfotech.in www.sufiinfotech.in;
    return 404;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sufiinfotech.in /etc/nginx/sites-enabled/
sudo certbot --nginx -d sufiinfotech.in -d www.sufiinfotech.in
sudo nginx -t && sudo systemctl reload nginx
```

### Deploying a frontend change (⚠️ required after every frontend edit)

The frontend is **not** served live from source — it's a static build. nginx
just serves whatever is sitting in `/var/www/html/mooncraft`. Forgetting this
step is why fixes can look "not deployed yet" even though the code is correct.

```bash
cd /root/mooncrafts/mooncraft-jewelry
npx ng build --configuration production

# back up the currently-live build first
TS=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/mooncrafts_deploy_backups/mooncraft_${TS}
cp -r /var/www/html/mooncraft/* /root/mooncrafts_deploy_backups/mooncraft_${TS}/

# replace the live build (clean first so stale hashed bundles don't linger)
rm -rf /var/www/html/mooncraft/*
cp -r dist/mooncraft-jewelry/browser/* /var/www/html/mooncraft/
```

### Deploying a backend change

The backend runs from source directly under pm2 — no build step, but pm2 must
be restarted to pick up code changes (it does **not** hot-reload):

```bash
cd /root/mooncrafts/mooncraft-backend
git pull
npm install   # only if package.json changed
pm2 restart mooncraft-backend
```

> This has bitten us before: editing `product.controller.js` on disk without
> restarting pm2 meant the live server kept running the old code from its
> in-memory module cache, so a fix looked like it "didn't work" until restart.

### Useful checks

```bash
pm2 list                        # is the backend up?
pm2 logs mooncraft-backend      # tail backend logs
curl http://localhost:5000/api/health
sudo nginx -t                   # validate nginx config before reload
sudo systemctl status nginx
```

---

## 3. Security notes

- `.env` files are gitignored and must never be committed — only `.env.example`
  (with placeholder values) is tracked.
- The `mooncraft_jewelry_*.sql` dumps in `mooncraft-backend/` contain real
  production data (user emails, password hashes, session tokens, order/payment
  records) as of the export date. This repo is **public** — if you're reading
  this after that data was committed, treat those credentials as compromised:
  rotate the MySQL password, invalidate/rotate JWT secrets, and force-expire
  refresh tokens server-side.
