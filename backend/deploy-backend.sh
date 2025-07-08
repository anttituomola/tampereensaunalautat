#!/bin/bash

# Deploy authentication backend to UpCloud server
# Usage: ./deploy-backend.sh

echo "🚀 Deploying authentication backend to UpCloud server..."

# Server details
SERVER_ALIAS="upcloud"
SERVER_PATH="/var/www/sauna-api"
LOCAL_FILES=("auth-routes.js" "server.js" "package.json" "env-template.txt")

# Check if all files exist
for file in "${LOCAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: $file not found!"
        exit 1
    fi
done

echo "📤 Uploading backend files to server..."

# Copy files to server
for file in "${LOCAL_FILES[@]}"; do
    echo "📁 Uploading $file..."
    scp "$file" "$SERVER_ALIAS:$SERVER_PATH/"
done

echo "🔧 Configuring server..."

# Connect to server and set up
ssh "$SERVER_ALIAS" << 'EOF'
    cd /var/www/sauna-api
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "📋 Creating .env file from template..."
    if [ ! -f ".env" ]; then
        cp env-template.txt .env
        echo "⚠️  Please update .env with your actual values"
    else
        echo "✅ .env file already exists"
    fi
    
    echo "🔄 Restarting API server..."
    pm2 restart sauna-api || pm2 start server.js --name sauna-api
    
    echo "📊 Server status:"
    pm2 status sauna-api
    
    echo "✅ Deployment complete!"
EOF

echo "✅ Backend deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. SSH into the server: ssh $SERVER_ALIAS"
echo "2. Navigate to: cd $SERVER_PATH"
echo "3. Edit .env file with your actual values:"
echo "   - JWT_SECRET (generate a secure random string)"
echo "   - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (for SES)"
echo "   - FROM_EMAIL (your verified SES email)"
echo "4. Restart the server: pm2 restart sauna-api"
echo ""
echo "🧪 Test the authentication endpoints:"
echo "curl https://api.tampereensaunalautat.fi/api/health"
echo "curl -X POST https://api.tampereensaunalautat.fi/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}'"
echo ""
echo "📋 Available endpoints:"
echo "  POST /api/auth/login - Request magic link"
echo "  POST /api/auth/verify - Verify magic link token"
echo "  POST /api/auth/refresh - Refresh JWT token"
echo "  POST /api/auth/logout - Logout user"
echo "  GET /api/auth/me - Get current user info"
echo "  GET /api/user/saunas - Get user's saunas"
echo "  PUT /api/sauna/:id - Update sauna"
echo "  GET /api/admin/users - Get all users (admin only)"
echo "  GET /api/admin/pending-saunas - Get pending saunas (admin only)" 