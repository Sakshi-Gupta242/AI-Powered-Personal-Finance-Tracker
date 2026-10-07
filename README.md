# AI-Powered Personal Finance Tracker and Smart Budgeting System

> **Tagline:** *“Track. Analyze. Predict. Save.”*  
> **A complete, production-ready full-stack AI/ML college mini project & portfolio application.**

---

## 📌 1. Project Overview

The **AI-Powered Personal Finance Tracker and Smart Budgeting System** is an end-to-end web platform designed to help users track daily income and expenditures in Indian Rupee (**₹ INR**), enforce smart category budgeting, and leverage **Machine Learning (Scikit-Learn)** to predict future expenses and automatically categorize transaction descriptions.

### Core Philosophy
* **100% Free & Realistic:** Zero reliance on paid third-party AI APIs (OpenAI/Gemini API keys not needed). Uses local Python **Scikit-Learn** models for instant predictions.
* **Production-Grade Relational Architecture:** MySQL database schema with SQLAlchemy ORM, indexed queries, cascading foreign keys, and secure JWT authentication.
* **Modern Interactive UI:** Responsive React 18 dashboard built with Vite, Tailwind CSS, Recharts visual analytics, and Lucide glyphs.

---

## ✨ 2. Key Features

| Feature | Description | Technology / Model |
| :--- | :--- | :--- |
| **Linear Regression Expense Prediction** | Analyzes multi-month historical spending sequence and predicts expected expense for the upcoming month with trend velocity (slope). | Scikit-Learn `LinearRegression` (OLS) |
| **Smart Category Auto-Detection** | Detects category (Food, Travel, Shopping, Bills, etc.) live as you type descriptions like *"Domino's Pizza"* or *"Uber ride"*. | Scikit-Learn `TfidfVectorizer` + `LogisticRegression` |
| **Smart Budget Guard** | Set monthly category thresholds with automated **80% warnings** and **100% overspending critical alerts**. | Dynamic variance engine |
| **Spending Telemetry & Analytics** | Interactive graphs for Monthly Inflow vs Outflow, Category Donut breakdown, and Weekly Velocity. | Recharts + Pandas aggregations |
| **Personalized AI Savings Engine** | Computes savings rate, detects month-over-month surges, and calculates annual compounding savings. | Statistical Reasoning Rules + 50/30/20 Rule |
| **Executive Monthly Reports & PDF** | Detailed monthly statements with category distributions and 1-click downloadable vector PDF statements. | ReportLab + Browser Print Styles |
| **1-Click Viva Demo Seeder** | Instant pre-population of 70+ realistic multi-month Indian Rupee transactions for demonstration. | Automated Seed Engine |

---

## 🛠️ 3. Technology Stack

### Frontend
* **React.js 18** (Vite SPA)
* **Tailwind CSS 3** (Modern responsive dark/light slate theme)
* **Recharts** (Interactive SVG graphs & donut charts)
* **Lucide React** (Vector iconography)
* **React Router DOM 6** (Protected client-side navigation)

### Backend & Machine Learning
* **Python 3.10+ / Flask 3.x**
* **Flask-SQLAlchemy 3.x** (ORM)
* **PyMySQL & Cryptography** (MySQL connector)
* **PyJWT & Werkzeug** (JWT token handling and password hashing)
* **Scikit-Learn 1.4+** (`LinearRegression`, `TfidfVectorizer`, `LogisticRegression`)
* **Pandas & NumPy** (Time-series data processing & aggregations)
* **ReportLab** (Dynamic financial PDF generation)

### Database
* **MySQL 8.0+** (Production) / **SQLite** (Zero-config local fallback)

---

## 📂 4. Project Structure

```
finance-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Responsive header with branding & quick actions
│   │   │   ├── Sidebar.tsx            # Sidebar navigation & ML badge
│   │   │   ├── MetricCard.tsx         # KPI cards with ₹ INR currency formatting
│   │   │   ├── TransactionModal.tsx   # Add/Edit modal with AI auto-category button
│   │   │   ├── BudgetModal.tsx        # Set/Edit budget limits modal
│   │   │   ├── LoadingSpinner.tsx     # Loading animation
│   │   │   ├── EmptyState.tsx         # Empty data states
│   │   │   └── ProtectedRoute.tsx     # JWT authentication route guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # Global JWT auth, user state, login/register/seed
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # High-conversion modern landing page
│   │   │   ├── LoginPage.tsx          # Login with 1-Click Demo Account fill
│   │   │   ├── RegisterPage.tsx       # User registration with validation
│   │   │   ├── DashboardPage.tsx      # KPI cards, 4 Recharts, AI callouts, recent logs
│   │   │   ├── AddTransactionPage.tsx # Form with live AI category detector
│   │   │   ├── TransactionsPage.tsx   # Search, filters, date range, pagination, CSV export
│   │   │   ├── BudgetPage.tsx         # Category progress bars with >80% & >100% alerts
│   │   │   ├── AIInsightsPage.tsx     # Linear Regression forecasting & Category ML Sandbox
│   │   │   ├── ReportsPage.tsx        # Monthly statements with downloadable PDF
│   │   │   └── ProfilePage.tsx        # Account management & viva specifications
│   │   ├── services/
│   │   │   └── api.ts                 # Typed API client with JWT interceptor
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── App.tsx                    # Main routing configuration
│   │   ├── main.tsx                   # React root entry
│   │   └── index.css                  # Tailwind styles & print CSS
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py                # User model with hashed passwords
│   │   │   ├── transaction.py         # Transaction model (Income/Expense, amount, date)
│   │   │   └── budget.py              # Category budget thresholds
│   │   ├── routes/
│   │   │   ├── auth.py                # Register, Login, Me endpoints
│   │   │   ├── transactions.py        # Transaction CRUD, filters, pagination
│   │   │   ├── dashboard.py           # Dashboard KPIs, monthly/weekly aggregations
│   │   │   ├── budgets.py             # Budget CRUD & real-time utilization
│   │   │   ├── ai.py                  # Linear Regression & TF-IDF endpoints
│   │   │   ├── reports.py             # Monthly statements & ReportLab PDF export
│   │   │   └── seed.py                # Seeding API endpoints
│   │   ├── ml/
│   │   │   ├── expense_prediction.py  # Scikit-Learn Linear Regression model
│   │   │   ├── category_classifier.py # TF-IDF + Logistic Regression text classifier
│   │   │   ├── spending_analysis.py   # Statistical aggregations & trends
│   │   │   └── recommendations.py     # AI saving recommendations engine
│   │   ├── utils/
│   │   │   └── auth_middleware.py     # JWT token decoding and @token_required decorator
│   │   ├── config.py                  # Database and JWT configuration
│   │   └── __init__.py                # Flask app factory
│   ├── seed_data.py                   # Multi-month realistic demo transactions generator
│   ├── requirements.txt
│   └── run.py                         # Backend entry point (Port 5000)
│
├── database/
│   └── schema.sql                     # MySQL 8.0+ relational schema DDL
│
├── .env.example                       # Environment configuration template
├── Procfile                           # Production web process
├── render.yaml                        # Render deployment blueprint
├── vercel.json                        # Vercel SPA routing configuration
└── README.md
```

---

## 🚀 5. Getting Started (Local Setup)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/ai-personal-finance-tracker.git
cd ai-personal-finance-tracker
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

### Step 3: Set Up and Run the Python Backend

1. **Install Python dependencies:**
```bash
pip install -r backend/requirements.txt
```

2. **Start the Flask Backend:**
```bash
python backend/run.py
```
> The API server will launch at `http://localhost:5000`.  
> Health check is accessible at `http://localhost:5000/api/health`.  
> *Note: If MySQL is not configured, the app automatically initializes a local SQLite database (`finance_tracker.db`) with zero manual setup required.*

---

### Step 4: Set Up and Run the React Frontend

1. **Install Node packages:**
```bash
npm install
```

2. **Start the Vite Dev Server:**
```bash
npm run dev
```
> The frontend application will start at `http://localhost:5173`.

---

## 🗄️ 6. MySQL Database Setup (Optional / Production)

To connect to a local or cloud MySQL database:

1. **Open MySQL CLI or phpMyAdmin and execute `database/schema.sql`:**
```sql
CREATE DATABASE IF NOT EXISTS finance_tracker_db;
USE finance_tracker_db;
```
*(Or import the complete schema from `database/schema.sql`)*

2. **Update your `.env` file with your MySQL connection string:**
```env
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/finance_tracker_db
```

3. Restart the backend server:
```bash
python backend/run.py
```

---

## 🤖 7. How the Machine Learning Works

### A. Next-Month Expense Prediction (Linear Regression)
* **File:** `backend/app/ml/expense_prediction.py`
* **Algorithm:** Ordinary Least Squares (OLS) Linear Regression from Scikit-Learn:
  $$\hat{Y} = m \cdot X + c$$
* **Inputs:** Chronological array of monthly expense aggregates $X = [1, 2, \dots, N]$, $Y = [E_1, E_2, \dots, E_N]$.
* **Outputs:** 
  - Forecasted expense amount for month $N+1$
  - Spending velocity ($m$ slope per month in ₹)
  - Trend classification (*Upward / Downward / Stable*)
  - Percentage growth relative to latest recorded month.

### B. Automatic Category Classifier (NLP / TF-IDF)
* **File:** `backend/app/ml/category_classifier.py`
* **Algorithm:** Scikit-Learn `TfidfVectorizer(ngram_range=(1,2))` + `LogisticRegression()`.
* **Seed Dataset:** Comprehensive corpus of 80+ typical Indian and global expense descriptions covering all 10 categories (Food, Travel, Shopping, Education, Bills, Entertainment, Healthcare, Rent, Transportation, Other).
* **Live Sandbox:** Located under **AI Insights & ML** page, allowing evaluators to input custom strings and inspect predicted category, confidence percentage, and alternative ranking candidates.

---

## 🎯 8. Demo Credentials & Viva Guide

For instant evaluation and viva demonstration:

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@financetracker.com` | `password123` | Pre-populated with 70+ transactions across 4 months |

* **Quick Login:** On the Login page, click **"1-Click Login"** on the green banner.
* **Seed Button:** Click the **"Seed Demo Data"** button in the navbar or Profile page anytime to reset sample records.

---

## 🌐 9. Deployment Instructions

### Deploy Frontend to Vercel
1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Set **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
5. Click **Deploy**. *(The included `vercel.json` ensures SPA routes load without 404 errors).*

### Deploy Backend to Render or Railway
1. Sign in to [Render](https://render.com).
2. Create a new **Web Service** connected to your repository.
3. Configure settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `python backend/run.py`
4. Set **Environment Variables**:
   - `FLASK_ENV`: `production`
   - `JWT_SECRET`: *(Generate a secure random string)*
   - `DATABASE_URL`: *(Your MySQL or PostgreSQL URI from Aiven / PlanetScale / Supabase / Railway)*
   - `FRONTEND_URL`: `https://your-app.vercel.app`
5. Click **Deploy Web Service**.

---

## 📡 10. Complete REST API Reference

### Authentication
* `POST /api/auth/register` — Create new user account
* `POST /api/auth/login` — Sign in and retrieve JWT Bearer token
* `GET  /api/auth/me` — Get authenticated user details `[Protected]`

### Transactions
* `GET    /api/transactions` — List transactions (supports `search`, `category`, `type`, `start_date`, `end_date`, `page`, `limit`, `sort_by`, `sort_order`) `[Protected]`
* `POST   /api/transactions` — Create transaction `[Protected]`
* `GET    /api/transactions/<id>` — Get transaction details `[Protected]`
* `PUT    /api/transactions/<id>` — Update transaction `[Protected]`
* `DELETE /api/transactions/<id>` — Delete transaction `[Protected]`

### Dashboard & Analytics
* `GET /api/dashboard/summary` — Key KPI metrics, recent logs, warnings `[Protected]`
* `GET /api/dashboard/monthly` — Monthly income vs expense trends `[Protected]`
* `GET /api/dashboard/categories` — Expense category breakdown `[Protected]`
* `GET /api/dashboard/weekly` — Weekly spending velocity `[Protected]`

### Budgets
* `GET    /api/budgets` — Category budget limits with real-time actual spending and warning states `[Protected]`
* `POST   /api/budgets` — Set/update category budget limit `[Protected]`
* `PUT    /api/budgets/<id>` — Update budget amount `[Protected]`
* `DELETE /api/budgets/<id>` — Delete budget limit `[Protected]`

### Machine Learning & AI
* `GET  /api/ai/insights` — Comprehensive spending analysis, 50/30/20 target, and saving tips `[Protected]`
* `GET  /api/ai/prediction` — Scikit-Learn Linear Regression forecast `[Protected]`
* `POST /api/ai/predict-category` — Predict category from description string

### Reports & Export
* `GET /api/reports/monthly` — Structured monthly statement data `[Protected]`
* `GET /api/reports/export-pdf` — Downloadable vector PDF statement generated via ReportLab `[Protected]`

### Seeding
* `POST /api/seed/demo-account` — Reset default demo account
* `POST /api/seed/my-account` — Populate demo dataset into current account `[Protected]`

---

## 📜 11. License & Academic Integrity

This project is built for academic presentation, demonstration, and personal portfolio use.  
Feel free to adapt, extend, and deploy!
