$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -eq $task ) {
    Write-Host "直接起動します"
    npm run start
} else {
    if ($task.State -eq "Running") {
        Write-Host "タスクを再起動します"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    }
    Write-Host "タスクを起動しています"
    Start-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
}

Start-Sleep -Seconds 1