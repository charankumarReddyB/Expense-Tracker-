# Project Constitution - Smart Expense Tracking System

> **Status**: 🔄 Initialization Phase  
> **Last Updated**: 2026-02-12 22:59 IST  
> **Protocol**: B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)

---

## 🎯 Project North Star

**Singular Desired Outcome**: Create an intelligent financial monitoring system that consolidates multi-platform transaction data and provides AI-powered insights to help users improve their financial health without executing payments.

---

## 📊 Data Schemas

### Core Entities

#### User Schema
```json
{
  "user_id": "uuid",
  "email": "string (unique)",
  "password_hash": "string (bcrypt)",
  "profile": {
    "name": "string",
    "currency": "string (default: INR)",
    "timezone": "string",
    "preferences": {
      "alert_thresholds": [50, 80, 100],
      "notification_channels": ["email", "in_app"],
      "theme": "dark"
    }
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Transaction Schema (Raw Import)
```json
{
  "transaction_id": "uuid",
  "user_id": "uuid (foreign key)",
  "platform": "string (upi|wallet|banking)",
  "raw_data": {
    "platform_tx_id": "string",
    "timestamp": "timestamp",
    "amount": "decimal",
    "description": "string",
    "merchant": "string",
    "category_hint": "string (optional)",
    "metadata": "object"
  },
  "import_date": "timestamp",
  "processed": "boolean"
}
```

#### Expense Schema (Normalized)
```json
{
  "expense_id": "uuid",
  "user_id": "uuid (foreign key)",
  "transaction_id": "uuid (foreign key, nullable)",
  "amount": "decimal",
  "currency": "string",
  "category_id": "uuid (foreign key)",
  "description": "string",
  "merchant": "string",
  "date": "date",
  "source_platform": "string",
  "is_recurring": "boolean",
  "confidence_score": "float (0-1, for ML categorization)",
  "user_verified": "boolean",
  "metadata": {
    "location": "string (optional)",
    "payment_method": "string",
    "tags": ["string"]
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Category Schema
```json
{
  "category_id": "uuid",
  "name": "string",
  "parent_category_id": "uuid (nullable, self-referential)",
  "icon": "string (emoji or icon name)",
  "color": "string (hex)",
  "is_custom": "boolean",
  "user_id": "uuid (nullable, for custom categories)",
  "keywords": ["string (for ML matching)"]
}
```

**Predefined Categories**:
- Food & Dining (🍔)
- Transportation (🚗)
- Utilities (💡)
- Entertainment (🎬)
- Education (📚)
- Healthcare (🏥)
- Shopping (🛍️)
- Personal Care (💅)
- Travel (✈️)
- Bills & Subscriptions (📄)

#### Budget Schema
```json
{
  "budget_id": "uuid",
  "user_id": "uuid (foreign key)",
  "category_id": "uuid (foreign key)",
  "limit_amount": "decimal",
  "period": "string (monthly|weekly|yearly)",
  "start_date": "date",
  "end_date": "date",
  "alert_thresholds": [50, 80, 100],
  "current_spent": "decimal (computed)",
  "status": "string (on_track|warning|exceeded)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Alert Schema
```json
{
  "alert_id": "uuid",
  "user_id": "uuid (foreign key)",
  "type": "string (budget_threshold|fraud_detection|bill_reminder|insight)",
  "severity": "string (info|warning|critical)",
  "title": "string",
  "message": "string",
  "data": "object (context-specific payload)",
  "is_read": "boolean",
  "is_dismissed": "boolean",
  "created_at": "timestamp"
}
```

#### Financial Goal Schema
```json
{
  "goal_id": "uuid",
  "user_id": "uuid (foreign key)",
  "name": "string",
  "target_amount": "decimal",
  "current_amount": "decimal",
  "deadline": "date",
  "priority": "integer (1-5)",
  "status": "string (active|paused|completed|abandoned)",
  "milestones": [
    {
      "amount": "decimal",
      "date": "date",
      "achieved": "boolean"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### API Payload Schemas

#### Expense Categorization Request
```json
{
  "transaction_id": "uuid",
  "description": "string",
  "amount": "decimal",
  "merchant": "string (optional)",
  "date": "date"
}
```

#### Expense Categorization Response
```json
{
  "category_id": "uuid",
  "category_name": "string",
  "confidence": "float (0-1)",
  "alternatives": [
    {
      "category_id": "uuid",
      "category_name": "string",
      "confidence": "float"
    }
  ]
}
```

#### Budget Status Response
```json
{
  "budget_id": "uuid",
  "category": "string",
  "limit": "decimal",
  "spent": "decimal",
  "remaining": "decimal",
  "percentage_used": "float",
  "status": "string (on_track|warning|exceeded)",
  "days_remaining": "integer"
}
```

#### Insight Payload
```json
{
  "insight_id": "uuid",
  "type": "string (recommendation|prediction|anomaly|trend)",
  "title": "string",
  "description": "string",
  "data": {
    "category": "string (optional)",
    "amount": "decimal (optional)",
    "timeframe": "string (optional)",
    "comparison": "object (optional)"
  },
  "action_items": ["string"],
  "priority": "integer (1-5)",
  "created_at": "timestamp"
}
```

#### Chat Query Request
```json
{
  "query": "string",
  "conversation_id": "uuid (optional)",
  "context": {
    "date_range": {
      "start": "date (optional)",
      "end": "date (optional)"
    },
    "categories": ["uuid (optional)"]
  }
}
```

#### Chat Query Response
```json
{
  "response": "string (natural language answer)",
  "data": "object (structured data supporting the answer)",
  "visualizations": [
    {
      "type": "string (chart|table|metric)",
      "config": "object"
    }
  ],
  "conversation_id": "uuid",
  "follow_up_suggestions": ["string"]
}
```

---

## 🎭 Behavioral Rules

### System Behavior
1. **Read-Only Principle**: Never request write permissions to payment platforms
2. **Privacy First**: All user data encrypted at rest and in transit
3. **Fail Gracefully**: If ML categorization fails, default to "Uncategorized" and prompt user
4. **No Assumptions**: If transaction description is ambiguous, ask user instead of guessing
5. **Audit Trail**: Log all category changes, budget updates, and alert triggers

### ML Model Behavior
1. **Active Learning**: When confidence < 0.7, present top 3 category suggestions to user
2. **Context Awareness**: Same merchant can have different categories based on time/amount
3. **Continuous Improvement**: Retrain models weekly with new user-verified data
4. **Explainability**: Always provide reason for categorization ("Matched keyword: 'coffee'")

### Alert Behavior
1. **Adaptive Frequency**: Context-based alert limits
   - Budget warnings: Max 2 per category per day
   - Fraud/anomaly alerts: Immediate, no daily limit
   - Insights/recommendations: Max 3 per day
   - Bill reminders: 7 days before, 1 day before, on due date
2. **Smart Timing**: Send budget warnings at 80% (proactive) and 100% (reactive)
3. **Deduplication**: Don't send same alert type within 24 hours (except fraud)
4. **Actionable**: Every alert must include a suggested action
5. **Severity Levels**: 
   - Info (blue): General insights, tips
   - Warning (yellow): Budget approaching limit
   - Critical (red): Budget exceeded, fraud detected

### UI/UX Behavior
1. **Premium Aesthetics**: Dark theme with lime green (#BFF549) accents
2. **Responsive**: Mobile-first design, works on all screen sizes
3. **Fast**: All interactions < 200ms, show loading states for longer operations
4. **Accessible**: ARIA labels, keyboard navigation, high contrast mode
5. **Notification Center**: 
   - Real-time in-app notifications with badge counter
   - Categorized by type (budget, fraud, insight, reminder)
   - Mark as read/dismiss functionality
   - Notification history (last 30 days)
6. **Export Capabilities**:
   - PDF: Monthly reports with charts and summaries
   - CSV: Raw transaction data with filters
   - Charts: Interactive with zoom, pan, export as PNG
7. **API Access**:
   - RESTful endpoints for all core features
   - JWT authentication required
   - Rate limiting: 100 requests/minute
   - OpenAPI/Swagger documentation

---

## 🏗️ Architectural Invariants

### Layer 1: Architecture (SOPs)
- All business logic documented in `architecture/*.md` before coding
- SOPs must define: Goal, Inputs, Process, Outputs, Edge Cases
- Update SOP before updating code

### Layer 2: Navigation (Decision Making)
- AI/LLM layer routes between SOPs and Tools
- No complex business logic in this layer
- Decision trees documented in `gemini.md`

### Layer 3: Tools (Execution)
- All tools in `tools/` are atomic and testable
- Environment variables in `.env` only
- Temporary files in `.tmp/` only
- Each tool has single responsibility

### Database Rules
- Use SQLAlchemy ORM (no raw SQL except for complex analytics)
- All migrations versioned with Alembic
- Foreign keys enforced at database level
- Soft deletes for user data (GDPR compliance)
- **Data Retention**: 
  - Transaction history: 2 years (configurable per user)
  - Archived data: Moved to cold storage after 2 years
  - User can request full data export or deletion anytime
  - Auto-purge deleted accounts after 30-day grace period

### API Rules
- All endpoints use Pydantic models for validation
- JWT authentication required except `/auth/login` and `/auth/signup`
- Rate limiting: 100 requests/minute per user
- CORS configured for frontend domain only

---

## 🔐 Security Invariants

1. **Authentication**: JWT with 15-minute access tokens, 7-day refresh tokens
2. **Password Policy**: Min 8 characters, bcrypt with cost factor 12
3. **API Keys**: Never log or expose in error messages
4. **Data Encryption**: AES-256 for sensitive fields (if needed)
5. **Input Validation**: Sanitize all user inputs, use parameterized queries

---

## 🧪 Testing Invariants

1. **Unit Tests**: Every tool in `tools/` must have corresponding test
2. **ML Accuracy**: Categorization model must achieve >85% accuracy
3. **API Tests**: All endpoints tested with valid/invalid/edge cases
4. **Performance**: Load test with 10,000 transactions
5. **Security**: Penetration testing before deployment

---

## 📁 File Structure

```
d:\Expense tracker\
├── gemini.md              # This file (Project Constitution)
├── task_plan.md           # Phases, goals, checklists
├── findings.md            # Research, discoveries, constraints
├── progress.md            # What was done, errors, tests, results
├── .env                   # API keys, secrets (never commit)
├── .tmp/                  # Temporary files (ephemeral)
│
├── architecture/          # Layer 1: SOPs
│   ├── user_management.md
│   ├── expense_tracking.md
│   ├── budget_monitoring.md
│   ├── ml_categorization.md
│   ├── fraud_detection.md
│   └── conversational_ai.md
│
├── tools/                 # Layer 3: Python Scripts
│   ├── db_setup.py
│   ├── import_transactions.py
│   ├── categorize_expense.py
│   ├── predict_budget.py
│   ├── detect_anomalies.py
│   ├── generate_insights.py
│   └── chat_query.py
│
├── backend/               # FastAPI Application
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   ├── ml/
│   ├── integrations/
│   └── tests/
│
└── frontend/              # Next.js Application
    ├── app/
    ├── components/
    └── styles/
```

---

## 🚫 Do Not Rules

1. **DO NOT** write code in `tools/` until data schemas are defined
2. **DO NOT** proceed to Phase 2 (Link) until Discovery Questions are answered
3. **DO NOT** guess at business logic - ask user for clarification
4. **DO NOT** store secrets in code - use `.env` only
5. **DO NOT** skip testing - every tool must be verified
6. **DO NOT** deploy without updating maintenance log
7. **DO NOT** modify `gemini.md` for minor updates - use `progress.md`

---

## 📋 Pending Decisions

### Discovery Questions (Phase 1: Blueprint)
**✅ ALL ANSWERS CONFIRMED - 2026-02-12 23:15 IST**

1. **North Star**: ✅ **CONFIRMED**
   - "Intelligent financial monitoring system for multi-platform expense analysis"

2. **Integrations**: ✅ **CONFIRMED - Option C: Hybrid**
   - **Phase 1**: Mock payment platforms with realistic data generators
   - **Design**: Architecture ready for real OAuth 2.0 integration
   - **Future**: UPI apps (PhonePe, GPay), banking APIs, digital wallets
   - **Adapter Pattern**: Ensures easy swap from mock to real connectors

3. **Source of Truth**: ✅ **CONFIRMED - Supabase PostgreSQL**
   - **Primary Database**: Supabase (cloud-hosted PostgreSQL)
   - **Development**: Can use local PostgreSQL if Supabase credentials not ready
   - **ML Models**: Store in backend `/ml/models/` directory
   - **Temporary Data**: `.tmp/` for intermediate processing

4. **Delivery Payload**: ✅ **CONFIRMED - Multi-Channel**
   - **Primary**: Web dashboard (Next.js frontend) with real-time updates
   - **Notifications**: In-app notification center (primary), email alerts (optional)
   - **Reports**: PDF exports for monthly summaries, CSV for raw data
   - **Charts**: Interactive visualizations (Chart.js/Recharts)
   - **API**: RESTful API exposed for third-party integrations
   - **Export Formats**: JSON, CSV, PDF

5. **Behavioral Rules**: ✅ **CONFIRMED**
   - **AI Assistant Tone**: Professional with context-aware adjustments
     - Budget alerts: Direct and actionable
     - Insights: Educational and motivational
     - Fraud alerts: Urgent and clear
   - **Alert Frequency**: Adaptive based on alert type
     - Budget warnings: Max 2 per category per day
     - Fraud alerts: Immediate (no limit)
     - Insights: Max 3 per day
   - **Data Retention**: 2 years of transaction history
   - **Privacy**: GDPR compliant, user can request data deletion anytime

---

## 🔄 Maintenance Log

### Version History
- **v0.1** (2026-02-12): Initial constitution created
  - Data schemas defined
  - Behavioral rules established
  - Architectural invariants documented

---

**This document is LAW. All code must conform to these schemas and rules.**
