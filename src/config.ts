import * as fs from 'fs';

class Config {
    constructor() {
        let configFile: Config | undefined;
        try {
            configFile = JSON.parse(fs.readFileSync("./config.json").toString()) as Config;
        } catch (e) {
            fs.writeFileSync("./config.json", JSON.stringify(this, undefined, "    "));
            configFile = undefined;
        }

        this.focalMin = configFile?.focalMin ? configFile.focalMin : 12;
        this.focalMax = configFile?.focalMax ? configFile.focalMax : 300;
        this.focalDefault = configFile?.focalDefault ? configFile.focalDefault : 50;

        this.apertureMin = configFile?.apertureMin ? configFile.apertureMin : 22;
        this.apertureMax = configFile?.apertureMax ? configFile.apertureMax : 1;

        this.apertureDefault = configFile?.apertureDefault ? configFile?.apertureDefault : this.apertureMin;

        this.exposureRange = configFile?.exposureRange ? configFile.exposureRange : 3;
        this.exposureDefault = configFile?.exposureDefault ? configFile.exposureDefault : 0;

        this.listenPort = configFile?.listenPort ? configFile.listenPort : 9001;
        this.listenAddress = configFile?.listenAddress ? configFile.listenAddress : "127.0.0.1";

        fs.writeFileSync("./config.json", JSON.stringify(this, undefined, "    "));
    }

    focalMin: number;
    focalMax: number;
    focalDefault: number;

    apertureMin: number;
    apertureMax: number;
    apertureDefault: number;

    exposureRange: number;
    exposureDefault: number;

    listenPort: number;
    listenAddress: string;
}

export const config = new Config();
