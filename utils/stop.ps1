$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -ne $task ) {
    if ($task.State -eq "Running") {
        Write-Host "�^�X�N���I�����܂�"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    } else {
        Write-Host "�^�X�N���N�����Ă��܂���"
    }
}

if (Test-Path ${env:TEMP}\VRChat-Exif-Writer.pid) {
    $processId = $(Get-Content ${env:TEMP}\VRChat-Exif-Writer.pid)
    Remove-Item ${env:TEMP}\VRChat-Exif-Writer.pid

    Write-Host "�v���Z�X���I�����܂�"
    try {
        Stop-Process $processId -ErrorAction Stop
    }
    catch {
        if ($_.Exception -is [Microsoft.PowerShell.Commands.ProcessCommandException]) {
            Write-Host "�v���Z�X���N�����Ă��܂���ł���"
        }
    }
} else {
    Write-Host "�v���Z�X���N�����Ă��܂���"
}

Start-Sleep -Seconds 1