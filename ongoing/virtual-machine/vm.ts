export const instructions = {
    jump:             'jmp',
    addToAccumulator: 'acc',
    noop:             'nop',
} as const;

export const vmFlags = {
    returnOnLoop: 1 << 0
} as const;

class VirtualMachine {
    private _currentInstructionIndex = 0;
    private _visitedInstructions = new Set<number>();

    runOnce() {

    }

    runUntilLoop() {

    }
}