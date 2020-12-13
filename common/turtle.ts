import { IPoint } from './models';

export const Directions = {
    north: 0,
    east:  1,
    south: 2,
    west:  3,
    count: 4
} as const;

export type Direction = typeof Directions[keyof typeof Directions];

class Turtle {
    private readonly _position: IPoint = { x: 0, y: 0 };
    private _direction: Direction;

    constructor(initialDirection: Direction = Directions.north) {
    }
}