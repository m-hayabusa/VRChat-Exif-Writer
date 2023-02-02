import { Tail } from 'tail';
import * as fs from 'fs';
import path from 'path';
import { exiftool } from 'exiftool-vendored';

import { State } from './state';
import { config } from './config';
import { MediaTag, XmpTag, ExifTag, PngTag, RoomInfo, MakerNotes } from './tags';

const compatdata_path = process.platform == "win32" ? "" : process.env.STEAM_COMPAT_DATA_PATH == undefined ? `${process.env["HOME"]}/.local/share/Steam/steamapps/compatdata/` : `${process.env.STEAM_COMPAT_DATA_PATH}`

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
            {
                const match = line.match(/VRCApplication: OnApplicationQuit/);
                if (match) {
                    console.log("VRChat: Quit");
                    State.restart = true;
                }
            }
            {
                const match = line.match(/([0-9\.\: ]*) Log        -  \[VRC Camera\] Took screenshot to\: (.*)/);
                if (match) {
                    const DateTime = match[1].replaceAll('.', ':');

                    const fpath = process.platform == "win32" ? match[2] : match[2].replaceAll('C:\\', (`${compatdata_path}/438100/pfx/drive_c/`)).replaceAll('\\', '/');

                    const tag: Array<MediaTag> = [];

                    tag.push(new ExifTag("DateTimeOriginal", DateTime));
                    tag.push(new ExifTag("ImageDescription", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                    tag.push(new XmpTag("DateTimeOriginal", DateTime));
                    tag.push(new XmpTag("ImageDescription", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                    tag.push(new PngTag("Description", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                    tag.push(new PngTag("CreationTime", DateTime));

                    if (State.isVL2Enabled) {
                        tag.push(new ExifTag("Make", "logilabo"));
                        tag.push(new ExifTag("Model", "VirtualLens2"));
                        tag.push(new ExifTag("DateTimeOriginal", DateTime));
                        tag.push(new ExifTag("FocalLength", State.focalLength.toFixed(1)));
                        if (State.apertureValue != config.apertureMin) tag.push(new ExifTag("FNumber", State.apertureValue.toFixed(1)));
                        tag.push(new ExifTag("ExposureIndex", State.exposureIndex.toFixed(1)));
                        tag.push(new ExifTag("ImageDescription", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                        tag.push(new XmpTag("Make", "logilabo"));
                        tag.push(new XmpTag("Model", "VirtualLens2"));
                        tag.push(new XmpTag("DateTimeOriginal", DateTime));
                        tag.push(new XmpTag("FocalLength", State.focalLength.toFixed(1)));
                        if (State.apertureValue != config.apertureMin) tag.push(new XmpTag("FNumber", State.apertureValue.toFixed(1)));
                        tag.push(new XmpTag("ExposureIndex", State.focalLength.toFixed(1)));
                        tag.push(new XmpTag("ImageDescription", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                        tag.push(new PngTag("Description", `at VRChat ${State.roomInfo.world_name}, with ${State.players.toString()}`));
                        tag.push(new PngTag("Make", "logilabo"));
                        tag.push(new PngTag("Model", "VirtualLens2"));
                    }
                    this.writeMetadata(fpath, tag, new MakerNotes(State.roomInfo, State.players));
                    // console.log(line, match);
                }
            }
            {
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
            }
            {
                const match = line.match(/Joining or Creating Room: (.*)/);
                if (match) {
                    State.roomInfo.world_name = match[1];
                    console.log(State.roomInfo);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/OnPlayerJoined (.*)/);
                if (match) {
                    State.players.push(match[1]);
                    // console.log(State.players.toString());
                    console.log("join", match[1]);
                    // console.log(line, match);
                }
            }
            {
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
            }
        });
    }

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
}

