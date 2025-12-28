-- New Tables for Mimariproje Platform
-- Run this migration after adding models to schema.prisma

-- Reviews (Değerlendirme sistemi)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  completion_date DATE,
  client_name VARCHAR(200),
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  updated_at TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);

-- Portfolio Images
CREATE TABLE IF NOT EXISTS portfolio_images (
  id SERIAL PRIMARY KEY,
  portfolio_item_id INTEGER NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP(6) DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- skill, project_type, style
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP(6) DEFAULT NOW()
);

-- Project Tags (many-to-many)
CREATE TABLE IF NOT EXISTS project_tags (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- User Skills (many-to-many with proficiency)
CREATE TABLE IF NOT EXISTS user_skills (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50), -- beginner, intermediate, expert
  PRIMARY KEY (user_id, tag_id)
);

-- Escrow Transactions (emanet sistemi)
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(4, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  seller_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, released, refunded, disputed
  payment_id INTEGER REFERENCES payments(id),
  created_at TIMESTAMP(6) DEFAULT NOW(),
  released_at TIMESTAMP(6),
  disputed_at TIMESTAMP(6),
  resolved_at TIMESTAMP(6)
);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_id ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);

-- Job Packages
CREATE TABLE IF NOT EXISTS job_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  job_count INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  validity_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(6) DEFAULT NOW()
);

-- Insert default job packages
INSERT INTO job_packages (name, job_count, price, validity_days, is_active) VALUES
('Başlangıç', 10, 500.00, 365, true),
('Profesyonel', 20, 800.00, 365, true),
('Kurumsal', 50, 1500.00, 365, true)
ON CONFLICT DO NOTHING;

-- User Job Packages
CREATE TABLE IF NOT EXISTS user_job_packages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES job_packages(id),
  remaining_jobs INTEGER NOT NULL,
  purchased_at TIMESTAMP(6) DEFAULT NOW(),
  expires_at TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_job_packages_user_id ON user_job_packages(user_id);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  used_at TIMESTAMP(6),
  created_at TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);

-- Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  verified_at TIMESTAMP(6),
  created_at TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  device_info VARCHAR(500),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP(6) NOT NULL,
  revoked_at TIMESTAMP(6),
  created_at TIMESTAMP(6) DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);
