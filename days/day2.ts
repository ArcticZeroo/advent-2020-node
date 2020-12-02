import { getFilePath, readFileContents } from '../common/reader';

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
        let letters = new Map();
        for (const letter of pass) {
            letters.set(letter, (letters.get(letter) || 0) + 1);
        }
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
