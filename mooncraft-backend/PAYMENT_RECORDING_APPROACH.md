# 💳 PAYMENT RECORDING APPROACH - ALL PAYMENT TYPES

## 🎯 RAZORPAY INTEGRATED PAYMENT METHODS

All these payment methods are supported through Razorpay integration:

1. **Credit Card** (Visa, Mastercard, Amex)
2. **Debit Card** (All Indian banks)
3. **UPI** (Google Pay, PhonePe, Paytm, WhatsApp Pay) ⭐ FASTEST
4. **Net Banking** (Direct bank transfer)
5. **Wallet** (Razorpay Wallet, PayZapp)

---

## 📋 HOW EACH PAYMENT TYPE IS RECORDED

### **UNIFIED APPROACH: Same Tables for All Payment Types**

```
payment_methods table → Stores payment method config
    ↓
payments table → Creates record for payment
    ↓
Razorpay API → Sends to gateway (user interaction)
    ↓
payment_webhooks table → Receives confirmation
    ↓
payments table (UPDATE) → Updates status & transaction_id
    ↓
payment_transactions table → Logs transaction
    ↓
saved_payment_instruments table (optional) → Save for quick checkout
```

---

## 1️⃣ UPI PAYMENT RECORDING

**When user pays with UPI (Google Pay, PhonePe, Paytm, WhatsApp):**

### Step 1: Create Payment Record
```sql
INSERT INTO payments (
  order_id,
  user_id,
  payment_method_id,  -- 3 for UPI (from payment_methods)
  amount,
  currency,
  status,
  gateway_name,
  initiated_at
) VALUES (
  100,                -- Order ID
  1,                  -- User ID
  3,                  -- UPI method ID
  5000.00,
  'INR',
  'pending',
  'razorpay',
  NOW()
);
```

### Step 2: Call Razorpay API
```javascript
// Node.js Example
const razorpay = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET'
});

const order = await razorpay.orders.create({
  amount: 500000,  // in paise
  currency: 'INR',
  receipt: '100_receipt',
  method: 'upi'
});

// Returns: order.id = 'order_abc123'
```

### Step 3: User Opens UPI App
- Frontend shows UPI payment option
- User clicks "Pay with UPI"
- Razorpay shows: Google Pay / PhonePe / Paytm / WhatsApp
- User selects app → enters UPI ID → confirms

### Step 4: Razorpay Sends Webhook
```json
{
  "type": "payment.authorized",
  "payload": {
    "payment": {
      "id": "pay_123456789",
      "amount": 500000,
      "currency": "INR",
      "status": "captured",
      "method": "upi",
      "vpa": "user@googleplay"
    }
  }
}
```

### Step 5: Update Database Records

**A) Update payments table:**
```sql
UPDATE payments SET
  status = 'completed',
  transaction_id = 'pay_123456789',
  gateway_reference_id = 'pay_123456789',
  completed_at = NOW()
WHERE order_id = 100;
```

**B) Log transaction details:**
```sql
INSERT INTO payment_transactions (
  payment_id,
  transaction_type,
  amount,
  status,
  gateway_transaction_id,
  gateway_response_code,
  gateway_response_message
) VALUES (
  1,                    -- payment ID
  'payment',
  5000.00,
  'success',
  'pay_123456789',
  '0',
  'Payment Successful'
);
```

**C) Save UPI ID for quick checkout:**
```sql
INSERT INTO saved_payment_instruments (
  user_id,
  payment_method_id,
  instrument_type,
  upi_id,
  is_default,
  is_verified
) VALUES (
  1,
  3,                    -- UPI
  'upi',
  'user@googleplay',
  FALSE,
  TRUE
);
```

**Result:**
- ✅ Payment recorded in `payments` table
- ✅ UPI ID saved in `saved_payment_instruments`
- ✅ Transaction logged in `payment_transactions`
- ✅ Next UPI payment = Quick selection from saved UPI IDs

---

## 2️⃣ CREDIT/DEBIT CARD RECORDING

**When user pays with Credit or Debit Card:**

### Step 1: Create Payment Record
```sql
INSERT INTO payments (
  order_id,
  user_id,
  payment_method_id,  -- 1 for Credit Card, 2 for Debit Card
  amount,
  status,
  gateway_name
) VALUES (
  101,
  1,
  1,                  -- Credit Card
  10000.00,
  'pending',
  'razorpay'
);
```

### Step 2: User Enters Card Details
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Card Holder: Gaurav Kumar

⚠️ IMPORTANT: Never store raw card numbers!
   Razorpay handles tokenization automatically
```

### Step 3: Razorpay Tokenizes Card
```json
Response from Razorpay:
{
  "id": "pay_987654321",
  "token": "token_1234567890abcd",
  "method": "card",
  "card": {
    "id": "card_1234567890",
    "last4": "1111",
    "network": "Visa",
    "type": "credit",
    "issuer": "HDFC"
  }
}
```

### Step 4: Update Database

**A) Update payments table:**
```sql
UPDATE payments SET
  status = 'completed',
  transaction_id = 'pay_987654321',
  gateway_reference_id = 'pay_987654321',
  completed_at = NOW()
WHERE order_id = 101;
```

**B) Save Card Token (NOT raw card data):**
```sql
INSERT INTO saved_payment_instruments (
  user_id,
  payment_method_id,
  instrument_type,
  card_token,              -- TOKENIZED (safe!)
  last_four_digits,
  card_holder_name,
  expiry_month,
  expiry_year,
  card_brand,
  is_default,
  is_verified
) VALUES (
  1,
  1,                      -- Credit Card method
  'credit_card',
  'token_1234567890abcd', -- Razorpay token (safe to store)
  '1111',
  'Gaurav Kumar',
  12,
  2025,
  'Visa',
  TRUE,
  TRUE
);
```

**C) Log transaction:**
```sql
INSERT INTO payment_transactions (
  payment_id,
  transaction_type,
  amount,
  status,
  gateway_transaction_id
) VALUES (
  2,
  'payment',
  10000.00,
  'success',
  'pay_987654321'
);
```

**Result:**
- ✅ Card token saved (never raw card number)
- ✅ Next payment = Quick selection from saved cards
- ✅ No CVV needed for saved cards (Razorpay handles)

---

## 3️⃣ NET BANKING PAYMENT RECORDING

**When user pays via Net Banking (HDFC, ICICI, SBI, etc):**

### Step 1: Create Payment Record
```sql
INSERT INTO payments (
  order_id,
  user_id,
  payment_method_id,  -- 4 for Net Banking
  amount,
  status
) VALUES (
  102,
  1,
  4,                  -- Net Banking
  8000.00,
  'pending'
);
```

### Step 2: Send to Razorpay
```javascript
const order = await razorpay.orders.create({
  amount: 800000,
  currency: 'INR',
  method: 'netbanking'
});
```

### Step 3: User Selects Bank & Logs In
- Razorpay shows bank options: HDFC, ICICI, Axis, SBI, etc.
- User selects bank
- User logs into bank account
- User authorizes payment
- Bank confirms transfer

### Step 4: Update Database
```sql
UPDATE payments SET
  status = 'completed',
  transaction_id = 'pay_456789123',
  completed_at = NOW()
WHERE order_id = 102;

INSERT INTO payment_transactions (
  payment_id,
  transaction_type,
  amount,
  status,
  gateway_transaction_id,
  description
) VALUES (
  3,
  'payment',
  8000.00,
  'success',
  'pay_456789123',
  'Net Banking - HDFC'
);
```

**Result:**
- ✅ Payment recorded
- ✅ Bank name captured in description
- ✅ Transaction logged for audit

---

## 4️⃣ WALLET PAYMENT RECORDING

### **OPTION A: Using Razorpay Wallet**
Same as UPI/Card - Razorpay handles it

### **OPTION B: Using Our In-App Wallet**

**When user pays from app wallet balance:**

### Step 1: Check Wallet Balance
```sql
SELECT balance FROM wallets WHERE user_id = 1;
-- Result: 15000.00
```

### Step 2: Verify Sufficient Balance
```javascript
if (walletBalance >= paymentAmount) {
  // Proceed with payment
} else {
  // Show "Insufficient wallet balance"
}
```

### Step 3: Deduct from Wallet
```sql
UPDATE wallets SET
  balance = balance - 5000,
  total_spent = total_spent + 5000
WHERE user_id = 1;
```

### Step 4: Create Payment Record
```sql
INSERT INTO payments (
  order_id,
  user_id,
  payment_method_id,  -- 5 for Digital Wallet
  amount,
  status,
  transaction_id,
  completed_at
) VALUES (
  103,
  1,
  5,                  -- Wallet
  5000.00,
  'completed',        -- Immediate (no gateway)
  'wallet_txn_123',
  NOW()
);
```

### Step 5: Log Wallet Transaction
```sql
INSERT INTO wallet_transactions (
  wallet_id,
  user_id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  reference_type,
  reference_id,
  description
) VALUES (
  1,
  1,
  'debit',
  5000.00,
  15000.00,
  10000.00,
  'order',
  103,
  'Payment for Order #103'
);
```

### Step 6: Log in payment_transactions
```sql
INSERT INTO payment_transactions (
  payment_id,
  transaction_type,
  amount,
  status,
  description
) VALUES (
  4,
  'payment',
  5000.00,
  'success',
  'Wallet Payment - In-App Balance'
);
```

**Result:**
- ✅ Wallet balance updated immediately
- ✅ Transaction logged in wallet_transactions
- ✅ Order marked as paid
- ✅ Complete audit trail

---

## 🔄 DATABASE FLOW SUMMARY

```
For ALL Payment Types:

1. INSERT into payments
   └─ status='pending', payment_method_id, order_id, amount

2. Call Razorpay API (or deduct from wallet)

3. User completes payment in app/gateway

4. Receive webhook (or confirm wallet deduction)

5. UPDATE payments
   └─ status='completed', transaction_id, completed_at

6. INSERT into payment_transactions
   └─ Log full details: gateway response, request, status

7. INSERT into saved_payment_instruments (optional)
   └─ Save UPI ID or Card Token for quick checkout

8. UPDATE orders table
   └─ payment_status='completed', mark for fulfillment
```

---

## 💾 SAMPLE RECORDS FOR DIFFERENT PAYMENTS

### UPI Payment Example
```
payments:
id=1, order_id=100, amount=5000, payment_method_id=3 (UPI), 
transaction_id='pay_abc123', status='completed'

saved_payment_instruments:
id=1, user_id=1, instrument_type='upi', upi_id='user@googleplay'

payment_transactions:
id=1, payment_id=1, amount=5000, status='success'
```

### Card Payment Example
```
payments:
id=2, order_id=101, amount=10000, payment_method_id=1 (Credit Card),
transaction_id='pay_def456', status='completed'

saved_payment_instruments:
id=2, user_id=1, instrument_type='credit_card', 
card_token='token_xyz789', last_four_digits='1111'

payment_transactions:
id=2, payment_id=2, amount=10000, status='success'
```

### Wallet Payment Example
```
payments:
id=4, order_id=103, amount=5000, payment_method_id=5 (Wallet),
transaction_id='wallet_txn_123', status='completed'

wallets:
user_id=1, balance=10000 (after deduction)

wallet_transactions:
wallet_id=1, transaction_type='debit', amount=5000,
balance_before=15000, balance_after=10000

payment_transactions:
id=4, payment_id=4, amount=5000, status='success'
```

---

## 🎯 KEY POINTS

✅ **All payment types use the SAME table structure**
- Only `payment_method_id` differs (1=Card, 3=UPI, 4=NetBanking, etc)

✅ **Razorpay handles user interaction**
- We just call API, Razorpay shows UPI app selection, card form, etc

✅ **Transaction ID is unique identifier**
- Razorpay returns transaction_id (pay_xxxxx)
- Store this for reconciliation and refunds

✅ **Never store raw card numbers**
- Use card_token from Razorpay (safe!)
- last_four_digits only for display

✅ **UPI IDs can be saved**
- Much simpler than cards
- Users can select from saved UPI IDs for quick checkout

✅ **Complete audit trail**
- payment_logs table tracks every operation
- payment_transactions log request/response data
- wallet_transactions show balance changes

---

## 📊 SUPPORTED PAYMENT METHOD IDs

```
ID | Method Name       | Code
───┼──────────────────┼──────────────
1  | Credit Card       | credit_card
2  | Debit Card        | debit_card
3  | UPI               | upi
4  | Net Banking       | net_banking
5  | Digital Wallet    | wallet
6  | Buy Now Pay Later | bnpl
```

Use these IDs when inserting payment records!

---

## ✅ QUICK CHECKLIST

- [ ] Select payment method (from payment_methods table)
- [ ] Create payment record (INSERT into payments)
- [ ] Send to Razorpay or deduct from wallet
- [ ] Receive webhook or wallet confirmation
- [ ] Update payment status (UPDATE payments)
- [ ] Log transaction (INSERT into payment_transactions)
- [ ] Save instrument for future (INSERT into saved_payment_instruments)
- [ ] Update order status (orders table)
- [ ] Send order confirmation to customer

---

**All tables ready for production use!** 🚀
