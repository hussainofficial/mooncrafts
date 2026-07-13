# 🎯 MOONCRAFT ARCHITECTURE REVIEW - ACTION PLAN

## Phase 1: CRITICAL (Must Fix Before Production) - 2-3 Weeks

### Week 1: Payment Integration Foundation

#### Task 1.1: Implement Razorpay Order Creation
**File:** Create src/services/razorpay.service.js
**What to do:**
- Initialize Razorpay client with API keys from .env
- Create method to generate Razorpay order ID
- Store gateway_order_id in payments table
- Return Razorpay order details to frontend

**Acceptance Criteria:**
- Razorpay order created successfully
- Order ID stored in database
- Frontend can initiate payment with Razorpay

#### Task 1.2: Implement Payment Signature Verification
**File:** Create src/utils/payment-verification.js
**What to do:**
- Implement HMAC-SHA256 signature verification
- Verify gateway_order_id, gateway_payment_id, and signature
- Prevent forged payment confirmations

**Acceptance Criteria:**
- Signature verification works for valid payments
- Forged signatures are rejected

#### Task 1.3: Implement Webhook Handler
**File:** Create src/routes/payment-webhook.routes.js
**What to do:**
- Add POST /api/v1/payments/webhook endpoint
- Verify webhook signature
- Update payment status based on webhook event
- Publish event for order confirmation

**Acceptance Criteria:**
- Receives webhook from Razorpay
- Signature verified
- Payment status updated in database
- Order status updated

---

### Week 2: Fix Order-Payment Atomicity

#### Task 2.1: Add Database Transactions
**File:** Modify src/repositories/order.repository.js and payment.repository.js
**What to do:**
- Wrap order + payment creation in transaction
- Rollback on failure
- Use BEGIN/COMMIT/ROLLBACK

**Acceptance Criteria:**
- If order creation succeeds but payment fails, both are rolled back
- No orphaned orders

#### Task 2.2: Update Order Status Flow
**File:** Modify order.repository.js
**What to do:**
- Add status: 'pending_payment' (initial)
- Add status: 'payment_confirmed' (after webhook)
- Update order status only after webhook verification

**Acceptance Criteria:**
- Order starts as 'pending_payment'
- Only updates to 'payment_confirmed' after backend webhook verification
- Frontend cannot force status change

#### Task 2.3: Update Payment Table Schema
**File:** Create migration: src/migrations/add_payment_fields.sql
**What to do:**
- Add: gateway VARCHAR(50)
- Add: gateway_order_id VARCHAR(255)
- Add: gateway_payment_id VARCHAR(255)
- Add: gateway_signature VARCHAR(500)
- Add: failure_reason TEXT
- Add: failure_code VARCHAR(50)
- Add: paid_at TIMESTAMP

**Acceptance Criteria:**
- New fields available in payments table
- Data correctly stored and retrieved

---

### Week 3: Backend Calculation Verification

#### Task 3.1: Create Order Calculation Service
**File:** Create src/services/order-calculation.service.js
**What to do:**
- Verify cart items from database
- Recalculate: sum(product.price * quantity)
- Fetch tax rate from config
- Fetch shipping cost based on method
- Validate and apply coupon from database
- Return verified total amount

**Acceptance Criteria:**
- Backend calculates amount independently
- Amount matches frontend calculation (or catches fraud attempt)
- Rejects invalid coupons

#### Task 3.2: Move Coupon Validation to Backend
**File:** Create src/services/coupon.service.js
**What to do:**
- Create POST /api/v1/coupons/validate endpoint
- Validate coupon code against database
- Check coupon not already used by user (if applicable)
- Return discount amount

**Acceptance Criteria:**
- Only valid database coupons accepted
- Each coupon can be validated via API

#### Task 3.3: Shipping Calculation API
**File:** Create src/services/shipping.service.js
**What to do:**
- Create GET /api/v1/shipping/calculate endpoint
- Calculate based on distance/weight/method
- Return shipping cost

**Acceptance Criteria:**
- Shipping cost calculated by backend
- Frontend displays backend-calculated cost

---

## Phase 2: HIGH PRIORITY - Week 4-5

### Task 4: Add Inventory Management

**File:** Create src/repositories/inventory.repository.js
**What to do:**
- Create inventory table in database
- Track stock, reserved, available quantities
- Check inventory before order creation
- Reserve inventory on payment confirmation
- Release on order cancellation

**Acceptance Criteria:**
- Can't create order without stock
- Stock decreases on payment confirmation
- Released on cancellation

---

### Task 5: Security Enhancements

**Files:** 
- app.js (rate limiting, HTTPS)
- auth.middleware.js (validation)

**What to do:**
- Add express-rate-limit middleware
- Enforce HTTPS in production
- Validate CORS_ORIGIN required
- Add input sanitization
- Add CSRF protection
- Add authentication on all admin endpoints

**Acceptance Criteria:**
- Rate limiting works (test with curl)
- HTTPS enforced in production
- Invalid requests rejected

---

## Phase 3: MEDIUM PRIORITY - Week 6+

### Task 6: Notifications

- Order confirmation email
- Shipping notification
- Delivery confirmation

### Task 7: Refund System

- Create refunds table
- Implement refund API
- Handle refund webhooks

### Task 8: Audit Logging

- Create audit_logs table
- Log all payment operations
- Log all admin actions

---

## Testing Checklist

### Before Deployment Test

#### Payment Flow
- [ ] Test successful payment end-to-end
- [ ] Test failed payment handling
- [ ] Test payment retry
- [ ] Test webhook delivery
- [ ] Verify order status transitions
- [ ] Verify inventory updated

#### Security
- [ ] Test rate limiting
- [ ] Test invalid signature rejection
- [ ] Test CORS enforcement
- [ ] Test unauthorized access rejection
- [ ] Test invalid coupon rejection

#### Database
- [ ] Test transaction rollback
- [ ] Verify no orphaned orders
- [ ] Verify payment table fields populated
- [ ] Check indexes on critical tables

---

## Estimated Timeline

- **Phase 1 (Critical):** 3 weeks
- **Phase 2 (High):** 2 weeks  
- **Phase 3 (Medium):** 2 weeks
- **Testing:** 1 week

**Total: 8 weeks**

After completion, application will be production-ready.

---

## Key Deliverables

1. ✅ Real Razorpay integration with signature verification
2. ✅ Webhook handler for payment confirmation
3. ✅ Transaction support for order + payment
4. ✅ Backend amount calculation & verification
5. ✅ Inventory management system
6. ✅ Proper order status flow (pending_payment → payment_confirmed)
7. ✅ Security enhancements (rate limiting, HTTPS, etc)
8. ✅ Email notifications
9. ✅ Comprehensive testing

---

Generated: July 6, 2026
