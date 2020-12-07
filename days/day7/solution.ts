import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines } from '../../common/utils';

config();

const year = 2020;
const day = 7;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const parentBagRegex = /(.+) bags/;
const childBagRegex = /(\d+) (.+?) bag/;
const parentSymbol = Symbol.for('parent');

const formulas = lines(input)
    .reduce((formulas, line) => {
        const [parent, childrenRaw] = line.split('contain');
        const parentColor = parent.trim().split('bags')[0].trim();
        formulas[parentColor] = {};
        if (childrenRaw.includes('no other bags')) {
            return formulas;
        }
        childrenRaw.split(',').map(child => {
            const [, countRaw, color] = child.match(childBagRegex);
            formulas[parentColor][color] = Number(countRaw);
        });
        return formulas;
    }, {});

const hasShinyGold = (formulas: Record<string, Record<string, number>>, current: Record<string, number>) => {
    if (current.hasOwnProperty('shiny gold')) {
        return true;
    }

    return Object.keys(current).some(color => hasShinyGold(formulas, formulas[color]));
};

const part1 = async () => {
    console.log(Object.keys(formulas).filter(color => hasShinyGold(formulas, formulas[color])).length);
};

const bagCount = (formulas: Record<string, Record<string, number>>, current: Record<string, number>) => {
    console.log(current);
    return Object.keys(current).map(color => {
        console.log('checking', color, current[color]);
        return current[color] * bagCount(formulas, formulas[color]);
    }).reduce(...reducers.add(1));
};

const part2 = async () => {
    console.log(bagCount(formulas, formulas['shiny gold']));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
