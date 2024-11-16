-- Drop existing notification tables if they exist
DROP TABLE IF EXISTS notification_settings;
DROP TABLE IF EXISTS notification_providers;
DROP TABLE IF EXISTS notification_types;

-- Create notification providers table
CREATE TABLE notification_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider_type VARCHAR(50) NOT NULL, -- 'EMAIL', 'PUSHOVER', 'DISCORD', 'SLACK'
    is_enabled BOOLEAN DEFAULT false,
    credentials JSONB, -- Store provider-specific credentials
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification types table
CREATE TABLE notification_types (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'BILL_DUE', 'BILL_OVERDUE', 'WEEKLY_SUMMARY', etc.
    is_enabled BOOLEAN DEFAULT false,
    settings JSONB, -- Store type-specific settings (frequency, advance notice, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create provider_type_mapping table (which providers are enabled for which notification types)
CREATE TABLE provider_type_mapping (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES notification_providers(id),
    type_id INTEGER REFERENCES notification_types(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_id, type_id)
); 