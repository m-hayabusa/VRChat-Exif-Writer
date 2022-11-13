Set-Location $PSScriptRoot\..

$tri = New-ScheduledTaskTrigger -AtLogOn -RandomDelay $(New-TimeSpan -Minutes 1) -User $((Get-WMIObject -class Win32_ComputerSystem).UserName)
$pri = New-ScheduledTaskPrincipal -LogonType Interactive -RunLevel Limited -UserId ((Get-WMIObject -class Win32_ComputerSystem).UserName)
$act = New-ScheduledTaskAction -WorkingDirectory $(Get-Location) -Execute "wscript.exe" -Argument "utils\task_runner.js"

Register-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath nekomimiStudio -Trigger $tri -Principal $pri -Action $act -Force
Start-Sleep -s 1