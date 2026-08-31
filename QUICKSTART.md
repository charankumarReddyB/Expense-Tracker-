# 🚀 Smart Expense Tracker - Quick Start Guide

An intelligent, full-stack financial monitoring system built with **Next.js 14**, **TypeScript**, **TailwindCSS**, **Prisma ORM**, and **SQLite**.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

## ⚡ Quick Start (One-Command Launch)

Simply run:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`** (bypasses login and opens directly to the Dashboard).

---

## 🛠️ Installation & Setup (Step-by-step)

If setting up for the first time or after pulling the repo:

1. **Install Dependencies**:
   ```bash
   npm run install:frontend
   ```

2. **Database Setup & Migrations (SQLite)**:
   ```bash
   cd frontend
   npx prisma db push
   ```

3. **Seed Demo Data**:
   Populate the database with realistic 6-month transaction data, budgets, goals, and categories:
   ```bash
   node prisma/seed.js
   ```

4. **Run Development Server**:
   ```bash
   cd ..
   npm run dev
   ```

---

## 📁 Project Structure

```
Expense tracker/
├── QUICKSTART.md           # Quick Start Guide
├── README.md               # Main Documentation
├── package.json            # Root workspace scripts
└── frontend/               # Full-stack Next.js 14 Application
    ├── app/                # App Router (Pages & API Routes)
    │   ├── api/            # Local API Handlers (Expenses, Budgets, Goals, etc.)
    │   ├── dashboard/      # Dashboard Views (Expenses, Budgets, Analytics, etc.)
    │   ├── layout.tsx      # Root Layout & Sidebar Component
    │   └── page.tsx        # Redirects straight to /dashboard
    ├── components/         # Reusable UI Widgets (AI Assistant, Charts)
    ├── lib/                # Utilities & Shared Prisma Client instance
    └── prisma/             # Database Schema & SQLite Data
        ├── schema.prisma   # Prisma ORM Schema
        ├── dev.db          # Local SQLite Database
        └── seed.js         # Realistic Demo Data Seed Script
```

---

## 🛠️ Key Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Next.js local development server on `http://localhost:3000` |
| `npm run build:frontend` | Builds the production Next.js bundle |
| `npm run install:frontend` | Installs all frontend dependencies safely |

---

## 💡 Troubleshooting

- **Database Reset**:
  To reset and re-seed the SQLite database, run:
  ```bash
  cd frontend
  npx prisma db push --force-reset
  node prisma/seed.js
  ```
