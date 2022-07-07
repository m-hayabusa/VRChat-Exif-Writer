import { Server } from 'node-osc';
import { execFile, exec, execSync, ChildProcess } from 'child_process';
import * as rl from "readline";

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
    args.push(`-makernote=${JSON.stringify(makerNotes)}`)
    execFile("./node_modules/exiftool.exe/vendor/exiftool.exe", args).stdout?.on("data", (data: string) => {
        console.log(data);
    });
    console.log("./node_modules/exiftool.exe/vendor/exiftool.exe" + args.toString());
}


let isVL2Enabled = false;
let focalLength = 0;
let apertureValue = Infinity;
let exposureIndex = 0;
let roomInfo = new RoomInfo();
let players: string[] = [];


class OscServer {
    
    focalMin = 12;
    focalMax = 300;
    apertureMin = 1;
    apertureMax = 22;
    exposureRange = 3;

    oscServer: Server | undefined;
    
    close() {
        this.oscServer?.close();
    }
    listen() {
        this.oscServer = new Server(9001, '0.0.0.0', () => {
            console.log('OSC Server is listening');
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
                if (val >= this.focalMax)
                    focalLength = Infinity;
                else
                    focalLength = this.focalMin * Math.exp(val * Math.log(this.focalMax / this.focalMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Aperture") {
                apertureValue = this.apertureMin * Math.exp(val * Math.log(this.apertureMax / this.apertureMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Exposure") {
                exposureIndex = (2 * val - 1) * this.exposureRange;
            }
        });
    }
}

class logReader {
    exec: ChildProcess | undefined;
    reader: rl.Interface | undefined;

    close(){
        this.exec?.kill();
        this.reader?.close();
    }

    open() {
        this.exec = exec("powershell.exe -C \"Get-ChildItem ${env:APPDATA}\\..\\LocalLow\\VRChat\\VRChat\\ -Filter output_log_* | Sort-Object LastWriteTime | Select-Object -last 1 | Get-Content -Wait -Tail 0\"");

        const stream = this.exec.stdout;
        if (!stream) {
            return;
        }

        stream.setEncoding("utf8");
        this.reader = rl.createInterface({
            input: stream,
        });

        this.reader.on("line", (line: string) => {
            if (line != "") console.log(line);
            {
                const match = line.match(/([0-9\.\: ]*) Log        -  \[VRC Camera\] Took screenshot to\: (.*)/);
                if (match) {
                    const DateTime = match[1].replaceAll('.', ':');
                    if (isVL2Enabled) {
                        writeMetadata(match[2], [
                            new ExifTag("Make", "logilabo"),
                            new ExifTag("Model", "VirtualLens2"),
                            new ExifTag("DateTimeOriginal", DateTime),
                            new ExifTag("FocalLength", focalLength.toFixed(1)),
                            new ExifTag("FNumber", apertureValue.toFixed(1)),
                            new ExifTag("ExposureIndex", exposureIndex.toFixed(1)),
                            new ExifTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`),
                        ], new MakerNotes(roomInfo, players));
                    } else {
                        writeMetadata(match[2], [
                            new ExifTag("DateTimeOriginal", DateTime),
                            new ExifTag("ImageDescription", `at VRChat ${roomInfo.world_name}, with ${players.toString()}`),
                        ], new MakerNotes(roomInfo, players));
                    }
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/.*\[Behaviour\] Joining (wrld_.*?):.*?~(?:(private|friends|hidden)\((.*?)\))?/);
                if (match) {
                    roomInfo = new RoomInfo();
                    roomInfo.world_id = match[1];
                    roomInfo.permission = match[2] ? match[2] : "public";
                    roomInfo.organizer = match[3];
                    players = [];
                    // console.log(roomInfo);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/Joining or Creating Room: (.*)/);
                if (match) {
                    roomInfo.world_name = match[1];
                    // console.log(roomInfo);
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/OnPlayerJoined (.*)/);
                if (match) {
                    players.push(match[1]);
                    console.log(players.toString());
                    console.log("join", match[1])
                    // console.log(line, match);
                }
            }
            {
                const match = line.match(/OnPlayerLeft (.*)/);
                if (match) {
                    const i = players.indexOf(match[1]);
                    if (i !== -1) {
                        players.splice(i, 1);
                        console.log(players.toString());
                        // console.log(line, match);
                        console.log("quit", match[1])
                    }
                }
            }
        });
    }
}

const log = new logReader();
const osc = new OscServer();
let running = false;

function main() {
    const waitLoop = setInterval(() => {
        exec("powershell.exe -C \"(Get-Process -Name VRChat | Measure-Object).Count\"", (error, stdout, stderr) => {
            if (parseInt(stdout) >= 1) {
                if (!running){
                    running = true;
                    console.log("VRChat found");
                    setTimeout(() => {
                        osc.listen();
                        log.open();
                    }, 1000);
                }
            } else {
                running = false;
                osc.close();
                log.close();
                console.log("Waiting for VRChat...");
            }
        });
    }, 5000);
}

main();