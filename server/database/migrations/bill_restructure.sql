-- Drop existing bill-related tables
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS bill_history;

-- Create payees table (equivalent to income_sources)
CREATE TABLE payees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    expected_amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- 'WEEKLY', 'BIWEEKLY', 'MONTHLY', etc.
    start_date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bills table (equivalent to income_entries)
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    payee_id INTEGER REFERENCES payees(id),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    description TEXT,
    is_one_time BOOLEAN DEFAULT FALSE,
    payee_name VARCHAR(255), -- For one-time bills
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bill_payments table for payment history
CREATE TABLE bill_payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 