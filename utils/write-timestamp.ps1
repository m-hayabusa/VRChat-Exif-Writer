Param(
    [array]$Pathes,
    $DestPath
)

$path_to_exiftool = "$($env:LocalAppData)\Programs\VRChat-Exif-Writer\node_modules\exiftool.exe\vendor\exiftool.exe"
$destDirRoot = $DestPath

$Pathes | ForEach-Object {
    $_ | Get-ChildItem -Recurse | ForEach-Object {
        $newDate = $null
        $datetime = $null
        $matched = $null
        $year = $null
        $mon = $null
        $source = $null

        if ($_ -match 'VRChat[_ ](?:(?:.*)_)?(\d+)[- ](\d+)[- ](\d+)[_ ](\d+)[- ](\d+)[- ](\d+).*.(?:(?:png)|(?:jpg))$') {
            $matched = "image"
            $newDate = "$($Matches.1):$($Matches.2):$($Matches.3) $($Matches.4):$($Matches.5):$($Matches.6)"
            $year = $Matches.1
            $mon = $Matches.2
            $source = "VRChat"
        }

        if ($_ -match '(?:438100_)?(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_1(?:_vr)?.(?:(?:jpg)|(?:png))$') {
            if ($_ -match '.*Steam\\.*\\screenshots\\thumbnails\\.*') {
                return
            }

            $matched = "image"
            $newDate = "$($Matches.1):$($Matches.2):$($Matches.3) $($Matches.4):$($Matches.5):$($Matches.6)"
            $year = $Matches.1
            $mon = $Matches.2
            $source = "Steam"
        }

        elseif ($_ -match '(?:(?:com.vrchat.oculus.quest)|(?:VirtualDesktop.Android)|(?:com.polygraphene.alvr))-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2}).(jpg|mp4)$') {
            if ($Matches.7 -eq "jpg") {
                $matched = "image"
            } else {
                $matched = "video"
            }
            $newDate = "$($Matches.1):$($Matches.2):$($Matches.3) $($Matches.4):$($Matches.5):$($Matches.6)"
            $year = $Matches.1
            $mon = $Matches.2
            $source = "Quest"
        }

        if ($matched -eq "image") {
            $datetime = $(&${path_to_exiftool} -EXIF:DateTimeOriginal $_.FullName -charset utf8)
            if ($datetime -eq $null) {
                Write-host "WRITE" $_ $newDate
                &${path_to_exiftool} -overwrite_original -EXIF:DateTimeOriginal=$newDate $_.FullName -charset utf8 > $null
            } else {
                Write-Host "     " $_
            }
        } elseif ($matched -ne $null) {
            Write-Host "     " $_
        }

        if ($destDirRoot -ne $null -and $matched -ne $null) {
            if ($mon.Length -eq 1) {
                $mon = "0$mon"
            }
            $destDir = "$destDirRoot\$year-$mon\"

            New-Item -ItemType Directory -Force -Path $destDir > $null
            Move-Item -Path $_ -Destination $destDir
        }
    }
}