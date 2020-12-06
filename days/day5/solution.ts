import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';

config();

const year = 2020;
const day = 5;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8').trim().split('\n');

const getSeats = () => input.map(value => Number.parseInt(
    value.split('')
        .map(char => Number('BR'.includes(char)))
        .join(''),
    2 /*radix (binary)*/
));

const part1 = async () => {
    console.log('pt1:', getSeats().reduce(...reducers.max()));
};

const part2 = async () => {
    const allSeats = getSeats();

    for (let i = 0; i < (1 << 10); i++) {
        if (!allSeats.includes(i) && allSeats.includes(i - 1) && allSeats.includes(i + 1)) {
            console.log('pt2:', i);
        }
    }
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
