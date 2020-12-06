import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import {
    lines,
    removeWhitespace,
    paragraphs,
    uniqueChars,
    setIntersection
} from '../../common/utils';

config();

const year = 2020;
const day = 6;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const part1 = async () => {
    console.log(
        paragraphs(input)
            .map(removeWhitespace)
            .map(uniqueChars)
            .map(s => s.size)
            .reduce(...reducers.add())
    );
};

const part2 = async () => {
    console.log(
        paragraphs(input)
            .map(group => lines(group).map(uniqueChars).reduce(setIntersection).size)
            .reduce(...reducers.add())
    );
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
