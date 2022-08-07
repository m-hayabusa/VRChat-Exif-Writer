$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -eq $task ) {
    Write-Host "タスクが登録されていません (自動起動でないなら、直接ウィンドウを閉じてください)"
} elseif ($task.State -eq "Running") {
    Write-Host "タスクを終了します"
    Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
} else {
    Write-Host "タスクが起動していません"
}