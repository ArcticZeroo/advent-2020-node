import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';

config();

const year = 2020;
const day = 3;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8').trim().split('\n');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const part1 = async () => {
    const grid = new InfiniteGrid<boolean>();
    for (let y = 0; y < input.length; ++y) {
        for (let x = 0; x < input[y].length; ++x) {
            grid.set({ x, y }, input[y][x] === '#');
        }
    }
    const pos = { x: 0, y: 0 };
    let total = 0;
    while (pos.y < grid.maxValues.y) {
        pos.x += 3;
        pos.y += 1;
        if (grid.get({ y: pos.y, x: pos.x % grid.maxValues.x })) {
            total++;
        }
    }
    console.log(total);
};

const part2 = async () => {
    const grid = new InfiniteGrid<boolean>();
    for (let y = 0; y < input.length; ++y) {
        for (let x = 0; x < input[y].length; ++x) {
            grid.set({ x, y }, input[y][x] === '#');
        }
    }
    const slopes = [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 7, y: 1 }, { x: 1, y: 2 }];
    const total = slopes.map(() => 0);
    for (let i = 0; i < slopes.length; ++i) {
        const pos = { x: 0, y: 0 };
        const { x: slopeX, y: slopeY } = slopes[i];
        while (pos.y < grid.maxValues.y) {
            pos.x += slopeX;
            pos.y += slopeY;
            if (grid.get({ y: pos.y, x: pos.x % grid.maxValues.x })) {
                total[i]++;
            }
        }
    }
    console.log(total.reduce((a, b) => a * b, 1));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
