-- Customer testimonial/review system (order-triggered, admin-moderated).
-- Deliberately a separate table from `reviews` (per-product star ratings by
-- logged-in users, used by product.controller.js/product.repository.js) --
-- this is an order-level testimonial with its own moderation workflow.

CREATE TABLE IF NOT EXISTS customer_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT chk_customer_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_customer_reviews_status (status),
  INDEX idx_customer_reviews_order (order_id)
);
