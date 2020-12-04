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

const fields = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid', 'cid'] as const;

type Passport = Record<string, string>;

const isValid = (passport: Passport) => {
    for (const field of fields) {
        if (field === 'cid') {
            continue;
        }

        if (!passport.hasOwnProperty(field)) {
            return false;
        }

        const value = passport[field];
        const valAsNum = Number(value);

        switch (field) {
            case 'byr':
                if (valAsNum < 1920 || valAsNum > 2002) {
                    return false;
                }
                break;
            case 'iyr':
                if (valAsNum < 2010 || valAsNum > 2020) {
                    return false;
                }
                break;
            case 'eyr':
                if (valAsNum < 2020 || valAsNum > 2030) {
                    return false;
                }
                break;
            case 'hgt': {
                const pattern = /^(\d+)(in|cm)$/;

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
                if (!/^[#][0-9a-f]{6}$/.test(value)) {
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
                break;
            }
        }
    }

    return true;
};

const createPassports = (onPassportCreated: (passport: Record<string, string>) => void) => {
    let currentPassport = {};
    for (const line of input) {
        if (!line.trim()) {
            onPassportCreated({...currentPassport});
            currentPassport = {};
            continue;
        }
        const pieces = line.split(/\s+/g);
        for (const field of pieces) {
            const [key, value] = field.split(':');
            currentPassport[key] = value;
        }
    }
};

const part1 = async () => {
    let total = 0;
    createPassports((passport) => {
        if (fields.every(field => field === 'cid' || passport.hasOwnProperty(field))) {
            total++;
        }
    });
    console.log(total);
};

const part2 = async () => {
    let total = 0;
    createPassports((passport) => {
       if (isValid(passport)) {
           total++;
       }
    });
    console.log(total);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
