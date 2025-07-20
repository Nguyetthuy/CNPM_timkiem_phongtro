Write-Host "🔍 Testing image display issue..." -ForegroundColor Green

# Chuyển về thư mục cha và chạy script
Set-Location ".."
Write-Host "📂 Changed to parent directory" -ForegroundColor Yellow

# Chạy script test
Write-Host "🧪 Running test script..." -ForegroundColor Yellow
node test-and-fix-images.js

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check the output above for issues" -ForegroundColor White
Write-Host "2. If needed, restart services:" -ForegroundColor White
Write-Host "   docker-compose restart post-service" -ForegroundColor Gray
Write-Host "   docker-compose restart gateway" -ForegroundColor Gray
Write-Host "3. Hard refresh browser (Ctrl+F5)" -ForegroundColor White

Read-Host "Press Enter to continue" 