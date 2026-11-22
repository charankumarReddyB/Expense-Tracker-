# 🚀 Smart Expense Tracking and Budget Analysis System

An intelligent, full-stack financial monitoring system built with **Next.js 14 App Router**, **TypeScript**, **Prisma ORM**, **Supabase (PostgreSQL)**, and **TailwindCSS**. It provides real-time expense monitoring, predictive budgeting, fraud detection, savings goal tracking, and interactive analytics.

---

## 🎯 Key Features

- 📊 **Interactive Dashboard**: Real-time spending overview, balance tracking, and monthly comparisons.
- 💸 **Expense Management**: Add, filter, search, update, and delete expenses effortlessly.
- 🔄 **Recurring Bills & Subscriptions**: Track periodic payments, auto-detect recurring patterns, and anticipate upcoming dues.
- 🎯 **Goal-Based Savings**: Track financial goals with interactive progress indicators and target dates.
- 📈 **Predictive Analytics & Forecasting**: Spending trends, confidence ranges, and budget overrun predictions.
- 🛡️ **Anomaly & Fraud Detection**: Automated alerts flagging unusual transaction spikes or duplicate charges.
- 💡 **AI Recommendations**: Personalized savings suggestions and category optimizations.
- 💾 **Supabase PostgreSQL**: Cloud-hosted PostgreSQL with Prisma ORM migrations and pooling.

---

## 🛠️ Tech Stack

- **Full-Stack Framework**: [Next.js 14](https://nextjs.org/) (App Router — UI Pages & Serverless API Routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) via [Prisma ORM](https://www.prisma.io/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & Dark-Theme Glassmorphism
- **Visuals**: Lucide React & Recharts
- **Compiler**: Next.js Turbopack (`--turbo`)

---

## 📁 Project Architecture

```
Expense tracker/
├── frontend/
│   ├── app/
│   │   ├── api/             # Backend API Route Handlers (Auth, Expenses, Budgets, Goals, etc.)
│   │   │   ├── analytics/   # Analytics & Trends
│   │   │   ├── auth/        # Authentication
│   │   │   ├── budgets/     # Budget Management & Summaries
│   │   │   ├── expenses/    # Expense CRUD & Stats
│   │   │   ├── forecasting/ # Predictive Analytics
│   │   │   ├── fraud/       # Fraud & Anomaly Alerts
│   │   │   ├── goals/       # Savings Goals & Progress
│   │   │   ├── recurring/   # Subscriptions & Bills
│   │   │   └── reports/     # Report Exports
│   │   ├── dashboard/       # Frontend UI Pages (Dashboard, Expenses, Budgets, etc.)
│   │   ├── globals.css      # Design Tokens & Styles
│   │   └── layout.tsx       # Root Layout
│   ├── components/          # Reusable UI Widgets & AI Assistant
│   ├── lib/                 # Prisma client, API helper, utilities
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma PostgreSQL Schema
│   │   └── seed.js          # Demo Data Seeder
│   └── package.json         # Frontend dependencies & Next.js scripts
├── package.json             # Root workspace scripts
├── vercel.json              # Vercel deployment configuration
├── render.yaml              # Render deployment configuration
└── README.md
```

---

## 🚀 Local Development

1. **Clone repository and install dependencies**:
   ```bash
   npm run install:frontend
   ```

2. **Configure Environment Variables**:
   In `frontend/.env`:
   ```env
   DATABASE_URL="your_supabase_postgresql_connection_string"
   DIRECT_URL="your_supabase_direct_connection_string"
   JWT_SECRET_KEY="your-jwt-secret-key"
   ```

3. **Generate Prisma Client & Push Schema**:
   ```bash
   cd frontend
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🌐 Cloud Deployment

### Deploying to Vercel (Recommended)
1. Import this repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add the following **Environment Variables**:
   - `DATABASE_URL` (Supabase connection string)
   - `DIRECT_URL` (Supabase direct connection string)
   - `JWT_SECRET_KEY` (secret key)
4. Click **Deploy**. Vercel will build both the frontend and backend API endpoints automatically.

### Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com) connected to this repository (or use the included `render.yaml` Blueprint).
2. Set:
   - **Build Command**: `npm install && npm run build:frontend`
   - **Start Command**: `npm run start`
3. Add the **Environment Variables**: `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET_KEY`.
