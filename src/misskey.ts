import * as fs from "fs";
import { config } from "./config";
import path from "path";

type DriveFolder = {
    id: string;
    createdAt: string;
    name: string;
    parentId?: string;
};

class Misskey {
    private async query(endpoint: string, body: { [key: string]: any }) {
        return new Promise((res, rej) => {
            body.i = config.misskeyToken;

            fetch(config.misskeyInstance + "/api/" + endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                method: "POST",
            })
                .then(async (r) => await r.json())
                .then((body) => {
                    if (body["error"] != undefined) {
                        throw new Error(JSON.stringify(body));
                    }
                    res(body);
                });
        });
    }

    private async createDir(name: string, parent?: string): Promise<DriveFolder> {
        return new Promise((res, rej) => {
            (
                this.query("drive/folders/create", {
                    name: name,
                    parentId: parent,
                }) as Promise<DriveFolder>
            )
                .then((body) => res(body))
                .catch((e) => rej(e));
        });
    }

    private async findDir(name: string, parent?: string): Promise<DriveFolder[]> {
        return new Promise((res, rej) => {
            (
                this.query("drive/folders/find", {
                    name: name,
                    parentId: parent,
                }) as Promise<DriveFolder[]>
            )
                .then((b) => res(b))
                .catch((e) => rej(e));
        });
    }

    private async ensureDir(name: string, parent?: string): Promise<DriveFolder> {
        return new Promise((res, rej) => {
            this.findDir(name, parent)
                .then(async (b) => {
                    if (b.length <= 0) {
                        res(await this.createDir(name, parent));
                    } else {
                        res(b[0]);
                    }
                })
                .catch((e) => rej(e));
        });
    }

    private async uploadFile(file: string, description: string, folderId: string): Promise<void> {
        return new Promise(async (res, rej) => {
            const body = new FormData();
            body.append("i", config.misskeyToken);
            body.append("name", path.basename(file));
            body.append("comment", description);
            body.append("folderId", folderId);
            body.append("file", new Blob([fs.readFileSync(file)]));

            fetch(`${config.misskeyInstance}/api/drive/files/create`, {
                method: "POST",
                body: body,
            }).then((r) => res());
        });
    }

    public async upload(file: string, desc: string) {
        const date = new Date();
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        const today = date.getDate().toString().padStart(2, "0");

        if (!this.rootDir) this.rootDir = await this.ensureDir(config.misskeyDir);
        if (!this.monthDir || this.monthDir?.name !== month) this.monthDir = await this.ensureDir(month, this.rootDir.id);
        if (!this.todayDir || this.todayDir?.name !== today) this.todayDir = await this.ensureDir(today, this.monthDir.id);

        await this.uploadFile(file, desc, this.todayDir.id);
    }

    private rootDir?: DriveFolder;
    private monthDir?: DriveFolder;
    private todayDir?: DriveFolder;
}

export default new Misskey();
