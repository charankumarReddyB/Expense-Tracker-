# 🚀 Phase 1 Quick Start Guide

## Prerequisites
- PostgreSQL running on localhost:5432
- Python virtual environment active
- Backend server previously working

---

## Installation Steps

### 1. Install New Dependencies
```powershell
# Activate virtual environment (if not already active)
cd "D:\Expense tracker"
.\venv\Scripts\activate

# Install ReportLab for PDF generation
pip install reportlab
```

### 2. Run Database Migration
```powershell
# Add recurring_expenses table
python tools/migrate_add_recurring.py
```

Expected output:
```
✅ Migration successful!
Table 'recurring_expenses' created
Indexes added: idx_recurring_user, idx_recurring_due_date
```

### 3. Restart Backend Server
```powershell
# Kill existing server (Ctrl+C in terminal)
# Start fresh server
uvicorn backend.main:app --reload
```

Expected output should now show **12 routers** registered:
```
INFO:     Application startup complete.
Routers loaded: auth, expenses, categories, budgets, goals, alerts, analytics, intelligence, recurring, reports, export-import, fraud
```

### 4. Verify Installation

#### Check Swagger UI
Open browser: http://localhost:8000/docs

You should see **4 NEW sections**:
- 🔄 **Recurring Expenses** (10 endpoints)
- 📊 **Reports** (7 endpoints) 
- 📁 **Export/Import** (7 endpoints)
- 🛡️ **Fraud Detection** (7 endpoints)

#### Quick Health Check
```powershell
# Test if new routers are loaded
curl http://localhost:8000/api/recurring/
# Should return 401 (authentication required) - this is correct!
```

---

## Testing Phase 1 Features

### Test Suite 1: Recurring Expenses
```powershell
python tools/test_recurring_api.py
```

**Tests:**
1. Login authentication ✓
2. Detect recurring patterns ✓
3. Create recurring expense ✓
4. List recurring expenses ✓
5. Get upcoming bills ✓
6. Get summary statistics ✓
7. Update recurring expense ✓
8. Refresh next due date ✓
9. Create from detected pattern ✓

**Expected Result:** All tests pass, recurring expense created (Netflix ₹649)

---

### Test Suite 2: Fraud Detection
```powershell
python tools/test_fraud_api.py
```

**Tests:**
1. Login ✓
2. Run fraud analysis (30 days) ✓
3. Check single expense ✓
4. Get fraud statistics ✓
5. Quick scan (7 days) ✓
6. Analyze specific fraud types ✓

**Expected Result:** Fraud alerts generated based on existing expense data

---

### Test Suite 3: Export/Import
```powershell
python tools/test_export_import_api.py
```

**Tests:**
1. Login ✓
2. Download CSV template ✓
3. Export expenses (with metadata) ✓
4. Export all expenses ✓
5. Import CSV (5 expenses) ✓
6. Import bank statement ✓
7. Export with date filters ✓

**Expected Result:** CSV files generated, expenses imported successfully

---

## Manual Testing (via Swagger UI)

### 1. Test Recurring Expenses

**Step 1: Login**
Go to `/api/auth/login`, use your credentials

**Step 2: Authorize**
Copy the access token, click "Authorize" button (top right), paste token

**Step 3: Detect Patterns**
```json
POST /api/recurring/detect-patterns
{
  "lookback_months": 6,
  "min_occurrences": 3,
  "amount_tolerance": 0.1
}
```

**Step 4: Create Recurring Expense**
```json
POST /api/recurring/
{
  "name": "Netflix Subscription",
  "amount": 649,
  "frequency": "monthly",
  "start_date": "2024-02-01",
  "category_id": "your-entertainment-category-id",
  "alert_days_before": 3
}
```

**Step 5: Get Upcoming Bills**
```
GET /api/recurring/upcoming/bills?days_ahead=30
```

---

### 2. Test PDF Reports

**Step 1: Generate Monthly Report**
```
GET /api/reports/monthly/2024/2?download=true
```
Downloads: `expense_report_2024_02.pdf`

**Step 2: Generate Comprehensive Report**
```json
POST /api/reports/generate/download
{
  "report_type": "comprehensive",
  "start_date": "2024-01-01",
  "end_date": "2024-02-14"
}
```
Downloads: Professional PDF with expenses, budgets, goals analysis

---

### 3. Test Export/Import

**Step 1: Download Template**
```
GET /api/export-import/template/download
```
Downloads: `expense_import_template.csv`

**Step 2: Export Expenses**
```
GET /api/export-import/export/download?start_date=2024-01-01&end_date=2024-02-14&include_metadata=true
```
Downloads: `expenses_export_2024-02-14.csv`

**Step 3: Import CSV**
```
POST /api/export-import/import
[Upload your CSV file]
```
Returns:
```json
{
  "total_rows": 10,
  "successful": 9,
  "failed": 1,
  "skipped_duplicates": 0,
  "errors": [{"row": 5, "error": "Invalid date format"}]
}
```

---

### 4. Test Fraud Detection

**Step 1: Run Comprehensive Analysis**
```json
POST /api/fraud/analyze
{
  "lookback_days": 30,
  "sensitivity": "medium",
  "check_types": ["amount_anomaly", "duplicate_transaction", "unusual_merchant"]
}
```

Response shows:
```json
{
  "total_expenses_analyzed": 120,
  "suspicious_expenses": 5,
  "alerts": [...],
  "risk_summary": {
    "low": 2,
    "medium": 2,
    "high": 1,
    "critical": 0
  },
  "recommendations": [
    "⚠️ Review unusually large transactions",
    "⚠️ Check for duplicate charges"
  ]
}
```

**Step 2: Quick Scan**
```json
POST /api/fraud/quick-scan
{
  "days": 7
}
```
High-sensitivity scan of last 7 days

**Step 3: Get Statistics**
```
GET /api/fraud/stats
```
Returns dashboard-ready statistics

---

## Common Issues & Solutions

### Issue 1: "Table recurring_expenses does not exist"
**Solution:** Run migration script
```powershell
python tools/migrate_add_recurring.py
```

### Issue 2: "No module named 'reportlab'"
**Solution:** Install ReportLab
```powershell
pip install reportlab
```

### Issue 3: "404 Not Found" on new endpoints
**Solution:** Restart server
```powershell
# Ctrl+C to stop
uvicorn backend.main:app --reload
```

### Issue 4: Test scripts fail with "Connection refused"
**Solution:** Ensure backend server is running first
```powershell
# Terminal 1: Start server
uvicorn backend.main:app --reload

# Terminal 2: Run tests
python tools/test_recurring_api.py
```

### Issue 5: PDF generation fails
**Solution:** Check ReportLab version
```powershell
pip show reportlab
# Should be >= 4.0.0
```

---

## Verification Checklist

- [ ] ReportLab installed
- [ ] Migration script executed successfully
- [ ] Backend server restarted
- [ ] Swagger UI shows 12 router sections
- [ ] All 4 new sections visible in /docs
- [ ] Authorization working (can click Authorize button)
- [ ] test_recurring_api.py passes all 9 tests
- [ ] test_fraud_api.py passes all 6 tests
- [ ] test_export_import_api.py passes all 7 tests
- [ ] Can download PDF reports
- [ ] Can export/import CSV files
- [ ] Fraud detection returns results

---

## What's Next?

### Option 1: Test All Features
Run comprehensive testing on all 31 new endpoints to ensure everything works with your data.

### Option 2: Frontend Integration
Start building UI for:
- Recurring expenses management page
- Reports download center
- Import/export page with drag-drop
- Fraud alerts dashboard

### Option 3: Advanced Features
Enhance existing modules:
- Add real-time fraud alerts (WebSocket)
- Implement scheduled report emails
- Add OCR for receipt scanning
- Integrate with real bank APIs

---

## Quick Reference

### API Endpoints Summary

**Recurring Expenses** (`/api/recurring/`)
- POST `/` - Create recurring expense
- GET `/` - List all (filters: active, frequency, category)
- GET `/summary` - Get statistics
- GET `/{id}` - Get details
- PUT `/{id}` - Update
- DELETE `/{id}` - Delete
- POST `/detect-patterns` - Auto-detect patterns
- POST `/create-from-pattern` - Create from pattern
- GET `/upcoming/bills` - Get upcoming bills
- POST `/{id}/refresh-due-date` - Recalculate due date

**Reports** (`/api/reports/`)
- POST `/generate` - Generate custom report
- POST `/generate/download` - Generate & download
- GET `/monthly/{year}/{month}` - Monthly report
- GET `/yearly/{year}` - Yearly report
- GET `/budgets/performance` - Budget report
- GET `/goals/progress` - Goals report

**Export/Import** (`/api/export-import/`)
- POST `/export` - Export (returns metadata)
- GET `/export/download` - Download CSV
- GET `/export/all` - Export everything
- POST `/import` - Import CSV
- POST `/import/bank-statement` - Import bank data
- GET `/template/download` - Get template

**Fraud Detection** (`/api/fraud/`)
- POST `/analyze` - Comprehensive analysis
- GET `/check/{expense_id}` - Check single expense
- GET `/stats` - Statistics dashboard
- POST `/quick-scan` - Quick 7-day scan

---

## Support

For issues or questions:
1. Check [PHASE1_COMPLETION_SUMMARY.md](PHASE1_COMPLETION_SUMMARY.md) for detailed documentation
2. Review code comments in service files
3. Check logs: `backend/main.py` outputs detailed request logs
4. Verify database: `SELECT * FROM recurring_expenses;`

---

*Last Updated: February 14, 2026*
*Phase 1 Backend Completion - Quick Start Guide*
