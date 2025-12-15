-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('employee','manager','admin')),
    hire_date DATE,
    annual_leave_balance INTEGER DEFAULT 21,
    sick_leave_balance INTEGER DEFAULT 30
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item_id INTEGER,
    change INTEGER,
    type TEXT CHECK(type IN ('IN','OUT')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    leave_type TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK(status IN ('pending','approved','rejected')),
    days_requested INTEGER
);

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date DATE,
    check_in DATETIME,
    break_start DATETIME,
    break_end DATETIME,
    check_out DATETIME,
    total_hours REAL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Monthly Profits table
CREATE TABLE monthly_profits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER,
    year INTEGER,
    profit REAL,
    UNIQUE(month, year)
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);