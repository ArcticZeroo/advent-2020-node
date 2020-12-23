import * as util from 'util';

export interface INode<T> {
    value: T;
}

export interface ILinkedNode<T> {
    next?: ILinkedNode<T>;
    previous?: ILinkedNode<T>;
    value: T;
}

export class LinkedList<T> {
    protected _head?: ILinkedNode<T>;
    protected _tail?: ILinkedNode<T>;
    protected _size: number = 0;

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

    * [Symbol.iterator]() {
        let current = this._head;
        while (current != null) {
            yield current.value;
            current = current.next;
        }
    }

    [Symbol.toStringTag]() {
        return util.inspect([...this]);
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
        const nodes: Array<ILinkedNode<T>> = [];
        for (const value of values) {
            const node: ILinkedNode<T> = { value };
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
            nodes.push(node);
        }
        return nodes;
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

export class UnsafeLinkedList<T> extends LinkedList<T> {
    get head() {
        return this._head;
    }

    get tail() {
        return this._tail;
    }

    insertAfterNode(node: ILinkedNode<T>, value: T) {
        const newNode: ILinkedNode<T> = { value };
        newNode.next = node.next;
        if (newNode.next) {
            newNode.next.previous = newNode;
        }
        newNode.previous = node;
        node.next = newNode;

        if (node === this._tail) {
            this._tail = newNode;
        }

        return newNode;
    }

    removeAfterNode(node: ILinkedNode<T>) {
        // nothing to remove
        if (!node.next) {
            return undefined;
        }

        const oldNextNode = node.next;
        const newNextNode = node.next.next;

        node.next = newNextNode;
        if (newNextNode) {
            newNextNode.previous = node;
        }

        if (oldNextNode === this._tail) {
            this._tail = newNextNode;
        }

        return oldNextNode;
    }

    * nodes() {
        let current = this._head;
        while (current != null) {
            yield current;
            current = current.next;
        }
    }
}