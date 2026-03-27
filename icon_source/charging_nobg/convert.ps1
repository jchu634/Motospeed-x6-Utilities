# Requires: ImageMagick installed and 'magick' command available in PATH
# Run this script from the same folder that contains the PNGs.
# It will output .ico files in the same folder.

Write-Host "=== Battery Charging Icon Conversion Script ==="

# Current working directory
$workingDir = Get-Location

# Collect all PNG files
$pngFiles = Get-ChildItem -Path $workingDir -Filter '*.png'

if ($pngFiles.Count -eq 0) {
    Write-Host "No PNG files found in $workingDir"
    exit
}

# Detect available size prefixes (like 32x, 64x, etc.)
$sizes = $pngFiles |
    ForEach-Object {
        ($_).BaseName -split '-' | Select-Object -First 1
    } |
    Sort-Object -Unique

Write-Host "Detected sizes:" ($sizes -join ", ")

# Extract numeric indices
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
    # Naming: direct 0–99 → battery-00-charging … battery-99-charging
    $baseName = "battery-{0:D2}-charging" -f $num

    # Collect all PNGs for different resolutions of this index
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

    # Output path (.ico file)
    $outputPath = Join-Path $workingDir ("{0}.ico" -f $baseName)

    Write-Host "Creating $([System.IO.Path]::GetFileName($outputPath))"

    # Merge all resolution PNGs into a multi-size ICO
    $imageList = $inputImages -join " "
    $command = "magick convert $imageList -colors 256 `"$outputPath`""
    Invoke-Expression $command
}

Write-Host "`n✅ All charging icons created in $workingDir"
