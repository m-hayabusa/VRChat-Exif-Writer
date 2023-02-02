export class MediaTag {
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

export class ExifTag extends MediaTag {
    prefix: string = "-exif";
}

export class XmpTag extends MediaTag {
    prefix: string = "-xmp";
}

export class PngTag extends MediaTag {
    prefix: string = "-png";
}

export class RoomInfo {
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

export class MakerNotes {
    room: RoomInfo;
    players: string[];
    constructor(room: RoomInfo, players: string[]) {
        this.room = room;
        this.players = players;
    }
}
