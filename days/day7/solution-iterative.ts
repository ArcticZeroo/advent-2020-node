import { readFileSync } from 'fs';
import path from 'path';
import { LinkedList } from '../../common/data-structures';
import { lines } from '../../common/utils';

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const childBagRegex = /(\d+) (.+?) bag/;

type Formula = Record<string, number>;
type FormulasRecord = Record<string, Formula>;

const formulas = lines(input)
    .reduce((formulas: FormulasRecord, line) => {
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

const colors = Object.keys(formulas);

const childColors = (formula: Formula) => Object.keys(formula);

const shinyGoldColorName = 'shiny gold';

const part1 = () => {
    let foundCount = 0;
    for (const topLevelColor of colors) {
        // A shiny gold bag cannot contain itself
        if (topLevelColor === shinyGoldColorName) {
            continue;
        }

        const seenColors = new Set<string>();
        const stack = new LinkedList<string>([topLevelColor]);
        while (!stack.isEmpty) {
            const nextColor = stack.popEnd();

            if (nextColor === shinyGoldColorName) {
                foundCount++;
                break;
            }

            if (seenColors.has(nextColor)) {
                continue;
            }
            seenColors.add(nextColor);

            const formula = formulas[nextColor];
            stack.insertEnd(...childColors(formula));
        }
    }
    console.log(foundCount);
};

const part2 = () => {
    let totalBagCount = 0;

    const shinyGoldFormula = formulas[shinyGoldColorName];

    const parentCounts = new Map<string, number[]>();
    for (const childColor of childColors(shinyGoldFormula)) {
        parentCounts.set(childColor, []);
    }

    const stack = new LinkedList<string>(childColors(shinyGoldFormula));
    while (!stack.isEmpty) {
        const parent = stack.popEnd();
        const children = childColors(formulas[parent]);
        const formula = formulas[parent];
        stack.insertEnd(...childColors(formula));
    }
    console.log(totalBagCount);
}

part1();