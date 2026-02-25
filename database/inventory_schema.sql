-- ===============================
-- 1. CREATE DATABASE
-- ===============================
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;


-- ===============================
-- 2. PRODUCTS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),

  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity >= 0),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_product_name (name),
  INDEX idx_product_category (category)
) ENGINE=InnoDB;


-- ===============================
-- 3. SALES TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,

  product_id INT NOT NULL,
  quantity_sold INT NOT NULL CHECK (quantity_sold > 0),
  total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sales_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_sales_product (product_id),
  INDEX idx_sales_date (created_at)
) ENGINE=InnoDB;

-- DAILY REVENUE
SELECT 
  DATE(created_at) AS date,
  COALESCE(SUM(total_price),0) AS revenue
FROM sales
GROUP BY DATE(created_at)
ORDER BY date;

-- MONTHLY REVENUE
SELECT 
  DATE_FORMAT(created_at, '%Y-%m') AS month,
  COALESCE(SUM(total_price),0) AS revenue
FROM sales
GROUP BY month
ORDER BY month;

-- DASHBOARD
SELECT COUNT(*) AS total_products FROM products;
SELECT COALESCE(SUM(total_price),0) AS total_revenue FROM sales;