import { Temporal } from 'proposal-temporal';
import ZonedDateTime = Temporal.ZonedDateTime;

const zeroTimeOfDay = {
    hour:        0,
    minute:      0,
    second:      0,
    millisecond: 0,
    microsecond: 0,
    nanosecond:  0,
} as const;

export const calendar = new Intl.DateTimeFormat().resolvedOptions().calendar;

export const getTargetDay = () => {
    const now = Temporal.now.zonedDateTime(calendar);
    const dayOffset = now.hour < 1 ? 0 : 1;
    return now.day + dayOffset;
};

const getNow = () => Temporal.now.zonedDateTime(calendar);

export const getTargetYear = () => {
    return getNow().year;
};

const getMidnight = () => {
    const now = getNow();

    return now.with({
        day: getTargetDay(),
        ...zeroTimeOfDay
    });
};

export const getMillisecondsUntilMidnight = (now: ZonedDateTime, midnight: ZonedDateTime) => {
    const timeUntilMidnight = now.until(midnight);
    return Math.ceil(timeUntilMidnight.total({ unit: 'milliseconds', relativeTo: now }));
};

const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
};

const showCurrentTime = (milliseconds: number) => {
    const duration = Temporal.Duration.from({ milliseconds });

    const hours = formatTime(Math.floor(duration.total({ unit: 'hours' })));
    const minutes = formatTime(Math.floor(duration.total({ unit: 'minutes' })) % 60);
    const seconds = formatTime(Math.floor(duration.total({ unit: 'seconds' })) % 60);

    process.stdout.cursorTo(0);
    process.stdout.write(`Puzzle will open in: ${hours}h ${minutes}m ${seconds}s`);
};

export const scheduleMidnightTask = (task: () => void, additionalMsAfterMidnight: number = 1000) => {
    const midnight = getMidnight();
    const millisecondsUntilMidnight = getMillisecondsUntilMidnight(getNow(), midnight);

    if (millisecondsUntilMidnight <= 0) {
        task();
    } else {
        const timeTask = setInterval(() => {
            showCurrentTime(getMillisecondsUntilMidnight(getNow(), midnight));
        }, 1000);

        const endTimeTask = () => {
            process.stdout.write('\n');
            clearTimeout(timeTask);
        };

        setTimeout(() => {
            endTimeTask();
            task();
        }, millisecondsUntilMidnight + additionalMsAfterMidnight);
    }
};