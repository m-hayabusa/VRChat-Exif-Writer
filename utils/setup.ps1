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

while (!(Test-CommandExists("winget"))) {
    Write-Host "winget コマンドが見つかりません。ストアアプリから アプリ インストーラー をインストールしてください。`n何かキーを押すと ストアアプリが開きます。`n(「入手」や「更新」をクリックしてください 開いて放置するだけでも更新される？ようなのでどちらのボタンも見当らなかったらそのまま何かキーを押してみてください)"
    [void]$host.UI.RawUI.ReadKey()
    Start-Process ms-windows-store://pdp?ProductId=9NBLGGH4NNS1
    Write-Host "インストールが終わったら、何かキーを押すと 次に進みます。"
    [void]$host.UI.RawUI.ReadKey()
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

if ([System.Environment]::OSVersion.Version.Major -eq 10) {
    Write-Host "！Windows 10の場合、この後の操作で日本語が表示できず内容が読めなくなる場合があります。`nこのウィンドウのタイトルバーを右クリック → プロパティ → フォント タブ → 中段 フォント からBIZ UDゴシック を選択し、OKを押してください。"
    [void]$host.UI.RawUI.ReadKey()
}

if (!(Test-CommandExists("node"))) {
    Write-Host "Node.JSをインストールします。管理者権限が要求されるはずです。"
    winget install OpenJS.NodeJS.LTS -h
}

if (!(Test-CommandExists("git"))) {
    Write-Host "Git for Windowをインストールします。管理者権限が要求されるはずです。"
    winget install Git.Git -h
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$remote = git remote get-url origin 2>$null

if (($null -ne $remote) -and ($remote -ne "https://github.com/m-hayabusa/VRChat-Exif-Writer.git")) {
    Write-Host "別のGitリポジトリの下で実行されているようですが、本当に続けますか？`nEnterで実行 / Ctrl Cでキャンセル"
    while ($host.UI.RawUI.ReadKey().VirtualKeyCode -ne ([ConsoleKey]::Enter).value__) {}
}

if ($null -eq $remote) {
    git clone "https://github.com/m-hayabusa/VRChat-Exif-Writer.git"
    Set-Location VRChat-Exif-Writer
} else {
    Write-Host "更新します"
    git pull
}

npm install
npm run tsc

$task = Get-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\ 2>$null
if ($null -eq $task) {
    Write-Host "自動起動するように登録しますか？`nEnterで実行 / それ以外でスキップ"
    if ($host.UI.RawUI.ReadKey().VirtualKeyCode -eq ([ConsoleKey]::Enter).value__) {
        npm run regist
        Write-Host "自動起動の解除は、ショートカット「unregist」から実行できます。"
    } else {
        Write-Host "後から自動で起動するようにしたくなった場合は、ショートカット「regist」から実行できます。"
    }
} else {
    Write-Host "自動起動の解除は、ショートカット「unregist」から実行できます。"
}

if ($null -ne $task) {
    if ($task.State -eq "Running") {
        Write-Host "タスクを再起動します"
        Stop-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
    } else {
        Write-Host "タスクを起動します"
    }
    Start-ScheduledTask -TaskName VRChat-Exif-Writer -TaskPath \nekomimiStudio\
}

Write-Host "セットアップが終了しました。`n更新は、ショートカット「setup」から実行できます。"

if($null -eq $task) {
    Write-Host "手動での起動は、ショートカット「start」から実行できます。"
}

Write-Host "`n何かキーを押すと 終了します。"
[void]$host.UI.RawUI.ReadKey()