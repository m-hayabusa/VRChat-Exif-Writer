import { exec } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import LogReader from './logReader';
import OscServer from './oscServer';
import { State } from './state';


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

    const log = new LogReader();
    const osc = new OscServer();
    let running = false;

    osc.listen();
    const waitLoop = setInterval(() => {
        exec(process.platform == "win32" ? "powershell.exe -C \"(Get-Process -Name VRChat | Measure-Object).Count\"" : "ps -A|grep VRChat|wc -l", (error, stdout, stderr) => {
            if (parseInt(stdout) >= 1 && !State.restart) {
                if (!running) {
                    running = true;
                    console.log("VRChat: Start");
                    log.open();
                }
            } else {
                running = false;
                State.restart = false;
                log.close();
                console.log("Waiting for VRChat...");
            }
        });
    }, 5000);
}

main();