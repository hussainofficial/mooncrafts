# Update all service files to use environment configuration

$servicesPath = "C:\Users\hussa\mooncrafts\mooncraft-jewelry\src\app\core\services"
$services = @(
    "auth.service.ts",
    "category-admin.service.ts",
    "category.service.ts",
    "collection.service.ts",
    "location.service.ts",
    "material.service.ts",
    "order-management.service.ts",
    "order.service.ts",
    "payment-management.service.ts",
    "product-flags.service.ts",
    "razorpay-integration.service.ts",
    "user-management.service.ts"
)

foreach ($service in $services) {
    $filePath = Join-Path $servicesPath $service

    if (Test-Path $filePath) {
        Write-Host "📝 Updating $service..."

        $content = Get-Content $filePath -Raw

        # Add environment import if not present
        if ($content -notmatch "import.*environment") {
            $content = $content -replace "^(import \{ Injectable \}.*?`n)", "`$1import { environment } from '../../../environments/environment'`n"
        }

        # Replace localhost:5000 URLs with environment.apiUrl
        $content = $content -replace "private readonly API_URL = 'http://localhost:5000/api/v1/(.*?)'", "private readonly API_URL = `\`\${environment.apiUrl}/`$1\`"
        $content = $content -replace "private readonly .*API_URL = 'http://localhost:5000/api/v1/(.*?)'", "private readonly API_URL = `\`\${environment.apiUrl}/`$1\`"

        Set-Content $filePath $content
        Write-Host "✅ $service updated"
    }
}

Write-Host ""
Write-Host "🎉 All services updated to use environment configuration!"
