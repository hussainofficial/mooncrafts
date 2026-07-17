-- Fix: "Unknown column 'gateway_order_id' in 'field list'" on /api/v1/razorpay/create-order
-- payment.repository.js and razorpay.service.js read/write gateway_name, gateway_order_id,
-- gateway_response, failure_reason, completed_at, failed_at, and a 'refunded' status value
-- (used by analytics.repository.js), none of which exist on the live payments table.

ALTER TABLE payments
  MODIFY COLUMN status enum('pending','completed','failed','refunded') DEFAULT 'pending',
  ADD COLUMN gateway_name varchar(50) DEFAULT NULL AFTER transaction_id,
  ADD COLUMN gateway_order_id varchar(100) DEFAULT NULL AFTER gateway_name,
  ADD COLUMN gateway_response json DEFAULT NULL AFTER gateway_order_id,
  ADD COLUMN failure_reason text AFTER gateway_response,
  ADD COLUMN completed_at timestamp NULL DEFAULT NULL AFTER failure_reason,
  ADD COLUMN failed_at timestamp NULL DEFAULT NULL AFTER completed_at;
