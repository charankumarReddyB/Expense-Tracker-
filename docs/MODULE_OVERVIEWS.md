# UML Class Diagrams - 5 Core Modules

> **Generated using Mermaid** - Crisp, clear diagrams for each module

---

## Module 1: Authentication & User Management

### Overview
Handles user identity, security, and session management.

### UML Class Diagram

```mermaid
classDiagram
    class User {
        -int id
        -string email
        -string password_hash
        -string full_name
        -datetime created_at
        -datetime updated_at
        +authenticate(password) bool
        +update_profile(data) User
        +change_password(old_pwd, new_pwd) bool
        +get_preferences() dict
    }
    
    class AuthService {
        +register(email, password, name) User
        +login(email, password) Token
        +verify_token(token) User
        +refresh_token(refresh_token) Token
        +logout(token) bool
    }
    
    class Token {
        -string access_token
        -string refresh_token
        -string token_type
        -int expires_in
        +is_valid() bool
        +decode() dict
    }
    
    class PasswordValidator {
        +validate_strength(password) bool
        +hash_password(password) string
        +verify_password(password, hash) bool
    }
    
    AuthService --> User : manages
    AuthService --> Token : generates
    AuthService --> PasswordValidator : uses
    User --> Token : authenticated by
    
    style User fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style AuthService fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Token fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
```

---

## Module 2: Expense Management

### Overview
Transaction tracking with categorization and multi-platform import.

### UML Class Diagram

```mermaid
classDiagram
    class Expense {
        -int id
        -int user_id
        -float amount
        -int category_id
        -string description
        -string merchant
        -date date
        -datetime created_at
        +categorize() Category
        +update(data) Expense
        +delete() bool
    }
    
    class Category {
        -int id
        -string name
        -string icon
        -string color
        -int parent_id
        +get_subcategories() List~Category~
        +is_custom() bool
        +get_total_spent(user_id, period) float
    }
    
    class Transaction {
        -int id
        -string platform
        -json raw_data
        -datetime import_date
        -bool processed
        +normalize() Expense
        +validate() bool
    }
    
    class ExpenseService {
        +create_expense(data) Expense
        +get_expenses(filters) List~Expense~
        +update_expense(id, data) Expense
        +delete_expense(id) bool
        +import_transactions(platform) List~Expense~
        +search(query) List~Expense~
    }
    
    Expense "N" --> "1" Category : belongs to
    Expense "N" --> "1" User : owned by
    Transaction "1" --> "1" Expense : converts to
    ExpenseService --> Expense : manages
    ExpenseService --> Category : manages
    ExpenseService --> Transaction : processes
    
    style Expense fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style Category fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Transaction fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    style ExpenseService fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

---

## Module 3: Budget & Financial Goals

### Overview
Budget planning, monitoring, and goal tracking with alerts.

### UML Class Diagram

```mermaid
classDiagram
    class Budget {
        -int id
        -int user_id
        -int category_id
        -float limit_amount
        -string period
        -float spent_amount
        -datetime start_date
        -datetime end_date
        +check_status() string
        +calculate_remaining() float
        +calculate_percentage() float
        +trigger_alert() Alert
        +reset() void
    }
    
    class FinancialGoal {
        -int id
        -int user_id
        -string name
        -float target_amount
        -float current_amount
        -date deadline
        -string status
        +calculate_progress() float
        +is_on_track() bool
        +add_contribution(amount) void
        +get_required_monthly() float
    }
    
    class Alert {
        -int id
        -int user_id
        -string type
        -string message
        -string severity
        -bool is_read
        -datetime created_at
        +send() bool
        +mark_as_read() bool
    }
    
    class BudgetService {
        +create_budget(data) Budget
        +track_spending(expense) Budget
        +get_budget_status(id) dict
        +generate_alerts() List~Alert~
        +auto_adjust_budget(user_id) void
    }
    
    class BudgetObserver {
        -List~Budget~ watched_budgets
        +observe(budget) void
        +notify_on_threshold(budget, threshold) void
    }
    
    Budget "N" --> "1" Category : tracks
    Budget "N" --> "1" User : owned by
    Budget "1" --> "N" Alert : triggers
    FinancialGoal "N" --> "1" User : owned by
    BudgetService --> Budget : manages
    BudgetService --> FinancialGoal : manages
    BudgetService --> Alert : generates
    BudgetObserver --> Budget : watches
    BudgetObserver --> Alert : creates
    
    style Budget fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    style FinancialGoal fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    style Alert fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    style BudgetService fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

---

## Module 4: AI/ML Intelligence Services

### Overview
AI-powered automation for categorization, predictions, and fraud detection.

### UML Class Diagram

```mermaid
classDiagram
    class Categorizer {
        -model nlp_model
        -float confidence_threshold
        +train(data) void
        +predict(description) Category
        +get_confidence() float
        +retrain_on_feedback(expense, category) void
    }
    
    class Predictor {
        -model forecast_model
        -string model_type
        +train(historical_data) void
        +predict_spending(period) float
        +predict_budget(category) float
        +get_accuracy() float
    }
    
    class FraudDetector {
        -model anomaly_model
        -float threshold
        +detect(expense) bool
        +get_anomaly_score(expense) float
        +explain_detection() string
        +update_patterns(user_id) void
    }
    
    class Recommender {
        -dict user_patterns
        +analyze_patterns(user_id) dict
        +generate_recommendations() List~string~
        +suggest_savings() List~dict~
        +compare_with_peers(user_id) dict
    }
    
    class AIService {
        -Categorizer categorizer
        -Predictor predictor
        -FraudDetector fraud_detector
        -Recommender recommender
        +categorize_expense(expense) Category
        +predict_future_spending(user_id) dict
        +detect_fraud(expense) bool
        +get_recommendations(user_id) List~string~
        +get_insights(user_id) dict
    }
    
    AIService --> Categorizer : uses
    AIService --> Predictor : uses
    AIService --> FraudDetector : uses
    AIService --> Recommender : uses
    Categorizer --> Expense : analyzes
    Predictor --> Expense : forecasts from
    FraudDetector --> Expense : monitors
    Recommender --> Expense : learns from
    
    style Categorizer fill:#e8eaf6,stroke:#283593,stroke-width:2px
    style Predictor fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style FraudDetector fill:#ffebee,stroke:#c62828,stroke-width:2px
    style Recommender fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    style AIService fill:#fff9c4,stroke:#f57f17,stroke-width:2px
```

---

## Module 5: Analytics & Insights

### Overview
Data visualization, reporting, and trend analysis.

### UML Class Diagram

```mermaid
classDiagram
    class Analytics {
        +calculate_summary(user_id) dict
        +get_trends(period) dict
        +category_breakdown(user_id) dict
        +compare_periods(start, end) dict
        +get_spending_velocity(user_id) float
    }
    
    class Report {
        -int id
        -int user_id
        -string type
        -date start_date
        -date end_date
        -json data
        -datetime created_at
        +generate() bytes
        +export_pdf() bytes
        +export_csv() bytes
        +export_json() bytes
    }
    
    class Dashboard {
        +get_summary_cards(user_id) dict
        +get_recent_expenses(user_id) List~Expense~
        +get_budget_status(user_id) List~Budget~
        +get_trends(user_id) dict
        +get_alerts(user_id) List~Alert~
    }
    
    class ChartBuilder {
        +build_expense_chart(data) dict
        +build_category_pie(data) dict
        +build_trend_line(data) dict
        +build_comparison_bar(data) dict
    }
    
    class AnalyticsService {
        -Analytics analytics
        -ChartBuilder chart_builder
        +generate_dashboard(user_id) dict
        +create_report(user_id, type) Report
        +get_insights(user_id) List~string~
        +export_data(format) bytes
        +schedule_report(user_id, frequency) void
    }
    
    AnalyticsService --> Analytics : uses
    AnalyticsService --> Report : generates
    AnalyticsService --> Dashboard : builds
    AnalyticsService --> ChartBuilder : uses
    Report "N" --> "1" User : belongs to
    Dashboard --> Expense : aggregates
    Dashboard --> Budget : displays
    Analytics --> Expense : analyzes
    
    style Analytics fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Report fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Dashboard fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style ChartBuilder fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style AnalyticsService fill:#fce4ec,stroke:#ad1457,stroke-width:2px
```

---

## Module Interaction Sequence

### User Creates Expense Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Module
    participant E as Expense Module
    participant AI as Intelligence Module
    participant B as Budget Module
    participant AN as Analytics Module
    
    U->>A: Login Request
    A-->>U: JWT Token
    
    U->>E: Create Expense
    E->>AI: Auto-categorize
    AI-->>E: Category + Confidence
    E->>E: Save Expense
    
    E->>B: Update Budget Spending
    B->>B: Check Thresholds
    alt Budget Exceeded
        B-->>U: Alert Notification
    end
    
    E->>AN: Update Dashboard
    AN->>AN: Recalculate Metrics
    AN-->>U: Updated Dashboard
```

---

## System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend Layer (Next.js)"]
        UI1[Auth UI]
        UI2[Expense UI]
        UI3[Budget UI]
        UI4[AI UI]
        UI5[Analytics UI]
    end
    
    subgraph Backend["Backend Layer (FastAPI)"]
        M1[Auth Module]
        M2[Expense Module]
        M3[Budget Module]
        M4[Intelligence Module]
        M5[Analytics Module]
    end
    
    subgraph Core["Shared Core Infrastructure"]
        DB[(PostgreSQL)]
        SEC[Security/JWT]
        CFG[Configuration]
    end
    
    UI1 --> M1
    UI2 --> M2
    UI3 --> M3
    UI4 --> M4
    UI5 --> M5
    
    M1 --> Core
    M2 --> Core
    M3 --> Core
    M4 --> Core
    M5 --> Core
    
    M2 --> M1
    M3 --> M1
    M3 --> M2
    M4 --> M2
    M5 --> M2
    M5 --> M3
    
    style Frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Backend fill:#f1f8e9,stroke:#558b2f,stroke-width:3px
    style Core fill:#fff3e0,stroke:#e65100,stroke-width:3px
```

---

## Summary

| Module | Classes | Key Relationships | Primary Function |
|--------|---------|-------------------|------------------|
| **Auth** | User, AuthService, Token | User ↔ Token | Identity & Security |
| **Expense** | Expense, Category, Transaction | Expense → Category | Transaction Tracking |
| **Budget** | Budget, Goal, Alert | Budget → Alert | Budget Monitoring |
| **Intelligence** | Categorizer, Predictor, FraudDetector | AI Services → Expense | AI Automation |
| **Analytics** | Dashboard, Report, Analytics | Analytics → Expense/Budget | Insights & Reports |

**Platform Type**: Single unified web application with modular code organization
