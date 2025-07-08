-- Cleanup script to finalize user data and verify authentication setup

-- Set proper names for existing users based on their email domains
UPDATE users SET name = 'Saunalautta Risteilyt' WHERE email = 'info@saunalauttaristeilyt.fi';
UPDATE users SET name = 'Paljulautta' WHERE email = 'info@paljulautta.fi';  
UPDATE users SET name = 'Laineilla' WHERE email = 'santeri@laineilla.fi';

-- Create an admin user (update email as needed)
INSERT OR IGNORE INTO users (id, email, name, is_admin, email_verified, status, created_at, updated_at)
VALUES ('admin-001', 'admin@tampereensaunalautat.fi', 'Admin User', 1, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify the final users table structure and data
SELECT 'Final users table structure:' as info;
.schema users

SELECT 'Current users:' as info;
SELECT id, email, name, is_admin, status, created_at FROM users;

SELECT 'Authentication tables:' as info;
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%magic%' OR name LIKE '%session%' OR name LIKE '%user_%';

SELECT 'Setup complete!' as status; 