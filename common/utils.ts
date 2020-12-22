import { IPoint } from './models';
import * as reducers from './reducers';

export function removeWhitespace(s: string) {
    return s.replace(/\s/g, '');
}

export function chars(s: string) {
    return s.split('');
}

export function uniqueCount<T>(items: T[]) {
    return uniqueItems(items).size;
}

export function uniqueItems<T>(items: T[]) {
    return new Set(items);
}

export function uniqueChars(input: string) {
    return uniqueItems(chars(input));
}

export function paragraphs(input: string) {
    return input.trim().split(/\r?\n\r?\n/);
}

export function lines(input: string) {
    return input.trim().split(/\r?\n/);
}

export function setUnion<T, U>(a: Set<T>, b: Set<U>) {
    return new Set([...a, ...b]);
}

export function setDifference<T>(a: Set<T>, b: Set<T>) {
    return new Set([...a].filter(item => !b.has(item)));
}

export function setIntersection<T>(a: Set<T>, b: Set<T>) {
    return new Set([...a].filter(item => b.has(item)));
}

export function isBetween(input: string | number, a: number, b: number) {
    const num = Number(input);
    if (Number.isNaN(num)) {
        return false;
    }
    return num >= a && num <= b;
}

export function sorted(input: number[], { isAscending = true } = {}) {
    const copy = [...input];
    copy.sort((a, b) => isAscending ? a - b : b - a);
    return copy;
}

export function minMax(input: number[]) {
    if (input.length < 1) {
        return [];
    }
    const sortedInput = sorted(input);
    return [sortedInput[0], sortedInput[sortedInput.length - 1]] as const;
}

export function last<T>(input: Iterable<T>): T {
    if (Array.isArray(input)) {
        return input[input.length - 1];
    }
    let last;
    for (const item of input) {
        last = item;
    }
    return last;
}

export function first<T>(input: Iterable<T>) {
    if (Array.isArray(input)) {
        return input[0];
    }
    // noinspection LoopStatementThatDoesntLoopJS
    for (const item of input) {
        return item;
    }
}

export function reversed(input: string): string;
export function reversed<T>(input: T[]): T[];
export function reversed<T>(input: string | T[]) {
    if (typeof input === 'string') {
        return reversed(chars(input)).join('');
    }

    if (Array.isArray(input)) {
        const items = [];
        for (let i = input.length - 1; i >= 0; i--) {
            items.push(input[i]);
        }
        return items;
    }
}

export function gcd(a: number, b: number) {
    while (a !== 0) {
        const tempA = a;
        a = b % a;
        b = tempA;
    }
    return b;
}

export function lcm(a: number, b: number) {
    return (a / gcd(a, b)) * b;
}

export function modularInverse(value: number, modulo: number) {
    if (modulo === 1) {
        return 0;
    }

    const originalMod = modulo;
    let y = 0;
    let x = 1;

    while (value > 1) {
        const quotient = Math.floor(value / modulo);
        let temp = modulo;

        // mini euclid
        modulo = value % modulo;
        value = temp;
        temp = y;

        y = x - quotient * y;
        x = temp;
    }

    if (x < 0) {
        x += originalMod;
    }

    return x;
}

export function chineseRemainder(input: number[], remainders: number[]) {
    const totalProduct = input.reduce(...reducers.multiply());
    const eachDivided = input.map(value => totalProduct / value);
    const inverses = input.map((value, i) => modularInverse(eachDivided[i], value));
    return input.map((_, i) => remainders[i] * eachDivided[i] * inverses[i]).reduce(...reducers.add()) % totalProduct;
}

export function isTruthy(value: unknown) {
    return Boolean(value);
}

export function column<T>(rows: Array<Array<T>>, columnIndex: number) {
    return rows.map(row => row[columnIndex]);
}

export type KeysMatching<T, V> = { [K in keyof T]-?: V; }

export function keysOf<T extends KeysMatching<T, string>>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

export const PointMath = {
    add(a: IPoint, b: IPoint) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    sub(a: IPoint, b: IPoint) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
};

const combinationsGenerator = function* <T>(items: T[], count: number, currentIndex: number = 0, currentItems: T[] = []) {
    for (let i = currentIndex; i < items.length - (count - 1); i++) {
        currentItems.push(items[i]);
        if (count === 1) {
            yield currentItems;
        } else {
            yield* combinationsGenerator(items, count - 1, i + 1, currentItems);
        }
        currentItems.pop();
    }
};

export function combinations<T>(items: T[], count: number): T[] {
    return combinationsGenerator(items, count);
}