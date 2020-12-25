import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { LinkedList } from '../../common/data-structures';
import { InfiniteGrid } from '../../common/grid';
import { IPoint } from '../../common/models';
import * as reducers from '../../common/reducers';
import { lines, PointMath } from '../../common/utils';

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

interface IPoint3D extends IPoint {
    z: number;
}

const WHITE = false;
const BLACK = true;

const DirectionCoordinateOffsets: Record<string, IPoint3D> = {
    ne: { x: 1, y: 0, z: -1 },
    e:  { x: 1, y: -1, z: 0 },
    se: { x: 0, y: -1, z: 1 },
    sw: { x: -1, y: 0, z: 1 },
    w:  { x: -1, y: 1, z: 0 },
    nw: { x: 0, y: 1, z: -1 },
};

const moveInDirection = ({ x, y, z }: IPoint3D, direction: string): IPoint3D => {
    direction = direction.toLowerCase();
    if (!DirectionCoordinateOffsets.hasOwnProperty(direction)) {
        throw new Error(`Direction ${direction} does not exist`);
    }
    const { x: oX, y: oY, z: oZ } = DirectionCoordinateOffsets[direction];
    return { x: x + oX, y: y + oY, z: z + oZ };
};

const directionRegex = /(e|se|sw|w|nw|ne)/g;

const serializePoint = (point: IPoint3D) => `${point.x},${point.y},${point.z}`;

class HexagonGrid {
    private readonly _grid = new InfiniteGrid<Map<number, boolean>>();

    * values() {
        for (const row of this._grid.values()) {
            yield* row.values();
        }
    }

    * keys() {
        for (const { x, y } of this._grid.keys()) {
            for (const z of this._grid.get({ x, y }).keys()) {
                yield { x, y, z };
            }
        }
    }

    neighbors(point: IPoint3D) {
        return Object.keys(DirectionCoordinateOffsets).map(dir => moveInDirection(point, dir));
    }

    get(point: IPoint3D) {
        const row = this._grid.get(point);
        return row?.get(point.z);
    }

    set(point: IPoint3D, value: boolean) {
        if (!this._grid.has(point)) {
            this._grid.set(point, new Map());
        }
        this._grid.get(point).set(point.z, value);
    }

    delete(point: IPoint3D) {
        if (!this._grid.has(point)) {
            return;
        }
        this._grid.get(point).delete(point.z);
    }

    isBlack(point: IPoint3D) {
        return Boolean(this.get(point));
    }

    toggle(point: IPoint3D) {
        // const isCurrentlyBlack = this.isBlack(point);
        //
        // if (isCurrentlyBlack) {
        //     console.log('deleting', point, 'as it is becoming white');
        //     this.delete(point);
        // }

        this.set(point, !this.isBlack(point));
    }
}

const directionLines = lines(input).map(line => line.match(directionRegex));

const part1 = async () => {
    const grid = new HexagonGrid();
    for (const directions of directionLines) {
        let referencePoint: IPoint3D = { x: 0, y: 0, z: 0 };
        for (const direction of directions) {
            referencePoint = moveInDirection(referencePoint, direction);
        }
        grid.toggle(referencePoint);
    }
    console.log([...grid.values()].filter(value => value === BLACK).length);
};

const part2 = async () => {
    const grid = new HexagonGrid();

    const getTotalBlackTileCountInGrid = () => [...grid.values()].filter(value => value === BLACK).length;

    const determineFlips = function* () {
        const seen = new Set<string>();
        const stack = new LinkedList<IPoint3D>();

        for (const point of grid.keys()) {
            stack.insertEnd(point);
            stack.insertEnd(...grid.neighbors(point));
        }

        while (stack.size) {
            const point = stack.popStart();

            const serializedPoint = serializePoint(point);
            if (seen.has(serializedPoint)) {
                continue;
            }
            seen.add(serializedPoint);

            let blackTileCount = 0;
            for (const neighbor of grid.neighbors(point)) {
                if (grid.get(neighbor) === BLACK) {
                    blackTileCount++;
                }
            }

            const currentState = grid.get(point);
            if (currentState === BLACK) {
                if (blackTileCount === 0 || blackTileCount > 2) {
                    yield point;
                }
            } else if (blackTileCount === 2) {
                yield point;
            }
        }
    };

    for (const directions of directionLines) {
        let referencePoint: IPoint3D = { x: 0, y: 0, z: 0 };
        for (const direction of directions) {
            referencePoint = moveInDirection(referencePoint, direction);
        }
        grid.toggle(referencePoint);
    }

    for (let day = 0; day < 100; day++) {
        const flips = [...determineFlips()];
        for (const flip of flips) {
            grid.toggle(flip);
        }
        // console.log(`Day ${day + 1}:`, getTotalBlackTileCountInGrid());
    }

    console.log(getTotalBlackTileCountInGrid());
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
