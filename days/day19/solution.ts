import { match } from 'assert';
import { createToken, CstNode, CstParser, Lexer, TokenType } from 'chevrotain';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import Parsimmon from 'parsimmon';
import * as path from 'path';
import * as advent from 'advent-api';
import { LinkedList } from '../../common/data-structures';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import peg from 'pegjs';
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

const createParsimmonValidator = (sourceRules: RuleRecord) => {
    const ruleName = id => {
        if (Number(id) === 0) {
            return 'start';
        }

        return `rule${id}`;
    };

    const productions = {};
    for (const ruleId of Object.keys(sourceRules)) {
        const requirements = sourceRules[ruleId];
        productions[ruleName(ruleId)] = (lang) => {
            const requirementArguments = [];

            if (Array.isArray(requirements)) {
                for (const requirement of requirements) {
                    requirementArguments.push(Parsimmon.seq(requirement.map(requiredId => lang[ruleName(requiredId)])));
                }
            } else {
                requirementArguments.push(Parsimmon.string(requirements));
            }

            return Parsimmon.alt(...requirementArguments);
        };
    }

    const parser = Parsimmon.createLanguage(productions);

    const isValid = (message: string) => {
        return parser[ruleName(0)].parse(message).status;
    };

    return isValid;
};

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
    const matchesRule = (value: string, ruleId: number, nextMatchIndex: number) => {
        const requirements = rules[ruleId];

        if (Array.isArray(requirements)) {
            for (const requirement of requirements) {
                let newMatchIndex = nextMatchIndex;
                let allMatched = true;
                for (const requiredRuleId of requirement) {
                    newMatchIndex = matchesRule(value, requiredRuleId, newMatchIndex);
                    if (!newMatchIndex) {
                        allMatched = false;
                        break;
                    }
                }

                if (allMatched) {
                    return newMatchIndex;
                }
            }
        } else {
            const actualChar = value[nextMatchIndex];
            if (requirements === actualChar) {
                return nextMatchIndex + 1;
            }
        }
    };

    console.log(messages.filter(message => matchesRule(message, 0, 0) === message.length).length);

    const isValidGenerator = createGeneratorValidator(rules);
    console.log(messages.filter(isValidGenerator).length);
};

const part2peg = () => {
    const loopingRules = { ...rules };
    loopingRules[8] = [[42], [42, 8]];
    loopingRules[11] = [[42, 31], [42, 11, 31]];

    const ruleName = id => {
        if (Number(id) === 0) {
            return 'start';
        }

        return `rule${id}`;
    };

    const charCodeOfLetterA = 'a'.charCodeAt(0);
    const numberToChars = (value: number) => {
        let chars = '';
        while (value >= 0) {
            chars = String.fromCharCode(charCodeOfLetterA + (value % 26));
            value -= 26;
        }
        return chars;
    };

    const grammar = Object.keys(loopingRules).map(ruleId => {
        const requirements = loopingRules[ruleId];

        const requirementsAsGrammar = Array.isArray(requirements) ? requirements.map(requirement => requirement.map((requiredId, i) => {
            const ruleNameForId = ruleName(requiredId);
            // return `requirement${i}:${ruleNameForId}`;
            return ruleNameForId;
        }).join(' ')) : [`"${requirements}"`];
        return `${ruleName(ruleId)}\n = ${requirementsAsGrammar.join('\n / ')}`;
    }).join('\n\n');

    console.log(grammar);

    const parser = peg.generate(grammar);
    const isValid = (message: string) => {
        try {
            parser.parse(message);
            return true;
        } catch (e) {
            return false;
        }
    };

    console.log(messages.filter(isValid));
};

const part2 = async () => {
    const loopingRules = { ...rules };
    loopingRules[8] = [[42], [42, 8]];
    loopingRules[11] = [[42, 31], [42, 11, 31]];

    const isValid = createParsimmonValidator(loopingRules);

    console.log(messages.filter(isValid).length);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
