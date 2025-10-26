const { Actor } = require('apify');
const { log } = require('apify');

Actor.main(async () => {
    const input = await Actor.getInput();
    const {
        limit = 12,
        offset = 0,
        days = 1,
        region = 'uk',
        shopId = null,
        maxRetries = 3,
        delayBetweenRequests = 1000
    } = input;

    log.info('Starting trending products scraper...', { input });

    const results = [];
    let currentOffset = offset;
    let hasMore = true;
    let retryCount = 0;

    while (hasMore && results.length < limit) {
        try {
            log.info(`Fetching products batch at offset ${currentOffset}...`);
            
            const apiUrl = new URL('https://www.social1.ai/api/products/getTopProducts');
            apiUrl.searchParams.set('limit', Math.min(50, limit - results.length));
            apiUrl.searchParams.set('offset', currentOffset);
            apiUrl.searchParams.set('days', days);
            apiUrl.searchParams.set('region', region);
            
            if (shopId) {
                apiUrl.searchParams.set('shopId', shopId);
            }

            const response = await fetch(apiUrl.toString(), {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'priority': 'u=1, i'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid response format from API');
            }

            // Process and enhance the data
            const processedResults = data.results.map((product, index) => {
                const rank = currentOffset + index + 1;
                const trendingScore = calculateTrendingScore(product);
                
                return {
                    rank,
                    product_id: product.product_id,
                    name: product.name,
                    price_value: product.price_value,
                    price_display: product.price_display,
                    units_sold: product.units_sold,
                    gmv: product.gmv,
                    video_count: product.video_count,
                    creator_count: product.creator_count,
                    product_img_url: product.product_img_url,
                    categories: product.categories || [],
                    shop: {
                        shop_id: product.shop?.shop_id,
                        shop_name: product.shop?.shop_name,
                        shop_img_url: product.shop?.shop_img_url
                    },
                    trending_score: trendingScore,
                    viral_score: calculateViralScore(product),
                    region,
                    days_period: days,
                    scraped_at: new Date().toISOString(),
                    // Additional calculated fields
                    revenue_per_video: product.video_count > 0 ? (product.gmv / product.video_count) : 0,
                    sales_per_creator: product.creator_count > 0 ? (product.units_sold / product.creator_count) : 0,
                    engagement_rate: product.video_count > 0 ? (product.creator_count / product.video_count) : 0
                };
            });

            results.push(...processedResults);
            
            hasMore = data.has_more && results.length < limit;
            currentOffset += data.results.length;
            retryCount = 0; // Reset retry count on success

            log.info(`Fetched ${processedResults.length} products. Total: ${results.length}`);

            // Add delay between requests to be respectful
            if (hasMore && results.length < limit) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
            }

        } catch (error) {
            retryCount++;
            log.error(`Error fetching products (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount >= maxRetries) {
                log.error('Max retries reached. Stopping...');
                break;
            }
            
            // Exponential backoff
            const backoffDelay = delayBetweenRequests * Math.pow(2, retryCount - 1);
            log.info(`Retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }

    log.info(`Scraping completed. Total products: ${results.length}`);

    // Save results to dataset
    await Actor.pushData(results);

    // Set output statistics
    await Actor.setValue('OUTPUT', {
        totalProducts: results.length,
        region,
        daysPeriod: days,
        scrapedAt: new Date().toISOString(),
        topProduct: results[0] || null,
        categories: [...new Set(results.flatMap(p => p.categories))],
        totalShops: [...new Set(results.map(p => p.shop.shop_id).filter(Boolean))].length
    });

    log.info('Trending products scraping completed successfully!');
});

/**
 * Calculate trending score based on multiple factors
 */
function calculateTrendingScore(product) {
    const { units_sold = 0, gmv = 0, video_count = 0, creator_count = 0 } = product;
    
    // Base score from sales
    let score = Math.min(units_sold * 0.1, 50);
    
    // Revenue boost
    score += Math.min(gmv * 0.001, 30);
    
    // Video activity boost
    score += Math.min(video_count * 2, 15);
    
    // Creator diversity boost
    score += Math.min(creator_count * 1.5, 5);
    
    return Math.round(Math.min(score, 100));
}

/**
 * Calculate viral score based on engagement metrics
 */
function calculateViralScore(product) {
    const { video_count = 0, creator_count = 0, units_sold = 0 } = product;
    
    if (video_count === 0) return 0;
    
    // Viral score based on sales per video and creator diversity
    const salesPerVideo = units_sold / video_count;
    const creatorDiversity = creator_count / video_count;
    
    let viralScore = Math.min(salesPerVideo * 0.5, 40);
    viralScore += Math.min(creatorDiversity * 20, 30);
    viralScore += Math.min(video_count * 0.5, 30);
    
    return Math.round(Math.min(viralScore, 100));
}





