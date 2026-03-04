# Requires: ImageMagick installed and 'magick' command available in PATH
# Run this script from the same folder that contains the PNGs.
# It will output .ico files in the same folder.

Write-Host "=== Battery Icon Conversion Script ==="

# Current folder
$workingDir = Get-Location

# Collect all PNG files in this folder
$pngFiles = Get-ChildItem -Path $workingDir -Filter '*.png'

if ($pngFiles.Count -eq 0) {
    Write-Host "No PNG files found in $workingDir"
    exit
}

# Automatically detect available size prefixes (like '32x', '64x', etc.)
$sizes = $pngFiles |
    ForEach-Object {
        ($_).BaseName -split '-' | Select-Object -First 1
    } |
    Sort-Object -Unique

Write-Host "Detected sizes:" ($sizes -join ", ")

# Extract all unique numeric indices
$indices = $pngFiles |
    ForEach-Object {
        try {
            [int]($_.BaseName -split '-' | Select-Object -Last 1)
        } catch {
            $null
        }
    } |
    Sort-Object -Unique

foreach ($num in $indices) {
    # Naming convention adjustment:
    if ($num -eq 0) {
        $baseName = "battery-none"
    } else {
        $batteryLevel = $num - 1
        $baseName = "battery-{0:D2}" -f $batteryLevel
    }

    # Collect input PNGs for all resolutions for this index
    $inputImages = @()
    foreach ($size in $sizes) {
        $filePath = Join-Path $workingDir ("{0}-{1}.png" -f $size, $num)
        if (Test-Path $filePath) {
            $inputImages += "`"$filePath`""
        } else {
            Write-Warning "Missing expected file: $filePath"
        }
    }

    if ($inputImages.Count -eq 0) {
        Write-Warning "No source images found for index $num — skipping."
        continue
    }

    # Output full path for ICO
    $outputPath = Join-Path $workingDir ("{0}.ico" -f $baseName)

    Write-Host "Creating $([System.IO.Path]::GetFileName($outputPath))"

    # Merge multi-resolution versions into one .ico using ImageMagick
    $imageList = $inputImages -join " "
    $command = "magick convert $imageList -colors 256 `"$outputPath`""
    Invoke-Expression $command
}

Write-Host "`n✅ All icons created in $workingDir"
