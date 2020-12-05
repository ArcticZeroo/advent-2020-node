export const add = (initialValue: number = 0) => {
    return [(a, b) => a + b, initialValue] as const;
}

export const multiply = (initialValue: number = 1) => {
    return [(a, b) => a * b, initialValue] as const;
}

export const counter = (initialValue = {}) => {
    return [(a, b) => (a[b] ? a[b]++ : a[b] = 1) && a, initialValue] as const;
}

export const max = () => {
    return [(a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY] as const;
}

export const min = () => {
    return [(a, b) => Math.min(a, b), Number.POSITIVE_INFINITY] as const;
}