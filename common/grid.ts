import { IPoint } from './models';

export class InfiniteGrid<T = any> {
    private readonly _points = new Map<number, Map<number, T>>();
    private _minValues: IPoint = { x: 0, y: 0 };
    private _maxValues: IPoint = { x: 0, y: 0 };
    private _allXValues = new Set<number>();

    get minValues() {
        return { ...this._minValues };
    }

    get maxValues() {
        return { ...this._maxValues };
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
        this._points.get(point.y).set(point.x, value);
        this._allXValues.add(point.x);
    }

    get(point: IPoint) {
        return this._points.get(point.y)?.get(point.x);
    }

    has(point: IPoint) {
        return this._points.has(point.y) && this._points.get(point.y).has(point.x);
    }

    get allY() {
        return Array.from(this._points.keys()).sort();
    }

    get allX() {
        return Array.from(this._allXValues).sort();
    }
}