# Requires: ImageMagick installed and 'magick' command available in PATH
# Run this script from the same folder as the *-plugged.png assets.
# It combines all resolutions into a single battery-plugged.ico file.

Write-Host "=== Battery Plugged Icon Conversion Script ==="

# Current working directory
$workingDir = Get-Location

# Collect all PNGs ending with "-plugged.png"
$pngFiles = Get-ChildItem -Path $workingDir -Filter '*-plugged.png'

if ($pngFiles.Count -eq 0) {
    Write-Host "No *-plugged.png files found in $workingDir"
    exit
}

# Find and sort the available size prefixes (e.g. 32x, 64x, 128x)
$sizes = $pngFiles |
    ForEach-Object {
        ($_).BaseName -split '-' | Select-Object -First 1
    } |
    Sort-Object -Unique

Write-Host "Detected sizes:" ($sizes -join ", ")

# Gather all detected PNGs into a single list (quoted for safety)
$inputImages = $pngFiles | ForEach-Object { "`"$($_.FullName)`"" }

# Output path (.ico in the same folder)
$outputPath = Join-Path $workingDir "battery-plugged.ico"

Write-Host "Creating battery-plugged.ico..."

# Merge all PNGs into one multi-size ICO file
$imageList = $inputImages -join " "
$command = "magick convert $imageList -colors 256 `"$outputPath`""
Invoke-Expression $command

Write-Host "`n✅ Done! Created $outputPath"
