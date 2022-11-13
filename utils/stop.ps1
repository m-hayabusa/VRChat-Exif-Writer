$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -eq $task ) {
    if (Test-Path ${env:TEMP}\VRChat-Exif-Writer.pid) {
        $processId = $(Get-Content ${env:TEMP}\VRChat-Exif-Writer.pid)
        Remove-Item ${env:TEMP}\VRChat-Exif-Writer.pid

        Write-Host "プロセスを終了します"
        try {
            Stop-Process $processId -ErrorAction Stop
        } catch {
            if ($_.Exception -is [Microsoft.PowerShell.Commands.ProcessCommandException]) {
                Write-Host "プロセスが起動していませんでした"
            }
        }
    } else {
        Write-Host "プロセスが起動していません"
    }
} else {
    if ($task.State -eq "Running") {
        Write-Host "タスクを終了します"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    } else {
        Write-Host "タスクが起動していません"
    }
}

Start-Sleep -Seconds 1