#!/bin/bash

# Deploy Authentication Schema to UpCloud Server
# Usage: ./deploy-auth-schema.sh

echo "🚀 Deploying authentication schema to UpCloud server..."

# Server details
SERVER_ALIAS="upcloud"
DB_PATH="/var/www/sauna-api/saunas.db"
SCHEMA_FILE="auth-schema.sql"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: $SCHEMA_FILE not found!"
    exit 1
fi

echo "📤 Copying schema file to server..."
scp "$SCHEMA_FILE" "$SERVER_ALIAS:/tmp/"

echo "📊 Applying schema to database..."
ssh "$SERVER_ALIAS" << 'EOF'
    cd /var/www/sauna-api
    
    # Backup existing database
    echo "📋 Creating database backup..."
    cp saunas.db "saunas.db.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Apply schema
    echo "🔧 Applying authentication schema..."
    sqlite3 saunas.db < /tmp/auth-schema.sql
    
    # Verify tables were created
    echo "✅ Verifying authentication tables..."
    sqlite3 saunas.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'magic_links', 'user_sessions', 'user_saunas', 'pending_saunas');"
    
    # Show user count
    echo "👥 Current user count:"
    sqlite3 saunas.db "SELECT COUNT(*) as user_count FROM users;"
    
    # Clean up
    rm /tmp/auth-schema.sql
    
    echo "🎉 Authentication schema deployed successfully!"
EOF

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update admin email in the users table"
echo "2. Create user accounts for existing sauna owners"
echo "3. Link existing saunas to users via user_saunas table"
echo ""
echo "To connect to the database:"
echo "ssh $SERVER_ALIAS"
echo "sqlite3 /var/www/sauna-api/saunas.db" 