-- Create missing user accounts for existing sauna owners
-- Based on the email addresses from the saunas table

-- Insert missing users (using INSERT OR IGNORE to avoid duplicates)
INSERT OR IGNORE INTO users (email, name, email_verified, status, created_at, updated_at)
VALUES 
    ('elamyslaivaroosa@gmail.com', 'Elämyslaiva Roosa', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mika.hirvinen@hotmail.com', 'HuvilaLautta', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('jukka.oksala7@gmail.com', 'Jukka Oksala', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kippari@suomenkatamaraani.fi', 'Saunakatamaraani', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('info@tampereenvesijettivuokraus.fi', 'Tampereen Vesijettivuokraus', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('info@saunalauttaauroora.fi', 'Saunalautta Auroora', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('korentoartofficial@gmail.com', 'Saunalautta Tyyne', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('tmi.hiltunen.lari@gmail.com', 'Tampereen Saunalautta', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update existing users with better names
UPDATE users SET name = 'Saunalautta Risteilyt' WHERE email = 'info@saunalauttaristeilyt.fi';
UPDATE users SET name = 'Paljulautta' WHERE email = 'info@paljulautta.fi';
UPDATE users SET name = 'Laineilla' WHERE email = 'santeri@laineille.fi';

-- Now link users to their saunas via user_saunas table
-- Clear existing relationships first (in case of duplicates)
DELETE FROM user_saunas;

-- Create user-sauna relationships
INSERT INTO user_saunas (user_id, sauna_id, role)
SELECT u.id, s.id, 'owner'
FROM users u
JOIN saunas s ON u.email = s.email;

-- Verify the results
SELECT 'User accounts created:' as info;
SELECT email, name, status FROM users ORDER BY name;

SELECT 'User-sauna relationships:' as info;
SELECT u.name as user_name, s.name as sauna_name, us.role
FROM users u
JOIN user_saunas us ON u.id = us.user_id
JOIN saunas s ON us.sauna_id = s.id
ORDER BY u.name, s.name;

SELECT 'Summary:' as info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM saunas) as total_saunas,
    (SELECT COUNT(*) FROM user_saunas) as total_relationships; 