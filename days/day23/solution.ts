import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { ILinkedNode, INode, LinkedList, UnsafeLinkedList } from '../../common/data-structures';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { chars, minMax, sorted, wrap } from '../../common/utils';

const input = '974618352';

const getCups = () => chars(input).map(Number);

const part1 = async () => {
    const cups = getCups();
    let currentCup = cups[0];
    for (let move = 1; move <= 100; move++) {
        // console.log(`-- move ${move} --`);
        // console.log('cups:', cups.map(cup => cup === currentCup ? `(${cup})` : cup).join(' '));
        const pickedUpCups = [];
        for (let i = 0; i < 3; i++) {
            const currentCupIndex = cups.indexOf(currentCup);
            const nextIndex = wrap(currentCupIndex + 1, cups.length)
            // console.log(cups.join(''), currentCupIndex, nextIndex, cups[nextIndex]);
            pickedUpCups.push(...cups.splice(nextIndex, 1));
        }
        // console.log('pick up:', pickedUpCups.join(', '));
        const lowestCup = Math.min(...cups);
        const highestCup = Math.max(...cups);
        let destinationCupValue = currentCup;
        while (true) {
            destinationCupValue--;
            if (destinationCupValue < lowestCup) {
                destinationCupValue = highestCup;
            }
            if (cups.includes(destinationCupValue)) {
                break;
            }
        }
        // console.log('destination:', destinationCupValue);
        const destinationCupIndex = cups.indexOf(destinationCupValue);
        cups.splice(destinationCupIndex + 1, 0, ...pickedUpCups);
        currentCup = cups[wrap(cups.indexOf(currentCup) + 1, cups.length)];
        // console.log('');
    }
    const indexOfOne = cups.indexOf(1);
    const valuesAroundOne = [...cups.slice(indexOfOne + 1), ...cups.slice(0, indexOfOne)];
    console.log(valuesAroundOne.join(''));
};

const part2 = async () => {
    const cupNodes = new Map<number, INode<number>>();
    const cups = new UnsafeLinkedList(getCups());

    for (const node of cups.nodes()) {
        cupNodes.set(node.value, node);
    }

    let highestCup = Math.max(...cups) + 1;
    while (highestCup <= 1_000_000) {
        const [node] = cups.insertEnd(highestCup++);
        cupNodes.set(node.value, node);
    }

    const removeNextCup = (node: ILinkedNode<number>): number => {
        if (!node.next) {
            return cups.popStart();
        }

        return cups.removeAfterNode(node)?.value;
    }

    let currentCupNode = cups.head;
    for (let move = 1; move <= 10_000_000; move++) {
        if (move % 250_000 === 0) {
            console.log(`-- move ${move} --`);
        }
        // console.log(`-- move ${move} --`);
        // console.log('cups:', [...cups].map(cup => cup === currentCupNode.value ? `(${cup})` : cup).join(' '));
        const pickedUpCups: number[] = [];
        for (let i = 0; i < 3; i++) {
            const nextCupValue = removeNextCup(currentCupNode);
            if (!nextCupValue) {
                // console.log([...cups], currentCupNode.value);
                throw new Error('Somehow there was no cup to remove');
            }
            cupNodes.delete(nextCupValue);
            pickedUpCups.push(nextCupValue);
        }
        // console.log('pick up:', pickedUpCups.join(', '));
        let destinationCupValue = currentCupNode.value;
        while (true) {
            destinationCupValue--;
            if (destinationCupValue < 1) {
                destinationCupValue = 1_000_000;
            }
            if (!pickedUpCups.includes(destinationCupValue)) {
                break;
            }
        }
        // console.log('destination:', destinationCupValue);
        let destinationCup = cupNodes.get(destinationCupValue);
        for (const cup of pickedUpCups) {
            destinationCup = cups.insertAfterNode(destinationCup, cup);
            cupNodes.set(cup, destinationCup);
        }
        currentCupNode = currentCupNode.next ?? cups.head;
        // console.log('');
    }
    const oneCup = cupNodes.get(1);
    const cupA = removeNextCup(oneCup)
    const cupB = removeNextCup(oneCup);
    console.log(cupA * cupB);
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
