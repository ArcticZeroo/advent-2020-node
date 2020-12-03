import { getDayUrl, IPuzzleDay } from 'advent-api';
import open from 'open';

export const openPuzzle = async (puzzle: IPuzzleDay) => {
    const url = getDayUrl(puzzle);
    return await open(url);
};