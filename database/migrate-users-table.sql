-- Migration script to add authentication columns to existing users table
-- This handles the existing users table structure

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Update existing users with default names based on email
UPDATE users SET name = 'Sauna Owner' WHERE name = '' OR name IS NULL;

-- Create the missing index for status column
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Verify the updated structure
SELECT 'Users table updated successfully' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT * FROM users LIMIT 3; 