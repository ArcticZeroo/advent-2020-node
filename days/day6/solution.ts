import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';

config();

const year = 2020;
const day = 6;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8').split(/\r?\n/);

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const part1 = async () => {
    let totalCount = 0;
    let currentState = new Set();
    for (const line of input) {
        if (!line) {
            totalCount += currentState.size;
            currentState = new Set();
            continue;
        }
        for (const char of line) {
            currentState.add(char);
        }
    }
    totalCount += currentState.size;
    console.log(totalCount);
};

const part2 = async () => {
    let totalCount = 0;
    let currentState = new Map();
    let userCount = 0;

    const updateTotal = () => {
        totalCount += Array.from(currentState.values()).filter(value => value === userCount).length;
    };

    for (const line of input) {
        if (!line) {
            updateTotal();
            currentState = new Map();
            userCount = 0;
            continue;
        }
        userCount++;
        line.split('').reduce(...reducers.mapCounter(currentState));
    }
    updateTotal();
    console.log(totalCount);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
