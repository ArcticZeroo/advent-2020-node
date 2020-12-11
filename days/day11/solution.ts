import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import { chars, isBetween, lines, reversed } from '../../common/utils';

config();

const year = 2020;
const day = 11;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

type SeatRows = Array<Array<string>>;

const getSeatRows = () => lines(input).map(line => chars(line));

const runOccupiedCount = (countForEmpty: number, countForOccupied: number, getOccupiedCount: (seatRows: SeatRows, point: IPoint) => number) => {
    let seatRows = getSeatRows();
    const serializeSeats = () => seatRows.map(row => row.join('')).join('\n');
    const countOccupied = () => seatRows.map(line => line.filter(seat => seat === '#').length).reduce(...reducers.add());

    while (true) {
        let hasSeatChanged = false;

        let newSeats = seatRows.map(row => [...row]);

        for (let y = 0; y < seatRows.length; y++) {
            const line = seatRows[y];
            for (let x = 0; x < line.length; x++) {
                const point = { x, y };
                const occupiedCount = getOccupiedCount(seatRows, point);
                const seat = seatRows[y][x];
                if (seat === 'L' && occupiedCount === countForEmpty) {
                    newSeats[y][x] = '#';
                    hasSeatChanged = true;
                }
                if (seat === '#' && occupiedCount >= countForOccupied) {
                    newSeats[y][x] = 'L';
                    hasSeatChanged = true;
                }
            }
        }

        seatRows = newSeats;

        if (!hasSeatChanged) {
            break;
        }
    }

    return countOccupied();
};

const part1 = async () => {
    const getAllSeatsAround = (seatRows: SeatRows, { x, y }: IPoint) => {
        const previousLine = seatRows[y - 1] ?? [];
        const nextLine = seatRows[y + 1] ?? [];
        return [
            previousLine[x - 1], previousLine[x], previousLine[x + 1],
            seatRows[y][x - 1], seatRows[y][x + 1],
            nextLine[x - 1], nextLine[x], nextLine[x + 1]
        ].filter(value => Boolean(value));
    };

    const getOccupiedCount = (seatRows: SeatRows, { x, y }: IPoint) => {
        const seatsAround = getAllSeatsAround(seatRows, { x, y });
        return seatsAround.filter(seat => seat === '#').length;
    };

    console.log(runOccupiedCount(0, 4, getOccupiedCount));
};

const part2 = async () => {
    let seatRows = getSeatRows();
    const sizes = { y: seatRows.length, x: seatRows[0].length };

    const isNotEmpty = (seat: string) => seat !== '.';

    const findDiagonal = (from: IPoint, slope: IPoint) => {
        const currentPosition = { ...from };
        while (true) {
            currentPosition.x += slope.x;
            currentPosition.y += slope.y;
            if (!isBetween(currentPosition.x, 0, sizes.x - 1) || !isBetween(currentPosition.y, 0, sizes.y - 1)) {
                break;
            }
            const currentSeat = seatRows[currentPosition.y][currentPosition.x];
            if (isNotEmpty(currentSeat)) {
                return currentSeat;
            }
        }
        return undefined;
    };

    const getAllSeatsAround = (seatRows: SeatRows, { x, y }: IPoint) => {
        const currentRow = seatRows[y];
        const currentColumn = seatRows.map(row => row[x]);
        const right = currentRow.slice(x + 1).find(isNotEmpty);
        const left = reversed(currentRow.slice(0, x)).find(isNotEmpty);
        const top = reversed(currentColumn.slice(0, y)).find(isNotEmpty);
        const bottom = currentColumn.slice(y + 1).find(isNotEmpty);
        const upRight = findDiagonal({ x, y }, { x: 1, y: -1 });
        const upLeft = findDiagonal({ x, y }, { x: -1, y: -1 });
        const downRight = findDiagonal({ x, y }, { x: 1, y: 1 });
        const downLeft = findDiagonal({ x, y }, { x: -1, y: 1 });

        // could've inlined it, but the names are helpful
        return [
            right, left, top, bottom,
            upRight, upLeft, downRight, downLeft
        ].filter(value => Boolean(value));
    };

    const getOccupiedCount = (seatRows: SeatRows, { x, y }: IPoint) => {
        const seatsAround = getAllSeatsAround(seatRows, { x, y });
        return seatsAround.filter(seat => seat === '#').length;
    };

    console.log(runOccupiedCount(0, 5, getOccupiedCount));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
