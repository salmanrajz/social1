// Test GitHub Action locally
const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Testing GitHub Action locally...');

// Set the DATABASE_URL environment variable
process.env.DATABASE_URL = 'postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable';

const scraperScriptPath = path.resolve(__dirname, 'github-action-scraper.js');

console.log('📡 Running GitHub Action scraper...');
exec(`node ${scraperScriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ GitHub Action test failed: ${error.message}`);
    console.error(`Stderr: ${stderr}`);
    process.exit(1);
  }
  
  console.log(stdout);
  console.log('✅ GitHub Action test completed successfully!');
  console.log('🚀 Ready to push to GitHub and set up the cron job!');
});
