import { kMaxLength } from 'buffer';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';

config();

const year = 2020;
const day = 4;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8').split('\n');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const fields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid', 'cid'];

const fourDigits = (value) => /\d{4}/.test(value);

const isValid = (passport) => {
    for (const field of fields) {
        if (field === 'cid') {
            continue;
        }

        if (!passport.hasOwnProperty(field)) {
            return false;
        }

        const value = passport[field];
        const valNum = Number(value);

        switch (field) {
            case 'byr':
                if (!fourDigits(value) || valNum < 1920 || valNum > 2002) {
                    return false;
                }
                break;
            case 'iyr':
                if (!fourDigits(value) || valNum < 2010 || valNum > 2020) {
                    return false;
                }
                break;
            case 'eyr':
                if (!fourDigits(value) || valNum < 2020 || valNum > 2030) {
                    return false;
                }
                break;
            case 'hgt': {

                let pattern = /^(\d+)(in|cm)$/;

                if (!pattern.test(value)) {
                    return false;
                }

                const [, sizeRaw, units] = value.match(pattern);
                const size = Number(sizeRaw);
                if (units === 'cm') {
                    if (size < 150 || size > 193) {
                        return false;
                    }
                } else {
                    if (size < 59 || size > 76) {
                        return false;
                    }
                }
                break;
            }
            case 'hcl': {
                let pattern = /^[#][0-9a-f]{6}$/;
                if (!pattern.test(value)) {
                    return false;
                }
                break;
            }
            case 'ecl': {
                const allowedValues = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'];
                if (!allowedValues.includes(value)) {
                    return false;
                }
                break;
            }
            case 'pid': {
                if (!/^[0-9]{9}$/.test(value)) {
                    return false;
                }
            }
        }
    }

    return true;
};

const part1 = async () => {
    let total = 0;
    let passportFields = {};
    for (const line of input) {
        if (!line.trim()) {
            if (fields.every(field => passportFields.hasOwnProperty(field))) {
                total++;
            }
            passportFields = {};
            continue;
        }
        const pieces = line.split(/\s+/g);
        for (const field of pieces) {
            const [key, value] = field.split(':');
            passportFields[key] = value;
        }
    }
    console.log(total);
};

const part2 = async () => {
    let total = 0;
    let passportFields = {};
    for (const line of input) {
        if (!line.trim()) {
            if (isValid(passportFields)) {
                total++;
            }
            passportFields = {};
            continue;
        }
        const pieces = line.split(/\s+/g);
        for (const field of pieces) {
            const [key, value] = field.split(':');
            passportFields[key] = value;
        }
    }
    console.log(total);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
