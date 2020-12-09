import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines } from '../../common/utils';

config();

const year = 2020;
const day = 8;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const instructions = lines(input).map(line => {
    const [op, value] = line.split(/\s+/g);
    return [op, Number(value)] as const;
});

const checkInfiniteLoop = (currentInstructions = instructions) => {
    const ranInstructions = new Set();
    let i = 0;
    let accum = 0;
    while (i < currentInstructions.length) {
        if (ranInstructions.has(i)) {
            return [true, accum] as const;
        }

        const [op, value] = currentInstructions[i];
        ranInstructions.add(i);

        if (op === 'jmp') {
            i += value;
        } else {
            if (op === 'acc') {
                accum += value;
            }
            i++;
        }
    }
    return [false, accum] as const;
}

const part1 = async () => {
    const [, accum] = checkInfiniteLoop(instructions);
    console.log(accum);
};

const part2 = async () => {
    for (let i = 0; i < instructions.length; i++) {
        const [op, value] = instructions[i];
        if (!['jmp', 'nop'].includes(op)) {
            continue;
        }

        const newInstructions = [...instructions];
        newInstructions[i] = [op === 'jmp' ? 'nop' : 'jmp', value];

        const [infiniteLoopResult, accum] = checkInfiniteLoop(newInstructions);
        if (!infiniteLoopResult) {
            console.log(accum);
            return;
        }
    }
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);

