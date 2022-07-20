# VRChat-Exif-Writer

VRChatのキャプチャ画像にEXIFタグで

* `DateTimeOriginal` 撮影時刻
* `ImageDescription` ワールド名とそのインスタンスにいたプレイヤー名
* `MakerNotes` (`MakerNotes.schema.json`の構造のJSONをBase64でエンコードしたもの)

を書き込みます

VirtualLens2が有効な場合はさらに

* `Focal Length` 焦点距離
* `FNumber` F値
* `ExposureIndex` 露出インデックス

も書き込まれます

* https://github.com/m-hayabusa/picturama/releases を使うとそれらの情報を見れます
* 他の画像まわりのツール (特に、ログファイルを監視しファイルを移動するタイプのもの) とはおそらく干渉します
* UDP#9001を占有します (OSCメッセージを受信して使うVRC拡張とは共存できません)
* Windows/Linux環境で動きます

# インストール
## wingetを利用 (推奨) / Windows
`winget`を使うとNode.JSとGit両方を簡単にインストールすることができます。  
1. https://www.microsoft.com/p/app-installer/9nblggh4nns1 を開く
2. <kbd>Microsot Store アプリの取得</kbd> をクリック
3. 出てきたウィンドウの<kbd>詳細</kbd>をクリック (Win10の場合はこの手順が発生しないようです)
4. <kbd>インストール</kbd>をクリック、インストールが完了するまで待つ
5. スタートメニューに `cmd` と入力して<kbd>Enter</kb>
6. 出てきたウィンドウに `winget install OpenJS.NodeJS.LTS` と入力、<kbd>Enter</kbd> (Node.JSのインストールが実行されます)

6. `C:\Users\hayabusa>` のような表示に戻ったら `winget install Git.Git` と入力、<kbd>Enter</kbd> (Gitのインストールが実行されます)
7. `exit` と入力して閉じる

## Chocolateyを利用 / Windows
検索バーにて`cmd`と打ち込むと`コマンドプロンプト`というアプリケーションが表示されます。  
これを右クリックして管理者として実行を押してください  
<img width="490" alt="2022-07-10_15h20_31" src="https://user-images.githubusercontent.com/58413358/178133832-f2e23fd8-d1ef-47b5-a283-43c9463b9d7c.png">

1行づつコピーして貼り付け、上から順に実行してください。
```cmd
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
cinst -y git nodejs-lts
exit
```

## 手動
### Node.js
Node.jsならびにnpmのインストールが必要です。  
以下よりLTS版のダウンロード、インストールを行ってください。

[ダウンロード | Node.js](https://nodejs.org/ja/download/)

### Git
Gitを使ってダウンロードすると更新がしやすいのでおすすめです。  
以下よりダウンロード、インストールを行ってください。

[Git for Windows: https://gitforwindows.org/](https://gitforwindows.org/)

Gitをインストールしない場合、右上 Code から Download ZIP し、そのZIPファイルを展開してからフォルダを開いてエクスプローラのアドレスバーに `cmd` と入力、下記 `git clone...` とその下の行を飛ばして3行目から実行してください。

# 使い方
## Windowsの場合
#インストール の項目を参照し、Node.jsをインストールしてください。  
スタートメニューに`cmd`と入力し、<kbd>Enter</kbd>で起動してください。
表示されたウィンドウに以下を入力してください: 
```cmd
git clone -b main https://github.com/m-hayabusa/VRChat-Exif-Writer.git
cd VRChat-Exif-Writer
npm install
npm run tsc
npm run start
(このウィンドウはそのまま放置してVRChatを起動する)
```

`npm run start`を実行すると以下のような警告が表示される場合があります。  
この場合はそのまま`アクセスを許可する`を選択してください。  
<img width="384" alt="image" src="https://user-images.githubusercontent.com/58413358/178141878-b8037321-8972-42a0-ade0-06d3a145fdf0.png">

### 自動起動スクリプトの登録
#### 登録
```
> npm run regist
```
を実行すると、管理者権限を要求するプロンプトが表示されます。  
許可すると、ログインした際に自動で起動するようになります。
#### 削除
```
> npm run unregist
```
を実行すると、管理者権限を要求するプロンプトが表示されます。  
許可すると、自動で起動しなくなります。

## Linuxの場合

Linux(Steam Deck等)で使用する場合、別途exiftoolのインストールが必要になります。  
ディストリビューションごとに適切なパッケージをインストールしてください。

```shell
# Ubuntu
$ sudo apt install libimage-exiftool-perl

# Arch Linux
$ sudo pacman -S perl-image-exiftool
```

Linuxの場合、ターミナルを起動し、以下のコマンドを入力します。  
(先頭の$は不要です)

```shell
$ git clone -b main https://github.com/m-hayabusa/VRChat-Exif-Writer.git
$ cd VRChat-Exif-Writer
$ npm install
$ npm run tsc
$ npm run start
# Start VRChat
```

また、VRChatのインストールパスがデフォルトでない場合、別途VRChatインストール先の`compatdata`ディレクトリを環境変数`STEAM_COMPAT_DATA_PATH`に指定する必要があります。

# 更新
エクスプローラーでVRChat-Exif-Writerのフォルダを開き、アドレスバーに`cmd`と入力 (もしくは、ターミナルを開いてcloneしたディレクトリへ移動)
```
> git pull
> npm install
> npm run tsc
> npm run regist
```
