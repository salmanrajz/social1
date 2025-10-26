#!/bin/bash

echo "🚀 GitHub Actions TikTok Daily Scraper Setup"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Add GitHub Actions daily TikTok scraper with Supabase"

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. 🔗 Connect to GitHub repository:"
echo "   git remote add origin https://github.com/yourusername/tiktok-daily-scraper.git"
echo "   git push -u origin main"
echo ""
echo "2. 🔐 Set repository secret in GitHub:"
echo "   - Go to Settings → Secrets and variables → Actions"
echo "   - Add secret: DATABASE_URL"
echo "   - Value: postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable"
echo ""
echo "3. 🧪 Test the workflow:"
echo "   - Go to Actions tab → Daily TikTok Trending Products Scraper"
echo "   - Click 'Run workflow' to test manually"
echo ""
echo "4. ⏰ Monitor daily execution:"
echo "   - Workflow runs daily at 9:00 AM UTC"
echo "   - Check Actions tab for logs"
echo "   - Check Supabase database for data"
echo ""
echo "🎉 Your daily TikTok scraper is ready!"
