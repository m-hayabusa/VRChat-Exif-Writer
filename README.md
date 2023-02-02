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
Invoke-Expression ($([System.Text.Encoding]::GetEncoding("Shift_JIS").GetString((Invoke-WebRequest "https://raw.githubusercontent.com/m-hayabusa/VRChat-Exif-Writer/main/utils/setup.ps1" -UseBasicParsing).RawContentStream.GetBuffer())) -replace "\u0000","")
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

Linux(Steam Deck等)で使用する場合、Node.JSに加えて別途perlのインストールが必要になります。
(ほとんどの環境ですでにインストールされていると思います)  
ディストリビューションごとに適切なパッケージをインストールしてください。 
Node.JSはバージョン管理ツール(`nvm`や`n`のような)を利用してインストールすることをおすすめします。

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
`setup`が見あたらない場合、エクスプローラーのアドレスバーに`git pull`と入力してみてください。

## Linuxの場合
VRChat-Exif-Writerのディレクトリで
```
$ git pull
$ npm install
$ npm run tsc
```

# 設定
VRChat-Exif-Writerのディレクトリにある、config.jsonを編集してください  
存在しない場合、一回起動すると生成されるはずです
```
{
    "focalMin": 12,         // VirtualLens2 の Min Focal Length
    "focalMax": 300,        // VirtualLens2 の Max Focal Length 
    "focalDefault": 50,     // VirtualLens2 の Default Focal Length 
    "apertureMin": 22,      // VirtualLens2 の Min F Number
    "apertureMax": 1,       // VirtualLens2 の Max F Number
    "apertureDefault": 22,  // VirtualLens2 の Default F Number
    "exposureRange": 3,     // VirtualLens2 の Exposure Range 
    "exposureDefault": 0,   // VirtualLens2 の Default Exposure 
    "listenPort": 9001,     // VRChatがOSCを送信するUDPポート   
    "destDir": "",          // 保存先ディレクトリ
                            // "D:/VRCImage" にすると D:/VRCImage/2023-02 のようなディレクトリに保存される (空なら移動しない)
    "compressFormat": "",   // https://sharp.pixelplumbing.com/api-output#toformat のformatに指定できる文字列 (空なら変換しない)
                            // たとえば "jpeg" とか "webp" 、"avif" など
    "compressOptions": {}   // https://sharp.pixelplumbing.com/api-output#toformat のoptionsに指定できるオブジェクト
                            // たとえば { "quality": 90, "effort": 5} のように
}
```
VL2導入時に各パラメータを設定していない / VRChatの起動オプションでOSCの宛先ポートを変更していない 場合、デフォルト設定のままで問題ないはずです