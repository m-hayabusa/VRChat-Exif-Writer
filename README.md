# VRChat-Exif-Writer

VRChatのキャプチャ画像にEXIFタグで

* `DateTimeOriginal` 撮影時刻
* `ImageDescription` ワールド名とそのインスタンスにいたプレイヤー名
* `MakerNotes` (MakerNotes.schema.jsonを参照)

を書き込みます

VirtualLens2が有効な場合はさらに

* `Focal Length` 焦点距離
* `FNumber` F値
* `ExposureIndex` 露出インデックス

も書き込まれます

* 他の画像まわりのツール (特に、ログファイルを監視しファイルを移動するタイプのもの) とはおそらく干渉します
* UDP#9001を占有します (OSCメッセージを受信して使うVRC拡張とは共存できません)

Windows環境のみで動きます (PowerShell.exeが必要)

# 使い方
## Windows 10の場合
検索バーにて`cmd`と打ち込むと`コマンドプロンプト`というアプリケーションが表示されます。
これを右クリックして管理者として実行を押してください
<img width="490" alt="2022-07-10_15h20_31" src="https://user-images.githubusercontent.com/58413358/178133832-f2e23fd8-d1ef-47b5-a283-43c9463b9d7c.png">

`>`はコマンドの入力を示す記号です。
`>`の後から1行づつコピーして貼り付け、上から順に実行してください。
```
> @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
> cinst -y git nodejs-lts
> git clone -b master https://github.com/m-hayabusa/VRChat-Exif-Writer.git
> cd VRChat-Exif-Writer
> npm install
> npm run tsc
> npm run start
> # Start VRChat
```
