import { getFilePath, readFileContents } from '../common/reader';

const fileContents = readFileContents(getFilePath({ day: 1 }));
const data = fileContents.split('\n').map(Number);

function part1() {
    const a = data.find(n => data.includes(2020 - n));
    const b = 2020 - a;
    console.log(a * b);
}

function part2() {
    for (let i = 0; i < data.length - 2; ++i) {
        for (let j = i + 1; j < data.length - 1; ++j) {
            for (let k = j + 1; k < data.length; ++k) {
                if ((data[i] + data[j] + data[k]) === 2020) {
                    console.log(data[i] * data[j] * data[k]);
                }
            }
        }
    }
}

part1();
part2();
