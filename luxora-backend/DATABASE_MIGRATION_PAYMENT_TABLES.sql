-- ═══════════════════════════════════════════════════════════════════════════════
-- PAYMENT SYSTEM DATABASE MIGRATION
-- Comprehensive payment tables for complete e-commerce payment handling
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PAYMENT METHODS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(500),
  is_enabled BOOLEAN DEFAULT TRUE,
  processing_fee DECIMAL(5, 2) DEFAULT 0,
  min_amount DECIMAL(10, 2) DEFAULT 0,
  max_amount DECIMAL(10, 2) DEFAULT 999999.99,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert payment methods
INSERT INTO payment_methods (name, code, description, icon, is_enabled, processing_fee, sort_order) VALUES
('Credit Card', 'credit_card', 'Visa, Mastercard, American Express', '/icons/credit-card.svg', TRUE, 2.5, 1),
('Debit Card', 'debit_card', 'Bank debit cards', '/icons/debit-card.svg', TRUE, 1.5, 2),
('UPI', 'upi', 'Google Pay, PhonePe, Paytm, WhatsApp Pay', '/icons/upi.svg', TRUE, 0, 3),
('Net Banking', 'net_banking', 'Online banking transfer', '/icons/net-banking.svg', TRUE, 1.0, 4),
('Digital Wallet', 'wallet', 'In-app wallet balance', '/icons/wallet.svg', TRUE, 0, 5),
('Buy Now Pay Later', 'bnpl', 'Installment payment options', '/icons/bnpl.svg', TRUE, 3.5, 6)
ON DUPLICATE KEY UPDATE is_enabled=is_enabled;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SAVED CARDS/PAYMENT INSTRUMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saved_payment_instruments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_method_id INT NOT NULL,
  instrument_type ENUM('credit_card', 'debit_card', 'upi', 'bnpl') NOT NULL,

  -- For cards
  card_token VARCHAR(255) UNIQUE,
  last_four_digits VARCHAR(4),
  card_holder_name VARCHAR(255),
  expiry_month INT CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INT,
  card_brand VARCHAR(50),

  -- For UPI
  upi_id VARCHAR(255) UNIQUE,

  -- For bank accounts
  account_number_token VARCHAR(255),
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  ifsc_code VARCHAR(11),

  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  verification_attempts INT DEFAULT 0,
  verification_expires_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  INDEX idx_user (user_id),
  INDEX idx_default (is_default),
  INDEX idx_verified (is_verified),
  UNIQUE KEY unique_default (user_id, is_default) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. PAYMENTS TABLE (Main payment records)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_method_id INT,
  saved_instrument_id INT,

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund') DEFAULT 'pending',

  -- Gateway details
  gateway_name VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  gateway_reference_id VARCHAR(255),
  gateway_order_id VARCHAR(255),

  -- Payment details
  payment_notes TEXT,
  failure_reason TEXT,
  failure_code VARCHAR(50),

  -- Fees
  gateway_fee DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  total_charged DECIMAL(12, 2),

  -- Refund tracking
  refunded_amount DECIMAL(12, 2) DEFAULT 0,
  refund_status ENUM('no_refund', 'partial_refund', 'full_refund') DEFAULT 'no_refund',

  -- Timestamps
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (saved_instrument_id) REFERENCES saved_payment_instruments(id),

  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_txn_id (transaction_id),
  INDEX idx_gateway_ref (gateway_reference_id),
  INDEX idx_created (created_at),
  UNIQUE KEY unique_order_payment (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. PAYMENT TRANSACTIONS TABLE (Detailed transaction log)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT,
  user_id INT,

  transaction_type ENUM('payment', 'refund', 'reversal', 'capture', 'authorization') DEFAULT 'payment',

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('pending', 'processing', 'success', 'failed', 'reversed') DEFAULT 'pending',

  -- Gateway details
  gateway_transaction_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,

  request_payload LONGTEXT,
  response_payload LONGTEXT,

  description VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_payment (payment_id),
  INDEX idx_order (order_id),
  INDEX idx_type (transaction_type),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. REFUNDS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  refund_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  refund_type ENUM('full', 'partial') DEFAULT 'full',
  reason ENUM('customer_request', 'order_cancelled', 'product_return', 'defective_product', 'payment_error', 'duplicate_charge', 'other') DEFAULT 'customer_request',
  reason_description TEXT,

  status ENUM('initiated', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'initiated',

  -- Gateway details
  refund_transaction_id VARCHAR(255) UNIQUE,
  gateway_refund_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,

  initiated_by INT,
  initiator_type ENUM('user', 'admin', 'system') DEFAULT 'user',

  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_payment (payment_id),
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_reason (reason),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. PAYMENT DISPUTES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_disputes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  dispute_type ENUM('chargeback', 'fraud', 'service_not_received', 'unauthorized', 'other') NOT NULL,

  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('open', 'under_review', 'resolved', 'closed', 'accepted', 'rejected') DEFAULT 'open',

  -- Gateway details
  gateway_dispute_id VARCHAR(255),
  gateway_case_id VARCHAR(255),

  evidence_files JSON,
  supporting_documents JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_payment (payment_id),
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_type (dispute_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. PAYMENT WEBHOOKS/NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT,

  event_type VARCHAR(100) NOT NULL,
  event_source VARCHAR(50) NOT NULL,

  payload LONGTEXT NOT NULL,
  signature VARCHAR(500),

  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,

  INDEX idx_payment (payment_id),
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. WALLET TABLE (Digital wallet/store credit)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,

  balance DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',

  total_credited DECIMAL(12, 2) DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_refunded DECIMAL(12, 2) DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_balance (balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. WALLET TRANSACTIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_id INT NOT NULL,
  user_id INT NOT NULL,

  transaction_type ENUM('credit', 'debit', 'refund', 'adjustment') NOT NULL,

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  balance_before DECIMAL(12, 2),
  balance_after DECIMAL(12, 2),

  reference_type VARCHAR(50),
  reference_id INT,

  description VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_wallet (wallet_id),
  INDEX idx_user (user_id),
  INDEX idx_type (transaction_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. PAYMENT GATEWAY CREDENTIALS TABLE (Encrypted)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_gateway_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,

  gateway_name VARCHAR(50) NOT NULL UNIQUE,
  gateway_code VARCHAR(50) NOT NULL UNIQUE,

  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  merchant_id VARCHAR(255),
  merchant_key VARCHAR(255),

  is_live BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  webhook_secret VARCHAR(500),
  webhook_url VARCHAR(500),

  test_merchant_id VARCHAR(255),
  test_merchant_key VARCHAR(255),

  additional_config JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_gateway (gateway_code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert payment gateway credentials (update with actual values)
INSERT INTO payment_gateway_credentials (gateway_name, gateway_code, is_live, is_active) VALUES
('Razorpay', 'razorpay', FALSE, TRUE),
('Stripe', 'stripe', FALSE, TRUE),
('PayU', 'payu', FALSE, TRUE),
('2Checkout', '2checkout', FALSE, TRUE)
ON DUPLICATE KEY UPDATE is_active=is_active;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. PAYMENT LOGS TABLE (Audit trail)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT,

  action VARCHAR(100) NOT NULL,
  log_level ENUM('info', 'warning', 'error') DEFAULT 'info',

  message TEXT,
  stack_trace LONGTEXT,

  request_data LONGTEXT,
  response_data LONGTEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,

  INDEX idx_payment (payment_id),
  INDEX idx_action (action),
  INDEX idx_level (log_level),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. PAYMENT INSTALLMENTS TABLE (For BNPL/EMI)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_installments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  total_amount DECIMAL(12, 2) NOT NULL,
  installment_count INT NOT NULL,
  monthly_amount DECIMAL(12, 2) NOT NULL,

  interest_rate DECIMAL(5, 2) DEFAULT 0,
  total_interest DECIMAL(12, 2) DEFAULT 0,

  status ENUM('active', 'completed', 'failed', 'cancelled') DEFAULT 'active',

  start_date DATE,
  end_date DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_payment (payment_id),
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. INSTALLMENT SCHEDULES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS installment_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  installment_id INT NOT NULL,

  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,

  status ENUM('pending', 'paid', 'overdue', 'failed', 'cancelled') DEFAULT 'pending',

  paid_date DATE,
  paid_amount DECIMAL(12, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (installment_id) REFERENCES payment_installments(id) ON DELETE CASCADE,

  INDEX idx_installment (installment_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE RELATIONSHIPS SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════
/*
users (1) ────────────────────────── (N) payments
        ├─ user_id

users (1) ────────────────────────── (N) saved_payment_instruments
        ├─ user_id

users (1) ────────────────────────── (N) refunds
        ├─ user_id

users (1) ────────────────────────── (N) payment_disputes
        ├─ user_id

users (1) ────────────────────────── (1) wallets
        ├─ user_id (UNIQUE)

users (1) ────────────────────────── (N) wallet_transactions
        ├─ user_id

orders (1) ───────────────────────── (1) payments
        ├─ order_id (UNIQUE)

orders (1) ───────────────────────── (N) refunds
        ├─ order_id

orders (1) ───────────────────────── (N) payment_disputes
        ├─ order_id

orders (1) ───────────────────────── (N) payment_installments
        ├─ order_id

payment_methods (1) ────────────────── (N) payments
            ├─ payment_method_id

payment_methods (1) ────────────────── (N) saved_payment_instruments
            ├─ payment_method_id

payments (1) ──────────────────────── (N) payment_transactions
         ├─ payment_id

payments (1) ──────────────────────── (N) payment_webhooks
         ├─ payment_id

payments (1) ──────────────────────── (1) refunds
         ├─ payment_id

payments (1) ──────────────────────── (N) payment_disputes
         ├─ payment_id

payments (1) ──────────────────────── (N) payment_installments
         ├─ payment_id

payment_installments (1) ────────────── (N) installment_schedules
                   ├─ installment_id

wallets (1) ────────────────────────── (N) wallet_transactions
       ├─ wallet_id
*/

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

SHOW TABLES;
SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'luxora' AND TABLE_NAME LIKE '%payment%' OR TABLE_NAME LIKE '%wallet%' OR TABLE_NAME LIKE '%refund%' OR TABLE_NAME LIKE '%dispute%' OR TABLE_NAME LIKE '%installment%' OR TABLE_NAME LIKE '%payment_methods%' OR TABLE_NAME LIKE '%wallets%' OR TABLE_NAME LIKE '%saved_payment%';
