# Bansuri Fingering Mapper

## Android and iOS

The `mobile` folder contains the React Native + Expo port for Android phones,
iPhone, and tablets, plus a web preview. See `mobile\README.md` for setup,
platform builds, and tests. The WinUI project below remains independent.

```powershell
cd mobile
npm ci
npm start
```

A native Windows WinUI 3 port of the supplied single-page app. The interface uses
WinUI controls and vector hole diagrams; no WebView, web server, or browser is
required to run it. The original HTML is retained only as a test reference.

Windows uses Fluent typography, a native single-selection swara list, and a
native alternate-Pa toggle. The palette and common text/list styles live in
`App.xaml`; the Android/iOS port uses a matching React Native Paper theme.

## Build and run

Requires Windows 10 1809 or newer (x64), .NET 10 SDK, and NuGet access for the
first build. Visual Studio with Windows application development support is
optional.

```powershell
.\Run.ps1
```

Or build `BansuriMapper.csproj` in Visual Studio. The unpackaged executable is:

```text
bin\Debug\net10.0-windows10.0.19041.0\win-x64\BansuriMapper.exe
```

Keep the entire output directory together: both .NET and Windows App SDK runtime
dependencies are included. No separate Windows App Runtime installation is
required. Settings start at C / Bhairav on each launch, just like the web app.

## Behavior

All ten source thaats, independent reference and mapped flute roots, sharp/flat
spelling, ascending sequence, pitch/frequency readouts, register guidance,
six-hole diagrams, alternate Pa, reset, tuning notes, and reference links are
ported. Layout reflows for narrow windows. Standard native focus, keyboard, and
UI Automation patterns are supported.

The source's musical conventions are intentionally unchanged: Marwa omits Pa;
F-sharp through B use tonic pitches below C4; chromatic shapes repeat in higher
and lower registers. This is a faithful reference-pattern mapper, not a claim
that every generated pitch is playable on every physical flute.

## Tests

```powershell
.\Test.ps1
```

Requires Node.js and the .NET SDK. The original JavaScript generates 45,504
expected cases covering every thaat, reference root, mapped root, notation mode,
alternate setting, and scale note. The C# checks compare pitches, frequencies,
labels, holes, relative descriptions, technique guidance, and alternate visibility,
and test selection/reset transitions. There are no third-party test dependencies.

An optional live UI regression script uses Hyperloop against a running local
window; Hyperloop is only a development/testing tool, never an app dependency:

```powershell
.\Tests\UiTest.ps1 -Hwnd <current-window-handle>
```

Generated reference data, UI results, and validation screenshots are in
`artifacts` (excluded from source control).
