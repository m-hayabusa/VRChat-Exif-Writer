Write-Host "���̃X�N���v�g�́ANode.JS��Git�����݂��Ȃ����Winget�𗘗p���C���X�g�[�����AGit��`https://github.com/m-hayabusa/VRChat-Exif-Writer`��clone���A�����N�����^�X�N�X�P�W���[���ɓo�^������̂ł��B`nEnter�Ŏ��s / Ctrl C�ŃL�����Z��"
while ($host.UI.RawUI.ReadKey().VirtualKeyCode -ne ([ConsoleKey]::Enter).value__) {}

# https://devblogs.microsoft.com/scripting/use-a-powershell-function-to-see-if-a-command-exists/
Function Test-CommandExists{
    Param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {if(Get-Command $command){$TRUE}}
    Catch {$FALSE}
    Finally {$ErrorActionPreference=$oldPreference}
} #end function test-CommandExists

Function New-Shortcut{
    Param(
        [string]$Destinaton,
        [string]$Target,
        [string]$Arguments,
        [string]$Workdir
    )

    $ws = New-Object -ComObject ("WScript.Shell")
    $sc = $ws.CreateShortcut($Destinaton)
    $sc.TargetPath = $Target
    $sc.Arguments = $Arguments
    $sc.WorkingDirectory = $Workdir
    $sc.Save()
}

while (!(Test-CommandExists("winget"))) {
    Write-Host "winget �R�}���h��������܂���B�X�g�A�A�v������ �A�v�� �C���X�g�[���[ ���X�V���Ă��������B`n�����L�[�������� �X�g�A�A�v�����J���܂��B`n �J�������ł��X�V�����悤�ł����A�u����v��u�X�V�v�{�^�����\������Ă���ꍇ�͂�����N���b�N���Ă��������B"
    [void]$host.UI.RawUI.ReadKey()
    Start-Process ms-windows-store://pdp?ProductId=9NBLGGH4NNS1
    Write-Host "�C���X�g�[�����I�������A�����L�[�������� ���ɐi�݂܂��B"
    [void]$host.UI.RawUI.ReadKey()
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

if ([System.Environment]::OSVersion.Version.Build -lt 22000) {
    Write-Host "`n�IWindows 10�̏ꍇ�A���̌�̑���œ��{�ꂪ�\���ł������e���ǂ߂Ȃ��Ȃ�ꍇ������܂��B`n���̃E�B���h�E�̃^�C�g���o�[���E�N���b�N �� �v���p�e�B �� �t�H���g �^�u �� ���i �t�H���g ����BIZ UD�S�V�b�N ��I�����AOK�������Ă��������B`n"
    [void]$host.UI.RawUI.ReadKey()
}

if (!(Test-CommandExists("node"))) {
    Write-Host "`nNode.JS���C���X�g�[�����܂��B�Ǘ��Ҍ������v�������͂��ł��B`n"
    winget install OpenJS.NodeJS.LTS -h
}

if (!(Test-CommandExists("git"))) {
    Write-Host "`nGit for Window���C���X�g�[�����܂��B�Ǘ��Ҍ������v�������͂��ł��B`n"
    winget install Git.Git -h
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (!(Test-Path "$env:LocalAppData\Programs")){
    New-Item -ItemType Directory "$env:LocalAppData\Programs"
}

if (Test-Path "$env:LocalAppData\Programs\VRChat-Exif-Writer"){
    Set-Location "$env:LocalAppData\Programs\VRChat-Exif-Writer"
    Write-Host "�X�V���܂�"
    git pull
} else {
    Set-Location "$env:LocalAppData\Programs"
    git clone "https://github.com/m-hayabusa/VRChat-Exif-Writer.git"
    Set-Location VRChat-Exif-Writer
}

npm install
npm run tsc

$task = Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null
if ($null -eq $task) {
    Write-Host "`n�����N������悤�ɓo�^���܂����H`nEnter�Ŏ��s / ����ȊO�ŃX�L�b�v"
    if ($host.UI.RawUI.ReadKey().VirtualKeyCode -eq ([ConsoleKey]::Enter).value__) {
        npm run regist
        Write-Host "`n�����N���̉����́A�V���[�g�J�b�g�uunregist�v������s�ł��܂��B"
    } else {
        Write-Host "`n�ォ�玩���ŋN������悤�ɂ������Ȃ����ꍇ�́A�V���[�g�J�b�g�uregist�v������s�ł��܂��B"
    }
} else {
    Write-Host "`n�����N���̉����́A�V���[�g�J�b�g�uunregist�v������s�ł��܂��B"
}

if ($null -ne $task) {
    if ($task.State -eq "Running") {
        Write-Host "�^�X�N���ċN�����܂�"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    } else {
        Write-Host "�^�X�N���N�����܂�"
    }
    Start-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
}


$startmenuPath = "$env:AppData\Microsoft\Windows\Start Menu\Programs\"

if (!(Test-Path "$startmenuPath\VRChat-Exif-Writer")){
    New-Item -ItemType Directory "$startmenuPath\VRChat-Exif-Writer"
}

New-Shortcut -Destinaton "$startmenuPath\VRChat-Exif-Writer\VRChat-Exif-Writer.lnk" -Target $(Get-Command powershell.exe) -Arguments "$env:LocalAppData\Programs\VRChat-Exif-Writer\utils\start.ps1" -Workdir "$env:LocalAppData\Programs\VRChat-Exif-Writer"
New-Shortcut -Destinaton "$startmenuPath\VRChat-Exif-Writer\VRChat-Exif-Writer�̃t�H���_���J��.lnk" -Target "C:\Windows\explorer.exe" -Arguments "$env:LocalAppData\Programs\VRChat-Exif-Writer\"

Write-Host "`n�C���X�g�[�����ꂽ�t�H���_�� �X�^�[�g���j���[�uVRChat-Exif-Writer�̃t�H���_���J���v����J�����Ƃ��ł��܂��B"
Write-Host "�Z�b�g�A�b�v���I�����܂����B`n�X�V�́A�V���[�g�J�b�g�usetup�v������s�ł��܂��B"

if($null -eq $task) {
    Write-Host "�蓮�ł̋N���́A�V���[�g�J�b�g�ustart�v�������� �X�^�[�g���j���[�uVRChat-Exif-Writer�v������s�ł��܂��B"
}

Write-Host "`n�����L�[�������� �I�����܂��B"
[void]$host.UI.RawUI.ReadKey()