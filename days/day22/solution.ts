import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { LinkedList } from '../../common/data-structures';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { lines, paragraphs, reversed } from '../../common/utils';

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

type Deck = number[];
type DeckList = ReadonlyArray<Deck>;

const createDecks = () => {
    const decks = paragraphs(input).map(paragraph => lines(paragraph).slice(1).map(Number));
    return [decks, decks.flat()] as const;
};

const getWinner = (decks: DeckList, allCards: number[]) => {
    for (const [i, deck] of decks.entries()) {
        if (deck.length === allCards.length) {
            return [i, deck] as const;
        }
    }
};

const serializeDecks = (decks: DeckList) => decks.map(value => value.join(', ')).join('\n');

const score = (winnerDeck: Deck) => winnerDeck.map((value, i) => value * (winnerDeck.length - i)).reduce(...reducers.add());

const part1 = async () => {
    const [currentDecks, allCards] = createDecks();

    let winner: readonly [number, Deck];
    // while ((winner = getWinner(currentDecks, allCards)) == null) {
    //     const [player1Card] = currentDecks[0].splice(0, 1);
    //     const [player2Card] = currentDecks[1].splice(0, 1);
    //     if (player1Card > player2Card) {
    //         currentDecks[0].push(player1Card, player2Card);
    //     } else {
    //         currentDecks[1].push(player2Card, player1Card);
    //     }
    // }

    while ((winner = getWinner(currentDecks, allCards)) == null) {
        const drawnCards = currentDecks.map(deck => deck.splice(0, 1)[0]);
        const [player1Card, player2Card] = drawnCards;

        const roundWinner = player1Card > player2Card ? 0 : 1;
        const [winnerCard] = drawnCards.splice(roundWinner, 1);
        const loserCard = drawnCards.pop();
        currentDecks[roundWinner].push(winnerCard, loserCard);
    }

    const [, winnerDeck] = winner;

    console.log(score(winnerDeck));
};

const recursiveCombat = (currentDecks: number[][]) => {
    const allCards = currentDecks.flat();

    let winnerId: number;

    const [player1Deck, player2Deck] = currentDecks;
    const allPreviousTurns = new Set<string>();

    while ((winnerId = getWinner(currentDecks, allCards)?.[0]) == null) {
        const currentDeckState = serializeDecks(currentDecks);
        if (allPreviousTurns.has(currentDeckState)) {
            winnerId = 0;
            break;
        }
        allPreviousTurns.add(currentDeckState);
        //
        // console.log(serializeDecks(currentDecks));
        // console.log(allCards);

        const drawnCards = currentDecks.map(deck => deck.splice(0, 1)[0]);
        const [player1Card, player2Card] = drawnCards;

        let roundWinner;
        if (player1Deck.length >= player1Card && player2Deck.length >= player2Card) {
            // recurse
            const copyDecks = [
                player1Deck.slice(0, player1Card),
                player2Deck.slice(0, player2Card),
            ];
            roundWinner = recursiveCombat(copyDecks);
        } else {
            roundWinner = player1Card > player2Card ? 0 : 1;
        }

        const [winnerCard] = drawnCards.splice(roundWinner, 1);
        const loserCard = drawnCards.pop();
        currentDecks[roundWinner].push(winnerCard, loserCard);
    }

    return winnerId;
};

const part2 = async () => {
    const [decks,] = createDecks();
    const winnerId = recursiveCombat(decks);
    console.log('winner id:', winnerId);
    console.log(score(decks[winnerId]));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
