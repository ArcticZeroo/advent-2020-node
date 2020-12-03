export const add = (initialValue: number = 0) => {
    return [(a, b) => a + b, initialValue] as const;
}

export const multiply = (initialValue: number = 1) => {
    return [(a, b) => a * b, initialValue] as const;
}

export const counter = (initialValue = {}) => {
    return [(a, b) => (a[b] ? a[b]++ : a[b] = 1) && a, initialValue] as const;
}
