Set-Location $PSScriptRoot\..

$tri = New-ScheduledTaskTrigger -AtLogOn -RandomDelay $(New-TimeSpan -Minutes 1) -User $((Get-WMIObject -class Win32_ComputerSystem).UserName)
$pri = New-ScheduledTaskPrincipal -LogonType S4U -RunLevel Limited -UserId ((Get-WMIObject -class Win32_ComputerSystem).UserName)
$act = New-ScheduledTaskAction -WorkingDirectory $(Get-Location) -Execute """$((Get-Command Node).Source)""" -Argument "built/main.js"

Register-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath nekomimiStudio -Trigger $tri -Principal $pri -Action $act -Force
Start-Sleep -s 1