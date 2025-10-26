// Simple test to run scraper and check database
const { main } = require('./daily-scraper-final.js');

async function testScraper() {
  try {
    console.log('🧪 Testing scraper...');
    await main();
    console.log('✅ Scraper test complete');
  } catch (error) {
    console.error('❌ Scraper test failed:', error.message);
  }
}

testScraper();




