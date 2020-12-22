import { IPuzzleDay } from 'advent-api';
import { promises as fs } from 'fs';
import * as path from 'path';

const template = ({ year, day }: IPuzzleDay) => `
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

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

export const createFile = async ({ year, day }: IPuzzleDay) => {
    const folderPath = getFolderPath(day);
    await fs.mkdir(folderPath);
    await fs.writeFile(path.resolve(folderPath, 'solution.ts'), template({ year, day }), { flag: 'w' });
};
