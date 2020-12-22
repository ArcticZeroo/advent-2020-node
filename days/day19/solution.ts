import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { LinkedList } from '../../common/data-structures';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines, paragraphs } from '../../common/utils';

config();

const year = 2020;
const day = 19;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const [ruleDataRaw, messages] = paragraphs(input).map(lines);

type RuleRequirement = string | Array<Array<number>>;
type RuleRecord = Record<number, RuleRequirement>;

const rules: RuleRecord = ruleDataRaw.map(line => {
    const [ruleIdRaw, requirementsRaw] = line.split(':').map(value => value.trim());
    const ruleId = Number(ruleIdRaw);

    let requirements: string | Array<Array<number>>;
    if (requirementsRaw.includes('"')) {
        requirements = requirementsRaw.replace(/"/g, '');
    } else {
        const requirementPieces = requirementsRaw.split('|');
        requirements = requirementPieces.map(piece => piece.trim().split(/\s+/g).map(Number));
    }
    return [ruleId, requirements] as const;
}).reduce((rules, [id, requirements]) => {
    rules[id] = requirements;
    return rules;
}, {});

const createGeneratorValidator = (sourceRules: RuleRecord) => {
    // Attempts to match a rule by ID, and returns the remaining string to match
    const matchRule = function* (ruleId: number, value: string) {
        const requirement = sourceRules[ruleId];

        if (Array.isArray(requirement)) {
            for (const alternative of matchRequirementAlternatives(requirement, value)) {
                yield alternative;
            }
        } else {
            if (value[0] === requirement) {
                yield value.slice(1);
            }
        }
    };

    const matchRequirementList: (requiredIds: number[], value: string) => Generator<string> = function* (requiredIds: number[], value: string) {
        if (requiredIds.length === 0) {
            yield value;
        }

        // If the value is already empty, do not continue yielding possible values, or else we'll be here forever.
        if (value === '') {
            return;
        }

        const [currentId, ...remainingIds] = requiredIds;
        for (const currentValue of matchRule(currentId, value)) {
            for (const remainingValue of matchRequirementList(remainingIds, currentValue)) {
                yield remainingValue;
            }
        }
    };

    const matchRequirementAlternatives = function* (alternatives: Array<Array<number>>, value: string) {
        for (const alternative of alternatives) {
            for (const alternativeValue of matchRequirementList(alternative, value)) {
                yield alternativeValue;
            }
        }
    };

    const isValid = (value: string) => {
        for (const remainingMatch of matchRule(0, value)) {
            if (remainingMatch.length === 0) {
                return true;
            }
        }
        return false;
    };

    return isValid;
};

const part1 = async () => {
    const isValidGenerator = createGeneratorValidator(rules);
    console.log(messages.filter(isValidGenerator).length);
};
const part2 = async () => {
    const loopingRules = {
        ...rules,
        8:  [[42], [42, 8]],
        11: [[42, 31], [42, 11, 31]]
    };

    const isValid = createGeneratorValidator(loopingRules);

    console.log(messages.filter(isValid).length);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
