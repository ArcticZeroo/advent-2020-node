import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines } from '../../common/utils';

config();

const year = 2020;
const day = 18;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const Operator = {
    mul: '*',
    add: '+'
};

const OperatorToOperation = {
    [Operator.mul]: (a: number, b: number) => a * b,
    [Operator.add]: (a: number, b: number) => a + b,
}

enum Token {
    number = 'number',
    operator = 'operator',
    openParen = 'openParen',
    closeParen = 'closeParen'
}

const Rules = {
    [Token.number]:     /-?\d+/,
    [Token.operator]:   new RegExp(`[${Operator.mul}${Operator.add}]`),
    [Token.openParen]:  /[(]/,
    [Token.closeParen]: /[)]/,
};

interface IToken {
    name: string;
    value: string;
}

const tokenize = (equation: string) => {
    let currentIndex = 0;
    const tokens: IToken[] = [];
    for (const name of Object.keys(Rules)) {
        const regex = new RegExp(Rules[name]);
        const execResult = regex.exec(equation.slice(currentIndex));
        if (regex.lastIndex > currentIndex) {
            tokens.push({ name, value: execResult[0] });
        }
    }
};

const solveEquation = (equation: string) => {
    while (equation.includes('(')) {
        const lastOpenParen = equation.lastIndexOf('(');
        const matchingCloseParen = equation.indexOf(')', lastOpenParen);
        const result = solveEquation(equation.slice(lastOpenParen + 1, matchingCloseParen));
        equation = equation.slice(0, lastOpenParen) + result + equation.slice(matchingCloseParen + 1);
    }
    const pieces = equation.split(/\s+/g);
    while (pieces.length > 1) {
        const [a, operator, b] = pieces.slice(0, 3);
        const operation = OperatorToOperation[operator];
        pieces.splice(0, 3, operation(Number(a), Number(b)).toString());
    }
    return Number(pieces[0]);
};

const solveEquation2 = (equation: string) => {
    while (equation.includes('(')) {
        const lastOpenParen = equation.lastIndexOf('(');
        const matchingCloseParen = equation.indexOf(')', lastOpenParen);
        const result = solveEquation2(equation.slice(lastOpenParen + 1, matchingCloseParen));
        equation = equation.slice(0, lastOpenParen) + result + equation.slice(matchingCloseParen + 1);
    }

    while (equation.includes('+')) {
        const pieces = equation.split(/\s+/g);
        const nextPlusSign = pieces.indexOf('+');
        const a = Number(pieces[nextPlusSign - 1]);
        const b = Number(pieces[nextPlusSign + 1]);
        const result = a + b;
        pieces.splice(nextPlusSign - 1, 3, result.toString());
        equation = pieces.join(' ');
    }

    const pieces = equation.split(/\s+/g);
    while (pieces.length > 1) {
        const [a, operator, b] = pieces.slice(0, 3);
        const operation = OperatorToOperation[operator];
        pieces.splice(0, 3, operation(Number(a), Number(b)).toString());
    }
    return Number(pieces[0]);
};

const part1 = async () => {
    console.log(lines(input).map(solveEquation).reduce(...reducers.add()));
};

const part2 = async () => {
    console.log(lines(input).map(solveEquation2).reduce(...reducers.add()));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
