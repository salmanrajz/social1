#!/bin/bash

echo "🗄️ Setting up Turso database for TikTok Viral Trends App"
echo "=================================================="

# Check if user is logged in
if ! turso auth whoami &> /dev/null; then
    echo "❌ You need to login to Turso first!"
    echo "Run: turso auth signup (for new users) or turso auth login (existing users)"
    exit 1
fi

echo "✅ Logged in to Turso as: $(turso auth whoami)"

# Create database
echo "🚀 Creating database 'social1-app'..."
turso db create social1-app

# Get database URL
echo "📋 Getting database URL..."
DB_URL=$(turso db show social1-app --url)

echo "✅ Database created successfully!"
echo "📋 Your database URL: $DB_URL"
echo ""
echo "🔧 Add this to your .env file:"
echo "DATABASE_URL=\"$DB_URL\""
echo ""
echo "🚀 Next steps:"
echo "1. Add the DATABASE_URL to your .env file"
echo "2. Run: npx prisma db push"
echo "3. Run: npx prisma generate"
echo "4. Start your app: npm run dev"
