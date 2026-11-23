param(
    [string]$AndroidSdk = $env:ANDROID_HOME,
    [string]$JavaHome = $env:JAVA_HOME,
    [string]$Architectures = 'arm64-v8a',
    [string]$CMakeVersion = '3.31.6'
)
$ErrorActionPreference = 'Stop'
if ([Environment]::OSVersion.Platform -ne 'Win32NT') { throw 'This helper is for Windows. Use Expo or Gradle directly on other platforms.' }
if (!$AndroidSdk -or !(Test-Path (Join-Path $AndroidSdk "cmake\$CMakeVersion\bin\ninja.exe"))) {
    throw "Set ANDROID_HOME (or pass -AndroidSdk) to an SDK with CMake $CMakeVersion installed."
}
if (!$JavaHome -or !(Test-Path (Join-Path $JavaHome 'bin\java.exe'))) {
    throw 'Set JAVA_HOME (or pass -JavaHome) to the JDK installation.'
}
if ((Get-ItemPropertyValue 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled) -ne 1) {
    throw 'Enable Windows long-path support before building from a deep directory, or use a shorter checkout path.'
}

$oldJavaHome = $env:JAVA_HOME
$oldAndroidHome = $env:ANDROID_HOME
$mappedDrive = $null
Push-Location (Join-Path $PSScriptRoot '..')
try {
    $env:JAVA_HOME = (Resolve-Path $JavaHome).Path
    $env:ANDROID_HOME = (Resolve-Path $AndroidSdk).Path
    if ($env:ANDROID_HOME -match '\s') {
        # A space-free SDK path avoids CMake shortening the clang++ executable name.
        $usedDrives = [Environment]::GetLogicalDrives()
        $letter = @('S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'R') | Where-Object { "${_}:\" -notin $usedDrives } | Select-Object -First 1
        if (!$letter) { throw 'No free drive letter is available for the temporary SDK alias.' }
        & "$env:SystemRoot\System32\subst.exe" "${letter}:" $env:ANDROID_HOME
        if ($LASTEXITCODE) { throw 'Could not create the temporary SDK alias.' }
        $mappedDrive = "${letter}:"
        $env:ANDROID_HOME = "$mappedDrive\"
    }
    if (!(Test-Path '.\android\gradlew.bat')) {
        npx expo prebuild --platform android --no-install
        if ($LASTEXITCODE) { throw 'Android project generation failed.' }
    }
    & .\android\gradlew.bat -p .\android :app:assembleRelease --no-daemon --console=plain --max-workers=4 "-PreactNativeArchitectures=$Architectures" "-Pandroid.cmakeVersion=$CMakeVersion"
    if ($LASTEXITCODE) { throw 'Android APK build failed.' }
    New-Item '.\artifacts' -ItemType Directory -Force | Out-Null
    $destination = Join-Path (Get-Location) 'artifacts\bansuri-mapper-android.apk'
    Copy-Item '.\android\app\build\outputs\apk\release\app-release.apk' $destination -Force
    Write-Host "APK: $destination"
    Write-Host 'Local test build only: uses the generated development signing key, not store credentials.'
}
finally {
    if ($mappedDrive) { & "$env:SystemRoot\System32\subst.exe" $mappedDrive /D }
    $env:JAVA_HOME = $oldJavaHome
    $env:ANDROID_HOME = $oldAndroidHome
    Pop-Location
}
