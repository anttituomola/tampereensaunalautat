-- Authentication Database Schema for Tampereensaunalautat.fi
-- Execute this on the UpCloud server to create authentication tables

-- Users table - stores sauna owner accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Magic links table - stores authentication tokens
CREATE TABLE IF NOT EXISTS magic_links (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- User sessions table - stores JWT refresh tokens
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sauna ownership table - links users to their saunas
CREATE TABLE IF NOT EXISTS user_saunas (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    sauna_id TEXT NOT NULL,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'viewer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sauna_id) REFERENCES saunas(id) ON DELETE CASCADE,
    UNIQUE(user_id, sauna_id)
);

-- Pending sauna registrations table - new saunas awaiting approval
CREATE TABLE IF NOT EXISTS pending_saunas (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_email TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    event_length INTEGER NOT NULL,
    price_min INTEGER NOT NULL,
    price_max INTEGER NOT NULL,
    equipment TEXT NOT NULL, -- JSON array
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    url TEXT,
    notes TEXT,
    winter BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by TEXT,
    reviewed_at DATETIME,
    rejection_reason TEXT,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Add owner_email column to existing saunas table if it doesn't exist
-- ALTER TABLE saunas ADD COLUMN owner_email TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_saunas_user_id ON user_saunas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saunas_sauna_id ON user_saunas(sauna_id);
CREATE INDEX IF NOT EXISTS idx_pending_saunas_status ON pending_saunas(status);
CREATE INDEX IF NOT EXISTS idx_pending_saunas_owner_email ON pending_saunas(owner_email);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_pending_saunas_updated_at
    AFTER UPDATE ON pending_saunas
    FOR EACH ROW
    BEGIN
        UPDATE pending_saunas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Clean up expired magic links (run this periodically)
CREATE VIEW IF NOT EXISTS expired_magic_links AS
SELECT * FROM magic_links 
WHERE expires_at < CURRENT_TIMESTAMP AND used = 0;

-- Clean up expired sessions (run this periodically)
CREATE VIEW IF NOT EXISTS expired_sessions AS
SELECT * FROM user_sessions 
WHERE expires_at < CURRENT_TIMESTAMP;

-- Insert default admin user (update email as needed)
INSERT OR IGNORE INTO users (id, email, name, is_admin, email_verified, status)
VALUES ('admin-001', 'admin@tampereensaunalautat.fi', 'Admin User', 1, 1, 'active');

-- Sample data: Create user accounts for existing sauna owners
-- These should be updated with actual owner emails from the saunas table
INSERT OR IGNORE INTO users (email, name, email_verified, status)
VALUES 
    ('owner1@example.com', 'Sauna Owner 1', 1, 'active'),
    ('owner2@example.com', 'Sauna Owner 2', 1, 'active'),
    ('owner3@example.com', 'Sauna Owner 3', 1, 'active');

-- Link existing saunas to users (example - update with actual data)
-- INSERT OR IGNORE INTO user_saunas (user_id, sauna_id, role)
-- SELECT u.id, s.id, 'owner'
-- FROM users u, saunas s
-- WHERE u.email = s.owner_email;

-- Useful queries for management:
-- 1. Get all users with their saunas:
--    SELECT u.*, s.name as sauna_name FROM users u 
--    LEFT JOIN user_saunas us ON u.id = us.user_id
--    LEFT JOIN saunas s ON us.sauna_id = s.id;

-- 2. Get active magic links:
--    SELECT * FROM magic_links WHERE expires_at > CURRENT_TIMESTAMP AND used = 0;

-- 3. Get pending sauna registrations:
--    SELECT * FROM pending_saunas WHERE status = 'pending';

-- 4. Clean up expired tokens:
--    DELETE FROM magic_links WHERE expires_at < CURRENT_TIMESTAMP;
--    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP; 