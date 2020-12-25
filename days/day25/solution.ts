import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';


const handshakeResults = function* (subjectNumber: number = initialSubjectNumber) {
    let value = 1;
    const divideBy = 20201227;
    while (true) {
        value *= subjectNumber;
        value = value % divideBy;
        yield value;
    }
};

const handshakeResult = function(loopSize: number, subjectNumber: number = initialSubjectNumber) {
    const resultsIterator = handshakeResults(subjectNumber);
    let result;
    for (let i = 0; i < loopSize; i++) {
        result = resultsIterator.next();
    }
    return result?.value;
}

const findPrivateKey = (publicKey: number) => {
    let loopSize = 0;
    for (const value of handshakeResults()) {
        loopSize++;
        if (value === publicKey) {
            return loopSize;
        }
    }
}

const cardPublicKey = 11562782;
const doorPublicKey = 18108497;
const initialSubjectNumber = 7;

const cardPrivateKey = findPrivateKey(cardPublicKey);
const doorPrivateKey = findPrivateKey(doorPublicKey);

const encryptionKey = handshakeResult(cardPrivateKey, doorPublicKey);

const part1 = async () => {
    console.log(encryptionKey);
};

const part2 = async () => {

};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
