const { Actor } = require('apify');
const { log } = require('apify');

Actor.main(async () => {
    const input = await Actor.getInput();
    const {
        query,
        region = 'us',
        limit = 50,
        maxRetries = 3,
        delayBetweenRequests = 1000,
        includeDetails = true,
        minTrendingScore = 0,
        minUnitsSold = 0,
        category = null,
        priceRange = null
    } = input;

    log.info('Starting TikTok Product Finder...', { input });

    if (!query) {
        throw new Error('Query parameter is required for product search');
    }

    const results = [];
    let retryCount = 0;
    let hasMore = true;
    let currentOffset = 0;

    while (hasMore && results.length < limit) {
        try {
            log.info(`Searching for products with query: "${query}" at offset ${currentOffset}...`);
            
            const apiUrl = new URL('https://www.social1.ai/api/products/search');
            apiUrl.searchParams.set('query', query);
            apiUrl.searchParams.set('region', region);

            const response = await fetch(apiUrl.toString(), {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'cookie': '_ga=GA1.1.1881742864.1759043181; _ga_KW1C8BH7Q1=GS2.1.s1759063488$o3$g1$t1759063555$j57$l0$h0; __Host-next-auth.csrf-token=a94e8ab6ff9168567f058830865b30d19c4fc6486b91f324e97b3b3d7329029d%7C1021bc754a0c458bd4123d7e1a2c0f4e36609566ad7aa1a861322c660277e78e; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1ayzYZtJzTLv5gDvdBJQbM45ufEErT8cSNgSlnXTR6UzppDvqPiRJenG9; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..QT0laU5AOAhYAg5o.VWJETykLfJPFy8mh6fSrW6df_iCk-bf-Y96ym1clw8WuHL3UTTI5Wm4nW2Ezr78i177A2-8sYbbngKxq-GwRl5c5XqxCpBUCDoIxypU007Ijq0TrkUAjolP3hZkw_W5w9Zct4BAUg4guAyz7ca2gbd2taR-SsLR3ElsE9QFoF1hAnfV-y-ZHdG9fmDfN9fErBGSkeb_Yq2P0P4Z56lAStlsjYk0ffc9c07mKveQKv6WatZ1xw5fE4lWlaTkXXY87ByMyfu9sYurgI-p9nohKU-Y5n5_j6rkYQwrlAhNLk3bKeHjtaxi7yB5qr9abJvuQGesJLF-EyRKM4qwvZ0KgqsbiZIM8yMQJWEAf1oiBFpiMRsWvMVNPJTaHxTI28w.T0j5xEdh5MN0pq-pOz26vg; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2268e513b98343115e47e60b8e%22%2C%22%24sesid%22%3A%5B1759865140361%2C%220199c021-aafb-7d27-b50a-1a4b20417b26%22%2C1759865055995%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D',
                    'priority': 'u=1, i',
                    'referer': 'https://www.social1.ai/',
                    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Social1 API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid response format from API');
            }

            // Process and enhance the data with detailed analysis
            const processedResults = data.results.map((product, index) => {
                const trendingScore = calculateTrendingScore(product);
                const viralScore = calculateViralScore(product);
                const marketabilityScore = calculateMarketabilityScore(product);
                const competitionScore = calculateCompetitionScore(product);
                
                const enhancedProduct = {
                    // Basic product info
                    product_id: product.product_id,
                    name: product.name,
                    // description: product.description || null, // HIDDEN
                    
                    // Pricing information
                    price_value: product.price_value,
                    price_display: product.price_display,
                    // original_price: product.original_price || null, // HIDDEN
                    // discount_percentage: calculateDiscountPercentage(product), // HIDDEN
                    
                    // Sales performance
                    units_sold: product.units_sold || 0,
                    // gmv: product.gmv || 0, // HIDDEN
                    // revenue_per_unit: product.price_value > 0 ? (product.gmv / product.units_sold) : 0, // HIDDEN
                    
                    // Content performance
                    // video_count: product.video_count || 0, // HIDDEN
                    // creator_count: product.creator_count || 0, // HIDDEN
                    // avg_views_per_video: calculateAvgViewsPerVideo(product), // HIDDEN
                    // avg_engagement_per_video: calculateAvgEngagement(product), // HIDDEN
                    
                    // Visual assets
                    product_img_url: product.product_img_url,
                    product_url: product.product_url || `https://www.tiktok.com/shop/${region}/pdp/${product.product_id}`,
                    // additional_images: product.additional_images || [], // HIDDEN
                    
                    // Categorization
                    // categories: product.categories || [], // HIDDEN
                    tags: extractTags(product),
                    brand: extractBrand(product),
                    
                    // Shop information
                    shop: {
                        shop_id: product.shop?.shop_id,
                        shop_name: product.shop?.shop_name,
                        shop_img_url: product.shop?.shop_img_url,
                        shop_rating: product.shop?.rating || null,
                        shop_followers: product.shop?.followers || null,
                        shop_verified: product.shop?.verified || false
                    },
                    
                    // Calculated scores and metrics
                    // trending_score: trendingScore, // HIDDEN
                    // viral_score: viralScore, // HIDDEN
                    marketability_score: marketabilityScore,
                    // competition_score: competitionScore, // HIDDEN
                    overall_score: calculateOverallScore(trendingScore, viralScore, marketabilityScore),
                    
                    // Market analysis
                    market_position: determineMarketPosition(product),
                    target_audience: analyzeTargetAudience(product),
                    // seasonal_trends: analyzeSeasonalTrends(product), // HIDDEN
                    
                    // Business metrics
                    profit_potential: calculateProfitPotential(product),
                    roi_estimate: calculateROIEstimate(product),
                    // break_even_analysis: calculateBreakEven(product), // HIDDEN
                    
                    // Engagement metrics
                    // engagement_rate: product.video_count > 0 ? (product.creator_count / product.video_count) : 0, // HIDDEN
                    // conversion_rate: calculateConversionRate(product), // HIDDEN
                    // customer_acquisition_cost: calculateCAC(product), // HIDDEN
                    
                    // Additional metadata
                    region,
                    search_query: query,
                    found_at: new Date().toISOString(),
                    // data_quality: assessDataQuality(product), // HIDDEN
                    
                    // Detailed analytics (if includeDetails is true)
                    // ...(includeDetails && {
                    //     detailed_analytics: {
                    //         sales_velocity: calculateSalesVelocity(product),
                    //         price_elasticity: calculatePriceElasticity(product),
                    //         competitor_analysis: analyzeCompetitors(product),
                    //         market_saturation: assessMarketSaturation(product),
                    //         growth_potential: assessGrowthPotential(product),
                    //         risk_assessment: assessRiskFactors(product)
                    //     }
                    // }) // HIDDEN
                };

                return enhancedProduct;
            });

            // Apply filters
            const filteredResults = processedResults.filter(product => {
                if (product.trending_score < minTrendingScore) return false;
                if (product.units_sold < minUnitsSold) return false;
                if (category && !product.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))) return false;
                if (priceRange) {
                    const price = product.price_value;
                    if (priceRange.min && price < priceRange.min) return false;
                    if (priceRange.max && price > priceRange.max) return false;
                }
                return true;
            });

            results.push(...filteredResults);
            
            // Check if we have more results
            hasMore = data.results.length > 0 && results.length < limit;
            currentOffset += data.results.length;
            retryCount = 0;

            log.info(`Found ${filteredResults.length} products (${processedResults.length} total). Total: ${results.length}`);

            // Add delay between requests
            if (hasMore && results.length < limit) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
            }

        } catch (error) {
            retryCount++;
            log.error(`Error searching products (attempt ${retryCount}/${maxRetries}):`, error);
            
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

    // Sort results by overall score
    results.sort((a, b) => b.overall_score - a.overall_score);

    log.info(`Product search completed. Total products found: ${results.length}`);

    // Save results to dataset
    await Actor.pushData(results);

    // Set output statistics
    await Actor.setValue('OUTPUT', {
        totalProducts: results.length,
        searchQuery: query,
        region,
        searchedAt: new Date().toISOString(),
        topProduct: results[0] || null,
        averageTrendingScore: results.length > 0 ? Math.round(results.reduce((sum, p) => sum + p.trending_score, 0) / results.length) : 0,
        averagePrice: results.length > 0 ? Math.round(results.reduce((sum, p) => sum + p.price_value, 0) / results.length * 100) / 100 : 0,
        totalCategories: [...new Set(results.flatMap(p => p.categories))].length,
        totalShops: [...new Set(results.map(p => p.shop.shop_id).filter(Boolean))].length,
        marketInsights: generateMarketInsights(results)
    });

    log.info('TikTok Product Finder completed successfully!');
});

/**
 * Calculate comprehensive trending score
 */
function calculateTrendingScore(product) {
    const { units_sold = 0 } = product; // Only units_sold is visible, others are hidden
    
    let score = 0;
    
    // Sales performance (40% weight)
    score += Math.min(units_sold * 0.08, 40);
    
    // Revenue performance (25% weight) - HIDDEN - gmv is hidden
    // score += Math.min(gmv * 0.002, 25);
    score += Math.min(units_sold * 0.02, 25); // Use units_sold as proxy
    
    // Content activity (20% weight) - HIDDEN - video_count is hidden
    // score += Math.min(video_count * 1.5, 20);
    score += Math.min(units_sold * 0.01, 20); // Use units_sold as proxy
    
    // Creator diversity (15% weight) - HIDDEN - creator_count is hidden
    // score += Math.min(creator_count * 2, 15);
    score += Math.min(units_sold * 0.005, 15); // Use units_sold as proxy
    
    return Math.round(Math.min(score, 100));
}

/**
 * Calculate viral potential score
 */
function calculateViralScore(product) {
    const { units_sold = 0 } = product; // Only units_sold is visible, others are hidden
    
    // if (video_count === 0) return 0; // HIDDEN - video_count is hidden
    
    // const salesPerVideo = units_sold / video_count; // HIDDEN - video_count is hidden
    // const creatorDiversity = creator_count / video_count; // HIDDEN - creator_count, video_count are hidden
    // const viralMultiplier = Math.min(salesPerVideo * 0.3, 40); // HIDDEN
    // const diversityBonus = Math.min(creatorDiversity * 25, 30); // HIDDEN
    // const contentVolume = Math.min(video_count * 0.8, 30); // HIDDEN - video_count is hidden
    
    // Use units_sold as proxy for viral potential
    const viralPotential = Math.min(units_sold * 0.05, 100);
    
    return Math.round(viralPotential);
}

/**
 * Calculate marketability score
 */
function calculateMarketabilityScore(product) {
    const { price_value = 0, units_sold = 0 } = product;
    
    let score = 0;
    
    // Price competitiveness (30% weight)
    if (price_value > 0 && price_value <= 50) score += 30;
    else if (price_value <= 100) score += 20;
    else if (price_value <= 200) score += 10;
    
    // Category popularity (25% weight) - HIDDEN - categories are hidden
    // const popularCategories = ['beauty', 'fashion', 'home', 'electronics', 'fitness'];
    // const hasPopularCategory = categories.some(cat => 
    //     popularCategories.some(pop => cat.toLowerCase().includes(pop))
    // );
    // score += hasPopularCategory ? 25 : 10;
    score += 15; // Default score since categories are hidden
    
    // Sales volume (25% weight)
    score += Math.min(units_sold * 0.02, 25);
    
    // Brand recognition (20% weight)
    const brand = extractBrand(product);
    score += brand && brand.length > 2 ? 20 : 10;
    
    return Math.round(Math.min(score, 100));
}

/**
 * Calculate competition score (lower is better)
 */
function calculateCompetitionScore(product) {
    // const { creator_count = 0, video_count = 0, categories = [] } = product; // HIDDEN - creator_count, video_count, categories are hidden
    
    let competition = 0;
    
    // High creator count = high competition (HIDDEN - creator_count is hidden)
    // competition += Math.min(creator_count * 2, 40);
    
    // High video count = high competition (HIDDEN - video_count is hidden)
    // competition += Math.min(video_count * 1.5, 35);
    
    // Popular categories = high competition (HIDDEN - categories are hidden)
    // const competitiveCategories = ['beauty', 'fashion', 'electronics'];
    // const hasCompetitiveCategory = categories.some(cat => 
    //     competitiveCategories.some(comp => cat.toLowerCase().includes(comp))
    // );
    // competition += hasCompetitiveCategory ? 25 : 10;
    competition += 15; // Default competition score since related fields are hidden
    
    return Math.round(Math.min(competition, 100));
}

/**
 * Calculate overall product score
 */
function calculateOverallScore(trending, viral, marketability) {
    return Math.round((trending * 0.4 + viral * 0.3 + marketability * 0.3));
}

/**
 * Calculate discount percentage
 */
function calculateDiscountPercentage(product) {
    if (product.original_price && product.price_value) {
        const discount = ((product.original_price - product.price_value) / product.original_price) * 100;
        return Math.round(Math.max(0, discount));
    }
    return 0;
}

/**
 * Calculate average views per video (estimated)
 */
function calculateAvgViewsPerVideo(product) {
    const { video_count = 0, units_sold = 0 } = product;
    if (video_count === 0) return 0;
    
    // Estimate views based on sales (rough conversion rate of 0.5%)
    return Math.round(units_sold / video_count * 200);
}

/**
 * Calculate average engagement per video
 */
function calculateAvgEngagement(product) {
    const { video_count = 0, creator_count = 0 } = product;
    if (video_count === 0) return 0;
    
    return Math.round((creator_count / video_count) * 100);
}

/**
 * Extract tags from product data
 */
function extractTags(product) {
    const tags = [];
    
    // Add category tags (HIDDEN - categories are hidden)
    // if (product.categories) {
    //     tags.push(...product.categories);
    // }
    
    // Add brand tag
    const brand = extractBrand(product);
    if (brand) {
        tags.push(brand);
    }
    
    // Add price range tag
    const price = product.price_value || 0;
    if (price <= 25) tags.push('budget');
    else if (price <= 100) tags.push('mid-range');
    else tags.push('premium');
    
    return [...new Set(tags)];
}

/**
 * Extract brand from product name
 */
function extractBrand(product) {
    const name = product.name || '';
    const words = name.split(' ');
    
    // Common brand patterns
    if (words.length > 0) {
        const firstWord = words[0].toLowerCase();
        if (firstWord.length > 2 && !['the', 'new', 'best', 'top'].includes(firstWord)) {
            return words[0];
        }
    }
    
    return null;
}

/**
 * Determine market position
 */
function determineMarketPosition(product) {
    const { units_sold = 0, price_value = 0 } = product;
    
    if (units_sold > 10000 && price_value < 50) return 'mass-market-leader';
    if (units_sold > 5000 && price_value < 100) return 'popular-choice';
    if (units_sold > 1000 && price_value > 100) return 'premium-niche';
    if (units_sold < 1000) return 'emerging-product';
    
    return 'competitive-market';
}

/**
 * Analyze target audience
 */
function analyzeTargetAudience(product) {
    const { price_value = 0 } = product;
    
    const audience = {
        primary: 'general',
        demographics: [],
        interests: []
    };
    
    // Age demographics based on categories (HIDDEN - categories are hidden)
    // if (categories.some(cat => cat.toLowerCase().includes('beauty'))) {
    //     audience.demographics.push('18-35');
    //     audience.interests.push('beauty', 'skincare');
    // }
    
    // if (categories.some(cat => cat.toLowerCase().includes('fitness'))) {
    //     audience.demographics.push('20-40');
    //     audience.interests.push('health', 'fitness');
    // }
    
    // Price-based demographics
    if (price_value <= 30) {
        audience.primary = 'budget-conscious';
        audience.demographics.push('students', 'young-adults');
    } else if (price_value >= 100) {
        audience.primary = 'affluent';
        audience.demographics.push('professionals', 'luxury-buyers');
    }
    
    return audience;
}

/**
 * Analyze seasonal trends
 */
function analyzeSeasonalTrends(product) {
    // const { categories = [] } = product; // HIDDEN - categories are hidden
    const trends = [];
    
    // Seasonal category mapping (HIDDEN - categories are hidden)
    // const seasonalMap = {
    //     'beauty': ['spring', 'summer'],
    //     'fashion': ['spring', 'summer', 'fall', 'winter'],
    //     'home': ['fall', 'winter'],
    //     'electronics': ['winter', 'holiday'],
    //     'fitness': ['new-year', 'summer']
    // };
    
    // categories.forEach(category => {
    //     Object.entries(seasonalMap).forEach(([cat, seasons]) => {
    //         if (category.toLowerCase().includes(cat)) {
    //             trends.push(...seasons);
    //         }
    //     });
    // });
    
    return [...new Set(trends)];
}

/**
 * Calculate profit potential
 */
function calculateProfitPotential(product) {
    const { price_value = 0, units_sold = 0 } = product;
    
    // Estimate cost at 40% of retail price
    const estimatedCost = price_value * 0.4;
    const profitPerUnit = price_value - estimatedCost;
    const totalProfit = profitPerUnit * units_sold;
    
    return {
        profit_per_unit: Math.round(profitPerUnit * 100) / 100,
        total_profit: Math.round(totalProfit),
        profit_margin: Math.round((profitPerUnit / price_value) * 100),
        cost_estimate: Math.round(estimatedCost * 100) / 100
    };
}

/**
 * Calculate ROI estimate
 */
function calculateROIEstimate(product) {
    const profit = calculateProfitPotential(product);
    const investment = profit.total_profit * 0.3; // 30% of profit as investment estimate
    
    return {
        roi_percentage: Math.round((profit.total_profit / investment) * 100),
        payback_period_days: Math.round(investment / (profit.total_profit / 30)), // 30 days estimate
        investment_required: Math.round(investment)
    };
}

/**
 * Calculate break-even analysis
 */
function calculateBreakEven(product) {
    const { price_value = 0 } = product;
    const profit = calculateProfitPotential(product);
    const breakEvenUnits = Math.ceil(profit.cost_estimate / profit.profit_per_unit);
    
    return {
        break_even_units: breakEvenUnits,
        break_even_revenue: Math.round(breakEvenUnits * price_value),
        break_even_days: Math.round(breakEvenUnits / 10) // Assuming 10 units/day average
    };
}

/**
 * Calculate conversion rate (estimated)
 */
function calculateConversionRate(product) {
    const { video_count = 0, units_sold = 0 } = product;
    if (video_count === 0) return 0;
    
    // Estimate 1000 views per video on average
    const estimatedViews = video_count * 1000;
    return Math.round((units_sold / estimatedViews) * 100 * 100) / 100; // Percentage with 2 decimals
}

/**
 * Calculate customer acquisition cost (estimated)
 */
function calculateCAC(product) {
    const { creator_count = 0, units_sold = 0, price_value = 0 } = product;
    if (units_sold === 0) return 0;
    
    // Estimate $100 per creator collaboration
    const estimatedMarketingCost = creator_count * 100;
    return Math.round((estimatedMarketingCost / units_sold) * 100) / 100;
}

/**
 * Assess data quality
 */
function assessDataQuality(product) {
    let quality = 100;
    
    if (!product.units_sold) quality -= 20;
    if (!product.price_value) quality -= 15;
    if (!product.video_count) quality -= 15;
    if (!product.creator_count) quality -= 10;
    if (!product.categories || product.categories.length === 0) quality -= 10;
    if (!product.product_img_url) quality -= 10;
    if (!product.shop?.shop_name) quality -= 10;
    
    return Math.max(0, quality);
}

/**
 * Calculate sales velocity
 */
function calculateSalesVelocity(product) {
    const { units_sold = 0 } = product;
    
    // Assume sales over 30 days
    const dailySales = units_sold / 30;
    const weeklySales = dailySales * 7;
    
    return {
        daily: Math.round(dailySales * 100) / 100,
        weekly: Math.round(weeklySales * 100) / 100,
        monthly: units_sold,
        trend: dailySales > 100 ? 'accelerating' : dailySales > 50 ? 'stable' : 'declining'
    };
}

/**
 * Calculate price elasticity (simplified)
 */
function calculatePriceElasticity(product) {
    const { price_value = 0, units_sold = 0 } = product;
    
    // Simplified elasticity calculation
    if (price_value < 25) return 'elastic'; // Price sensitive
    if (price_value < 100) return 'moderate';
    return 'inelastic'; // Less price sensitive
}

/**
 * Analyze competitors
 */
function analyzeCompetitors(product) {
    const { creator_count = 0, categories = [] } = product;
    
    return {
        competition_level: creator_count > 50 ? 'high' : creator_count > 20 ? 'medium' : 'low',
        market_saturation: creator_count > 100 ? 'saturated' : creator_count > 30 ? 'competitive' : 'opportunity',
        differentiation_potential: categories.length > 3 ? 'high' : 'medium'
    };
}

/**
 * Assess market saturation
 */
function assessMarketSaturation(product) {
    const { creator_count = 0, video_count = 0 } = product;
    const contentRatio = video_count / creator_count || 0;
    
    if (creator_count > 100 && contentRatio > 5) return 'high';
    if (creator_count > 50 && contentRatio > 3) return 'medium';
    return 'low';
}

/**
 * Assess growth potential
 */
function assessGrowthPotential(product) {
    const { units_sold = 0, trending_score = 0, categories = [] } = product;
    
    let potential = 0;
    
    // Sales volume potential
    if (units_sold < 1000) potential += 40;
    else if (units_sold < 5000) potential += 20;
    
    // Trending score potential
    if (trending_score > 80) potential += 30;
    else if (trending_score > 60) potential += 20;
    
    // Category growth potential
    const growingCategories = ['electronics', 'fitness', 'sustainable'];
    const hasGrowingCategory = categories.some(cat => 
        growingCategories.some(growing => cat.toLowerCase().includes(growing))
    );
    potential += hasGrowingCategory ? 30 : 10;
    
    return {
        score: Math.min(potential, 100),
        level: potential > 70 ? 'high' : potential > 40 ? 'medium' : 'low',
        factors: ['sales-volume', 'trending-momentum', 'category-growth']
    };
}

/**
 * Assess risk factors
 */
function assessRiskFactors(product) {
    const risks = [];
    
    if (!product.units_sold || product.units_sold < 100) {
        risks.push({ type: 'low-sales', severity: 'high', description: 'Very low sales volume' });
    }
    
    if (!product.video_count || product.video_count < 5) {
        risks.push({ type: 'low-content', severity: 'medium', description: 'Limited content creation' });
    }
    
    if (product.price_value > 200) {
        risks.push({ type: 'high-price', severity: 'medium', description: 'Premium pricing may limit adoption' });
    }
    
    if (!product.categories || product.categories.length === 0) {
        risks.push({ type: 'unclear-positioning', severity: 'low', description: 'Unclear product positioning' });
    }
    
    return {
        overall_risk: risks.length === 0 ? 'low' : risks.some(r => r.severity === 'high') ? 'high' : 'medium',
        risk_factors: risks
    };
}

/**
 * Generate market insights
 */
function generateMarketInsights(results) {
    if (results.length === 0) return null;
    
    const avgPrice = results.reduce((sum, p) => sum + p.price_value, 0) / results.length;
    const avgTrending = results.reduce((sum, p) => sum + p.trending_score, 0) / results.length;
    const totalSales = results.reduce((sum, p) => sum + p.units_sold, 0);
    
    const topCategories = results
        .flatMap(p => p.categories)
        .reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
    
    const topCategoriesList = Object.entries(topCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cat, count]) => ({ category: cat, count }));
    
    return {
        market_summary: {
            average_price: Math.round(avgPrice * 100) / 100,
            average_trending_score: Math.round(avgTrending),
            total_products_analyzed: results.length,
            total_sales_volume: totalSales
        },
        top_categories: topCategoriesList,
        market_opportunities: {
            price_gaps: avgPrice > 50 ? 'Budget segment opportunity' : 'Premium segment opportunity',
            category_gaps: topCategoriesList.length < 3 ? 'Diverse category opportunity' : 'Category saturation',
            trending_potential: avgTrending > 70 ? 'High trending momentum' : 'Growth opportunity'
        }
    };
}
