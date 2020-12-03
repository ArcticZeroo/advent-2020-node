import { promises as fs } from 'fs';
import * as path from 'path';

const template = (year: number, day: number) => `
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';

config();

const year = ${year};
const day = ${day};

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({year, day, part, answer}, {cookie: process.env.ADVENT_COOKIE});
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const part1 = async () => {
    
};

const part2 = async () => {
    
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
`;

export const getFolderPath = (day: number) => path.resolve(path.join(__dirname, '../days/', `day${day}/`));

export const createFile = async (year: number, day: number) => {
    const folderPath = getFolderPath(day);
    await fs.mkdir(folderPath);
    await fs.writeFile(path.resolve(folderPath, 'solution.ts'), template(year, day), { flag: 'w' });
};
