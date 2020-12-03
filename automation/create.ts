import { config } from 'dotenv';
import { createFile } from './file-creation';
import { downloadInput } from './input-download';
import { getTargetDay, getTargetYear, scheduleMidnightTask } from './scheduler';

config();

const run = async () => {
    const day = getTargetDay();

    console.log('target day is', day);

    console.log('Creating file...');
    await createFile(getTargetYear(), day);

    const initializeDay = async () => {
        console.log('It is midnight! Downloading input...');
        await downloadInput(day);
    };

    const onMidnight = () => {
        initializeDay()
            .catch(console.error);
    };

    console.log('Scheduling task...');
    scheduleMidnightTask(onMidnight);
};

run().catch(console.error);

