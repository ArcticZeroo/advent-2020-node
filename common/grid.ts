import { IPoint } from './models';

export class InfiniteGrid<T = any> {
    private readonly _points = new Map<number, Map<number, T>>();
    private _minValues: IPoint = { x: 0, y: 0 };
    private _maxValues: IPoint = { x: 0, y: 0 };
    private _allXValues = new Set<number>();
    private _size: number = 0;

    get size() {
        return this._size;
    }

    get isEmpty() {
        return this.size === 0;
    }

    get minValues() {
        return { ...this._minValues };
    }

    get maxValues() {
        return { ...this._maxValues };
    }

    get corners(): IPoint[] {
        const minValues = this.minValues;
        const maxValues = this.maxValues;
        return [
            { x: minValues.x, y: minValues.y },
            { x: minValues.x, y: maxValues.y },
            { x: maxValues.x, y: minValues.y },
            { x: maxValues.x, y: maxValues.y },
        ];
    }

    * values() {
        for (const row of this._points.values()) {
            for (const value of row.values()) {
                yield value;
            }
        }
    }

    * keys() {
        for (const row of this._points.values()) {
            for (const key of row.keys()) {
                yield key;
            }
        }
    }

    neighbors(point: IPoint, allowDiagonal: boolean = true) {
        const neighbors = [
            { ...point, x: point.x - 1 },
            { ...point, x: point.x + 1 },
            { ...point, y: point.y - 1 },
            { ...point, y: point.y + 1 },
        ];

        if (allowDiagonal) {
            neighbors.push(
                { x: point.x - 1, y: point.y - 1 },
                { x: point.x + 1, y: point.y - 1 },
                { x: point.x - 1, y: point.y + 1 },
                { x: point.x + 1, y: point.y - 1 },
            );
        }

        return neighbors;
    }

    * row(y: number) {
        const row = this._points.get(y);
        if (row) {
            for (const [x, value] of row.entries()) {
                yield [{ x, y }, value] as const;
            }
        }
    }

    * column(x: number) {
        for (const y of this.allY) {
            const row = this._points.get(y);
            if (row.has(x)) {
                yield row.get(x);
            }
        }
    }

    private _ensureRowExists(row: number) {
        if (!this._points.has(row)) {
            this._points.set(row, new Map<number, T>());
        }
    }

    private _updateBounds(point: IPoint) {
        if (point.x < this._minValues.x) {
            this._minValues.x = point.x;
        }

        if (point.x > this._maxValues.x) {
            this._maxValues.x = point.x;
        }

        if (point.y < this._minValues.y) {
            this._minValues.y = point.y;
        }

        if (point.y > this._maxValues.y) {
            this._maxValues.y = point.y;
        }
    }

    set(point: IPoint, value: T) {
        this._ensureRowExists(point.y);
        this._updateBounds(point);
        const row = this._points.get(point.y);
        if (!row.has(point.x)) {
            this._size++;
        }
        row.set(point.x, value);
        this._allXValues.add(point.x);
    }

    get(point: IPoint) {
        return this._points.get(point.y)?.get(point.x);
    }

    has(point: IPoint) {
        return this._points.has(point.y) && this._points.get(point.y).has(point.x);
    }

    find(predicate: (value: T) => boolean): IPoint | undefined {
        for (const [y, row] of this._points.entries()) {
            for (const [x, value] of row.entries()) {
                if (predicate(value)) {
                    return { x, y };
                }
            }
        }
    }

    get allY() {
        return Array.from(this._points.keys()).sort();
    }

    get allX() {
        return Array.from(this._allXValues).sort();
    }
}