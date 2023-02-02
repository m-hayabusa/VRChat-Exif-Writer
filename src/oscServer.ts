import { Server } from 'node-osc';
import { State } from './state';
import { config } from './config';

export default class OscServer {

    oscServer: Server | undefined;

    close() {
        this.oscServer?.close();
    }
    listen() {
        this.oscServer = new Server(config.listenPort, '0.0.0.0', () => {
            // console.log('OSC Server is listening');
        });

        this.oscServer.on('message', (msg) => {
            const path = msg[0];
            const val = parseFloat(msg[1] as string);

            if (path === "/avatar/parameters/VirtualLens2_Control") {
                if (val == 193) {
                    State.isVL2Enabled = true;
                } else if (val == 192) {
                    State.isVL2Enabled = false;
                }
            }

            if (path === "/avatar/parameters/VirtualLens2_Zoom") {
                if (val === 0)
                    State.focalLength = Infinity;
                else
                    State.focalLength = config.focalMin * Math.exp(val * Math.log(config.focalMax / config.focalMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Aperture") {
                State.apertureValue = config.apertureMin * Math.exp(val * Math.log(config.apertureMax / config.apertureMin));
            }

            if (path === "/avatar/parameters/VirtualLens2_Exposure") {
                State.exposureIndex = (2 * val - 1) * config.exposureRange;
            }

            if (path === "/avatar/change") {
                State.focalLength = config.focalDefault;
                State.apertureValue = config.apertureDefault;
                State.exposureIndex = config.exposureDefault;
                State.isVL2Enabled = false;
            }
        });
    }
}
