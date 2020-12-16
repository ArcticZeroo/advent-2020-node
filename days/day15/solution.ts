
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { last } from '../../common/utils';

config();

const year = 2020;
const day = 15;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({year, day, part, answer}, {cookie: process.env.ADVENT_COOKIE});
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const wrap = (value: number, around: number) => value < 0 ? wrap(around + value, around) : value % around;

const nthNumberSpoken = (n: number) => {
    const spokenTurns = new Map<number, number[]>();
    const data = input.split(',').map(Number);
    let currentNumber = 0;
    let currentTurn = 0;
    for (currentTurn; currentTurn < data.length; currentTurn++) {
        const value = data[currentTurn];
        spokenTurns.set(value, [currentTurn]);
        currentNumber = value;
    }
    for (currentTurn; currentTurn < n; currentTurn++) {
        const turns = spokenTurns.get(currentNumber);
        // never been spoken before
        if (turns.length <= 1) {
            currentNumber = 0;
        } else {
            currentNumber = turns[turns.length - 1] - turns[turns.length - 2];
        }
        let newTurns = spokenTurns.get(currentNumber) ?? [];
        if (newTurns.length > 1) {
            newTurns = [last(newTurns)];
        }
        newTurns.push(currentTurn);
        spokenTurns.set(currentNumber, newTurns);
    }
    return currentNumber;
}

const part1 = async () => {
    console.log(nthNumberSpoken(2020));
};

const part2 = async () => {
    console.log(nthNumberSpoken(30000000));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
