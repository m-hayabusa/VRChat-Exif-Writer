$task = $(Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null)

if ( $null -eq $task ) {
    Write-Host "�^�X�N���o�^����Ă��܂��� (�����N���łȂ��Ȃ�A���ڃE�B���h�E����Ă�������)"
} elseif ($task.State -eq "Running") {
    Write-Host "�^�X�N���I�����܂�"
    Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
} else {
    Write-Host "�^�X�N���N�����Ă��܂���"
}