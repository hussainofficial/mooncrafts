# 💳 PAYMENT SYSTEM - COMPREHENSIVE TABLES DOCUMENTATION

## 📊 COMPLETE PAYMENT TABLE STRUCTURE

13 interconnected tables providing complete payment processing, refunds, disputes, wallets, and installments.

---

## 🏗️ TABLE SCHEMAS

### **1. PAYMENT_METHODS TABLE**
Stores available payment methods and their configuration.

```sql
CREATE TABLE payment_methods (
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
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Data:**
```
| id | name                | code          | processing_fee | is_enabled |
|----|---------------------|---------------|----------------|------------|
| 1  | Credit Card         | credit_card   | 2.50           | TRUE       |
| 2  | Debit Card          | debit_card    | 1.50           | TRUE       |
| 3  | UPI                 | upi           | 0.00           | TRUE       |
| 4  | Net Banking         | net_banking   | 1.00           | TRUE       |
| 5  | Digital Wallet      | wallet        | 0.00           | TRUE       |
| 6  | Buy Now Pay Later   | bnpl          | 3.50           | TRUE       |
```

**Use Cases:**
- Display available payment options at checkout
- Calculate processing fees
- Enable/disable payment methods
- Set min/max transaction limits

---

### **2. SAVED_PAYMENT_INSTRUMENTS TABLE**
Stores user's saved cards, UPI IDs, and bank accounts for quick checkout.

```sql
CREATE TABLE saved_payment_instruments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_method_id INT NOT NULL,
  instrument_type ENUM('credit_card', 'debit_card', 'upi', 'bnpl'),

  -- For cards
  card_token VARCHAR(255) UNIQUE,
  last_four_digits VARCHAR(4),
  card_holder_name VARCHAR(255),
  expiry_month INT CHECK (1-12),
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

  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get user's saved cards
SELECT * FROM saved_payment_instruments
WHERE user_id = 1 AND instrument_type = 'credit_card' AND deleted_at IS NULL;

-- Get default payment method
SELECT * FROM saved_payment_instruments
WHERE user_id = 1 AND is_default = TRUE;

-- Verify card before payment
SELECT is_verified, expiry_month, expiry_year FROM saved_payment_instruments
WHERE id = 1 AND YEAR(CURDATE()) <= expiry_year AND MONTH(CURDATE()) <= expiry_month;
```

**Use Cases:**
- Quick checkout with saved cards
- One-click payment
- Card management (add/remove/set default)
- Card verification flow
- CVV tokenization

---

### **3. PAYMENTS TABLE**
Main payment records - one per order.

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  payment_method_id INT,
  saved_instrument_id INT,

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund'),

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
  refund_status ENUM('no_refund', 'partial_refund', 'full_refund'),

  -- Timestamps
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get payment details for order
SELECT p.*, pm.name as payment_method_name
FROM payments p
LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
WHERE p.order_id = 100;

-- Get all failed payments
SELECT * FROM payments
WHERE status = 'failed' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Get refund information
SELECT 
  amount, 
  refunded_amount, 
  (amount - refunded_amount) as remaining_amount,
  refund_status
FROM payments
WHERE order_id = 100;
```

**Payment Status Flow:**
```
pending → processing → completed (with refunded/partial_refund options)
       ↘ failed (with failure_reason)
       ↘ cancelled
```

---

### **4. PAYMENT_TRANSACTIONS TABLE**
Detailed transaction log for each payment interaction (authorization, capture, refund).

```sql
CREATE TABLE payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT,
  user_id INT,

  transaction_type ENUM('payment', 'refund', 'reversal', 'capture', 'authorization'),

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('pending', 'processing', 'success', 'failed', 'reversed'),

  -- Gateway details
  gateway_transaction_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,

  request_payload LONGTEXT,
  response_payload LONGTEXT,

  description VARCHAR(500),

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get all transactions for a payment
SELECT 
  transaction_type, 
  amount, 
  status, 
  created_at
FROM payment_transactions
WHERE payment_id = 1
ORDER BY created_at;

-- Get all refund transactions
SELECT * FROM payment_transactions
WHERE transaction_type = 'refund' AND status = 'success'
AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

**Transaction Types:**
- `payment` - Initial payment transaction
- `refund` - Full or partial refund
- `reversal` - Transaction reversal (failed authorization)
- `capture` - Captured authorized amount
- `authorization` - Pre-authorized transaction

---

### **5. REFUNDS TABLE**
Tracks all refund requests and their status.

```sql
CREATE TABLE refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  refund_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  refund_type ENUM('full', 'partial'),
  reason ENUM('customer_request', 'order_cancelled', 'product_return', 'defective_product', 'payment_error', 'duplicate_charge', 'other'),
  reason_description TEXT,

  status ENUM('initiated', 'processing', 'completed', 'failed', 'cancelled'),

  -- Gateway details
  refund_transaction_id VARCHAR(255) UNIQUE,
  gateway_refund_id VARCHAR(255),
  gateway_response_code VARCHAR(10),
  gateway_response_message TEXT,

  initiated_by INT,
  initiator_type ENUM('user', 'admin', 'system'),

  initiated_at TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get all refunds for a user
SELECT * FROM refunds
WHERE user_id = 1 AND status IN ('processing', 'completed')
ORDER BY created_at DESC;

-- Get failed refunds (need manual intervention)
SELECT * FROM refunds
WHERE status = 'failed'
AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Calculate total refunded amount
SELECT 
  SUM(CASE WHEN status = 'completed' THEN refund_amount ELSE 0 END) as completed_refunds,
  SUM(CASE WHEN status = 'processing' THEN refund_amount ELSE 0 END) as pending_refunds
FROM refunds
WHERE user_id = 1;
```

**Refund Status Flow:**
```
initiated → processing → completed
         ↘ failed
         ↘ cancelled
```

---

### **6. PAYMENT_DISPUTES TABLE**
Tracks chargebacks, fraud claims, and service disputes.

```sql
CREATE TABLE payment_disputes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  dispute_type ENUM('chargeback', 'fraud', 'service_not_received', 'unauthorized', 'other'),

  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status ENUM('open', 'under_review', 'resolved', 'closed', 'accepted', 'rejected'),

  -- Gateway details
  gateway_dispute_id VARCHAR(255),
  gateway_case_id VARCHAR(255),

  evidence_files JSON,
  supporting_documents JSON,

  created_at TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  updated_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get open disputes
SELECT * FROM payment_disputes
WHERE status IN ('open', 'under_review')
ORDER BY created_at;

-- Get disputes by type
SELECT 
  dispute_type, 
  COUNT(*) as count,
  SUM(amount) as total_disputed_amount
FROM payment_disputes
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY dispute_type;
```

---

### **7. PAYMENT_WEBHOOKS TABLE**
Stores incoming webhook events from payment gateways.

```sql
CREATE TABLE payment_webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT,

  event_type VARCHAR(100) NOT NULL,
  event_source VARCHAR(50) NOT NULL,

  payload LONGTEXT NOT NULL,
  signature VARCHAR(500),

  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,

  created_at TIMESTAMP,
  processed_at TIMESTAMP NULL
);
```

**Use Cases:**
- Payment gateway webhooks (Razorpay, Stripe)
- Verify webhook signatures
- Process async payment updates
- Retry failed webhook processing

---

### **8. WALLETS TABLE**
User digital wallets for storing credit/balance.

```sql
CREATE TABLE wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,

  balance DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',

  total_credited DECIMAL(12, 2) DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_refunded DECIMAL(12, 2) DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get user's wallet balance
SELECT balance, total_credited, total_spent FROM wallets
WHERE user_id = 1;

-- Update wallet balance after payment
UPDATE wallets SET balance = balance - 500 WHERE user_id = 1;

-- Get wallets with low balance (for promotions)
SELECT * FROM wallets
WHERE balance < 100 AND is_active = TRUE;
```

---

### **9. WALLET_TRANSACTIONS TABLE**
Transaction history for wallet operations.

```sql
CREATE TABLE wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wallet_id INT NOT NULL,
  user_id INT NOT NULL,

  transaction_type ENUM('credit', 'debit', 'refund', 'adjustment'),

  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  balance_before DECIMAL(12, 2),
  balance_after DECIMAL(12, 2),

  reference_type VARCHAR(50),
  reference_id INT,

  description VARCHAR(500),

  created_at TIMESTAMP
);
```

**Sample Query:**
```sql
-- Get wallet transaction history
SELECT * FROM wallet_transactions
WHERE wallet_id = 1
ORDER BY created_at DESC
LIMIT 50;

-- Get total credits this month
SELECT SUM(amount) as total_credited
FROM wallet_transactions
WHERE wallet_id = 1 
AND transaction_type = 'credit'
AND DATE(created_at) >= DATE_FORMAT(NOW(), '%Y-%m-01');
```

---

### **10. PAYMENT_GATEWAY_CREDENTIALS TABLE**
Stores API keys and configuration for payment gateways (encrypted).

```sql
CREATE TABLE payment_gateway_credentials (
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

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Data:**
```
| gateway_name | gateway_code | is_live | is_active |
|--------------|--------------|---------|-----------|
| Razorpay     | razorpay     | FALSE   | TRUE      |
| Stripe       | stripe       | FALSE   | TRUE      |
| PayU         | payu         | FALSE   | TRUE      |
| 2Checkout    | 2checkout    | FALSE   | TRUE      |
```

⚠️ **SECURITY:** These credentials should be encrypted at rest and never logged.

---

### **11. PAYMENT_LOGS TABLE**
Audit trail for all payment operations.

```sql
CREATE TABLE payment_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT,

  action VARCHAR(100) NOT NULL,
  log_level ENUM('info', 'warning', 'error'),

  message TEXT,
  stack_trace LONGTEXT,

  request_data LONGTEXT,
  response_data LONGTEXT,

  created_at TIMESTAMP
);
```

**Sample Log Entries:**
```
payment_id=1, action=PAYMENT_INITIATED, level=info
payment_id=1, action=GATEWAY_REQUEST_SENT, level=info
payment_id=1, action=GATEWAY_RESPONSE_RECEIVED, level=info
payment_id=1, action=PAYMENT_COMPLETED, level=info

payment_id=2, action=GATEWAY_REQUEST_SENT, level=info
payment_id=2, action=PAYMENT_FAILED, level=error, message=Insufficient funds
```

---

### **12. PAYMENT_INSTALLMENTS TABLE**
For BNPL (Buy Now Pay Later) and EMI options.

```sql
CREATE TABLE payment_installments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,

  total_amount DECIMAL(12, 2) NOT NULL,
  installment_count INT NOT NULL,
  monthly_amount DECIMAL(12, 2) NOT NULL,

  interest_rate DECIMAL(5, 2) DEFAULT 0,
  total_interest DECIMAL(12, 2) DEFAULT 0,

  status ENUM('active', 'completed', 'failed', 'cancelled'),

  start_date DATE,
  end_date DATE,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Scenario:**
```
Total Amount: ₹12,000
Installments: 6 months
Monthly Amount: ₹2,000
Interest Rate: 0% (promotional)
```

---

### **13. INSTALLMENT_SCHEDULES TABLE**
Detailed schedule for each installment payment.

```sql
CREATE TABLE installment_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  installment_id INT NOT NULL,

  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,

  status ENUM('pending', 'paid', 'overdue', 'failed', 'cancelled'),

  paid_date DATE,
  paid_amount DECIMAL(12, 2),

  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Schedule:**
```
| installment_number | due_date   | amount | status  | paid_date  |
|--------------------|------------|--------|---------|------------|
| 1                  | 2026-08-06 | 2000   | paid    | 2026-08-05 |
| 2                  | 2026-09-06 | 2000   | paid    | 2026-09-06 |
| 3                  | 2026-10-06 | 2000   | pending | NULL       |
| 4                  | 2026-11-06 | 2000   | pending | NULL       |
| 5                  | 2026-12-06 | 2000   | pending | NULL       |
| 6                  | 2027-01-06 | 2000   | pending | NULL       |
```

---

## 🔗 TABLE RELATIONSHIPS

```
users (1) ──────────────────────── (N) payments
                                      ├─ user_id
users (1) ──────────────────────── (N) saved_payment_instruments
                                      ├─ user_id
users (1) ──────────────────────── (N) refunds
                                      ├─ user_id
users (1) ──────────────────────── (N) payment_disputes
                                      ├─ user_id
users (1) ──────────────────────── (1) wallets
                                      ├─ user_id (UNIQUE)

orders (1) ───────────────────────── (1) payments
                                      ├─ order_id (UNIQUE)
orders (1) ───────────────────────── (N) refunds
                                      ├─ order_id

payment_methods (1) ────────────── (N) payments
                                      ├─ payment_method_id

payments (1) ──────────────────────── (N) payment_transactions
                                      ├─ payment_id
payments (1) ──────────────────────── (N) refunds
                                      ├─ payment_id

payment_installments (1) ────────── (N) installment_schedules
                                      ├─ installment_id
```

---

## 🚀 SETUP INSTRUCTIONS

### **Step 1: Run Migration**
```bash
cd C:\Users\hussa\luxora-backend
mysql -u root -p < DATABASE_MIGRATION_PAYMENT_TABLES.sql
```

### **Step 2: Verify Tables**
```bash
mysql -u root -p
mysql> USE luxora;
mysql> SHOW TABLES;
mysql> DESC payments;
mysql> DESC refunds;
```

### **Step 3: Configure Gateway Credentials**
```sql
UPDATE payment_gateway_credentials
SET api_key = 'your_api_key', 
    api_secret = 'your_api_secret'
WHERE gateway_code = 'razorpay';
```

---

## 💡 COMMON QUERIES

### **Dashboard Analytics**
```sql
-- Total payments today
SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount
FROM payments
WHERE DATE(created_at) = CURDATE();

-- Payment success rate
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM payments
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Refunds pending
SELECT COUNT(*) as pending_refunds, SUM(refund_amount) as total_pending
FROM refunds
WHERE status = 'processing';

-- Payment method breakdown
SELECT 
  pm.name,
  COUNT(p.id) as transaction_count,
  SUM(p.amount) as total_amount
FROM payments p
JOIN payment_methods pm ON p.payment_method_id = pm.id
WHERE DATE(p.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY pm.name;
```

### **User Queries**
```sql
-- Get user's payment history
SELECT 
  p.id,
  p.amount,
  p.status,
  pm.name as payment_method,
  p.created_at
FROM payments p
LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
WHERE p.user_id = 1
ORDER BY p.created_at DESC;

-- Get user's wallet transactions
SELECT * FROM wallet_transactions
WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = 1)
ORDER BY created_at DESC;
```

---

## ✅ PRODUCTION CHECKLIST

- [ ] Enable SSL/TLS for all payment endpoints
- [ ] Encrypt gateway credentials in database
- [ ] Implement PCI DSS compliance
- [ ] Set up webhook verification
- [ ] Configure payment gateway test/live keys
- [ ] Enable payment logs and monitoring
- [ ] Set up alert notifications for failed payments
- [ ] Implement idempotency for payment transactions
- [ ] Regular backup of payment data
- [ ] Audit logging for all payment operations

---

## 📚 FILES CREATED

```
✅ DATABASE_MIGRATION_PAYMENT_TABLES.sql (13 tables, complete schema)
✅ PAYMENT_TABLES_DOCUMENTATION.md (This file - comprehensive guide)
```

All tables are ready for immediate use! 🚀
