$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:5080'
$health = Invoke-RestMethod -TimeoutSec 10 "$base/api/health"
if ($health.status -ne 'ok') { throw 'Health check failed.' }
$schema = Invoke-RestMethod -TimeoutSec 10 "$base/openapi/v1.json"
foreach ($route in @('/api/advisor/analyze', '/api/advisor/chat')) {
    if (-not $schema.paths.PSObject.Properties[$route]) { throw "OpenAPI route missing: $route" }
    $body = @{ question = 'Giá trị thặng dư khác lợi nhuận thế nào?'; state = @{ quarter = 1; cash = 700 } } | ConvertTo-Json -Depth 5
    $result = Invoke-RestMethod -TimeoutSec 25 -Uri "$base$route" -Method Post -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
    if ($result.mode -notin @('demo', 'gemini') -or [string]::IsNullOrWhiteSpace($result.message)) { throw "Invalid response from $route" }
    Write-Output "$route : OK ($($result.mode))"
}
Write-Output 'API health, OpenAPI, analyze and chat passed.'
