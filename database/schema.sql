-- Create tracked_products table
CREATE TABLE tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  product_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create price_history table
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tracked_products(id) ON DELETE CASCADE,
  price DECIMAL(10, 2),
  stock INT,
  scraped_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'retry', 'failed')),
  error_message TEXT,
  attempt_number INT DEFAULT 1
);

-- Create scrape_log table for detailed logging
CREATE TABLE scrape_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES tracked_products(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'retry', 'failed')),
  timestamp TIMESTAMP DEFAULT NOW(),
  error_message TEXT,
  price DECIMAL(10, 2),
  stock INT
);

-- Create indexes for fast queries
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_scraped_at ON price_history(scraped_at DESC);
CREATE INDEX idx_scrape_log_product_id ON scrape_log(product_id);
CREATE INDEX idx_scrape_log_timestamp ON scrape_log(timestamp DESC);
