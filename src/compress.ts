import * as fsP from "fs/promises";
import * as fs from "fs";
import sharp from "sharp";
import { exiftool } from 'exiftool-vendored';
import { config } from "./config";
import path from 'path';

async function findFile(dir: string) {
    for (const child of await fsP.readdir(dir)) {
        const c = path.join(dir, child);
        if ((await fsP.stat(c)).isDirectory()) {
            console.log(c);
            findFile(c);
        } else {
            console.log(c);
            try {
                await writeMetadata(c);
                // await writeMetadata(await convertImage(c));
            } catch (e) {
                console.warn(e);
            }
        }
    }
}

async function convertImage(file: string): Promise<string> {
    return new Promise(async (res, rej) => {

        if (config.compressFormat === "" || path.extname(file) === "." + config.compressFormat) {
            await fsP.copyFile(file, "test/" + path.basename(file));
            res("test/" + path.basename(file));
            return;
        }

        const dest = "test/" + path.basename(file.replace(new RegExp(path.extname(file) + "$"), "." + config.compressFormat));

        if ([".png", ".heic", ".heif", ".avif", ".jpeg", ".jpg"].includes(path.extname(file))) {
            await sharp(file)
                .toFormat(config.compressFormat, config.compressOptions)
                .withMetadata()
                .toFile(dest)
                .then(() => {
                    fsP.rm(file).then(() => res(dest));
                })
                .catch((e: any) => rej(e));
        } else {
            rej();
        }
    });
}

async function writeMetadata(file: string): Promise<void> {
    return new Promise((res, rej) => {
        const r = file.match(/VRChat[_ ](?:(?:.*)_)?(\d+)[- ](\d+)[- ](\d+)[_ ](\d+)[- ](\d+)[- ](\d+).*.(?:(?:png)|(?:jpg)|(?:heic)|(?:heif))$/);
        if (!r) return;
        console.log(`${r[1]}:${r[2]}:${r[3]} ${r[4]}:${r[5]}:${r[6]}`);
        res();

        exiftool.write(file, {}, [
            "-overwrite_original",
            `-DateTimeOriginal=${r[1]}:${r[2]}:${r[3]} ${r[4]}:${r[5]}:${r[6]}`
        ]).then((r) => {
            console.log(r);
            res();
        }).catch((e) => {
            console.warn(e);
            rej();
        });
    });
}

findFile("C:\\Users\\hayabusa\\Pictures\\VRChat")