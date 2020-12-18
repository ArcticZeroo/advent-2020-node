export interface INode<T> {
    value: T;
}

interface ILinkedNode<T> {
    next?: ILinkedNode<T>;
    previous?: ILinkedNode<T>;
    value: T;
}

export class LinkedList<T> {
    private _head?: ILinkedNode<T>;
    private _tail?: ILinkedNode<T>;
    private _size: number = 0;

    constructor(iterable?: Iterable<T>) {
        if (iterable) {
            for (const item of iterable) {
                this.insertEnd(item);
            }
        }
    }

    get size() {
        return this._size;
    }

    get isEmpty() {
        return this.size === 0;
    }

    insertStart(...values: T[]) {
        for (const value of values) {
            const node: ILinkedNode<T> = { value };
            this._size++;
            if (!this._head) {
                this._head = node;
            } else {
                const oldHead = this._head;
                oldHead.previous = node;
                this._head = node;
                this._head.next = oldHead;
            }

            if (!this._tail) {
                this._tail = node;
            }
        }
    }

    insertEnd(...values: T[]) {
        for (const value of values) {
            const node: ILinkedNode<T> = {value};
            this._size++;
            if (!this._tail) {
                this._tail = node;
            } else {
                const oldTail = this._tail;
                oldTail.next = node;
                this._tail = node;
                this._tail.previous = oldTail;
            }

            if (!this._head) {
                this._head = node;
            }
        }
    }

    popStart() {
        if (this._size > 0) {
            this._size--;
        }

        const currentHead = this._head;
        this._head = currentHead?.next;

        if (this._size === 0) {
            this._tail = undefined;
        } else {
            this._head.previous = undefined;
        }

        return currentHead?.value;
    }

    popEnd() {
        if (this._size > 0) {
            this._size--;
        }

        const currentTail = this._tail;
        this._tail = currentTail?.previous;

        if (this._size === 0) {
            this._head = undefined;
        } else {
            this._tail.next = undefined;
        }

        return currentTail?.value;
    }
}