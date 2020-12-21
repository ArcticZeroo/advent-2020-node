import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { all } from 'parsimmon';
import * as path from 'path';
import * as advent from 'advent-api';
import { Counter } from '../../common/counter';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { last, lines, setDifference, setIntersection } from '../../common/utils';

config();

const year = 2020;
const day = 21;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({ year, day, part, answer }, { cookie: process.env.ADVENT_COOKIE });
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

const foodRegex = /(.+?)\s+\(contains\s+(.+?)\)/;

interface IFood {
    ingredients: string[];
    allergens: string[];
}

const foods: IFood[] = lines(input).map(line => {
    const [, ingredientsRaw, allergensRaw] = line.match(foodRegex);
    return {
        ingredients: ingredientsRaw.split(/\s+/g),
        allergens:   allergensRaw.split(/,\s*/g),
    };
});

const foodsByAllergen = foods.reduce((result, food) => {
    for (const allergen of food.allergens) {
        if (!result.has(allergen)) {
            result.set(allergen, []);
        }
        const foodList = result.get(allergen);
        foodList.push(food);
    }
    return result;
}, new Map<string, IFood[]>());

const part1 = async () => {
    const allIngredients = foods.flatMap(food => food.ingredients);
    let cannotContainAnyAllergen = new Set(allIngredients);

    for (const allergen of foodsByAllergen.keys()) {
        const ingredientSets = foodsByAllergen.get(allergen).map(food => new Set(food.ingredients));
        let commonIngredients = ingredientSets[0];
        for (let i = 1; i < ingredientSets.length; i++) {
            commonIngredients = setIntersection(commonIngredients, ingredientSets[i]);
        }
        cannotContainAnyAllergen = setDifference(cannotContainAnyAllergen, commonIngredients);
    }

    const ingredientCount = new Counter(allIngredients);
    console.log([...cannotContainAnyAllergen].map(ingredient => ingredientCount.get(ingredient)).reduce(...reducers.add()));
};

const part2 = async () => {
    const allAllergens = [...foodsByAllergen.keys()];

    const ingredientsByAllergen = new Map<string, string>();

    while (ingredientsByAllergen.size < allAllergens.length) {
        for (const allergen of allAllergens) {
            if (ingredientsByAllergen.has(allergen)) {
                continue;
            }

            const ingredientSets = foodsByAllergen.get(allergen).map(food => new Set(food.ingredients));

            // Common ingredients cannot contain allergens which have already been resolved
            let commonIngredients = setDifference(ingredientSets[0], new Set(ingredientsByAllergen.values()));

            for (let i = 1; i < ingredientSets.length; i++) {
                commonIngredients = setIntersection(commonIngredients, ingredientSets[i]);
            }

            if (commonIngredients.size === 1) {
                const ingredient = last(commonIngredients);
                ingredientsByAllergen.set(allergen, ingredient);
            }
        }
    }

    const sortedList = [...ingredientsByAllergen.entries()].sort(([a], [b]) => {
       return a < b ? -1 : 1;
    }).map(([, ingredient]) => ingredient).join(',');
    console.log(sortedList);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
