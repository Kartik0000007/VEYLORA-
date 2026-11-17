# PLAN.md — Veylora: Production-Level Conversion

**Project:** Veylora — Curated Fashion Archive (Amazon.in Affiliate)  
**Root:** `C:\d drivee data\vibe coding\pinerest affiliate\veylora`  
**Status:** Basic static HTML/Tailwind site → Production full-stack with Admin Dashboard  
**Date:** 2026-11-17

---

## 1. EXECUTIVE SUMMARY

Your current site (`website/frontend/`) is 100% static HTML with products hardcoded in every page. There is no database, no backend, no admin panel, and no way to update content without editing HTML files.

This plan converts Veylora into a **production-level system**:

1. **Backend API** (Node.js + Express + PostgreSQL) — serves products, categories, settings
2. **Admin Dashboard** (separate folder at root) — login + CRUD for products/categories/settings
3. **Build Script** — fetches from API at deploy time and generates static JSON data files
4. **Website** — modified to load data from JSON files (no more hardcoded HTML products)
5. **CI/CD** (GitHub Actions) — on push to `main`, build runs, deploys to Vercel + Render/Railway

**Key constraint you confirmed:** Admin dashboard is a **separate folder at root level**, not inside `website/`.

---

## 2. PROBLEM WITH CURRENT FOLDER STRUCTURE

You ran: move all folders into `website/` — including `.git`.

Current state:
```
veylora/
├── website/
│   ├── .git/          <-- git repo lives HERE
│   ├── .agent/
│   ├── assets/
│   └── frontend/
├── admin-dashboard/   <-- NOT tracked by git
├── backend/           <-- NOT tracked by git
├── scripts/           <-- NOT tracked by git
├── .github/           <-- NOT tracked by git
└── README.md
```

**Problem:** Git only tracks `website/`. New folders (`admin-dashboard`, `backend`, `scripts`, `.github`) are invisible to git. CI/CD cannot deploy what git doesn't track.

**Fix (Phase 0):** Move `.git` back to root so the entire project is one repository:
```
veylora/
├── .git/              <-- git at ROOT (tracks everything)
├── website/
├── admin-dashboard/
├── backend/
├── scripts/
├── .github/
└── README.md
```

This is required before any CI/CD will work.

---

## 3. TECH STACK (CONFIRMED BY YOU)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Hosting — Website** | Vercel (free subdomain) | Static hosting, instant deploys, GitHub integration |
| **Hosting — Admin Dashboard** | Vercel (free subdomain) | Same as website, separate app |
| **Hosting — Backend API** | Render or Railway (free tier) | Node.js hosting, persistent PostgreSQL |
| **Database** | PostgreSQL | Relational — perfect for products ↔ categories |
| **Backend Language** | Node.js + Express | JavaScript everywhere, fast to build |
| **Frontend (website)** | Existing HTML + Tailwind + vanilla JS | Keep your design, load data via fetch |
| **Admin Dashboard** | Vanilla HTML/JS + Tailwind | No build step needed, deploys as static on Vercel |
| **CI/CD** | GitHub Actions | Auto-deploy on push to `main` |
| **Auth** | Simple username/password + JWT | One admin account, bcrypt password hash |
| **Build Method** | Static build at deploy time | `scripts/build.js` fetches API → writes JSON → website loads JSON |

---

## 4. DETAILED ARCHITECTURE

### 4.1 Data Flow (Admin Change → Website Update)

```
1. Admin logs into admin-dashboard (Vercel)
2. Admin adds/edits a product via API call → backend (Render/Railway)
3. Backend writes to PostgreSQL
4. Admin pushes code OR triggers webhook → GitHub Actions CI/CD
5. GitHub Actions runs `scripts/build.js`
6. Build script calls backend API → fetches all products/categories/settings
7. Build script writes JSON files to `website/frontend/data/`
8. GitHub Actions deploys `website/` to Vercel
9. Website loads `data/products.json` and renders product cards dynamically
```

### 4.2 Database Schema (PostgreSQL)

```sql
categories: id, name, slug, description, image_url, is_active, sort_order, created_at, updated_at
products:   id, category_id, name, slug, description, brand, price, original_price, currency, affiliate_url, image_url, is_active, is_featured, sort_order, created_at, updated_at
settings:   id, setting_key, setting_value, updated_at
admins:     id, username, email, password_hash, role, is_active, created_at, updated_at
```

### 4.3 API Endpoints (Backend)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/categories` | No | List active categories |
| GET | `/api/categories?active=false` | No | List all categories (admin) |
| GET | `/api/categories/:slug` | No | Get category by slug |
| POST | `/api/categories` | Yes (JWT) | Create category |
| PUT | `/api/categories/:id` | Yes (JWT) | Update category |
| DELETE | `/api/categories/:id` | Yes (JWT) | Delete category |
| GET | `/api/products` | No | List products (with filters) |
| GET | `/api/products?active=false` | Yes | List all products (admin) |
| GET | `/api/products/:slug` | No | Get product by slug |
| POST | `/api/products` | Yes (JWT) | Create product |
| PUT | `/api/products/:id` | Yes (JWT) | Update product |
| DELETE | `/api/products/:id` | Yes (JWT) | Delete product |
| GET | `/api/settings` | No | Get all site settings |
| PUT | `/api/settings/:key` | Yes (JWT) | Update setting |
| POST | `/api/auth/login` | No | Admin login (returns JWT) |
| GET | `/api/auth/me` | Yes | Verify token |

---

## 5. PHASE-BY-PHASE IMPLEMENTATION PLAN

### Phase 0 — Git & Repository Structure (Prerequisite)

**Goal:** Fix git location so all code is tracked.

Tasks:
1. Move `.git` from `website/` to root `veylora/`
2. Create `.gitignore` (node_modules, .env, .DS_Store, etc.)
3. Verify `git status` sees all folders: `website/`, `admin-dashboard/`, `backend/`, `scripts/`, `.github/`
4. Commit current state as baseline

Deliverable: Single git repo at root tracking everything.

---

### Phase 1 — Backend API + Database

**Goal:** Running API that serves products, categories, settings, and admin auth.

Tasks:
1. [ ] `backend/package.json` — Express, pg, cors, dotenv, bcryptjs, jsonwebtoken, helmet
2. [ ] `database/schema.sql` — Full schema (categories, products, settings, admins)
3. [ ] `backend/src/models/db.js` — PostgreSQL connection pool
4. [ ] `backend/src/middleware/auth.js` — JWT verification middleware
5. [ ] `backend/src/middleware/error.js` — Global error handler
6. [ ] `backend/src/controllers/categoryController.js` — CRUD categories
7. [ ] `backend/src/controllers/productController.js` — CRUD products
8. [ ] `backend/src/controllers/authController.js` — Login / verify
9. [ ] `backend/src/controllers/settingsController.js` — Site settings CRUD
10. [ ] `backend/src/routes/categories.js` — Category routes (public + admin)
11. [ ] `backend/src/routes/products.js` — Product routes (public + admin)
12. [ ] `backend/src/routes/auth.js` — Login route
13. [ ] `backend/src/routes/settings.js` — Settings routes
14. [ ] `backend/src/index.js` — Express app entry point
15. [ ] `.env.example` — Environment variables template
16. [ ] Test locally: `npm install && npm start` → `http://localhost:5000/api/health`

Deliverable: Backend running locally with seeded data (default admin: `admin` / `admin123`).

---

### Phase 2 — Admin Dashboard

**Goal:** Separate app at `admin-dashboard/` where you manage everything.

Tasks:
1. [ ] `admin-dashboard/index.html` — Auto-redirect (login or dashboard based on token)
2. [ ] `admin-dashboard/login.html` — Username/password login, stores JWT in localStorage
3. [ ] `admin-dashboard/dashboard.html` — Overview stats (product count, categories, featured)
4. [ ] `admin-dashboard/products.html` — Product list + add/edit/delete form
5. [ ] `admin-dashboard/categories.html` — Category list + add/edit/delete form
6. [ ] `admin-dashboard/settings.html` — Site settings editor (hero text, counts, etc.)
7. [ ] `admin-dashboard/src/js/api.js` — Fetch wrapper with JWT auth header
8. [ ] `admin-dashboard/src/js/auth.js` — requireAuth, getCurrentUser, logout helpers
9. [ ] All pages protected: redirect to login if no token
10. [ ] Test: login → add product → see it in dashboard list → edit → delete

Deliverable: Fully functional admin dashboard connected to backend API.

---

### Phase 3 — Connect Website to Backend

**Goal:** Website loads content dynamically instead of hardcoded HTML.

Tasks:
1. [ ] `scripts/build.js` — Node script that:
     - Calls `GET /api/categories?active=false`
     - Calls `GET /api/products?active=false`
     - Calls `GET /api/settings`
     - Writes JSON files to `website/frontend/data/`:
       - `data/categories.json`
       - `data/products.json`
       - `data/settings.json`
       - `data/category-{slug}.json` (one per category)
       - `data/featured.json`
2. [ ] `website/frontend/scripts/load-data.js` — Vanilla JS that:
     - Fetches `data/products.json` on page load
     - Renders product cards into the grid (replaces hardcoded HTML)
     - Filters by category when on category pages (men.html, women.html, etc.)
     - Reads `data/settings.json` for hero text, counts, etc.
3. [ ] Modify `website/frontend/index.html` — Remove hardcoded product cards, add container + script tag
4. [ ] Modify `website/frontend/men.html`, `women.html`, `clothing.html`, `footwear.html`, `accessories.html` — Same treatment
5. [ ] Modify `website/frontend/aesthetics.html`, `trending.html`, `style-edit.html` — Load category/aesthetic data from JSON
6. [ ] Keep Amazon.in affiliate links (from `affiliate_url` field in JSON)
7. [ ] Test locally: run backend → run build script → open website → products appear from API

Deliverable: Website renders all products/categories from JSON data files (no hardcoded HTML products).

---

### Phase 4 — CI/CD Pipeline

**Goal:** Any admin change → automatic website redeploy.

Tasks:
1. [ ] `.github/workflows/deploy.yml` — GitHub Actions workflow:
   - Trigger: push to `main`
   - Job 1: Build (`scripts/build.js`) — needs `API_BASE` secret pointing to Render/Railway backend
   - Job 2: Deploy website (`website/`) to Vercel
   - Job 3: Deploy admin-dashboard to Vercel
   - Job 4: Deploy backend to Render/Railway (optional, if backend code changed)
2. [ ] GitHub Secrets to configure:
   - `VERCEL_TOKEN` — Vercel API token
   - `VERCEL_ORG_ID` — Vercel organization ID
   - `VERCEL_PROJECT_ID_WEBSITE` — Website project ID
   - `VERCEL_PROJECT_ID_ADMIN` — Admin dashboard project ID
   - `RENDER_SERVICE_ID` / `RAILWAY_SERVICE_ID` — Backend service ID
   - `RENDER_API_KEY` / `RAILWAY_TOKEN` — Backend deploy token
   - `API_BASE` — Backend URL for build script
3. [ ] Set up Vercel projects:
   - Project 1: root directory = `website/`
   - Project 2: root directory = `admin-dashboard/`
4. [ ] Set up Render/Railway backend:
   - Connect GitHub repo
   - Root directory = `backend/`
   - Add PostgreSQL database
   - Set environment variables from `.env.example`
5. [ ] Test end-to-end: push to main → CI/CD runs → website updates

Deliverable: Automated pipeline. Push to `main` → backend + admin + website all deploy.

---

### Phase 5 — Production Hardening

**Goal:** Make it production-grade.

Tasks:
1. [ ] **Security:**
   - Change default admin password (`admin123`) immediately after first login
   - Add rate limiting on `/api/auth/login`
   - Add input validation (express-validator) on all POST/PUT endpoints
   - Set `NODE_ENV=production` on Render/Railway
   - Enable HTTPS everywhere (Vercel + Render provide this automatically)
2. [ ] **Performance:**
   - Compress JSON responses (gzip)
   - Add image optimization (serve via Vercel Image Optimization or Cloudinary)
   - Add loading states to website JS
3. [ ] **Error Handling:**
   - Website shows graceful fallback if JSON fetch fails
   - Backend returns proper HTTP status codes (400, 401, 404, 500)
4. [ ] **Database:**
   - Add migrations folder for future schema changes
   - Set up PostgreSQL backups on Render/Railway
5. [ ] **Monitoring:**
   - Add health check endpoint (already in `/api/health`)
   - Set up uptime monitoring (free: UptimeRobot or similar)

Deliverable: Production-ready, secure, monitored system.

---

## 6. FINAL FOLDER STRUCTURE

```
veylora/                              (git repo root)
├── .git/
├── .github/
│   └── workflows/
│       └── deploy.yml                (CI/CD)
├── .gitignore
├── .env.example
├── PLAN.md
├── README.md
├── database/
│   └── schema.sql                    (PostgreSQL schema)
├── scripts/
│   └── build.js                      (static build: API → JSON)
├── backend/                          (Node.js + Express API)
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── models/
│       │   └── db.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── categories.js
│       │   ├── products.js
│       │   └── settings.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── categoryController.js
│       │   ├── productController.js
│       │   └── settingsController.js
│       └── middleware/
│           ├── auth.js
│           └── error.js
├── admin-dashboard/                  (Separate app, NOT inside website/)
│   ├── index.html                    (redirect login/dashboard)
│   ├── login.html
│   ├── dashboard.html
│   ├── products.html
│   ├── categories.html
│   ├── settings.html
│   └── src/
│       ├── js/
│       │   ├── api.js
│       │   └── auth.js
│       └── css/
├── website/                          (Main public site)
│   ├── .agent/
│   ├── assets/
│   └── frontend/
│       ├── index.html
│       ├── men.html
│       ├── women.html
│       ├── clothing.html
│       ├── footwear.html
│       ├── accessories.html
│       ├── aesthetics.html
│       ├── trending.html
│       ├── style-edit.html
│       ├── search.html
│       ├── search-empty.html
│       ├── partials/
│       │   ├── header.html
│       │   ├── footer.html
│       │   └── ...
│       ├── scripts/
│       │   ├── generate-pages.mjs
│       │   └── load-data.js          (NEW — loads JSON data)
│       └── data/                     (GENERATED at build time)
│           ├── categories.json
│           ├── products.json
│           ├── settings.json
│           ├── featured.json
│           └── category-*.json
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 7. CI/CD WORKFLOW DETAIL

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Veylora

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node scripts/build.js
        env:
          API_BASE: ${{ secrets.API_BACKEND_URL }}
      - run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add website/frontend/data/
          git commit -m "chore: regenerate static data" || true
          git push

  deploy-website:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEBSITE }}
          working-directory: ./website

  deploy-admin:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_ADMIN }}
          working-directory: ./admin-dashboard

  deploy-backend:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Secrets You Must Add in GitHub

| Secret | Description | Example Value |
|--------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token | From Vercel account settings → Tokens |
| `VERCEL_ORG_ID` | Vercel org ID | From Vercel dashboard |
| `VERCEL_PROJECT_ID_WEBSITE` | Website project ID | From Vercel project settings |
| `VERCEL_PROJECT_ID_ADMIN` | Admin project ID | From Vercel project settings |
| `API_BACKEND_URL` | Backend URL for build script | `https://veylora-api.onrender.com` |
| `RENDER_DEPLOY_HOOK` | Render deploy hook URL | From Render service settings |

---

## 8. HOW ADMIN CHANGES REFLECT ON WEBSITE (CI/CD Loop)

```
Scenario: You add a new product in Admin Dashboard

1. You open https://admin-dashboard.vercel.app → login
2. Go to Products → Add Product → fill name, price, Amazon.in link, image
3. Click Save → API call to backend → PostgreSQL updated
4. You go to GitHub repo → push any change (or set up a webhook)
5. GitHub Actions triggers:
   - `scripts/build.js` runs → fetches all products from backend → writes `website/frontend/data/products.json`
   - Commits new JSON files to repo
   - Deploys `website/` to Vercel
6. Visitors open https://veylora.vercel.app
7. Website loads `data/products.json` → new product appears automatically
```

**Timing:** Typically 2–5 minutes from admin save to live website.

---

## 9. RISKS & MITIGATION

| Risk | Mitigation |
|------|-----------|
| `.git` was inside `website/` | Move to root in Phase 0 |
| Backend goes down (free tier sleeps) | Website shows cached JSON; admin shows error |
| Default password `admin123` | Change immediately after first login |
| JSON build fails | CI/CD fails, website keeps last good deploy |
| CORS blocking admin → backend | Set `CORS_ORIGIN` env var on backend |
| Free subdomain limits | Works fine for start; add custom domain later |

---

## 10. TESTING CHECKLIST (Before Launch)

- [ ] Admin login works with `admin` / `admin123`
- [ ] Add product → appears in dashboard product list
- [ ] Edit product → changes reflect in list
- [ ] Delete product → removed from list
- [ ] Add category → appears in category list
- [ ] Update site setting (hero text) → saved
- [ ] Run `scripts/build.js` → JSON files generated correctly
- [ ] Website loads products from JSON (not hardcoded HTML)
- [ ] Website category pages filter correctly
- [ ] Push to `main` → GitHub Actions deploys to Vercel
- [ ] Live website shows latest admin changes

---

## 11. IMMEDIATE NEXT STEPS (What I Build First)

1. **Phase 0:** Fix git root location
2. **Phase 1:** Backend API + PostgreSQL schema
3. **Phase 2:** Admin Dashboard
4. **Phase 3:** Build script + website JSON loading
5. **Phase 4:** CI/CD pipeline

Ready to start? I'll begin with Phase 0 (git fix) and Phase 1 (backend).