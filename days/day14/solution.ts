import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { Counter } from '../../common/counter';
import { InfiniteGrid } from '../../common/grid';
import { counter } from '../../common/reducers';
import * as reducers from '../../common/reducers';
import { lines } from '../../common/utils';
import apply = Reflect.apply;

config();

const year = 2020;
const day = 14;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const lineToAssignment = (line: string) => {
    const [, index, unmaskedValue] = line.match(/mem\[(\d+)] = (\d+)/).map(Number);
    return [index, unmaskedValue] as const;
};

const lineToMask = (line: string) => line.split('=')[1].trim();

const part1 = async () => {
    const inputLines = lines(input);
    let mask: string;
    const memory = new Map<number, number>();
    const applyMask = (value: number) => {
        const binaryChars = value.toString(2).padStart(mask.length, '0').split('');
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 'X') {
                continue;
            }
            binaryChars[i] = mask[i];
        }
        return Number.parseInt(binaryChars.join(''), 2);
    };
    for (const line of inputLines) {
        if (line.startsWith('mask')) {
            mask = lineToMask(line);
            continue;
        }

        const [index, unmaskedValue] = lineToAssignment(line);
        memory.set(index, applyMask(unmaskedValue));
    }

    console.log(Array.from(memory.values()).reduce(...reducers.add()));
};

const part2 = async () => {
    const inputLines = lines(input);
    let mask: string;
    const memory = new Map<number, number>();
    const parseBinary = (chars: string[]) => Number.parseInt(chars.join(''), 2);
    const applyMask = (value: number) => {
        const binaryChars = value.toString(2).padStart(mask.length, '0').split('');
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '0') {
                continue;
            }

            binaryChars[i] = mask[i];
        }

        if (binaryChars.includes('X')) {
            const xCount = new Counter(binaryChars).get('X');
            const permutationCount = Math.pow(2, xCount);

            const permutations = [];
            for (let i = 0; i < permutationCount; i++) {
                const currentPermutation = [...binaryChars];
                const indexAsBinary = i.toString(2).padStart(xCount, '0');
                let lastIndex = 0;
                for (let j = 0; j < indexAsBinary.length; j++) {
                    lastIndex = currentPermutation.indexOf('X', lastIndex);
                    currentPermutation[lastIndex] = indexAsBinary[j];
                }
                permutations.push(parseBinary(currentPermutation));
            }

            return permutations;
        }

        return [parseBinary(binaryChars)];
    };
    for (const line of inputLines) {
        if (line.startsWith('mask')) {
            mask = lineToMask(line);
            continue;
        }
        const [index, unmaskedValue] = lineToAssignment(line);

        const maskedIndices = applyMask(index);
        for (const maskedIndex of maskedIndices) {
            memory.set(maskedIndex, unmaskedValue);
        }
    }

    console.log(Array.from(memory.values()).reduce(...reducers.add()));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
