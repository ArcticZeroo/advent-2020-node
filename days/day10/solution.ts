
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { Counter } from '../../common/counter';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { isBetween, lines, sorted } from '../../common/utils';

config();

const year = 2020;
const day = 10;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const isSupportedGap = (lowerAdapter: number, higherAdapter: number) => isBetween(higherAdapter - lowerAdapter, 1, 3);

const getAdapters = () => {
    const inputAdapters = lines(input).map(Number);
    const builtInAdapterValue = Math.max(...inputAdapters) + 3;
    return [0, ...sorted(inputAdapters), builtInAdapterValue]
}

const part1 = async () => {
    const adapters = getAdapters();
    const differences = new Map<number, number>();
    for (let i = 0; i < adapters.length - 1; i++) {
        const diff = adapters[i + 1] - adapters[i];
        if (!differences.has(diff)) {
            differences.set(diff, 0);
        }
        differences.set(diff, differences.get(diff) + 1);
    }
    console.log(differences.get(1) * differences.get(3));
};

const part2 = async () => {
    const adapters = getAdapters();
    const combinationsByIndex = new Counter<number>();
    combinationsByIndex.increment(0);
    for (let i = 0; i < adapters.length - 1; i++) {
        for (let j = i + 1; j < adapters.length; j++) {
            if (!isSupportedGap(adapters[i], adapters[j])) {
                break;
            }
            combinationsByIndex.increment(j, combinationsByIndex.get(i));
        }
    }

    console.log(combinationsByIndex.get(adapters.length - 1));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
