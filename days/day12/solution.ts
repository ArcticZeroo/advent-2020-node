
import { config } from 'dotenv';
import { Dir, Dirent, readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import { lines, paragraphs } from '../../common/utils';

config();

const year = 2020;
const day = 12;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({year, day, part, answer}, {cookie: process.env.ADVENT_COOKIE});
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};


const Directions = {
    N:     0,
    E:     1,
    S:     2,
    W:     3,
    count: 4,
}

const DirectionSigns = {
    [Directions.N]: -1,
    [Directions.E]: 1,
    [Directions.S]: 1,
    [Directions.W]: -1
}

const data = lines(input).map(line => [line[0], Number(line.slice(1))] as const);

const manhattan = (from: IPoint, to: IPoint) => (Math.abs(to.x - from.x) + Math.abs(to.y - from.y));

const wrap = (value: number, around: number) => value < 0 ? wrap(around + value, around) : value % around;

const matchSigns = (source: number, matchWith: number) => Math.sign(source) === Math.sign(matchWith) ? source : -source;

const part1 = async () => {
    let currentDir = Directions.E;
    const currentPos = {x: 0, y: 0};

    const turn = (count: number, isLeft: boolean) => currentDir = wrap(currentDir + (isLeft ? -count : count), Directions.count)

    const move = (count: number, moveDir: number) => {
        const xMult = [Directions.E, Directions.W].includes(moveDir) ? DirectionSigns[moveDir] : 0;
        const yMult = [Directions.N, Directions.S].includes(moveDir) ? DirectionSigns[moveDir] : 0;
        currentPos.x += count * xMult;
        currentPos.y += count * yMult;
    }

    for (const [instruction, count] of data) {
        if (['L', 'R'].includes(instruction)) {
            turn(count / 90, instruction === 'L');
            continue;
        }

        if (['F'].includes(instruction)) {
            move(count, currentDir);
            continue;
        }

        const dir = Directions[instruction as keyof typeof Directions];
        move(count, dir);
    }

    console.log(currentPos);
    console.log(manhattan({x: 0, y: 0}, currentPos));
};

const part2 = () => {
    const shipPosition = {x: 0, y: 0};
    const waypointRelativePosition = {x: 10, y: 1};
    const degreesToCount = degrees => (degrees % 360) / 90;

    for (const [instruction, count] of data) {
        console.log(instruction, count);
        switch (instruction) {
            case 'N':
                waypointRelativePosition.y += count;
                break;
            case 'S':
                waypointRelativePosition.y -= count;
                break;
            case 'E':
                waypointRelativePosition.x += count;
                break;
            case 'W':
                waypointRelativePosition.x -= count;
                break;
            case 'L':
                for (let i = 0; i < degreesToCount(count); i++) {
                    [waypointRelativePosition.x, waypointRelativePosition.y] = [-waypointRelativePosition.y, waypointRelativePosition.x];
                }
                break;
            case 'R':
                for (let i = 0; i < degreesToCount(count); i++) {
                    [waypointRelativePosition.x, waypointRelativePosition.y] = [waypointRelativePosition.y, -waypointRelativePosition.x];
                }
                break;
            case 'F':
                shipPosition.x += count * waypointRelativePosition.x;
                shipPosition.y += count * waypointRelativePosition.y;
        }
        console.log(shipPosition, waypointRelativePosition);
    }
    console.log(manhattan({x: 0, y: 0}, shipPosition));
};

const part2bad = async () => {
    const currentPos = {x: 0, y: 0};
    const waypointRelativePos = {x: 10, y: -1};
    const waypointRelativeDir = {x: Directions.E, y: Directions.N};

    const turn = (fromDir: number, count: number, isLeft: boolean) => wrap(fromDir + (isLeft ? -count : count), Directions.count)

    const degreesToCount = degrees => (degrees % 360) / 90;

    const move = (fromPos: IPoint, count: number, moveDir: number) => {
        console.log('move from', fromPos, 'for count', count, 'in dir', moveDir);
        const xMult = moveDir === Directions.E ? 1 : moveDir === Directions.W ? -1 : 0;
        const yMult = moveDir === Directions.S ? 1 : moveDir === Directions.N ? -1 : 0;
        fromPos.x += count * xMult;
        fromPos.y += count * yMult;

        console.log(fromPos);
    }

    for (const [instruction, count] of data) {
        console.log(instruction, count);
        if (['L', 'R'].includes(instruction)) {
            const isL = instruction === 'L';
            const rotateCount = degreesToCount(count);
            waypointRelativeDir.x = turn(waypointRelativeDir.x, rotateCount, isL);
            waypointRelativeDir.y = turn(waypointRelativeDir.y, rotateCount, isL);
            waypointRelativePos.x = matchSigns(waypointRelativePos.x, DirectionSigns[waypointRelativeDir.x]);
            waypointRelativePos.y = matchSigns(waypointRelativePos.y, DirectionSigns[waypointRelativeDir.y]);
            [waypointRelativeDir.x, waypointRelativeDir.y] = [waypointRelativeDir.y, waypointRelativeDir.x];
            [waypointRelativePos.x, waypointRelativePos.y] = [waypointRelativePos.y, waypointRelativePos.x];
            console.log('directions after rotation of', rotateCount, ':', waypointRelativeDir);
            console.log('positions after rotation:', waypointRelativePos);
            continue;
        }

        if (['F'].includes(instruction)) {
            move(currentPos, Math.abs(count * waypointRelativePos.x), waypointRelativeDir.x);
            move(currentPos, Math.abs(count * waypointRelativePos.y), waypointRelativeDir.y);
            continue;
        }

        console.log('about to move, current dirs are', waypointRelativeDir);
        const dir = Directions[instruction as keyof typeof Directions];
        move(waypointRelativePos, count, dir);
    }

    console.log(currentPos);
    console.log(manhattan({x: 0, y: 0}, currentPos));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
