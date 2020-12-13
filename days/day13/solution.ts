import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { chars, chineseRemainder, first, lcm, lines, paragraphs } from '../../common/utils';

config();

const year = 2020;
const day = 13;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const data = lines(input);

const part1 = async () => {
    const departTimestamp = Number(data[0]);
    const busesInService = data[1].split(',').filter(value => value !== 'x').map(Number);
    let lowestBusId = -1;
    let lowestTime = Number.POSITIVE_INFINITY;
    for (const bus of busesInService) {
        const nextTime = bus - (departTimestamp % bus);
        if (nextTime < lowestTime) {
            lowestBusId = bus;
            lowestTime = nextTime;
        }
    }
    console.log(lowestBusId, lowestTime, lowestBusId * lowestTime);
};

const part2 = async () => {
    const departTimestamp = Number(data[0]);
    const busesInService = data[1].split(',').map(Number);
    const validIdsAndIndices = busesInService.map((value, i) => [value, i] as const).filter(([value]) => !Number.isNaN(value));
    const values = validIdsAndIndices.map(([value]) => value);
    const indices = validIdsAndIndices.map(([value, i]) => value - i);
    console.log(values, indices);
    console.log(chineseRemainder(values, indices));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
