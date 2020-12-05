import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { url } from 'inspector';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';

config();

const year = 2020;
const day = 5;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8').split('\n');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const directions = {
    front: 'F',
    back:  'B',
    left:  'L',
    right: 'R'
};

const binarySearch = (itemCount, instructions) => {
    let array = [...Array(itemCount).keys()];
    for (const isUpper of instructions) {
        if (isUpper) {
            array = array.slice(array.length / 2);
        } else {
            array = array.slice(0, array.length / 2);
        }
        if (array.length === 1) {
            return array[0];
        }
    }
};

const getSeatId = (row, col) => (row * 8) + col;

const getSeats = (onSeat: (seat: IPoint) => void) => {
    for (const line of input) {
        if (!line.trim()) {
            continue;
        }
        const row = binarySearch(128, line.slice(0, 7).split('').map(value => value === directions.back));
        const col = binarySearch(8, line.slice(7, line.length).split('').map(value => value === directions.right));
        onSeat({ x: col, y: row });
    }
};

const part1 = async () => {
    let highestSeatId = -1;
    getSeats(({ x: col, y: row }) => {
        highestSeatId = Math.max(highestSeatId, getSeatId(row, col));
    });
    console.log(highestSeatId);
};

const part2 = async () => {
    const grid = new InfiniteGrid<number>();

    getSeats(({ x: col, y: row }) => {
        const seatId = getSeatId(row, col);
        grid.set({ x: row, y: col }, seatId);
    });

    for (let col = 0; col <= 7; col++) {
        // arbitrary numbers chosen because they're "not exactly at the end" or whatever
        for (let row = 10; row <= 100; row++) {
            if (!grid.has({ x: row, y: col })) {
                console.log('missing:', row, col);
            }
        }
    }
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
