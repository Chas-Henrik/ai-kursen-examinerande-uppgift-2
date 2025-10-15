# Test Script för Chat History Fix

## Steg 1: Registrera användare (manuellt via browser)
- Gå till http://localhost:3000/register
- Registrera: test@example.com / testpassword

## Steg 2: Logga in (manuellt via browser) 
- Gå till http://localhost:3000/login
- Logga in med samma uppgifter

## Steg 3: Testa Sessions API med cookies
$sessionEndpoint = "http://localhost:3000/api/sessions"

# Detta kommer att testa om sessions API:et nu fungerar med cookies
# efter att användaren har loggat in i browsern
$response = Invoke-WebRequest -Uri $sessionEndpoint -Method GET -ContentType "application/json" -UseBasicParsing

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response Content: $($response.Content)"

## Steg 4: Testa att skapa en session genom chat
# Först behöver vi skapa ett dokument och sedan chatta