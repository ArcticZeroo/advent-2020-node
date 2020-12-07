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