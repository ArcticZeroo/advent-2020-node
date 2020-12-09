
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines } from '../../common/utils';

config();

const year = 2020;
const day = 9;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({year, day, part, answer}, {cookie: process.env.ADVENT_COOKIE});
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const firstNonValid = (preambleLength: number) => {
    const values = lines(input).map(Number);

    const isSumOfPrevious = (valueIndex: number) => {
        const possibleValues = values.slice(valueIndex - preambleLength, valueIndex);
        for (const a of possibleValues) {
            for (const b of possibleValues) {
                if (a !== b && a + b === values[valueIndex]) {
                    return true;
                }
            }
        }
        return false;
    }

    for (let i = preambleLength; i < values.length; i++) {
        if (!isSumOfPrevious(i)) {
            return values[i];
        }
    }
}

const part1 = async () => {
    // console.log(firstNonValid(25));
};

const part2 = async () => {
    const invalid = firstNonValid(25);
    const values = lines(input).map(Number);
    for (let i = 0; i < values.length - 2; i++) {
        for (let j = i + 2; j < values.length; j++) {
            const range = values.slice(i, j + 1);
            if (range.reduce(...reducers.add()) === invalid) {
                const min = Math.min(...range);
                const max = Math.max(...range);
                console.log(min + max);
                return;
            }
        }
    }
    console.log('none found');
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
