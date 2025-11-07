export interface IStack<T>
{
    maxSize: number;

    isEmpty(): boolean;
    setSize(size: number): void;
    takeOverFromArray(arr: T[]): void;

    push(val: T): void;
    pushMany(vals: T[]): void;

    pushFromOtherStack(o: IStack<T>): void;
    pushAsCopyFromOtherStack(o: IStack<T>): void;

    pop(): T | null;
    popUntil(callbackfn: (top: T) => boolean): boolean;
    popCount(count: number): T[];

    peek(): T | null;
    clear(): void;
}


export class Stack<T> implements IStack<T>
{
    private stack: T[] = [];
    private _maxSize: number;

    constructor(maxSize = 30)
    {
        this._maxSize = maxSize;
    }

    public get maxSize()
    {
        return this._maxSize;
    }

    public takeOverFromArray(arr: T[]): void
    {
        this.stack = arr;
    }


    public isEmpty()
    {
        return this.stack.length === 0;
    }

    public setSize(size: number)
    {
        this._maxSize = size;
    }

    public push(val: T)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push(val);
    }

    public pushMany(vals: T[])
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push.apply(this.stack, vals);
    }

    public pushFromOtherStack(o: Stack<T>)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        for (let i = o.stack.length - 1; i >= 0; i--)
        {
            this.stack.push(o.stack[i]);
        }
    }

    public pushAsCopyFromOtherStack(o: Stack<T>)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push.apply(this.stack, o.stack);
    }

    public pop(): T | null
    {
        return this.stack.pop() ?? null;
    }

    public peek(): T | null
    {
        return this.stack.at(-1) ?? null;
    }

    /**
     * @param callbackfn - условие, при котором мы перестаём делать pop 
     * @returns true если условие оказалось true
     */
    public popUntil(callbackfn: (top: T) => boolean): boolean
    {
        const index = this.stack.findLastIndex(callbackfn);
        if (index === -1)
        {
            this.stack = [];
            return false;
        }

        this.stack.splice(index + 1, this.stack.length - index - 1);
        return true;
    }

    public popCount(count: number): T[]
    {
        return this.stack.splice(this.stack.length - count, count);
    }

    public clear(): void
    {
        this.stack.length = 0;
    }
}
