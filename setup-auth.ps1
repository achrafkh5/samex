# Authentication System Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DreamCars Authentication System Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install required packages
Write-Host "Step 1: Installing required npm packages..." -ForegroundColor Yellow
Write-Host "Running: npm install jsonwebtoken bcryptjs" -ForegroundColor Gray
npm install jsonwebtoken bcryptjs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install packages. Please run manually: npm install jsonwebtoken bcryptjs" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Check for .env.local file
Write-Host "Step 2: Checking environment variables..." -ForegroundColor Yellow

$envFile = ".env.local"
$envExists = Test-Path $envFile

if ($envExists) {
    Write-Host "✓ .env.local file exists" -ForegroundColor Green
    
    # Check if JWT_SECRET exists
    $content = Get-Content $envFile -Raw
    if ($content -match "JWT_SECRET=") {
        Write-Host "✓ JWT_SECRET is already configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ JWT_SECRET not found in .env.local" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Adding JWT_SECRET to .env.local..." -ForegroundColor Yellow
        
        # Generate a random JWT secret
        $randomBytes = New-Object byte[] 32
        [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
        $jwtSecret = [Convert]::ToBase64String($randomBytes)
        
        Add-Content $envFile "`n# JWT Secret for Authentication"
        Add-Content $envFile "JWT_SECRET=$jwtSecret"
        
        Write-Host "✓ JWT_SECRET added to .env.local" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ .env.local file not found. Creating it..." -ForegroundColor Yellow
    
    # Generate a random JWT secret
    $randomBytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($randomBytes)
    $jwtSecret = [Convert]::ToBase64String($randomBytes)
    
    # Create .env.local with MongoDB URI prompt
    Write-Host ""
    $mongoUri = Read-Host "Enter your MongoDB connection string (or press Enter to use default)"
    if ([string]::IsNullOrWhiteSpace($mongoUri)) {
        $mongoUri = "mongodb://localhost:27017/dreamcars"
    }
    
    @"
# MongoDB Connection
MONGODB_URI=$mongoUri

# JWT Secret for Authentication
JWT_SECRET=$jwtSecret

# Node Environment (use 'production' for production)
NODE_ENV=development
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✓ .env.local created successfully!" -ForegroundColor Green
}

Write-Host ""

# Step 3: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ npm packages installed" -ForegroundColor Green
Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review your .env.local file" -ForegroundColor White
Write-Host "2. Make sure your MongoDB is running" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host "4. Navigate to http://localhost:3000/signup to test" -ForegroundColor White
Write-Host ""
Write-Host "For detailed documentation, see: AUTH_SYSTEM_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
