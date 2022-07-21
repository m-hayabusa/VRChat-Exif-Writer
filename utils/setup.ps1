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

while (!(Test-CommandExists("winget"))) {
    Write-Host "winget �R�}���h��������܂���B�X�g�A�A�v������ �A�v�� �C���X�g�[���[ ���C���X�g�[�����Ă��������B`n�����L�[�������� �X�g�A�A�v�����J���܂��B`n(�u����v��u�X�V�v���N���b�N���Ă������� �J���ĕ��u���邾���ł��X�V�����H�悤�Ȃ̂łǂ���̃{�^����������Ȃ������炻�̂܂܉����L�[�������Ă݂Ă�������)"
    [void]$host.UI.RawUI.ReadKey()
    Start-Process ms-windows-store://pdp?ProductId=9NBLGGH4NNS1
    Write-Host "�C���X�g�[�����I�������A�����L�[�������� ���ɐi�݂܂��B"
    [void]$host.UI.RawUI.ReadKey()
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

if ([System.Environment]::OSVersion.Version.Major -eq 10) {
    Write-Host "�IWindows 10�̏ꍇ�A���̌�̑���œ��{�ꂪ�\���ł������e���ǂ߂Ȃ��Ȃ�ꍇ������܂��B`n���̃E�B���h�E�̃^�C�g���o�[���E�N���b�N �� �v���p�e�B �� �t�H���g �^�u �� ���i �t�H���g ����BIZ UD�S�V�b�N ��I�����AOK�������Ă��������B"
    [void]$host.UI.RawUI.ReadKey()
}

if (!(Test-CommandExists("node"))) {
    Write-Host "Node.JS���C���X�g�[�����܂��B�Ǘ��Ҍ������v�������͂��ł��B"
    winget install OpenJS.NodeJS.LTS -h
}

if (!(Test-CommandExists("git"))) {
    Write-Host "Git for Window���C���X�g�[�����܂��B�Ǘ��Ҍ������v�������͂��ł��B"
    winget install Git.Git -h
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$remote = git remote get-url origin 2>$null

if (($null -ne $remote) -and ($remote -ne "https://github.com/m-hayabusa/VRChat-Exif-Writer.git")) {
    Write-Host "�ʂ�Git���|�W�g���̉��Ŏ��s����Ă���悤�ł����A�{���ɑ����܂����H`nEnter�Ŏ��s / Ctrl C�ŃL�����Z��"
    while ($host.UI.RawUI.ReadKey().VirtualKeyCode -ne ([ConsoleKey]::Enter).value__) {}
}

if ($null -eq $remote) {
    git clone "https://github.com/m-hayabusa/VRChat-Exif-Writer.git"
    Set-Location VRChat-Exif-Writer
} else {
    Write-Host "�X�V���܂�"
    git pull
}

npm install
npm run tsc

$task = Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null
if ($null -eq $task) {
    Write-Host "�����N������悤�ɓo�^���܂����H`nEnter�Ŏ��s / ����ȊO�ŃX�L�b�v"
    if ($host.UI.RawUI.ReadKey().VirtualKeyCode -eq ([ConsoleKey]::Enter).value__) {
        npm run regist
        Write-Host "�����N���̉����́A�V���[�g�J�b�g�uunregist�v������s�ł��܂��B"
    } else {
        Write-Host "�ォ�玩���ŋN������悤�ɂ������Ȃ����ꍇ�́A�V���[�g�J�b�g�uregist�v������s�ł��܂��B"
    }
} else {
    Write-Host "�����N���̉����́A�V���[�g�J�b�g�uunregist�v������s�ł��܂��B"
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

Write-Host "�Z�b�g�A�b�v���I�����܂����B`n�X�V�́A�V���[�g�J�b�g�usetup�v������s�ł��܂��B"

if($null -eq $task) {
    Write-Host "�蓮�ł̋N���́A�V���[�g�J�b�g�ustart�v������s�ł��܂��B"
}

Write-Host "`n�����L�[�������� �I�����܂��B"
[void]$host.UI.RawUI.ReadKey()