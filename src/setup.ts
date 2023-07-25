import { v4 as uuidv4 } from "uuid";
import { config } from "./config";
import readline from "readline";

class Setup {
    callback: ((line: string) => void) | undefined;

    async getBool(defaultValue: boolean) {
        const prompt = defaultValue ? "Yes/no: " : "yes/No: ";
        process.stdout.write(prompt);

        return new Promise<boolean>((res, rej) => {
            this.callback = (line: string) => {
                if (line.match(/Y(?:es)?/i)) {
                    console.log("-> Yes");
                    res(true);
                } else if (line.match(/N(?:o)?/i)) {
                    console.log("-> No");
                    res(false);
                } else {
                    if (defaultValue !== undefined) {
                        console.log(defaultValue ? "-> Yes" : "-> No");
                        res(defaultValue);
                    } else process.stdout.write(prompt);
                }
            };
        });
    }

    async getLine(pattern?: RegExp, defaultValue?: string) {
        // if (defaultValue) console.log("デフォルト値に設定するならそのままEnter");
        process.stdout.write(defaultValue ? `(デフォルト: ${defaultValue}): ` : ": ");
        return await new Promise<string>((res, rej) => {
            this.callback = (line: string) => {
                const result = line ? line : defaultValue ? defaultValue : "";

                if (!pattern) {
                    res(result);
                } else {
                    if (result.match(pattern)) {
                        res(result);
                    } else {
                        process.stdout.write("入力内容を確認してください: ");
                    }
                }
            };
        });
    }

    async setup() {
        const reader = readline.createInterface({
            input: process.stdin,
        });

        reader.on("line", (line: string) => {
            if (this.callback) this.callback(line);
        });

        console.log("\n設定ファイルを生成します。");

        console.log("\n\nyes/No: でEnter -> No になる\nYes/no: でEnter -> Yes になる\n(デフォルト: ...): のとき、デフォルト値に設定するならそのままEnter\n\n");

        console.log("設定ツールを使いますか?\n直接config.jsonを編集することでも設定できます");
        if (!(await this.getBool(true))) {
            console.log("了解! README.mdに内容が書いてあります");
            reader.close();
            config.save();
            return;
        }

        console.log("\nVirtualLens2の設定をデフォルトから変更していますか? (いまのところ全アバター共通としています)");
        if (await this.getBool(false)) {
            console.log("Min Focal Length");
            config.focalMin = parseInt(await this.getLine(/\d*/, config.focalMin.toString()));
            console.log("Max Focal Length");
            config.focalMax = parseInt(await this.getLine(/\d*/, config.focalMax.toString()));
            console.log("Default Focal Length");
            config.focalDefault = parseInt(await this.getLine(/\d*/, config.focalDefault.toString()));
            console.log("Min F Number");
            config.apertureMin = parseInt(await this.getLine(/\d*/, config.apertureMin.toString()));
            console.log("Max F Number");
            config.apertureMax = parseInt(await this.getLine(/\d*/, config.apertureMax.toString()));
            console.log("Default F Number");
            config.apertureDefault = parseInt(await this.getLine(/\d*/, config.apertureDefault.toString()));
            console.log("Exposure Range");
            config.exposureRange = parseInt(await this.getLine(/\d*/, config.exposureRange.toString()));
            console.log("Default F Number");
            config.exposureDefault = parseInt(await this.getLine(/\d*/, config.exposureDefault.toString()));

            config.save();
        }

        console.log("\n画像を圧縮しますか?");
        if (await this.getBool(config.compressFormat !== "")) {
            console.log("圧縮形式を選択してください\n\n選択肢:\n* jpeg\n* png\n* webp\n* tiff\n* avif\n* heif\n");

            config.compressFormat = (await this.getLine(/^(?:jpeg|png|webp|tiff|avif|heif)$/, config.compressFormat)) as any;
            if (config.compressFormat === "webp" || config.compressFormat === "avif" || config.compressFormat === "heif") {
                console.log("可逆圧縮を利用しますか?");
                //@ts-ignore
                if (await this.getBool(!!config.compressOptions.lossless))
                    //@ts-ignore
                    config.compressOptions.lossless = true;
                //@ts-ignore
                else config.compressOptions.lossless = undefined;
            }
            console.log(
                "直接設定ファイルを編集すれば、圧縮率や方式など細かい設定ができます。\nconfig.jsonの compressOptions に設定できる項目は、 https://sharp.pixelplumbing.com/api-output#toformat を参照してください"
            );

            config.save();
        }

        console.log("\n画像を移動しますか?");
        if (await this.getBool(config.destDir !== "")) {
            console.log("移動先のディレクトリのパスを入力");
            config.destDir = await this.getLine(undefined, config.destDir);

            config.save();
        }

        console.log("\nMisskeyへの自動アップロードを有効にしますか?");
        if (await this.getBool(!!config.misskeyToken)) {
            if (config.misskeyToken && config.misskeyInstance) {
                console.log("すでにトークンが保存されていますが、再度設定しますか? ( " + config.misskeyInstance + " )");
                if (!(await this.getBool(false))) {
                    console.log("ok!");
                    reader.close();
                    config.save();
                    return;
                }
            }

            const sessionID = uuidv4();
            const perms = encodeURIComponent(["read:drive", "write:drive"].join(","));
            const name = encodeURIComponent("VRChat Exif Writer");

            console.log("Misskeyインスタンスのドメインを入力 (ex: https://mewl.me )");
            config.misskeyInstance = await this.getLine(/https:\/\/.*/, config.misskeyInstance);

            console.log(`${config.misskeyInstance}/miauth/${sessionID}?name=${name}&permission=${perms}`);
            console.log("URLを開いてWebブラウザに移動、「やっていってください」になったらEnter");

            await new Promise<void>((res, rej) => {
                this.callback = (line: string) => {
                    fetch(`${config.misskeyInstance}/api/miauth/${sessionID}/check`, { method: "POST" })
                        .then((r) => r.json())
                        .then((ret) => {
                            if (ret.ok) {
                                this.callback = undefined;
                                config.misskeyToken = ret.token;
                                config.save();
                                console.log("保存しました");
                                res();
                            } else {
                                console.log("まだ許可されていないようです");
                            }
                        });
                };
            });

            console.log("Misskey Driveでの保存先フォルダの名前を入力");
            config.misskeyDir = await this.getLine(undefined, config.misskeyDir);
        }

        config.save();
        console.log("ok.");
        reader.close();
    }
}

const setup = new Setup();
setup.setup();
