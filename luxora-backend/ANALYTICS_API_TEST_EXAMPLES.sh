#!/bin/bash

# LUXORA Analytics API - Curl Test Examples
# This file contains curl commands to test all analytics endpoints
# Replace TOKEN with your actual admin JWT token

TOKEN="your_admin_jwt_token_here"
BASE_URL="http://localhost:5000/api/v1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LUXORA Analytics API Test Examples ===${NC}\n"

# ============ ORDER ANALYTICS ============

echo -e "${BLUE}[1] Order Analytics${NC}"
echo "GET $BASE_URL/orders/admin/analytics"
curl -X GET "$BASE_URL/orders/admin/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ PAYMENT ANALYTICS ============

echo -e "${BLUE}[2] Payment Analytics${NC}"
echo "GET $BASE_URL/payments/admin/analytics"
curl -X GET "$BASE_URL/payments/admin/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[3] Payment Method Breakdown${NC}"
echo "GET $BASE_URL/analytics/payments/methods"
curl -X GET "$BASE_URL/analytics/payments/methods" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[4] Daily Revenue (Last 30 days)${NC}"
echo "GET $BASE_URL/analytics/payments/daily-revenue?days=30"
curl -X GET "$BASE_URL/analytics/payments/daily-revenue?days=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[5] Daily Revenue (Last 7 days)${NC}"
echo "GET $BASE_URL/analytics/payments/daily-revenue?days=7"
curl -X GET "$BASE_URL/analytics/payments/daily-revenue?days=7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ PRODUCT ANALYTICS ============

echo -e "${BLUE}[6] Product Analytics${NC}"
echo "GET $BASE_URL/products/admin/analytics"
curl -X GET "$BASE_URL/products/admin/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[7] Top Products by Price${NC}"
echo "GET $BASE_URL/analytics/products/top?sortBy=price&limit=10"
curl -X GET "$BASE_URL/analytics/products/top?sortBy=price&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[8] Top Products by Sales${NC}"
echo "GET $BASE_URL/analytics/products/top?sortBy=sales&limit=5"
curl -X GET "$BASE_URL/analytics/products/top?sortBy=sales&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[9] Low Stock Products${NC}"
echo "GET $BASE_URL/analytics/products/top?sortBy=stock&limit=10"
curl -X GET "$BASE_URL/analytics/products/top?sortBy=stock&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ USER ANALYTICS ============

echo -e "${BLUE}[10] User Analytics${NC}"
echo "GET $BASE_URL/users/admin/analytics"
curl -X GET "$BASE_URL/users/admin/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[11] Top Customers by Spending${NC}"
echo "GET $BASE_URL/analytics/users/top-customers?limit=10"
curl -X GET "$BASE_URL/analytics/users/top-customers?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[12] Daily Registrations (Last 30 days)${NC}"
echo "GET $BASE_URL/analytics/users/daily-registrations?days=30"
curl -X GET "$BASE_URL/analytics/users/daily-registrations?days=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ CATEGORY ANALYTICS ============

echo -e "${BLUE}[13] Category Analytics${NC}"
echo "GET $BASE_URL/analytics/categories"
curl -X GET "$BASE_URL/analytics/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[14] Inventory Value by Category${NC}"
echo "GET $BASE_URL/analytics/inventory"
curl -X GET "$BASE_URL/analytics/inventory" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ SALES ANALYTICS ============

echo -e "${BLUE}[15] Monthly Revenue (Last 12 months)${NC}"
echo "GET $BASE_URL/analytics/monthly-revenue?months=12"
curl -X GET "$BASE_URL/analytics/monthly-revenue?months=12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[16] Monthly Revenue (Last 6 months)${NC}"
echo "GET $BASE_URL/analytics/monthly-revenue?months=6"
curl -X GET "$BASE_URL/analytics/monthly-revenue?months=6" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${BLUE}[17] Conversion Metrics${NC}"
echo "GET $BASE_URL/analytics/conversion"
curl -X GET "$BASE_URL/analytics/conversion" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# ============ DASHBOARD ANALYTICS ============

echo -e "${BLUE}[18] Complete Dashboard Analytics${NC}"
echo "GET $BASE_URL/analytics/dashboard"
curl -X GET "$BASE_URL/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${GREEN}=== All test requests completed ===${NC}\n"
