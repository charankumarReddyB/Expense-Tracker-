# Local PostgreSQL Setup Guide

## Prerequisites
- PostgreSQL 14+ installed on Windows
- pgAdmin 4 (optional, for GUI management)

## Installation Steps

### 1. Install PostgreSQL

**Download**: https://www.postgresql.org/download/windows/

**During Installation**:
- Set password for `postgres` user (remember this!)
- Default port: 5432
- Install Stack Builder components (optional)

### 2. Verify Installation

```powershell
# Check PostgreSQL service is running
Get-Service -Name postgresql*

# Connect to PostgreSQL (will prompt for password)
psql -U postgres
```

### 3. Create Database

**Option A: Using psql command line**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE expense_tracker;

-- Verify
\l

-- Exit
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin 4
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → Create → Database
4. Name: `expense_tracker`
5. Owner: `postgres`
6. Click Save

### 4. Configure Environment

```powershell
# Copy environment template
copy .env.example .env

# .env should contain:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker
```

**Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation**

### 5. Test Connection

```powershell
# Activate virtual environment
venv\Scripts\activate

# Install dependencies (if not already done)
pip install sqlalchemy psycopg2-binary python-dotenv

# Run handshake test
python tools/db_handshake.py
```

**Expected Output**:
```
============================================================
DATABASE CONNECTION HANDSHAKE TEST
============================================================

Status: SUCCESS
Message: Database connection successful
Timestamp: 2026-02-12T23:37:32+05:30
Database URL: postgresql://postgres:****@localhost:5432/expense_tracker
Connection Successful: True
Database Version: PostgreSQL 16.x on x86_64-pc-windows...

============================================================
```

## Troubleshooting

### Issue 1: "psql: command not found"
**Solution**: Add PostgreSQL to PATH
```powershell
# Add to System Environment Variables:
C:\Program Files\PostgreSQL\16\bin
```

### Issue 2: "Connection refused"
**Possible Causes**:
- PostgreSQL service not running
- Wrong port number
- Firewall blocking connection

**Solution**:
```powershell
# Check service status
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-16  # Adjust version number
```

### Issue 3: "password authentication failed"
**Solution**: Reset postgres password
```powershell
# Using psql as admin
psql -U postgres
ALTER USER postgres WITH PASSWORD 'new_password';
```

### Issue 4: "database does not exist"
**Solution**: Create the database
```sql
psql -U postgres
CREATE DATABASE expense_tracker;
```

## Database Management

### Connect to Database
```powershell
psql -U postgres -d expense_tracker
```

### Useful Commands
```sql
-- List all databases
\l

-- Connect to database
\c expense_tracker

-- List all tables
\dt

-- Describe table
\d table_name

-- Run SQL file
\i path/to/file.sql

-- Exit
\q
```

### Backup Database
```powershell
pg_dump -U postgres expense_tracker > backup.sql
```

### Restore Database
```powershell
psql -U postgres expense_tracker < backup.sql
```

## Next Steps

Once database connection is verified:
1. ✅ Database created
2. ✅ Connection tested
3. → Set up Alembic migrations
4. → Create database schema
5. → Initialize with predefined categories

## Security Notes

- **Development**: Using `postgres` user is acceptable
- **Production**: Create dedicated user with limited privileges
- **Password**: Use strong password, never commit `.env` to git
- **Backup**: Regular backups recommended (daily for production)

## Performance Tips

- **Connection Pooling**: SQLAlchemy handles this automatically
- **Indexes**: Will be created via migrations
- **Vacuum**: PostgreSQL auto-vacuum is enabled by default
- **Monitoring**: Use pgAdmin or pg_stat_statements for query analysis
