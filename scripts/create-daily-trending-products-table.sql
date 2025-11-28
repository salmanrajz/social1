-- Create table for daily trending products from API
CREATE TABLE IF NOT EXISTS daily_trending_products_api (
  id BIGSERIAL PRIMARY KEY,
  collection_date DATE NOT NULL,
  ranking INT NOT NULL,
  
  -- Product data
  product_id VARCHAR(100),
  product_name TEXT,
  price_value DECIMAL(15,2),
  price_display VARCHAR(50),
  units_sold INT DEFAULT 0,
  product_img_url TEXT,
  
  -- Shop data
  shop_name VARCHAR(200),
  shop_id VARCHAR(100),
  
  -- Categories
  categories JSONB,
  
  -- Metrics
  gmv DECIMAL(15,2) DEFAULT 0,
  video_count INT DEFAULT 0,
  creator_count INT DEFAULT 0,
  region VARCHAR(10) DEFAULT 'us',
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_daily_product UNIQUE (collection_date, ranking, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_collection_date ON daily_trending_products_api(collection_date);
CREATE INDEX IF NOT EXISTS idx_daily_ranking ON daily_trending_products_api(ranking);
CREATE INDEX IF NOT EXISTS idx_daily_product_id ON daily_trending_products_api(product_id);
CREATE INDEX IF NOT EXISTS idx_daily_gmv ON daily_trending_products_api(gmv);
CREATE INDEX IF NOT EXISTS idx_daily_date_ranking ON daily_trending_products_api(collection_date, ranking);
CREATE INDEX IF NOT EXISTS idx_daily_region ON daily_trending_products_api(region);

-- Add comment
COMMENT ON TABLE daily_trending_products_api IS 'Daily trending products data scraped from Social1.ai API (getTopProducts endpoint)';

