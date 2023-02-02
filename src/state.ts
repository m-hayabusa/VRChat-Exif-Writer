import { config } from './config';
import { RoomInfo } from './tags';

export class State {
    static isVL2Enabled = false;
    static focalLength = config.focalDefault;
    static apertureValue = config.apertureDefault;
    static exposureIndex = config.exposureDefault;
    static roomInfo = new RoomInfo();
    static players: string[] = [];
    static restart = false; //TODO: Remove this
}