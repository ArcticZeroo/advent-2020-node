import { config } from 'dotenv';
import { createFile } from './file-creation';
import { downloadInput } from './input-download';
import { openPuzzle } from './navigation';
import { getTargetDay, getTargetYear, scheduleMidnightTask } from './scheduler';

config();

const run = async () => {
    const day = getTargetDay();
    const year = getTargetYear();
    const puzzle = { year, day };

    console.log('target day is', day);

    console.log('Creating file...');

    await createFile(puzzle);

    const initializeDay = async () => {
        console.log('It is midnight! Downloading input...');
        const puzzleOpenPromise = openPuzzle(puzzle);
        await downloadInput(day);
        await puzzleOpenPromise;
    };

    const onMidnight = () => {
        initializeDay()
            .catch(console.error);
    };

    console.log('Scheduling task...');
    scheduleMidnightTask(onMidnight);
};

run().catch(console.error);

