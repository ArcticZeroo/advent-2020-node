import { Counter } from '../common/counter';
import { getFilePath, readFileContents } from '../common/reader';
import { counter } from '../common/reducers';

const fileContents = readFileContents(getFilePath({ day: 2 }));
const data = fileContents.split('\n');

const matchingRegex = /(\d+)-(\d+) (\w): (\w+)/

function part1() {
    let total = 0;
    for (const item of data) {
        if (!matchingRegex.test(item)) {
            continue;
        }

        const [, minCountRaw, maxCountRaw, letter, pass] = item.match(matchingRegex);
        const minCount = Number(minCountRaw);
        const maxCount = Number(maxCountRaw);

        const letters = new Counter(pass);
        const letterCount = letters.get(letter);
        if (letterCount >= minCount && letterCount <= maxCount) {
            total++;
        }
    }
    console.log(total);
}

function part2() {
    let total = 0;
    for (const item of data) {
        if (!matchingRegex.test(item)) {
            continue;
        }

        const [, firstIndexRaw, secondIndexRaw, letter, pass] = item.match(matchingRegex);
        const firstIndex = Number(firstIndexRaw);
        const secondIndex = Number(secondIndexRaw);

        const firstHas = pass[firstIndex - 1] === letter;
        const secondHas = pass[secondIndex - 1] === letter;
        if ((firstHas || secondHas) && firstHas !== secondHas) {
            total++;
        }
    }
    console.log(total);
}

part1();
part2();
