import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import { isBetween, isTruthy, lines, minMax } from '../../common/utils';

config();

const year = 2020;
const day = 17;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

interface IPoint3D extends IPoint {
    z: number;
}

class ThreeDimensionalGrid {

}

const part1 = async () => {
    // y x z
    let grid = new Map<string, string>();
    const initialStateData = lines(input);
    const serializePoint3D = ({ x, y, z }: IPoint3D) => `${x},${y},${z}`;
    const deserializePoint3D = (value: string): IPoint3D => {
        const [x, y, z] = value.split(',').map(Number);
        return { x, y, z };
    };
    const getCoordinatesAround = (point: IPoint3D) => {
        const serializedPoint = serializePoint3D(point);
        const points: IPoint3D[] = [];

        for (let z = point.z - 1; z <= point.z + 1; z++) {
            for (let y = point.y - 1; y <= point.y + 1; y++) {
                for (let x = point.x - 1; x <= point.x + 1; x++) {
                    const currentPointAround = { x, y, z };
                    if (serializePoint3D(currentPointAround) === serializedPoint) {
                        continue;
                    }
                    points.push(currentPointAround);
                }
            }
        }

        return points;
    };

    const Activity = {
        active:   '#',
        inactive: '.'
    };

    for (let y = 0; y < initialStateData.length; y++) {
        for (let x = 0; x < initialStateData[y].length; x++) {
            const value = initialStateData[y][x];
            if (value === Activity.active) {
                grid.set(serializePoint3D({ x, y, z: 0 }), value);
            }
        }
    }

    const printGrid = () => {
        const points = [...grid.keys()].map(deserializePoint3D);
        const [minX, maxX] = minMax(points.map(point => point.x));
        const [minY, maxY] = minMax(points.map(point => point.y));
        const [minZ, maxZ] = minMax(points.map(point => point.z));

        for (let z = minZ; z <= maxZ; z++) {
            const output = [
                `z=${z}`
            ];
            for (let y = minY; y <= maxY; y++) {
                let lineOutput = '';
                for (let x = minX; x <= maxX; x++) {
                    const point = { x, y, z };
                    lineOutput += grid.get(serializePoint3D(point)) === Activity.active ? '#' : '.';
                }
                output.push(lineOutput);
            }
            output.push('');
            console.log(output.join('\n'));
        }
    };

    for (let cycle = 0; cycle < 6; cycle++) {
        const newGrid = new Map(grid);

        const seenPoints = new Set<string>();

        const stack: string[] = [...grid.keys()];

        while (stack.length) {
            const [serializedPoint] = stack.splice(-1, 1);

            if (seenPoints.has(serializedPoint)) {
                continue;
            }

            seenPoints.add(serializedPoint);
            const point = deserializePoint3D(serializedPoint);
            const coordsAround = getCoordinatesAround(point);
            const occupiedValuesCount = coordsAround.map(serializePoint3D).map(value => grid.get(value)).filter(isTruthy).length;

            if (grid.has(serializedPoint)) {
                if (!isBetween(occupiedValuesCount, 2, 3)) {
                    newGrid.delete(serializedPoint);
                }
            } else {
                if (occupiedValuesCount === 3) {
                    newGrid.set(serializedPoint, Activity.active);
                }
            }

            if (grid.has(serializedPoint)) {
                stack.push(...coordsAround.map(serializePoint3D));
            }
        }

        grid = newGrid;
    }

    console.log([...grid.values()].filter(value => value === Activity.active).length);
};

const part2 = async () => {
    interface IPoint4D extends IPoint3D {
        w: number;
    }

    // y x z
    let grid = new Map<string, string>();
    const initialStateData = lines(input);
    const serializePoint4D = ({ x, y, z, w }: IPoint4D) => `${x},${y},${z},${w}`;
    const deserializePoint4D = (value: string): IPoint4D => {
        const [x, y, z, w] = value.split(',').map(Number);
        return { x, y, z, w };
    };
    const getCoordinatesAround = (point: IPoint4D) => {
        const serializedPoint = serializePoint4D(point);
        const points: IPoint4D[] = [];

        for (let w = point.w - 1; w <= point.w + 1; w++) {
            for (let z = point.z - 1; z <= point.z + 1; z++) {
                for (let y = point.y - 1; y <= point.y + 1; y++) {
                    for (let x = point.x - 1; x <= point.x + 1; x++) {
                        const currentPointAround = { x, y, z, w };
                        if (serializePoint4D(currentPointAround) === serializedPoint) {
                            continue;
                        }
                        points.push(currentPointAround);
                    }
                }
            }
        }

        return points;
    };

    const Activity = {
        active:   '#',
        inactive: '.'
    };

    for (let y = 0; y < initialStateData.length; y++) {
        for (let x = 0; x < initialStateData[y].length; x++) {
            const value = initialStateData[y][x];
            if (value === Activity.active) {
                grid.set(serializePoint4D({ x, y, z: 0, w: 0 }), value);
            }
        }
    }

    const printGrid = () => {
        const points = [...grid.keys()].map(deserializePoint4D);
        const [minX, maxX] = minMax(points.map(point => point.x));
        const [minY, maxY] = minMax(points.map(point => point.y));
        const [minZ, maxZ] = minMax(points.map(point => point.z));
        const [minW, maxW] = minMax(points.map(point => point.w));

        for (let w = minW; w <= maxW; w++) {
            for (let z = minZ; z <= maxZ; z++) {
                const output = [
                    `z=${z}`
                ];
                for (let y = minY; y <= maxY; y++) {
                    let lineOutput = '';
                    for (let x = minX; x <= maxX; x++) {
                        const point = { x, y, z, w };
                        lineOutput += grid.get(serializePoint4D(point)) === Activity.active ? '#' : '.';
                    }
                    output.push(lineOutput);
                }
                output.push('');
                console.log(output.join('\n'));
            }
        }
    };

    for (let cycle = 0; cycle < 6; cycle++) {
        const newGrid = new Map(grid);

        const seenPoints = new Set<string>();

        const stack: string[] = [...grid.keys()];

        while (stack.length) {
            const [serializedPoint] = stack.splice(-1, 1);

            if (seenPoints.has(serializedPoint)) {
                continue;
            }

            seenPoints.add(serializedPoint);
            const point = deserializePoint4D(serializedPoint);
            const coordsAround = getCoordinatesAround(point);
            const occupiedValuesCount = coordsAround.map(serializePoint4D).map(value => grid.get(value)).filter(isTruthy).length;

            if (grid.has(serializedPoint)) {
                if (!isBetween(occupiedValuesCount, 2, 3)) {
                    newGrid.delete(serializedPoint);
                }
            } else {
                if (occupiedValuesCount === 3) {
                    newGrid.set(serializedPoint, Activity.active);
                }
            }

            if (grid.has(serializedPoint)) {
                stack.push(...coordsAround.map(serializePoint4D));
            }
        }

        grid = newGrid;
    }

    console.log([...grid.values()].filter(value => value === Activity.active).length);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
