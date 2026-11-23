param([string]$ReferenceHtml = (Join-Path $PSScriptRoot 'Tests\Reference.html'))
$ErrorActionPreference = 'Stop'
$fixture = Join-Path $PSScriptRoot 'artifacts\reference.json'
New-Item (Split-Path $fixture) -ItemType Directory -Force | Out-Null
node (Join-Path $PSScriptRoot 'Tests\reference.cjs') $ReferenceHtml $fixture
if ($LASTEXITCODE) { throw 'Reference generation failed.' }
dotnet run --project (Join-Path $PSScriptRoot 'Tests\BansuriMapper.Tests.csproj') -- $fixture
if ($LASTEXITCODE) { throw 'Parity tests failed.' }
