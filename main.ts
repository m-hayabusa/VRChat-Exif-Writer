import { Server } from 'node-osc';
import { execFile, exec } from 'child_process';
import { Tail } from 'tail';
import * as fs from 'fs';
import os from 'os';

const compatdata_path = process.platform == "win32" ? "" : process.env.STEAM_COMPAT_DATA_PATH == undefined ? `${process.env["HOME"]}/.local/share/Steam/steamapps/compatdata/` : `${process.env.STEAM_COMPAT_DATA_PATH}`

class Config {
    static focalMin = 12;
    static focalMax = 300;
    static focalDefault = 50;

    static apertureMin = 22;
    static apertureMax = 1;
    static apertureDefault = Infinity;

    static exposureRange = 3;
    static exposureDefault = 0;

    static listenPort = 9001;
}

class MediaTag {
    prefix = "";
    tag: string;
    data: string;
    constructor(tag: string, data: string) {
        this.tag = tag;
        this.data = data;
    }
    toString(): string {
        return `${this.prefix}:${this.tag}=${this.data}`
    }
}

class ExifTag extends MediaTag {
    prefix: string = "-exif";
}

class XmpTag extends MediaTag {
    prefix: string = "-xmp";
}

class PngTag extends MediaTag {
    prefix: string = "-png";
}

class RoomInfo {
    world_id: string | undefined;
    world_name: string | undefined;
    permission: string | undefined;
    organizer: string | undefined;

    constructor(world_id?: string, world_name?: string, permission?: string, orgnizer?: string) {
        this.world_id = world_id;
        this.world_name = world_name;
        this.permission = permission;
        this.organizer = orgnizer;
    }
}

class MakerNotes {
    room: RoomInfo;
    players: string[];
    constructor(room: RoomInfo, players: string[]) {
        this.room = room;
        this.players = players;
    }
}

function writeMetadata(file: string, data: MediaTag[], makerNotes?: MakerNotes) {
    let args = ["-charset", "utf8", "-overwrite_original", file];
    data.forEach(e => {
        args.push(e.toString());
    });
    args.push(`-makernote=${Buffer.from(JSON.stringify(makerNotes)).toString('base64')}`)
    execFile(process.platform == "win32" ? "./node_modules/exiftool.exe/vendor/exiftool.exe" : "exiftool", args).stdout?.on("data", (data: string) => {
        console.log(data);
    });
    console.log("> " + process.platform == "win32" ? "exiftool.exe " : "exiftool" + args.join(" "));
}


let isVL2Enabled = false;
let focalLength = Config.focalDefault;
let apertureValue = Config.apertureDefault;
let exposureIndex = Config.exposureDefault;
let roomInfo = new RoomInfo();
let players: string[] = [];
let restart = false;

class OscServer {

    oscServer: Server | undefined;

    close() {
        this.oscServer?.close();
    }
    listen() {
        this.oscServer = new Server(Config.listenPort, '0.0.0.0', () => {
            // console.log('OSC Server is listening');
        });

        this.oscServer.on('message', (msg) => {
            const path = msg[0];
            const val = parseFloat(msg[1] as string);

            if (path === "/avatar/parameters/VirtualLens2_Control") {
                if (val == 193) {
                    isVL2Enabled = true;
                } else if (val == 192) {
                    isVL2Enabled = false;
                }
            }

            if (path === "/avatar/parameters/VirtualLens2_Zoom") {
                if (val === 0)
                    focalLength = Infinity;
                else
                    focalLength = Config.focalMin * Math.exp(val * Math.log(Config.focalMax / Config.focalMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Aperture") {
                apertureValue = Config.apertureMin * Math.exp(val * Math.log(Config.apertureMax / Config.apertureMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Exposure") {
                exposureIndex = (2 * val - 1) * Config.exposureRange;
            }

            if (path === "/avatar/change") {
                focalLength = Config.focalDefault;
                apertureValue = Config.apertureDefault;
                exposureIndex = Config.exposureDefault;
                isVL2Enabled = false;
            }
        });
    }
}

class logReader {
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
            if (line != "") console.log(line);
            {
                const match = line.match(/VRCApplication: OnApplicationQuit/);
                if (match) {
                    console.log("VRChat: Quit");
                    restart = true;
                }
            }
            {
                const match = line.match(/([0-9\.\: ]*) Log        -  \[VRC Camera\] Took screenshot to\: (.*)/);
                if (match) {
                    const DateTime = match[1].replaceAll('.', ':');

                    const fpath = process.platform == "win32" ? match[2] : match[2].replaceAll('C:\\', (`${compatdata_path}/438100/pfx/drive_c/`)).replaceAll('\\', '/');

                    const tag: Array<MediaTag> = [];

                    tag.push(new ExifTag("DateTimeOriginal", DateTime));
                    tag.push(new ExifTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                    tag.push(new XmpTag("DateTimeOriginal", DateTime));
                    tag.push(new XmpTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                    tag.push(new PngTag("Description", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                    tag.push(new PngTag("CreationTime", DateTime));

                    if (isVL2Enabled) {
                        tag.push(new ExifTag("Make", "logilabo"));
                        tag.push(new ExifTag("Model", "VirtualLens2"));
                        tag.push(new ExifTag("DateTimeOriginal", DateTime));
                        tag.push(new ExifTag("FocalLength", focalLength.toFixed(1)));
                        tag.push(new ExifTag("FNumber", apertureValue.toFixed(1)));
                        tag.push(new ExifTag("ExposureIndex", exposureIndex.toFixed(1)));
                        tag.push(new ExifTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                        tag.push(new XmpTag("Make", "logilabo"));
                        tag.push(new XmpTag("Model", "VirtualLens2"));
                        tag.push(new XmpTag("DateTimeOriginal", DateTime));
                        tag.push(new XmpTag("FocalLength", focalLength.toFixed(1)));
                        tag.push(new XmpTag("FNumber", apertureValue.toFixed(1)));
                        tag.push(new XmpTag("ExposureIndex", focalLength.toFixed(1)));
                        tag.push(new XmpTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                        tag.push(new PngTag("Description", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`));
                        tag.push(new PngTag("Make", "logilabo"));
                        tag.push(new PngTag("Model", "VirtualLens2"));
                    }
                    writeMetadata(fpath, tag, new MakerNotes(roomInfo, players));
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/.*\[Behaviour\] Joining (wrld_.*?):(?:.*?(private|friends|hidden|group)\((.*?)\))?/);
                if (match) {
                    roomInfo = new RoomInfo();
                    roomInfo.world_id = match[1];
                    roomInfo.permission = match[2] ? match[2] : "public";
                    roomInfo.organizer = match[3];
                    players = [];
                    focalLength = Config.focalDefault;
                    apertureValue = Config.apertureDefault;
                    exposureIndex = Config.exposureDefault;
                    isVL2Enabled = false;

                    // console.log(roomInfo);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/Joining or Creating Room: (.*)/);
                if (match) {
                    roomInfo.world_name = match[1];
                    console.log(roomInfo);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/OnPlayerJoined (.*)/);
                if (match) {
                    players.push(match[1]);
                    // console.log(players.toString());
                    console.log("join", match[1]);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/OnPlayerLeft (.*)/);
                if (match) {
                    const i = players.indexOf(match[1]);
                    if (i !== -1) {
                        players.splice(i, 1);
                        // console.log(players.toString());
                        console.log("quit", match[1]);
                        // console.log(line, match);
                    }
                }
            }
        });
    }
}


function main() {
    if (fs.statSync(`${os.tmpdir()}/VRChat-Exif-Writer.pid`, { throwIfNoEntry: false })) {
        const pid = parseInt(fs.readFileSync(`${os.tmpdir()}/VRChat-Exif-Writer.pid`).toString());
        exec(process.platform == "win32" ? `powershell.exe -C \"Get-Process -Id ${pid}\"` : `ps --no-headers -p ${pid}`, (error, stdout, stderr) => {
            if (error?.code != 1) {
                throw new Error("Found Another Process");
            }
        });
    }
    fs.writeFile(`${os.tmpdir()}/VRChat-Exif-Writer.pid`, process.pid.toString(), () => { });

    const log = new logReader();
    const osc = new OscServer();
    let running = false;

    osc.listen();
    const waitLoop = setInterval(() => {
        exec(process.platform == "win32" ? "powershell.exe -C \"(Get-Process -Name VRChat | Measure-Object).Count\"" : "ps -A|grep VRChat|wc -l", (error, stdout, stderr) => {
            if (parseInt(stdout) >= 1 && !restart) {
                if (!running) {
                    running = true;
                    console.log("VRChat: Start");
                    log.open();
                }
            } else {
                running = false;
                restart = false;
                log.close();
                console.log("Waiting for VRChat...");
            }
        });
    }, 5000);
}

main();