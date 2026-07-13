# MOONCRAFT Analytics API - PowerShell Test Examples
# This file contains Invoke-WebRequest commands to test all analytics endpoints
# Replace $TOKEN with your actual admin JWT token

$TOKEN = "your_admin_jwt_token_here"
$BASE_URL = "http://localhost:5000/api/v1"
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "=== MOONCRAFT Analytics API Test Examples ===" -ForegroundColor Blue
Write-Host ""

# Function to make API calls and display results
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers
    )

    Write-Host "[$Name]" -ForegroundColor Blue
    Write-Host "$Method $Url"

    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)"
        }
    }

    Write-Host ""
}

# ============ ORDER ANALYTICS ============

Test-Endpoint -Name "1. Order Analytics" `
    -Url "$BASE_URL/orders/admin/analytics" `
    -Headers $headers

# ============ PAYMENT ANALYTICS ============

Test-Endpoint -Name "2. Payment Analytics" `
    -Url "$BASE_URL/payments/admin/analytics" `
    -Headers $headers

Test-Endpoint -Name "3. Payment Method Breakdown" `
    -Url "$BASE_URL/analytics/payments/methods" `
    -Headers $headers

Test-Endpoint -Name "4. Daily Revenue (Last 30 days)" `
    -Url "$BASE_URL/analytics/payments/daily-revenue?days=30" `
    -Headers $headers

Test-Endpoint -Name "5. Daily Revenue (Last 7 days)" `
    -Url "$BASE_URL/analytics/payments/daily-revenue?days=7" `
    -Headers $headers

# ============ PRODUCT ANALYTICS ============

Test-Endpoint -Name "6. Product Analytics" `
    -Url "$BASE_URL/products/admin/analytics" `
    -Headers $headers

Test-Endpoint -Name "7. Top Products by Price" `
    -Url "$BASE_URL/analytics/products/top?sortBy=price&limit=10" `
    -Headers $headers

Test-Endpoint -Name "8. Top Products by Sales" `
    -Url "$BASE_URL/analytics/products/top?sortBy=sales&limit=5" `
    -Headers $headers

Test-Endpoint -Name "9. Low Stock Products" `
    -Url "$BASE_URL/analytics/products/top?sortBy=stock&limit=10" `
    -Headers $headers

# ============ USER ANALYTICS ============

Test-Endpoint -Name "10. User Analytics" `
    -Url "$BASE_URL/users/admin/analytics" `
    -Headers $headers

Test-Endpoint -Name "11. Top Customers by Spending" `
    -Url "$BASE_URL/analytics/users/top-customers?limit=10" `
    -Headers $headers

Test-Endpoint -Name "12. Daily Registrations (Last 30 days)" `
    -Url "$BASE_URL/analytics/users/daily-registrations?days=30" `
    -Headers $headers

# ============ CATEGORY ANALYTICS ============

Test-Endpoint -Name "13. Category Analytics" `
    -Url "$BASE_URL/analytics/categories" `
    -Headers $headers

Test-Endpoint -Name "14. Inventory Value by Category" `
    -Url "$BASE_URL/analytics/inventory" `
    -Headers $headers

# ============ SALES ANALYTICS ============

Test-Endpoint -Name "15. Monthly Revenue (Last 12 months)" `
    -Url "$BASE_URL/analytics/monthly-revenue?months=12" `
    -Headers $headers

Test-Endpoint -Name "16. Monthly Revenue (Last 6 months)" `
    -Url "$BASE_URL/analytics/monthly-revenue?months=6" `
    -Headers $headers

Test-Endpoint -Name "17. Conversion Metrics" `
    -Url "$BASE_URL/analytics/conversion" `
    -Headers $headers

# ============ DASHBOARD ANALYTICS ============

Test-Endpoint -Name "18. Complete Dashboard Analytics" `
    -Url "$BASE_URL/analytics/dashboard" `
    -Headers $headers

Write-Host "=== All test requests completed ===" -ForegroundColor Green
