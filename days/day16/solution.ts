
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as advent from 'advent-api';
import { InfiniteGrid } from '../../common/grid';
import * as reducers from '../../common/reducers';
import { isBetween, lines, paragraphs } from '../../common/utils';

config();

const year = 2020;
const day = 16;

const input = readFileSync(path.resolve(path.join(__dirname, 'input.txt')), 'utf-8');

const submit = async (part: 1 | 2, answer: unknown) => {
    const response = await advent.submitAnswer({year, day, part, answer}, {cookie: process.env.ADVENT_COOKIE});
    console.log(response);
    const text = await response.text();
    console.log(text);
    return response;
};

class Range {
    private readonly ranges: Array<[number, number]> = [];

    add(range: [number, number]) {
        this.ranges.push(range);
    }

    isInRange(value: number) {
        return this.ranges.some(([start, end]) => isBetween(value, start, end));
    }
}

const ticketRangeRegex = /(.+?):(?:\s*(\d+)-(\d+)\s*(?:or\s*)?)+/

const parseTicket = (ticket: string) => {
    const [name, rangesRaw] = ticket.split(':');
    const range = new Range();

    for (const item of rangesRaw.split('or')) {
        const [start, end] = item.trim().split('-').map(Number);
        range.add([start, end]);
    }

    return [name.trim(), range] as const;
}

const getTicketData = () => {
    const data = paragraphs(input);
    const [ticketRangeRaw, selfTicketRaw, nearbyTicketsRaw] = data;
    const ticketRangeData = lines(ticketRangeRaw).map(line => line.split(/\s{2,}/)).flat().map(parseTicket);
    const selfTicketFields = selfTicketRaw.split(':')[1].trim().split(',').map(Number);
    const nearbyTickets = lines(nearbyTicketsRaw).slice(1).map(line => line.split(',').map(Number));
    return [ticketRangeData, selfTicketFields, nearbyTickets] as const;
};

const part1 = async () => {
    const [ticketFields, selfTicket, nearbyTickets] = getTicketData();
    const invalidValues = [];
    for (const ticket of nearbyTickets) {
        invalidValues.push(...ticket.filter(value => ticketFields.every(([, range]) => !range.isInRange(value))));
    }
    console.log(invalidValues.reduce(...reducers.add()));
};

type Field = ReturnType<typeof parseTicket>;
type Fields = Array<Field>;

const findFieldOrder = (fields: Fields, tickets: number[][], currentField?: Field, currentOrder: string[] = []) => {
    if (currentField) {
        const expectedIndex = currentOrder.length - 1;

        const [, currentRange] = currentField;

        // console.log(tickets.map(ticket => ticket[expectedIndex]));
        // console.log(tickets.every(ticket => currentRange.isInRange(ticket[expectedIndex])));
        if (!tickets.every(ticket => currentRange.isInRange(ticket[expectedIndex]))) {
            return false;
        }

        if (currentOrder.length === fields.length) {
            return currentOrder;
        }
    }

    for (const field of fields) {
        const [fieldName] = field;

        if (currentOrder.includes(fieldName)) {
            continue;
        }

        currentOrder.push(fieldName);

        if (findFieldOrder(fields, tickets, field, currentOrder)) {
            return currentOrder;
        }

        currentOrder.splice(-1, 1);
    }

    // no fields found from this position that were able to match all columns, backtrack
    return false;
}

const part2 = async () => {
    const [ticketFields, selfTicket, nearbyTickets] = getTicketData();
    const validNearbyTickets = nearbyTickets.filter(ticket => !ticket.some(value => ticketFields.every(([, range]) => !range.isInRange(value))));
    const fieldOrder = findFieldOrder(ticketFields, [...validNearbyTickets, selfTicket]);
    if (!fieldOrder) {
        throw new Error('Something bad happened, no field order was found. This shouldn\' be possible with well-formed advent inputs');
    }
    const fieldsStartingWithDeparture = fieldOrder.map((value, i) => [value, i] as const).filter(([value]) => value.startsWith('departure'));
    const selfTicketFieldsWithDeparture = selfTicket.filter((value, i) => fieldsStartingWithDeparture.some(([, fieldIndex]) => i === fieldIndex));
    console.log(selfTicketFieldsWithDeparture.reduce(...reducers.multiply()));
};

const run = async () => {
    await part1();
    await part2();
};

run().catch(console.error);
