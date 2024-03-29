Write-Host "このスクリプトは、Node.JSとGitが存在しなければWingetを利用しインストールし、Gitで`https://github.com/m-hayabusa/VRChat-Exif-Writer`をcloneし、自動起動をタスクスケジューラに登録するものです。`nEnterで実行 / Ctrl Cでキャンセル"
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

if (!(Test-CommandExists("winget"))) {
    Write-Host "winget コマンドが見つかりません。ストアアプリから アプリ インストーラー を更新してください。`nストアアプリを開くだけでも更新されるようですが、「入手」や「更新」ボタンが表示されている場合はそれをクリックしてください。更新が完了すると、自動で次に進みます。`n何かキーを押すと ストアアプリが開きます。"
    [void]$host.UI.RawUI.ReadKey()
    Start-Process ms-windows-store://pdp?ProductId=9NBLGGH4NNS1
    Write-Host -NoNewline "winget コマンドが利用できるようになるのを待っています"
    while (!(Test-CommandExists("winget"))) {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 1
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    Write-Host "`nwinget コマンドが利用できるようになりました。"
}

if ([System.Environment]::OSVersion.Version.Build -lt 22000) {
    Write-Host "`n！Windows 10の場合、この後の操作で日本語が表示できず内容が読めなくなる場合があります。`nこのウィンドウのタイトルバーを右クリック → プロパティ → フォント タブ → 中段 フォント からBIZ UDゴシック を選択し、OKを押してください。`n何かキーを押すと 次に進みます。"
    [void]$host.UI.RawUI.ReadKey()
}

if (!(Test-CommandExists("node"))) {
    Write-Host "`nNode.JSをインストールします。管理者権限が要求されるはずです。`n"
    winget install OpenJS.NodeJS.LTS -h
}

if (!(Test-CommandExists("git"))) {
    Write-Host "`nGit for Windowをインストールします。管理者権限が要求されるはずです。`n"
    winget install Git.Git -h
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$remote = git remote get-url origin 2>$null
if ("https://github.com/m-hayabusa/VRChat-Exif-Writer.git" -eq $remote) {
    Write-Host "更新します"
    git pull
} else {
    if (Test-Path "$env:LocalAppData\Programs\VRChat-Exif-Writer"){
        Set-Location "$env:LocalAppData\Programs\VRChat-Exif-Writer"
        Write-Host "更新します"
        git pull
    } else {
        if (!(Test-Path "$env:LocalAppData\Programs")){
            New-Item -ItemType Directory "$env:LocalAppData\Programs"
        }
        Set-Location "$env:LocalAppData\Programs"
        git clone "https://github.com/m-hayabusa/VRChat-Exif-Writer.git"
        Set-Location VRChat-Exif-Writer
    }
}

$targetDir = Get-Location

npm install
npm run tsc

$isAutoStart = $false

$task = Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null
if ($null -eq $task) {
    Write-Host "`n自動起動するように登録しますか？`nEnterで実行 / それ以外でスキップ"
    if ($host.UI.RawUI.ReadKey().VirtualKeyCode -eq ([ConsoleKey]::Enter).value__) {
        $isAutoStart = $true
    } else {
        Write-Host "`n後から自動で起動するようにしたくなった場合は、ショートカット「regist」から実行できます。"
    }
} else {
    $isAutoStart = $true
}

if ($isAutoStart) {
    npm run regist
    Write-Host "`n自動起動の解除は、ショートカット「unregist」から実行できます。"
}

if ($null -ne $task) {
    Start-Sleep -Seconds 1
    if ($task.State -eq "Running") {
        Write-Host "タスクを再起動します"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    } else {
        Write-Host "タスクを起動します"
    }
    Start-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
}


$startmenuPath = "$env:AppData\Microsoft\Windows\Start Menu\Programs\"

if (!(Test-Path "$startmenuPath\VRChat-Exif-Writer")){
    New-Item -ItemType Directory "$startmenuPath\VRChat-Exif-Writer"
}

New-Shortcut -Destinaton "$startmenuPath\VRChat-Exif-Writer\VRChat-Exif-Writer.lnk" -Target $(Get-Command powershell.exe) -Arguments "$targetDir\utils\start.ps1" -Workdir "$targetDir"
New-Shortcut -Destinaton "$startmenuPath\VRChat-Exif-Writer\VRChat-Exif-Writerのフォルダを開く.lnk" -Target "C:\Windows\explorer.exe" -Arguments "$targetDir\"
if ($isAutoStart) {
    New-Shortcut -Destinaton "$startmenuPath\VRChat-Exif-Writer\VRChat-Exif-Writerを停止.lnk" -Target $(Get-Command powershell.exe) -Arguments "$targetDir\utils\stop.ps1" -Workdir "$targetDir"
}

Write-Host "`nインストールされたフォルダは スタートメニュー「VRChat-Exif-Writerのフォルダを開く」から開くことができます。"
Write-Host "セットアップが終了しました。`n更新は、ショートカット「setup」から実行できます。"

if($null -eq $task) {
    Write-Host "手動での起動は、ショートカット「start」もしくは スタートメニュー「VRChat-Exif-Writer」から実行できます。"
}

Write-Host "`n何かキーを押すと 終了します。"
[void]$host.UI.RawUI.ReadKey()