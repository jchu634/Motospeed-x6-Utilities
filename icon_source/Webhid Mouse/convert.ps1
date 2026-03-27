# Requires: ImageMagick installed and 'magick' command available in PATH
# Run this script from the same folder that contains the PNGs.
# It will output a single icon.ico file in the same folder.

Write-Host "=== Icon Conversion Script ==="

# Current folder
$workingDir = Get-Location

# Hardcoded icon sizes (fixed amount as specified)
$sizes = @("x32", "x64", "x128", "x256")

# Use index 0 as the default source for the icon
$index = 0

# Collect input PNGs for all hardcoded sizes
$inputImages = @()
foreach ($size in $sizes)
{
    $filePath = Join-Path $workingDir ("{0}.png" -f $size )
    if (Test-Path $filePath)
    {
        $inputImages += "`"$filePath`""
    } else
    {
        Write-Warning "Missing expected file: $filePath"
    }
}

if ($inputImages.Count -eq 0)
{
    Write-Host "No source images found for index $index — exiting."
    exit
}

# Output path for the single icon.ico file
$outputPath = Join-Path $workingDir "icon.ico"

Write-Host "Creating icon.ico..."

# Merge multi-resolution versions into one icon.ico using ImageMagick
$imageList = $inputImages -join " "
$command = "magick $imageList -colors 256 `"$outputPath`""
Invoke-Expression $command

Write-Host "`n✅ icon.ico created in $workingDir"
