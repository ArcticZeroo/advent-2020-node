export class Counter<T> extends Map<T, number> {
    private readonly _defaultValue: number;

    constructor(iterableOrDefaultValue: Iterable<T> | number = 0) {
        super();
        if (typeof iterableOrDefaultValue === 'number') {
            this._defaultValue = iterableOrDefaultValue;
        } else if (iterableOrDefaultValue != null) {
            for (const value of iterableOrDefaultValue) {
                this.increment(value);
            }
        }
    }

    private _ensureKeyExists(key: T) {
        if (!this.has(key)) {
            this.set(key, this._defaultValue);
        }
    }
    get(key: T) {
        this._ensureKeyExists(key);
        return super.get(key);
    }

    increment(key: T, incrementBy = 1) {
        this._ensureKeyExists(key);
        super.set(key, super.get(key) + incrementBy);
    }
}