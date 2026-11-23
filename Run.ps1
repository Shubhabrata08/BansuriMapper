$ErrorActionPreference = 'Stop'
dotnet build (Join-Path $PSScriptRoot 'BansuriMapper.csproj') -c Debug -v minimal
if ($LASTEXITCODE) { throw 'Build failed.' }
Start-Process (Join-Path $PSScriptRoot 'bin\Debug\net10.0-windows10.0.19041.0\win-x64\BansuriMapper.exe')
