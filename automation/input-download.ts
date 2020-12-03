import { promises as fs } from 'fs';
import * as advent from 'advent-api';
import * as path from 'path';
import { Temporal } from 'proposal-temporal';
import { getFolderPath } from './file-creation';
import { calendar } from './scheduler';

const doesFileExist = async (path: string) => {
    try {
        await fs.stat(path);
        return true;
    } catch (e) {
        return false;
    }
};

export const downloadInput = async (day: number) => {
    const folderPath = getFolderPath(day);
    const inputPath = path.resolve(path.join(folderPath, 'input.txt'));

    if (await doesFileExist(inputPath)) {
        throw new Error('File already exists. Advent does not condone re-download');
    }

    const year = 2015 || Temporal.now.plainDate(calendar).year;

    const response = await advent.downloadInput({ day, year }, { cookie: process.env.ADVENT_COOKIE });
    const text = await response.text();
    await fs.writeFile(inputPath, text, { flag: 'w' });
};