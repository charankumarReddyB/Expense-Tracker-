# FastAPI Backend - Quick Test Guide

## Start the Server

```powershell
cd "d:\Expense tracker"
.\venv\Scripts\activate
python -m uvicorn backend.main:app --reload --port 8000
```

Server will start at: http://localhost:8000

## API Documentation

Once server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Test Endpoints

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. User Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

Response includes `access_token` and `refresh_token`.

### 3. User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 4. Get Current User (Protected)
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Create Expense (Protected)
```bash
curl -X POST http://localhost:8000/api/expenses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\":500,\"description\":\"Lunch\",\"merchant\":\"Restaurant\",\"date\":\"2026-02-13\",\"category_id\":\"CATEGORY_UUID\"}"
```

### 6. List Expenses (Protected)
```bash
curl "http://localhost:8000/api/expenses/?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Get Expense Statistics (Protected)
```bash
curl "http://localhost:8000/api/expenses/stats/summary?month=2&year=2026" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Available Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Authenticate user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile

### Expenses (`/api/expenses`)
- `POST /` - Create expense
- `GET /` - List expenses (with filters)
- `GET /{expense_id}` - Get single expense
- `PUT /{expense_id}` - Update expense
- `DELETE /{expense_id}` - Delete expense
- `GET /stats/summary` - Get expense statistics

## Query Parameters for List Expenses

- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)
- `category_id` - Filter by category UUID
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)
- `min_amount` - Minimum amount filter
- `max_amount` - Maximum amount filter
- `search` - Search in description/merchant

## Notes

- All protected endpoints require `Authorization: Bearer {access_token}` header
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Use `/api/auth/refresh` to get new access token
