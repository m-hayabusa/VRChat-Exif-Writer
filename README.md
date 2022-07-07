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

```
> npm run tsc
> npm run start
> # Start VRChat
```

