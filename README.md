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
> git clone -b main https://github.com/m-hayabusa/VRChat-Exif-Writer.git
> cd VRChat-Exif-Writer
> npm install
> npm run tsc
> npm run start
> # Start VRChat
```

### 自動起動スクリプトの登録

上記の方法ではVRChatを起動する前に毎回`npm run tsc`以降のコマンドを入力する必要があります。  
これをスクリプトを作成しスタートアップに登録することで自動化します。  
検索バーにて`ファイル名を指定して実行`と検索し起動します。  
<img width="280" alt="2022-07-10_15h29_14" src="https://user-images.githubusercontent.com/58413358/178134010-27513814-c45e-41ac-a12b-6d3395034ffa.png">
  
起動したら`shell:startup`と入力し`OK`を選択します。  
<img width="358" alt="2022-07-10_15h40_23" src="https://user-images.githubusercontent.com/58413358/178134233-cb8d2462-ee05-4c86-b7a6-7f3235a46046.png">
  
エクスプローラー上部の`表示`→`ファイル名拡張子`のチェックボックスを有効にしてください。  

ファイルエクスプローラーが起動するのでなにもないところで右クリックし、`新規作成`→`テキストドキュメント`を選択してください。  
<img width="471" alt="image" src="https://user-images.githubusercontent.com/58413358/178134267-2aa8658e-f323-4ffb-9243-ac0a17df42b5.png">
  
`新しいテキストドキュメント.txt`というファイルが生成されます。  
`VRChat-Exif-Writer-startup.bat`と入力し確定してください。  
<img width="174" alt="image" src="https://user-images.githubusercontent.com/58413358/178134378-dcd79414-d790-4482-a424-3f369643317c.png">

`名前の変更`という確認ダイアログが表示されますが問題ないため`はい(Y)`を選択してください。  
<img width="286" alt="image" src="https://user-images.githubusercontent.com/58413358/178134411-46326f43-49e6-417f-81bc-ec86f4c03de5.png">

作成した`VRChat-Exif-Writer-startup.bat`を右クリックし、`編集`を選択してください。  
<img width="195" alt="image" src="https://user-images.githubusercontent.com/58413358/178134472-6061414f-5255-4b72-8094-ceb205e573f8.png">

編集画面が開くため、以下の内容をコピペし保存してください。  
```
cd %userprofile%\VRChat-Exif-Writer
npm run tsc
start /min cmd /c npm run start
```
<img width="343" alt="image" src="https://user-images.githubusercontent.com/58413358/178134905-16adbde9-466f-46d1-b1ed-f613857e6013.png">


以上で完了です。  