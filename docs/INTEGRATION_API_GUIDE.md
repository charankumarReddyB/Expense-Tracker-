# Payment Integration - Quick Start Guide

## Authentication
All endpoints require Bearer token authentication.

```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@expensetracker.com",
    "password": "demo123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Import SMS Transactions

```bash
curl -X POST http://localhost:8000/api/integrations/sms/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "text": "Dear Customer, Your A/c XX1234 debited with Rs.450.50 on 15-Feb-26 at SWIGGY-BANGALORE. Avl Bal: Rs.45000.00",
        "sender": "AD-HDFCBK",
        "timestamp": "2026-02-15T10:30:00"
      },
      {
        "text": "You paid Rs.850.00 to Uber India on 13-Feb-26 using PhonePe UPI. UPI Ref: 403456789012",
        "sender": "PHONEPE",
        "timestamp": "2026-02-13T18:45:00"
      }
    ]
  }'
```

## Import Email Transactions

```bash
curl -X POST http://localhost:8000/api/integrations/email/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "content": "Transaction Details:\nAmount: Rs. 2,500.00\nMerchant: FLIPKART INTERNET PRIVATE LIMITED\nDate: 15-Feb-2026\nReference: REF567890123",
        "subject": "Debit Alert - HDFC Bank Account",
        "sender": "alerts@hdfcbank.com"
      }
    ]
  }'
```

## Account Aggregator Flow

### Step 1: Create Consent
```bash
curl -X POST http://localhost:8000/api/integrations/aa/consent/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fi_types": ["DEPOSIT", "CREDIT_CARD"],
    "purpose": "Personal Finance Tracking",
    "validity_months": 12
  }'

# Response
{
  "consent_id": "1e5cdfa7-8b10-4d3a-a01a-903bec785f3a",
  "status": "PENDING",
  "redirect_url": "https://api-sandbox.sahamati.org.in/consent/1e5cdfa7-8b10-4d3a-a01a-903bec785f3a/authorize",
  "created_at": "2026-02-16T02:24:57.220554"
}
```

### Step 2: User Approves Consent
Redirect user to `redirect_url` where they can approve access to their financial data.

### Step 3: Check Consent Status
```bash
curl http://localhost:8000/api/integrations/aa/consent/1e5cdfa7-8b10-4d3a-a01a-903bec785f3a/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "status": "ACTIVE"
}
```

### Step 4: Fetch Financial Data
```bash
curl -X POST http://localhost:8000/api/integrations/aa/fetch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consent_id": "1e5cdfa7-8b10-4d3a-a01a-903bec785f3a",
    "from_date": "2026-01-01",
    "to_date": "2026-02-28"
  }'

# Response
{
  "success": true,
  "imported": 45,
  "processed": 45,
  "failed": 0,
  "total": 45,
  "message": "Successfully imported 45 transactions from AA"
}
```

### Step 5: List Linked Accounts
```bash
curl "http://localhost:8000/api/integrations/aa/accounts?consent_id=1e5cdfa7-8b10-4d3a-a01a-903bec785f3a" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "accounts": [
    {
      "fi_type": "DEPOSIT",
      "account_number": "XXXX1234",
      "bank_name": "HDFC Bank"
    },
    {
      "fi_type": "CREDIT_CARD",
      "account_number": "XXXX5678",
      "bank_name": "ICICI Bank"
    }
  ]
}
```

### Step 6: Revoke Consent (Optional)
```bash
curl -X POST http://localhost:8000/api/integrations/aa/consent/1e5cdfa7-8b10-4d3a-a01a-903bec785f3a/revoke \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "success": true,
  "message": "Consent revoked successfully"
}
```

## Test SMS Parsing (Without Import)

```bash
curl -X POST http://localhost:8000/api/integrations/sms/test-parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Dear Customer, Your A/c XX1234 debited with Rs.1250.00 on 15-Feb-26 at AMAZON-INDIA. Avl Bal: Rs.43750.00",
    "sender": "AD-HDFCBK"
  }'

# Response
{
  "success": true,
  "parsed": {
    "amount": "1250.00",
    "merchant": "AMAZON-INDIA",
    "transaction_id": null,
    "date": "2026-02-15",
    "bank": "HDFC Bank",
    "platform": "banking"
  },
  "valid": true
}
```

## Test Email Parsing (Without Import)

```bash
curl -X POST http://localhost:8000/api/integrations/email/test-parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Amount: Rs. 599.00\nMerchant: Zomato Ltd\nDate: 14-Feb-2026\nRef No: TXN987654321",
    "subject": "Payment Alert",
    "sender": "cardalerts@icicibank.com"
  }'

# Response
{
  "success": true,
  "parsed": {
    "amount": "599.00",
    "merchant": "Zomato Ltd",
    "transaction_id": "TXN987654321",
    "date": "2026-02-14",
    "bank": "ICICI Bank",
    "platform": "banking"
  }
}
```

## Python Example

```python
import requests

# Configuration
BASE_URL = "http://localhost:8000"
EMAIL = "demo@expensetracker.com"
PASSWORD = "demo123"

# 1. Login
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"email": EMAIL, "password": PASSWORD}
)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Import SMS transactions
sms_data = {
    "messages": [
        {
            "text": "Your A/c debited with Rs.450.50 at SWIGGY",
            "sender": "AD-HDFCBK",
            "timestamp": "2026-02-15T10:30:00"
        }
    ]
}
response = requests.post(
    f"{BASE_URL}/api/integrations/sms/import",
    headers=headers,
    json=sms_data
)
print(f"SMS Import: {response.json()}")

# 3. Import email transactions
email_data = {
    "emails": [
        {
            "content": "Amount: Rs. 2,500.00\nMerchant: FLIPKART",
            "subject": "Debit Alert",
            "sender": "alerts@hdfcbank.com"
        }
    ]
}
response = requests.post(
    f"{BASE_URL}/api/integrations/email/import",
    headers=headers,
    json=email_data
)
print(f"Email Import: {response.json()}")

# 4. Create AA consent
consent_data = {
    "fi_types": ["DEPOSIT", "CREDIT_CARD"],
    "purpose": "Personal Finance Tracking",
    "validity_months": 12
}
response = requests.post(
    f"{BASE_URL}/api/integrations/aa/consent/create",
    headers=headers,
    json=consent_data
)
consent = response.json()
consent_id = consent["consent_id"]
print(f"Consent Created: {consent_id}")
print(f"Redirect URL: {consent['redirect_url']}")

# 5. Fetch financial data
fetch_data = {
    "consent_id": consent_id,
    "from_date": "2026-01-01",
    "to_date": "2026-02-28"
}
response = requests.post(
    f"{BASE_URL}/api/integrations/aa/fetch",
    headers=headers,
    json=fetch_data
)
print(f"AA Fetch: {response.json()}")
```

## JavaScript/TypeScript Example

```typescript
// Configuration
const BASE_URL = "http://localhost:8000";
const EMAIL = "demo@expensetracker.com";
const PASSWORD = "demo123";

// 1. Login
const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
});
const { access_token } = await loginResponse.json();

// 2. Import SMS transactions
const smsResponse = await fetch(`${BASE_URL}/api/integrations/sms/import`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [
      {
        text: "Your A/c debited with Rs.450.50 at SWIGGY",
        sender: "AD-HDFCBK",
        timestamp: "2026-02-15T10:30:00"
      }
    ]
  })
});
const smsResult = await smsResponse.json();
console.log("SMS Import:", smsResult);

// 3. Create AA consent
const consentResponse = await fetch(`${BASE_URL}/api/integrations/aa/consent/create`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    fi_types: ["DEPOSIT", "CREDIT_CARD"],
    purpose: "Personal Finance Tracking",
    validity_months: 12
  })
});
const consent = await consentResponse.json();
console.log("Consent ID:", consent.consent_id);
console.log("Redirect URL:", consent.redirect_url);

// 4. Fetch financial data
const fetchResponse = await fetch(`${BASE_URL}/api/integrations/aa/fetch`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    consent_id: consent.consent_id,
    from_date: "2026-01-01",
    to_date: "2026-02-28"
  })
});
const fetchResult = await fetchResponse.json();
console.log("AA Fetch:", fetchResult);
```

## Testing

Run the comprehensive test suite:
```bash
python tools/test_integrations.py
```

Expected output:
```
============================================================
Payment Integration API Tests
============================================================

=== Logging in ===
[OK] Logged in successfully

=== Testing SMS Import ===
[OK] SMS Import successful
    Imported: 2
    Processed: 2
    Failed: 0
    Total: 2

=== Testing Email Import ===
[OK] Email Import successful
    Imported: 2
    Processed: 2
    Failed: 0
    Total: 2

=== Testing AA Consent Creation ===
[OK] Consent created successfully
    Consent ID: 1e5cdfa7-8b10-4d3a-a01a-903bec785f3a
    Status: PENDING
    Redirect URL: https://api..