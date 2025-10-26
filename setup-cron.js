const { exec } = require('child_process');
const path = require('path');

// Setup daily cron job to run at 9 AM
function setupCronJob() {
  const scriptPath = path.join(__dirname, 'daily-trending-scraper.js');
  const cronExpression = '0 9 * * *'; // 9 AM daily
  
  const cronCommand = `crontab -l | grep -v "daily-trending-scraper" | { cat; echo "${cronExpression} cd ${__dirname} && node ${scriptPath} >> /var/log/daily-trending-scraper.log 2>&1"; } | crontab -`;
  
  console.log('🕘 Setting up daily cron job for 9 AM...');
  console.log(`📁 Script path: ${scriptPath}`);
  console.log(`⏰ Cron expression: ${cronExpression} (9 AM daily)`);
  
  exec(cronCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error setting up cron job:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Cron setup warning:', stderr);
    }
    
    console.log('✅ Cron job setup complete!');
    console.log('📋 Current crontab:');
    
    // Show current crontab
    exec('crontab -l', (err, output) => {
      if (!err) {
        console.log(output);
      }
    });
  });
}

// Manual execution function
function runNow() {
  console.log('🚀 Running scraper manually...');
  const { main } = require('./daily-trending-scraper.js');
  main();
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupCronJob();
    break;
  case 'run':
    runNow();
    break;
  case 'compare':
    const { getDailyComparison } = require('./daily-trending-scraper.js');
    const date1 = process.argv[3] || '2025-01-17';
    const date2 = process.argv[4] || '2025-01-16';
    getDailyComparison(date1, date2);
    break;
  default:
    console.log('📖 Usage:');
    console.log('  node setup-cron.js setup    - Setup daily cron job (9 AM)');
    console.log('  node setup-cron.js run      - Run scraper manually');
    console.log('  node setup-cron.js compare  - Compare two dates');
    console.log('');
    console.log('📝 Examples:');
    console.log('  node setup-cron.js run');
    console.log('  node setup-cron.js compare 2025-01-20 2025-01-19');
    break;
}




