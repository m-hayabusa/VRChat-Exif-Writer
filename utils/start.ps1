$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -eq $task ) {
    Write-Host "���ڋN�����܂�"
    npm run start
} else {
    if ($task.State -eq "Running") {
        Write-Host "�^�X�N���ċN�����܂�"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    }
    Write-Host "�^�X�N���N�����Ă��܂�"
    Start-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
}

Start-Sleep -Seconds 1