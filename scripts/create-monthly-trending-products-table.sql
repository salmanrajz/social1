-- Create table for monthly trending products from API
CREATE TABLE IF NOT EXISTS monthly_trending_products_api (
  id BIGSERIAL PRIMARY KEY,
  collection_date VARCHAR(7) NOT NULL, -- Format: YYYY-MM
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
  CONSTRAINT unique_monthly_product UNIQUE (collection_date, ranking, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_monthly_collection_date ON monthly_trending_products_api(collection_date);
CREATE INDEX IF NOT EXISTS idx_monthly_ranking ON monthly_trending_products_api(ranking);
CREATE INDEX IF NOT EXISTS idx_monthly_product_id ON monthly_trending_products_api(product_id);
CREATE INDEX IF NOT EXISTS idx_monthly_gmv ON monthly_trending_products_api(gmv);
CREATE INDEX IF NOT EXISTS idx_monthly_date_ranking ON monthly_trending_products_api(collection_date, ranking);
CREATE INDEX IF NOT EXISTS idx_monthly_region ON monthly_trending_products_api(region);

-- Add comment
COMMENT ON TABLE monthly_trending_products_api IS 'Monthly trending products data scraped from Social1.ai API (getTopProducts endpoint)';

