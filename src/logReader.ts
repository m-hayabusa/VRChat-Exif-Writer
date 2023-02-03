import { Tail } from 'tail';
import * as fs from 'fs';
import path from 'path';
import { exiftool } from 'exiftool-vendored';
import nodeNotifier from 'node-notifier';
import { exec } from 'child_process';
import * as http from "http";
import { AddressInfo } from 'net';

import { State } from './state';
import { config } from './config';
import { MediaTag, RoomInfo, MakerNotes } from './tags';
import sharp from 'sharp';

const compatdata_path = process.platform == "win32" ? "" : process.env.STEAM_COMPAT_DATA_PATH == undefined ? `${process.env["HOME"]}/.local/share/Steam/steamapps/compatdata/` : `${process.env.STEAM_COMPAT_DATA_PATH}`


class HttpServer {
    private htmlResBody;
    private httpServer;
    get port() {
        return (this.httpServer.address() as AddressInfo).port;
    }
    constructor() {
        this.htmlResBody = fs.readFileSync("./cushion.html", { encoding: "utf8" });
        this.httpServer = http.createServer((req, res) => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(this.htmlResBody);
        });
        this.httpServer.listen();
    }
}
const httpServer = new HttpServer();

export default class LogReader {
    tail: Tail | undefined;
    logFile: string = "";
    private logReadLoop: NodeJS.Timer | undefined;
    private logReopenLoop: NodeJS.Timer | undefined;

    close() {
        clearInterval(this.logReadLoop);
        clearInterval(this.logReopenLoop);
        this.logReadLoop = undefined;
        this.logReopenLoop = undefined;
        this.logFile = "";
        this.tail?.unwatch();
    }

    reflesh() {
        fs.lstat(this.logFile, () => { });
    }

    open(force: boolean = false) {
        const logDir = process.platform == "win32" ? `${process.env.APPDATA}\\..\\LocalLow\\VRChat\\VRChat\\` : `${compatdata_path}/438100/pfx/drive_c/users/steamuser/AppData/LocalLow/VRChat/VRChat/`;
        const logFile = logDir + (fs.readdirSync(logDir)
            .filter(e => e.startsWith("output_log_"))
            .map(e => ({ f: e, t: fs.lstatSync(logDir + e).mtime.getTime() }))
            .sort((a, b) => b.t - a.t))[0].f;

        if (this.logFile === logFile && !force) {
            return;
        }

        this.logFile = logFile;

        if (!this.logReopenLoop) {
            this.logReopenLoop = setInterval(() => {
                this.open(false);
            }, 5000);
        }

        if (!this.logReadLoop) {
            this.logReadLoop = setInterval(() => {
                this.reflesh();
            }, 500);
        }

        this.tail?.unwatch();
        this.tail = new Tail(this.logFile);

        this.tail.on("error", function (error) {
            console.log('ERROR: ', error);
        });

        this.tail.on("line", (line: string) => {
            // if (line != "") console.log(line);
            this.check.forEach(f => f(line));
        });
    }

    private check: Array<(line: string) => void> = [
        (line: string) => {
            const match = line.match(/VRCApplication: OnApplicationQuit/);
            if (match) {
                console.log("VRChat: Quit");
                State.restart = true;
            }
        },
        (line: string) => {
            const match = line.match(/([0-9\.\: ]*) Log        -  \[VRC Camera\] Took screenshot to\: (.*)/);
            if (match) {
                const DateTime = match[1].replaceAll('.', ':');

                const fpath = process.platform == "win32" ? match[2] : match[2].replaceAll('C:\\', (`${compatdata_path}/438100/pfx/drive_c/`)).replaceAll('\\', '/');

                const tag: Array<MediaTag> = [];

                tag.push(new MediaTag("DateTimeOriginal", DateTime));
                tag.push(new MediaTag("CreationTime", DateTime));
                tag.push(new MediaTag("ImageDescription", `at VRChat World ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                tag.push(new MediaTag("Description", `at VRChat World ${State.roomInfo.world_name}, with ${State.players.toString()}`));

                if (State.isVL2Enabled) {
                    tag.push(new MediaTag("Make", "logilabo"));
                    tag.push(new MediaTag("Model", "VirtualLens2"));
                    tag.push(new MediaTag("FocalLength", State.focalLength.toFixed(1)));
                    if (State.apertureValue != config.apertureMin) tag.push(new MediaTag("FNumber", State.apertureValue.toFixed(1)));
                    tag.push(new MediaTag("ExposureIndex", State.exposureIndex.toFixed(1)));
                }

                const makerNote = new MakerNotes(State.roomInfo, State.players);

                this.convertImage(fpath).then((file) => {
                    this.writeMetadata(file, tag, makerNote).then(() => {
                        const dir = file.split(path.sep);
                        const targetDir = config.destDir === "" ? path.dirname(file) + "/" : config.destDir + "/" + dir[dir.length - 2] + "/";
                        if (!fs.existsSync(targetDir))
                            fs.mkdirSync(targetDir);
                        const dest = targetDir + path.basename(file);

                        if (path.normalize(file) != path.normalize(dest))
                            fs.copyFile(file, dest, fs.constants.COPYFILE_EXCL, (err) => {
                                if (err) throw err;
                                fs.rm(file, (err) => { if (err) throw err; });
                            });
                    });
                }).catch(e => {
                    console.warn(e);
                    this.writeMetadata(fpath, tag, makerNote);
                })
                // console.log(line, match);
            }
        },
        (line: string) => {
            const match = line.match(/.*\[Behaviour\] Joining (wrld_.*?):(?:.*?(private|friends|hidden|group)\((.*?)\))?(~canRequestInvite)?/);
            if (match) {
                State.roomInfo = new RoomInfo();
                State.roomInfo.world_id = match[1];
                State.roomInfo.permission = (match[2] ? match[2] : "public") + (match[4] ? "+" : "");
                State.roomInfo.organizer = match[3];
                State.players = [];
                State.focalLength = config.focalDefault;
                State.apertureValue = config.apertureDefault;
                State.exposureIndex = config.exposureDefault;
                State.isVL2Enabled = false;

                // console.log(State.roomInfo);
                // console.log(line, match);
            }
        },
        (line: string) => {
            const match = line.match(/Joining or Creating Room: (.*)/);
            if (match) {
                State.roomInfo.world_name = match[1];
                console.log(State.roomInfo);
                // console.log(line, match);
            }
        },
        (line: string) => {
            const match = line.match(/OnPlayerJoined (.*)/);
            if (match) {
                State.players.push(match[1]);
                // console.log(State.players.toString());
                console.log("join", match[1]);
                // console.log(line, match);
            }
        },
        (line: string) => {
            const match = line.match(/OnPlayerLeft (.*)/);
            if (match) {
                const i = State.players.indexOf(match[1]);
                if (i !== -1) {
                    State.players.splice(i, 1);
                    // console.log(State.players.toString());
                    console.log("quit", match[1]);
                    // console.log(line, match);
                }
            }
        },
        (line: string) => {
            const match = line.match(/(?:\[Video Playback\] Attempting to resolve URL 'http:\/\/localhost\/Temporary_Listen_Addresses\/openURL\/|\[YukiYukiVirtual\/OpenURL\])(.*?)'?$/);
            if (match) {
                const url = match[1];
                console.log("OpenURL", url);

                const hostname = (new URL(url)).hostname;
                const allowed = config.linkWhiteList.map(
                    (allowedHost): boolean => {
                        if (allowedHost.startsWith("*"))
                            return hostname.endsWith(allowedHost.replace("*", ""));
                        else
                            return hostname === allowedHost;
                    }).includes(true);

                let jump = url;
                if (!allowed) {
                    jump = `http://localhost:${httpServer.port}?world_id=${State.roomInfo.world_id}&world_name=${encodeURIComponent(`${State.roomInfo.world_name}`)}&url=${encodeURIComponent(url)}`;
                }

                exec(process.platform == "win32" ? `start ${jump.replaceAll(/([&\|<>\(\)\"])/g, "^$1")}` : `xdg-open "${jump}"`);
                nodeNotifier.notify(
                    {
                        title: "VRChat Link Opener",
                        message: `Opened ${url} by ${State.roomInfo.world_name}`,
                        sound: true,
                        wait: false,
                    }
                );
            }
        }
    ];

    private async writeMetadata(file: string, data: MediaTag[], makerNotes?: MakerNotes): Promise<void> {
        return new Promise((res, rej) => {
            const argFile = path.dirname(file) + path.sep + path.basename(file) + ".tags.txt";
            console.log(argFile);
            const args = fs.createWriteStream(argFile);

            args.write("-overwrite_original\n");
            data.forEach(e => {
                args.write(e.toString() + "\n");
            });
            args.write(`-makernote=${Buffer.from(JSON.stringify(makerNotes)).toString('base64')}\n`);

            args.close();

            exiftool.write(file, {}, ["-@", argFile])
                .then(() => {
                    res();
                    fs.rmSync(argFile);
                })
                .catch((e) => {
                    console.warn(e);
                    rej();
                });
        });
    }
    private async convertImage(file: string): Promise<string> {
        return new Promise((res, rej) => {
            if (config.compressFormat === "") { res(file); return; }
            const dest = file.replace(/.png$/, '.' + config.compressFormat);
            sharp(file)
                .toFormat(config.compressFormat, config.compressOptions)
                .toFile(dest)
                .then(() => {
                    fs.rm(file, (e) => {
                        if (e) rej(e);
                        else res(dest);
                    })
                })
                .catch((e: any) => rej(e));
        });
    }
}

