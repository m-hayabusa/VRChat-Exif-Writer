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

Windows/Linux環境のみで動きます (Windowsの場合はPowerShell.exeが必要)

# インストール

Node.jsならびにnpmのインストールが必要です。  
以下よりダウンロード、インストールを行ってください。

[ダウンロード | Node.js](https://nodejs.org/ja/download/)

パッケージマネージャによるインストールも可能です。  
詳しくは以下を参考にしてください。

[パッケージマネージャを利用した Node.js のインストール | Node.js](https://nodejs.org/ja/download/package-manager/)

また、初回に`npm install`を実行する必要があります。

# 使い方

```
> npm run tsc
> npm run start
> # Start VRChat
```

# Linuxでの利用

Linux(Steam Deck等)で使用する場合、別途exiftoolのインストールが必要になります。

```shell
# Debian / Ubuntu
$ sudo apt install libimage-exiftool-perl

# Arch Linux / Manjaro / SteamOS Holo
$ sudo pacman -S perl-image-exiftool
```

また、VRChatのインストールパスがデフォルトでない場合、別途VRChatインストール先の`compatdata`ディレクトリを環境変数`STEAM_COMPAT_DATA_PATH`に指定する必要があります。
