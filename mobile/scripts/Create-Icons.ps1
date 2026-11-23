$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assets = Join-Path $PSScriptRoot '..\assets'
foreach ($name in @('icon.png', 'adaptive-icon.png', 'favicon.png')) {
    $size = if ($name -eq 'favicon.png') { 64 } else { 1024 }
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.ScaleTransform($size / 1024.0, $size / 1024.0)
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#101918'))
    $gold = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#d4b477'))
    $mint = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#9bc8a8'))
    $dark = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#1d2d29'))
    $outline = [System.Drawing.Pen]::new($mint, 10)
    try {
        $graphics.TranslateTransform(512, 512)
        $graphics.RotateTransform(-35)
        $graphics.FillRectangle($gold, -350, -80, 700, 160)
        $graphics.FillEllipse($gold, -390, -80, 160, 160)
        $graphics.FillEllipse($gold, 230, -80, 160, 160)
        for ($i = 0; $i -lt 6; $i++) {
            $x = -250 + $i * 90
            $graphics.FillEllipse($dark, $x, -24, 48, 48)
            if ($i -lt 3) { $graphics.FillEllipse($mint, $x, -24, 48, 48) }
            else { $graphics.DrawEllipse($outline, $x, -24, 48, 48) }
        }
        $bitmap.Save((Join-Path $assets $name), [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally { $outline.Dispose(); $gold.Dispose(); $mint.Dispose(); $dark.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
}
