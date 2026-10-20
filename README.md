# 🍔 FoodieHub — Full-Stack Food Ordering Platform

> **Academic Project — Design Assignment (DA3) on Automated Software Testing**  
> *A production-grade, test-automation-ready full-stack food delivery application with robust validation, transactional processing, and Selenium / Pytest test suites.*

---

## 📌 1. Project Overview & Architecture

**FoodieHub** is a full-stack web application architected specifically to support comprehensive software testing automation (End-to-End browser testing, boundary value testing, and integration testing).

### Architecture Highlights:
- **Zero Client-Side Trust:** All food prices, item availability, delivery charges, taxes (5% GST), and grand totals are authoritative and recalculated on the backend database. Client-supplied price tampering is strictly rejected.
- **Transactional Consistency:** Orders and order line items are created inside ACID database transactions with atomic rollback on failure. Historical snapshots of item names and prices are preserved in `order_items` for auditability.
- **Idempotency Protection:** Order requests support idempotency keys to safely prevent duplicate order creation upon retries.
- **Controlled Order Lifecycle:** State transitions follow a strict finite state machine:
  $$\text{PLACED} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PREPARING} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED}$$
  *(Direct jumps such as `PLACED` $\rightarrow$ `DELIVERED` are rejected with HTTP 400).*
- **Automation-Ready Frontend:** Every interactive element features unique, predictable `data-testid` attributes for Selenium and Cypress automation.

```
foodiehub/
├── frontend/               # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Navbar, FoodCard, Footer, ProtectedRoute
│   │   ├── context/        # AuthContext, CartContext (with localStorage persistence)
│   │   ├── pages/          # Home, Menu, Cart, Checkout, Confirmation, Orders, Login, Register
│   │   ├── services/       # Axios API client
│   │   └── types/          # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── backend/                # FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2
│   ├── app/
│   │   ├── api/v1/         # Health, Auth, Food, Orders, Payments
│   │   ├── core/           # Security (bcrypt, JWT), Config settings
│   │   ├── db/             # Database session, Alembic models, Seeding script
│   │   ├── models/         # User, Category, Food, Order, OrderItem
│   │   ├── schemas/        # Pydantic request/response schemas with boundary validators
│   │   └── main.py         # FastAPI application entrypoint
│   ├── alembic/            # Database migration versions
│   └── requirements.txt
├── tests/                  # Pytest + Requests + Selenium test automation suite
│   ├── api/                # API functional unit tests
│   ├── integration/        # Database integration and status transition tests
│   ├── e2e/                # Selenium browser automation test
│   ├── test_edge_cases.py  # Boundary values and security edge cases
│   └── conftest.py         # Pytest fixtures and test database isolation
├── reports/                # pytest-html test report output
├── docker-compose.yml      # PostgreSQL container configuration
└── README.md
```

---

## 🛠️ 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide React |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic Migrations |
| **Authentication** | Native Bcrypt password hashing, PyJWT (HMAC-SHA256) |
| **Database** | PostgreSQL 14+ (or SQLite test fallback) |
| **Test Automation** | Pytest, Selenium WebDriver (Headless Chrome), HTTPX / Requests, pytest-html |

---

## 🚀 3. Quick Start & Prerequisites

### Prerequisites
- **Python:** 3.11, 3.12, 3.13, or 3.14
- **Node.js:** v18+ or v20+ (with npm)
- **PostgreSQL:** Running locally on port `5432`, or Docker installed
- **Google Chrome:** For Selenium browser automation

---

## 📦 4. Installation & Setup

### Step 4.1: Clone & Setup Python Virtual Environment
```bash
# Navigate to project root
cd "Food ordering System"

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend and test dependencies
pip install -r backend/requirements.txt
```

### Step 4.2: Setup Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 🗄️ 5. PostgreSQL Database Setup

### Option A: Using Local PostgreSQL
Ensure PostgreSQL is active and create the development and test databases:
```bash
# Using psql command line
psql postgres -c "CREATE DATABASE foodiehub_dev;"
psql postgres -c "CREATE DATABASE foodiehub_test;"
```

### Option B: Using Docker Compose
```bash
docker compose up -d postgres
```

---

## 🔄 6. Database Migrations & Seeding

```bash
# 1. Run Alembic database migrations
source .venv/bin/activate
cd backend
alembic upgrade head
cd ..

# 2. Seed realistic food items, categories, and test accounts
PYTHONPATH=backend python3 backend/app/db/seed.py
```

### 👤 Demo Credentials Created by Seed Script:
| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@foodiehub.com` | `Password123!` | Standard customer ordering & history |
| **Customer 2** | `testuser@foodiehub.com` | `Password123!` | Secondary user for cross-user security checks |
| **Admin** | `admin@foodiehub.com` | `Admin123!` | Administrative privileges |

---

## 🏃 7. Running the Application Locally

### 1. Start the Backend API (FastAPI)
```bash
source .venv/bin/activate
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Redoc Documentation:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend (Vite + React)
In a separate terminal window:
```bash
cd frontend
npm run dev
```
- **Web App URL:** `http://localhost:5173`

---

## 🧪 8. Automated Testing Execution

The testing suite contains **45 comprehensive automated tests** organized into dedicated folders.

### Run All Tests & Generate HTML Report
```bash
source .venv/bin/activate
pytest tests/ -v --html=reports/test_report.html --self-contained-html
```
The test report is saved to `reports/test_report.html`.

### Run Specific Test Suites

#### 1. API Functional Tests
```bash
pytest tests/api/ -v
```

#### 2. Database Integration & State Lifecycle Tests
```bash
pytest tests/integration/ -v
```

#### 3. Boundary Values & Edge Case Tests
```bash
pytest tests/test_edge_cases.py -v
```

#### 4. Selenium E2E Browser Automation Test
*(Ensure both backend on port 8000 and frontend on port 5173 are running)*
```bash
pytest tests/e2e/test_selenium_e2e.py -v
```

---

## 🔍 9. Boundary Value & Edge Cases Tested

| # | Scenario / Edge Case | Expected System Behavior | Verified |
| :---: | :--- | :--- | :---: |
| 1 | Login with incorrect password | Returns `401 Unauthorized` | ✅ |
| 2 | Login with missing fields | Returns `422 Unprocessable Content` | ✅ |
| 3 | Registration with duplicate email | Returns `400 Bad Request` | ✅ |
| 4 | Registration with mismatched passwords | Returns `422` with validation error | ✅ |
| 5 | Registration with invalid email format | Returns `422` with email format error | ✅ |
| 6 | Unauthorized access to `/api/auth/me` | Returns `401 Unauthorized` | ✅ |
| 7 | Quantity = 0 | Returns `422` (Minimum permitted is 1) | ✅ |
| 8 | Quantity = -5 (Negative) | Returns `422` | ✅ |
| 9 | Quantity = 50 (Boundary Max) | Returns `201 Created` (Accepted) | ✅ |
| 10 | Quantity = 51 (Above Boundary Max) | Returns `422` (Maximum allowed is 50) | ✅ |
| 11 | Checkout with empty cart | Returns `400 Bad Request` | ✅ |
| 12 | Ordering sold-out / unavailable dish | Returns `400 Bad Request` | ✅ |
| 13 | Ordering nonexistent food ID | Returns `404 Not Found` | ✅ |
| 14 | Invalid PIN codes (`012345`, `12345`, `1234567`) | Returns `422` (Valid 6-digit Indian PIN) | ✅ |
| 15 | Invalid phone numbers (`123456789`, `5123456789`) | Returns `422` (10-digit Indian mobile) | ✅ |
| 16 | Cross-user order inspection (User B viewing User A's order) | Returns `403 Forbidden` | ✅ |
| 17 | Price manipulation in client request | Ignored; recalculates from DB | ✅ |
| 18 | Simulated payment failure toggle | Order marked `FAILED`/`CANCELLED` | ✅ |
| 19 | Duplicate order submission with identical idempotency key | Returns existing order without duplicating | ✅ |
| 20 | Invalid status transition (`PLACED` $\rightarrow$ `DELIVERED`) | Returns `400 Bad Request` | ✅ |

---

## 🎯 10. Selenium Test Selectors Reference

The frontend provides stable `data-testid` selectors across all pages:

| Element | Selector |
| :--- | :--- |
| **Navbar** | `[data-testid="navbar"]` |
| **Cart Count Badge** | `[data-testid="cart-count"]` |
| **Nav Links** | `[data-testid="nav-home"]`, `[data-testid="nav-menu"]`, `[data-testid="nav-orders"]` |
| **Auth Buttons** | `[data-testid="nav-login"]`, `[data-testid="nav-register"]`, `[data-testid="nav-logout"]` |
| **Hero Headline** | `[data-testid="hero-headline"]` |
| **Menu Search Input** | `[data-testid="menu-search-input"]` |
| **Food Card** | `[data-testid="food-card"]` |
| **Add to Cart Button** | `[data-testid="add-to-cart"]` |
| **Cart Page Container** | `[data-testid="cart-page"]` |
| **Checkout Button** | `[data-testid="checkout-button"]` |
| **Delivery Address Input** | `[data-testid="input-address"]` |
| **PIN Code Input** | `[data-testid="input-pincode"]` |
| **Phone Number Input** | `[data-testid="input-phone"]` |
| **Simulate Payment Failure Toggle** | `[data-testid="toggle-simulate-failure"]` |
| **Place Order Button** | `[data-testid="place-order"]` |
| **Order Confirmation Page** | `[data-testid="order-confirmation"]` |
| **Order ID Display** | `[data-testid="order-id"]` |
| **Order Status Badge** | `[data-testid="order-status"]` |
| **Error Alert Banner** | `[data-testid="error-message"]` |

---

## ❓ 11. Troubleshooting Common Errors

1. **`psycopg.OperationalError: connection failed`**
   - Verify PostgreSQL service is active: `pg_isready`
   - If using Docker: `docker compose up -d postgres`
   - Ensure the database `foodiehub_dev` exists: `psql postgres -c "CREATE DATABASE foodiehub_dev;"`

2. **Selenium Chrome Session Not Created**
   - Modern Selenium automatically downloads and manages `chromedriver` using `selenium-manager`.
   - Ensure Google Chrome is installed on the machine.

3. **CORS Errors During Frontend Development**
   - The Vite dev server (`vite.config.ts`) includes a proxy for `/api` pointing to `http://127.0.0.1:8000`. Keep this proxy enabled or ensure `allow_origins=["*"]` in FastAPI.

4. **Port 8000 or 5173 Already in Use**
   - Find and terminate existing processes:
     ```bash
     lsof -i :8000
     lsof -i :5173
     kill -9 <PID>
     ```
