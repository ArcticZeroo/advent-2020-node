import * as fs from 'fs';
import * as path from 'path';
import { Day, Part } from './models';

export function getFilePath({ day, part = 1 }: { day: Day, part?: Part }) {
    return path.resolve(__dirname, '../files', `day${day}-part${part}.txt`);
}

export function readFileContents(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
}
