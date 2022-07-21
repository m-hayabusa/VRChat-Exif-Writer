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
## PowerShellスクリプト (推奨) / Windows
`winget`を利用してNode.JSとGitをインストールした後、`%LocalAppData%\Programs\VRChat-Exif-Writer`にこのアプリケーションを配置するスクリプトです。

1. スタートメニューに `powershell` と入力して<kbd>Enter</kb>
2. 以下の1行をコピーし、1.で開いたウィンドウに貼り付ける
```
Invoke-Expression ((Invoke-WebRequest https://raw.githubusercontent.com/m-hayabusa/VRChat-Exif-Writer/add-setup-util/utils/setup.ps1 -UseBasicParsing).Content) 
```
3. 表示内容に従って操作する
4. `セットアップが終了しました。`と出たら、ウィンドウを閉じる

## 手動でセットアップする場合
Node.jsをインストールしてください。  
Gitはなくてもセットアップできますが、更新がしやすいので利用することをおすすめします。

### Node.js
Node.jsならびにnpmのインストールが必要です。  
以下よりLTS版のダウンロード、インストールを行ってください。

[ダウンロード | Node.js](https://nodejs.org/ja/download/)

### Git
Gitを使ってダウンロードすると更新がしやすいのでおすすめです。  
以下よりダウンロード、インストールを行ってください。

[Git for Windows: https://gitforwindows.org/](https://gitforwindows.org/)

Gitをインストールしない場合、右上 Code から Download ZIP し、そのZIPファイルを展開してからフォルダを開いてエクスプローラのアドレスバーに `cmd` と入力、下記 `git clone...` とその下の行を飛ばして3行目から実行してください。

### VRChat-Exif-Writer
スタートメニューに`cmd`と入力し、<kbd>Enter</kbd>で起動してください。
表示されたウィンドウに以下を入力してください: 
```cmd
git clone -b main https://github.com/m-hayabusa/VRChat-Exif-Writer.git
cd VRChat-Exif-Writer
npm install
npm run tsc
npm run start
```
(このウィンドウはそのまま放置してVRChatを起動する)

`npm run start`を実行すると以下のような警告が表示される場合があります。  
この場合はそのまま`アクセスを許可する`を選択してください。  
<img width="384" alt="image" src="https://user-images.githubusercontent.com/58413358/178141878-b8037321-8972-42a0-ade0-06d3a145fdf0.png">
#### 自動起動スクリプトの登録
インストール先のフォルダにあるショートカット `regist` をダブルクリックして開くと、管理者権限を要求するプロンプトが表示されます。  
許可すると、ログインした際に自動で起動するようになります。
#### 自動起動スクリプトの削除
インストール先のフォルダにあるショートカット `unregist` をダブルクリックして開くと、管理者権限を要求するプロンプトが表示されます。  
許可すると、自動で起動しなくなります。

## 手動でセットアップする場合 / Linux
Node.JSとGitをインストールしてください。

Linux(Steam Deck等)で使用する場合、Node.JSに加えて別途exiftoolのインストールが必要になります。  
ディストリビューションごとに適切なパッケージをインストールしてください。
Node.JSはバージョン管理ツール(`nvm`や`n`のような)を利用してインストールすることをおすすめします。

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
## Windowsの場合
エクスプローラーでVRChat-Exif-Writerのフォルダを開き、`setup`をダブルクリックし、表示されたウィンドウの内容に従って操作してください。

## Linuxの場合
VRChat-Exif-Writerのディレクトリで
```
$ git pull
$ npm install
$ npm run tsc
```
