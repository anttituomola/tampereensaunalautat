-- Create user-sauna relationships manually
-- Link each sauna to its owner based on email addresses

-- First, let's see what we have to work with
SELECT 'Current Users:' as info;
SELECT email, name FROM users WHERE email != 'admin@tampereensaunalautat.fi' ORDER BY email;

SELECT 'Current Saunas:' as info;  
SELECT name, email FROM saunas ORDER BY name;

-- Now create the relationships
INSERT INTO user_saunas (user_id, sauna_id, role)
SELECT u.id, s.id, 'owner'
FROM users u, saunas s
WHERE u.email = s.email
  AND u.email != 'admin@tampereensaunalautat.fi';

-- Verify the results
SELECT 'User-Sauna Relationships Created:' as info;
SELECT u.name as owner_name, s.name as sauna_name, us.role
FROM users u
JOIN user_saunas us ON u.id = us.user_id
JOIN saunas s ON us.sauna_id = s.id
ORDER BY u.name, s.name;

SELECT 'Summary:' as info;
SELECT 
    (SELECT COUNT(*) FROM users WHERE email != 'admin@tampereensaunalautat.fi') as sauna_owners,
    (SELECT COUNT(*) FROM saunas) as total_saunas,
    (SELECT COUNT(*) FROM user_saunas) as total_relationships; 